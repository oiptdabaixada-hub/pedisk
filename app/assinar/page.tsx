"use client";

import Script from "next/script";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  CreditCard,
  Headphones,
  HelpCircle,
  Loader2,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  Palette,
  QrCode,
  RefreshCw,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

declare global {
  interface Window {
    Cakto?: {
      CaktoSDK: new (config: { client_id: string }) => {
        initAntifraud: () => Promise<void>;
        completeAntifraudProfile: () => Promise<void>;
        getAntifraudReference: () => string | null;
        cleanupAntifraud: () => void;
      };
    };
  }
}

type PaymentResult = {
  success: boolean;
  message?: string;
  payment?: {
    orderId: string;
    refId: string | null;
    status: string;
    amount: string;
    baseAmount: string;
    fees: string;
    discount: string;
    checkoutUrl: string | null;
    qrCode: string;
    qrCodeBase64: string | null;
    expiresAt: string | null;
  };
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  document: string;
};

const PLAN_FEATURES = [
  "Loja online com sua própria marca",
  "Produtos e categorias ilimitados",
  "Pedidos organizados em tempo real",
  "Painel completo para gerenciar seu delivery",
  "Configuração de bairros e taxas de entrega",
  "Temas, cores, banner e identidade personalizada",
  "Link exclusivo para divulgar no Instagram e WhatsApp",
  "Novos recursos incluídos durante sua assinatura",
];

const FAQ = [
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não. A Pedisk funciona direto no navegador do celular ou computador. Seus clientes também acessam a loja por um link, sem precisar baixar nada.",
  },
  {
    question: "A Pedisk cobra porcentagem dos meus pedidos?",
    answer:
      "Não. A assinatura é fixa, e a Pedisk não retém porcentagem das vendas realizadas pela sua loja.",
  },
  {
    question: "Posso alterar produtos, fotos e preços quando quiser?",
    answer:
      "Sim. Você controla sua loja pelo painel e pode editar produtos, categorias, aparência, entrega e informações do negócio sempre que precisar.",
  },
  {
    question: "Quando meu acesso é liberado?",
    answer:
      "A confirmação é automática. Assim que o pagamento for aprovado, a assinatura será vinculada à sua conta Pedisk.",
  },
  {
    question: "Posso cancelar?",
    answer:
      "Sim. Você poderá solicitar o cancelamento da assinatura e impedir cobranças futuras. Seus dados não serão apagados imediatamente.",
  },
  {
    question: "Como funciona a garantia de 7 dias?",
    answer:
      "Você pode testar a Pedisk e solicitar o cancelamento dentro do prazo de garantia configurado para a oferta, conforme as regras aplicáveis à compra.",
  },
];

const COMPARISON = [
  ["Pedidos misturados no WhatsApp", "Pedidos organizados no painel"],
  ["Cardápio enviado por foto", "Loja profissional com link"],
  ["Cliente perguntando preço toda hora", "Produtos e preços disponíveis 24h"],
  ["Anotações e contas manuais", "Resumo automático de cada pedido"],
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatMoney(value: string | number) {
  const numeric = Number(value);

  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getPersistentFingerprint() {
  const storageKey = "pedisk-payment-fingerprint";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) return existing;

  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const fingerprint = `pedisk_${randomPart}`;
  window.localStorage.setItem(storageKey, fingerprint);

  return fingerprint;
}

export default function AssinarPage() {
  const router = useRouter();
  const caktoSdkRef = useRef<InstanceType<
    NonNullable<typeof window.Cakto>["CaktoSDK"]
  > | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    document: "",
  });

  const [sessionLoading, setSessionLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [payment, setPayment] = useState<PaymentResult["payment"] | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [mobileCtaPressed, setMobileCtaPressed] = useState(false);

  const publicClientId = process.env.NEXT_PUBLIC_CAKTO_CLIENT_ID || "";

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!payment?.expiresAt) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const expiresAt = new Date(payment.expiresAt!).getTime();
      const remaining = Math.max(
        0,
        Math.floor((expiresAt - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, [payment?.expiresAt]);

  useEffect(() => {
    return () => {
      caktoSdkRef.current?.cleanupAntifraud?.();
    };
  }, []);

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [secondsLeft]);

  async function loadCurrentUser() {
    setSessionLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login?redirect=/assinar");
        return;
      }

      const metadata = session.user.user_metadata || {};

      setForm((current) => ({
        ...current,
        name: metadata.name || current.name,
        email: session.user.email || current.email,
        phone: formatPhone(metadata.whatsapp || current.phone),
      }));
    } finally {
      setSessionLoading(false);
    }
  }

  async function initializeCaktoSdk() {
    if (!publicClientId) {
      setSdkError(
        "A chave pública da Cakto ainda não foi configurada no projeto."
      );
      return;
    }

    if (!window.Cakto?.CaktoSDK) {
      setSdkError("O módulo de segurança da Cakto não carregou.");
      return;
    }

    try {
      const sdk = new window.Cakto.CaktoSDK({
        client_id: publicClientId,
      });

      caktoSdkRef.current = sdk;
      await sdk.initAntifraud();

      setSdkReady(true);
      setSdkError("");
    } catch (error) {
      console.error("Erro ao iniciar SDK Cakto:", error);
      setSdkError(
        "Não foi possível iniciar a proteção do pagamento. Recarregue a página."
      );
    }
  }

  function updateForm(field: keyof FormState, value: string) {
    setErrorMessage("");
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    if (form.name.trim().length < 3) return "Digite seu nome completo.";
    if (!form.email.includes("@")) return "Digite um e-mail válido.";
    if (onlyDigits(form.phone).length !== 11) {
      return "Digite um WhatsApp válido com DDD.";
    }
    if (onlyDigits(form.document).length !== 11) {
      return "Digite um CPF válido.";
    }
    if (!sdkReady) {
      return "A proteção do pagamento ainda está carregando. Aguarde alguns segundos.";
    }

    return "";
  }

  async function generatePix() {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      document
        .getElementById("checkout-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setGenerating(true);
    setErrorMessage("");

    try {
      const sdk = caktoSdkRef.current;

      if (!sdk) {
        throw new Error("O módulo de segurança não está disponível.");
      }

      await sdk.completeAntifraudProfile();

      const antifraudReference = sdk.getAntifraudReference();

      if (!antifraudReference) {
        throw new Error(
          "Não foi possível concluir a verificação de segurança."
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login?redirect=/assinar");
        return;
      }

      const response = await fetch("/api/cakto/create-pix", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: onlyDigits(form.phone),
          document: onlyDigits(form.document),
          documentType: "cpf",
          fingerprint: getPersistentFingerprint(),
          antifraudProfilingAttemptReference: antifraudReference,
        }),
      });

      const result = (await response.json()) as PaymentResult;

      if (!response.ok || !result.success || !result.payment) {
        throw new Error(
          result.message || "Não foi possível gerar o pagamento Pix."
        );
      }

      setPayment(result.payment);
      window.setTimeout(() => {
        document
          .getElementById("pix-payment")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o Pix. Tente novamente."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function copyPixCode() {
    if (!payment?.qrCode) return;

    await navigator.clipboard.writeText(payment.qrCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  function jumpToCheckout() {
    setMobileCtaPressed(true);

    window.setTimeout(() => {
      setMobileCtaPressed(false);
    }, 420);

    window.setTimeout(() => {
      document
        .getElementById("checkout-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 90);
  }

  if (sessionLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-orange-400" size={38} />
          <p className="mt-4 text-sm font-bold text-zinc-500">
            Preparando seu checkout...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Script
        src="https://cakto-sdk.pages.dev/cakto-sdk.min.js"
        strategy="afterInteractive"
        onLoad={initializeCaktoSdk}
        onError={() =>
          setSdkError("Não foi possível carregar a segurança da Cakto.")
        }
      />

      <main className="min-h-screen overflow-hidden bg-[#050505] pb-28 text-white selection:bg-orange-500/30 lg:pb-12">
        <Background />

        <header className="relative z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-black shadow-[0_0_30px_rgba(249,115,22,0.35)]">
                P
              </div>

              <div className="text-left">
                <p className="text-xl font-black leading-none tracking-[-0.04em]">
                  pedisk
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
                  Checkout seguro
                </p>
              </div>
            </button>

            <div className="hidden items-center gap-5 text-xs font-bold text-zinc-400 md:flex">
              <span className="flex items-center gap-2">
                <LockKeyhole size={15} className="text-green-400" />
                Ambiente protegido
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-orange-400" />
                Pagamento processado pela Cakto
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-green-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Seguro
            </div>
          </div>
        </header>

        <div className="relative z-20 border-b border-orange-400/20 bg-orange-500/10">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 text-center text-xs font-black text-orange-200">
            <Sparkles size={15} className="shrink-0 text-yellow-300" />
            Você está a poucos minutos de colocar sua loja para vender.
          </div>
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
          <div className="mb-8 grid gap-7 lg:grid-cols-[1.12fr_.88fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-300">
                <Rocket size={15} />
                Pedisk Pro
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.065em] sm:text-5xl lg:text-7xl">
                Pare de perder pedidos em{" "}
                <span className="bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent">
                  conversas bagunçadas.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 lg:text-lg">
                Transforme seu negócio em um delivery profissional com loja
                própria, cardápio digital e pedidos organizados em um só lugar.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  "Sem taxa por pedido",
                  "Cancele quando quiser",
                  "Acesso pelo celular",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-300"
                  >
                    <CheckCircle2 size={15} className="text-green-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-10 rounded-full bg-orange-500/20 blur-[100px]" />

              <div className="relative overflow-hidden rounded-[36px] border border-orange-400/20 bg-gradient-to-br from-[#19110b] via-[#0d0d0d] to-[#090909] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-400">
                      Sua operação organizada
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Loja, pedidos e gestão no mesmo painel.
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-black">
                    <Zap size={21} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    [Store, "Sua loja online", "Com sua marca e seu link"],
                    [ShoppingBag, "Pedido recebido", "Atualização em tempo real"],
                    [Truck, "Entrega organizada", "Bairros, taxas e prazos"],
                    [Palette, "Visual personalizado", "Temas, cores e banner"],
                  ].map(([Icon, title, description]) => {
                    const FeatureIcon = Icon as typeof Store;

                    return (
                      <div
                        key={String(title)}
                        className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:border-orange-400/30 hover:bg-orange-500/[0.07]"
                      >
                        <FeatureIcon
                          size={20}
                          className="text-orange-400"
                        />
                        <p className="mt-4 font-black">{String(title)}</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {String(description)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-[24px] border border-green-400/20 bg-green-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500 text-black">
                      <PackageCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-green-200">
                        Pronto para receber pedidos
                      </p>
                      <p className="mt-1 text-xs text-green-200/60">
                        Publique sua loja e compartilhe o link.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProgressSteps />

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_430px] lg:items-start">
            <div className="space-y-6">
              <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-7">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-400">
                    Tudo incluso
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
                    Uma estrutura completa por menos de R$ 1,34 por dia.
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {PLAN_FEATURES.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <p className="text-sm font-bold leading-6 text-zinc-300">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <BarChart3 size={23} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-400">
                      Antes e depois
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      O cliente percebe a diferença.
                    </h2>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-white/10">
                  <div className="grid grid-cols-2 bg-white/[0.06] text-xs font-black uppercase tracking-[0.12em]">
                    <div className="border-r border-white/10 p-4 text-red-300">
                      Sem Pedisk
                    </div>
                    <div className="p-4 text-green-300">Com Pedisk</div>
                  </div>

                  {COMPARISON.map(([before, after]) => (
                    <div
                      key={before}
                      className="grid grid-cols-2 border-t border-white/10 text-sm"
                    >
                      <div className="border-r border-white/10 p-4 text-zinc-500">
                        {before}
                      </div>
                      <div className="flex items-start gap-2 p-4 font-bold text-zinc-200">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-green-400"
                        />
                        {after}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-orange-400/20 bg-gradient-to-br from-orange-500/15 to-transparent p-5 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-orange-500 text-black shadow-[0_0_45px_rgba(249,115,22,0.35)]">
                    <ShieldCheck size={38} />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-300">
                      Garantia de 7 dias
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Entre, teste a plataforma e conheça tudo por dentro.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      A oferta foi configurada com prazo de garantia de 7 dias.
                      Caso não faça sentido para seu negócio, solicite o
                      cancelamento dentro do período aplicável.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-400">
                    Dúvidas frequentes
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                    Tire suas dúvidas antes de assinar.
                  </h2>
                </div>

                <div className="space-y-3">
                  {FAQ.map((item, index) => {
                    const active = openFaq === index;

                    return (
                      <button
                        key={item.question}
                        type="button"
                        onClick={() => setOpenFaq(active ? null : index)}
                        className="w-full rounded-[22px] border border-white/10 bg-black/25 p-4 text-left"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-black">{item.question}</p>
                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-orange-400 transition ${
                              active ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {active && (
                          <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-zinc-400">
                            {item.answer}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside
              id="checkout-form"
              className="self-start rounded-[34px] border border-orange-400/20 bg-[#0d0d0d]/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:sticky lg:top-5"
            >
              {!payment ? (
                <>
                  <div className="rounded-[26px] border border-orange-400/20 bg-gradient-to-br from-orange-500/15 to-transparent p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-300">
                          Pedisk Pro
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                          Tudo que você precisa para profissionalizar seu
                          delivery.
                        </p>
                      </div>

                      <BadgeCheck
                        size={27}
                        className="shrink-0 text-orange-400"
                      />
                    </div>

                    <div className="mt-5 flex items-end gap-2">
                      <span className="text-5xl font-black tracking-[-0.06em] text-yellow-300">
                        R$ 39,90
                      </span>
                      <span className="pb-1 text-sm font-bold text-zinc-500">
                        /mês
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold text-green-400">
                      Sem taxa sobre seus pedidos
                    </p>
                  </div>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                      Seus dados
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="space-y-4">
                    <Field
                      label="Nome completo"
                      value={form.name}
                      onChange={(value) => updateForm("name", value)}
                      placeholder="Seu nome"
                      icon={<Users size={18} />}
                      autoComplete="name"
                    />

                    <Field
                      label="E-mail"
                      value={form.email}
                      onChange={(value) => updateForm("email", value)}
                      placeholder="seuemail@gmail.com"
                      icon={<MessageCircle size={18} />}
                      type="email"
                      autoComplete="email"
                    />

                    <Field
                      label="WhatsApp"
                      value={form.phone}
                      onChange={(value) =>
                        updateForm("phone", formatPhone(value))
                      }
                      placeholder="(21) 99999-9999"
                      icon={<Smartphone size={18} />}
                      inputMode="tel"
                      autoComplete="tel"
                    />

                    <Field
                      label="CPF"
                      value={form.document}
                      onChange={(value) =>
                        updateForm("document", formatCpf(value))
                      }
                      placeholder="000.000.000-00"
                      icon={<ShieldCheck size={18} />}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="mt-5 rounded-[24px] border border-green-400/20 bg-green-500/[0.08] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-black">
                        <QrCode size={20} />
                      </div>
                      <div>
                        <p className="font-black text-green-200">
                          Pagamento via Pix
                        </p>
                        <p className="mt-1 text-xs leading-5 text-green-200/60">
                          QR Code gerado na hora e confirmação automática após
                          o pagamento.
                        </p>
                      </div>
                    </div>
                  </div>

                  {sdkError && (
                    <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
                      {sdkError}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={generatePix}
                    disabled={generating || !sdkReady}
                    className="group relative mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-gradient-to-r from-orange-500 to-yellow-400 px-5 py-5 text-base font-black text-black shadow-[0_0_40px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-[-30%] w-[25%] -skew-x-12 bg-white/30 blur-lg transition-all duration-1000 group-hover:left-[120%]" />

                    {generating ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Gerando pagamento seguro...
                      </>
                    ) : !sdkReady ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Preparando segurança...
                      </>
                    ) : (
                      <>
                        GERAR PIX E ASSINAR
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <TrustItem icon={<LockKeyhole size={15} />} text="Seguro" />
                    <TrustItem icon={<Clock3 size={15} />} text="Na hora" />
                    <TrustItem
                      icon={<Headphones size={15} />}
                      text="Suporte"
                    />
                  </div>

                  <p className="mt-4 text-center text-[10px] leading-5 text-zinc-600">
                    Ao continuar, você confirma os dados informados e concorda
                    com a contratação da assinatura mensal da Pedisk.
                  </p>
                </>
              ) : (
                <PixPayment
                  payment={payment}
                  timerLabel={timerLabel}
                  secondsLeft={secondsLeft}
                  copied={copied}
                  onCopy={copyPixCode}
                  onReset={() => {
                    setPayment(null);
                    setErrorMessage("");
                  }}
                />
              )}
            </aside>
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/10 px-4 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-xs text-zinc-600 sm:flex-row sm:text-left">
            <div>
              <p className="font-black text-zinc-400">© 2026 Pedisk</p>
              <p className="mt-1">
                Seu delivery. Sua marca. Seus clientes.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} />
                Dados protegidos
              </span>
              <span className="flex items-center gap-2">
                <WalletCards size={14} />
                Pagamento Cakto
              </span>
            </div>
          </div>
        </footer>

        {!payment && (
          <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#090909]/95 p-3 backdrop-blur-2xl lg:hidden">
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileSummary(true)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                  Pedisk Pro
                </p>
                <p className="truncate text-lg font-black text-yellow-300">
                  R$ 39,90/mês
                </p>
              </button>

              <button
                type="button"
                onClick={jumpToCheckout}
                className={`relative flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 px-5 py-4 text-sm font-black text-black shadow-[0_0_28px_rgba(249,115,22,0.38)] transition duration-300 active:scale-90 ${
                  mobileCtaPressed
                    ? "-translate-y-3 scale-105 rotate-[-1deg]"
                    : "animate-pulse"
                }`}
              >
                <span className="pointer-events-none absolute inset-y-0 left-[-35%] w-[28%] -skew-x-12 bg-white/35 blur-md animate-[shine_2.2s_ease-in-out_infinite]" />
                Assinar agora
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {showMobileSummary && (
          <div className="fixed inset-0 z-[120] flex items-end bg-black/75 p-3 backdrop-blur-sm lg:hidden">
            <div className="w-full rounded-[30px] border border-white/10 bg-[#101010] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xl font-black">Resumo do plano</p>
                <button
                  type="button"
                  onClick={() => setShowMobileSummary(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {PLAN_FEATURES.slice(0, 5).map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                    <p className="text-sm text-zinc-300">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
                <div>
                  <p className="text-xs text-zinc-500">Total mensal</p>
                  <p className="mt-1 text-3xl font-black text-yellow-300">
                    R$ 39,90
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMobileSummary(false);
                    document
                      .getElementById("checkout-form")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-2xl bg-orange-500 px-5 py-4 text-sm font-black text-black"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute left-[-260px] top-[-220px] h-[620px] w-[620px] rounded-full bg-orange-500/15 blur-[170px]" />
      <div className="absolute bottom-[-300px] right-[-260px] h-[660px] w-[660px] rounded-full bg-yellow-500/10 blur-[180px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_78%)]" />
    </div>
  );
}

function ProgressSteps() {
  const steps = [
    ["1", "Seus dados"],
    ["2", "Pagamento"],
    ["3", "Acesso liberado"],
  ];

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2">
        {steps.map(([number, label], index) => (
          <div key={number} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-[58%] top-5 hidden h-px w-[84%] bg-gradient-to-r from-orange-400/50 to-white/10 sm:block" />
            )}

            <div className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black ${
                  index === 0
                    ? "border-orange-400 bg-orange-500 text-black shadow-[0_0_25px_rgba(249,115,22,0.3)]"
                    : "border-white/10 bg-[#111] text-zinc-500"
                }`}
              >
                {number}
              </div>
              <p
                className={`mt-2 text-[10px] font-black uppercase tracking-[0.1em] sm:text-xs ${
                  index === 0 ? "text-orange-300" : "text-zinc-600"
                }`}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-zinc-400">
        {label}
      </span>

      <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/40 px-4 transition focus-within:border-orange-400/50 focus-within:ring-4 focus-within:ring-orange-500/5">
        <span className="shrink-0 text-orange-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-white outline-none placeholder:text-zinc-700"
        />
      </div>
    </label>
  );
}

function TrustItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-[10px] font-black text-zinc-500">
      <span className="text-green-400">{icon}</span>
      {text}
    </div>
  );
}

function PixPayment({
  payment,
  timerLabel,
  secondsLeft,
  copied,
  onCopy,
  onReset,
}: {
  payment: NonNullable<PaymentResult["payment"]>;
  timerLabel: string;
  secondsLeft: number;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
}) {
  const expired = payment.expiresAt ? secondsLeft <= 0 : false;
  const [generatedQrCode, setGeneratedQrCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function buildQrCode() {
      if (payment.qrCodeBase64) {
        setGeneratedQrCode(payment.qrCodeBase64);
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(payment.qrCode, {
          width: 720,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        if (active) setGeneratedQrCode(dataUrl);
      } catch (error) {
        console.error("Erro ao gerar QR Code localmente:", error);
        if (active) setGeneratedQrCode(null);
      }
    }

    buildQrCode();

    return () => {
      active = false;
    };
  }, [payment.qrCode, payment.qrCodeBase64]);

  const baseAmount = Number(payment.baseAmount || payment.amount || 0);
  const fees = Number(payment.fees || 0);
  const discount = Number(payment.discount || 0);
  const finalAmount = Number(payment.amount || 0);

  return (
    <div id="pix-payment">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-green-500 text-black shadow-[0_0_45px_rgba(34,197,94,0.3)]">
          <QrCode size={31} />
        </div>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-green-300">
          Pix gerado com sucesso
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
          Finalize seu pagamento
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Abra o aplicativo do seu banco e escaneie o QR Code.
        </p>
      </div>

      <div className="mt-5 rounded-[28px] border border-white/10 bg-white p-4">
        {generatedQrCode ? (
          <img
            src={generatedQrCode}
            alt="QR Code Pix da assinatura Pedisk"
            className="mx-auto aspect-square w-full max-w-[260px] rounded-xl"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
            <Loader2 size={42} className="animate-spin" />
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-600">
            Plano
          </p>
          <p className="mt-1 text-xl font-black text-white">
            {formatMoney(baseAmount)}
          </p>
        </div>

        <div
          className={`rounded-[20px] border p-4 ${
            expired
              ? "border-red-400/20 bg-red-500/10"
              : "border-orange-400/20 bg-orange-500/10"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-600">
            Expira em
          </p>
          <p
            className={`mt-1 text-xl font-black ${
              expired ? "text-red-300" : "text-orange-300"
            }`}
          >
            {payment.expiresAt ? timerLabel : "60:00"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-[22px] border border-white/10 bg-black/30 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-zinc-500">
            <span>Assinatura Pedisk Pro</span>
            <span>{formatMoney(baseAmount)}</span>
          </div>

          {fees > 0 && (
            <div className="flex items-center justify-between text-zinc-500">
              <span>Taxa da operação</span>
              <span>{formatMoney(fees)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex items-center justify-between text-green-400">
              <span>Desconto</span>
              <span>- {formatMoney(discount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="font-black text-white">Total do Pix</span>
            <span className="text-2xl font-black text-yellow-300">
              {formatMoney(finalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-black/30 p-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-600">
          Pix copia e cola
        </p>
        <p className="line-clamp-3 break-all text-xs leading-5 text-zinc-500">
          {payment.qrCode}
        </p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        disabled={expired}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] bg-green-500 px-5 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {copied ? <Check size={19} /> : <Copy size={19} />}
        {copied ? "Código copiado!" : "Copiar código Pix"}
      </button>

      <div className="mt-4 rounded-[22px] border border-yellow-400/20 bg-yellow-500/10 p-4">
        <div className="flex items-start gap-3">
          <RefreshCw
            size={18}
            className="mt-0.5 shrink-0 animate-spin text-yellow-300 [animation-duration:3s]"
          />
          <div>
            <p className="text-sm font-black text-yellow-200">
              Confirmação automática
            </p>
            <p className="mt-1 text-xs leading-5 text-yellow-100/50">
              Assim que o Pix for confirmado, a Pedisk receberá a atualização
              do pagamento. Não gere outra cobrança para o mesmo pedido.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs font-bold text-zinc-600">
        Referência: {payment.refId || payment.orderId}
      </p>

      {expired && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 font-black text-zinc-300"
        >
          <RefreshCw size={18} />
          Gerar novo Pix
        </button>
      )}
    </div>
  );
}
