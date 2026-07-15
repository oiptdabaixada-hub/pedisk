"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  MessageCircle,
  ReceiptText,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";

type Extra = {
  id: number | string;
  name: string;
  price: number;
  emoji: string;
};

type CartItem = {
  cartId: string;
  productId: number | string;
  slug: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  emoji: string;
  quantity: number;
  observation: string;
  extras: Extra[];
  total: number;
};

type OrderStatus =
  | "novo"
  | "preparando"
  | "saiu_para_entrega"
  | "concluido"
  | "recusado";

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  storeWhatsapp?: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    complement: string;
    neighborhood: string;
  };
  payment: string;
  generalObservation: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

function PedidoConcluidoPageContent() {
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  const whatsappWindowRef = useRef<Window | null>(null);

  const urlStoreSlug = (searchParams.get("loja") || "")
    .trim()
    .toLowerCase();

  const activeStoreSlug = order?.storeSlug || urlStoreSlug;
  const storeHref = activeStoreSlug ? `/${activeStoreSlug}` : "/loja";

  useEffect(() => {
    const rawOrder = localStorage.getItem("pedisk-last-order");

    if (!rawOrder) {
      setOrder(null);
      setLoaded(true);
      return;
    }

    try {
      const parsedOrder = JSON.parse(rawOrder) as Order;
      setOrder(parsedOrder);
    } catch {
      setOrder(null);
    }

    setLoaded(true);
  }, []);

  function money(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function normalizeWhatsApp(value: string | null | undefined) {
    const digits = (value || "").replace(/\D/g, "");

    if (!digits) return "";
    if (digits.startsWith("55")) return digits;

    return `55${digits}`;
  }

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );
  }

  function openWhatsApp() {
    if (!order) return;

    const whatsappNumber = normalizeWhatsApp(order.storeWhatsapp);

    if (!whatsappNumber) {
      alert("A loja ainda não cadastrou um WhatsApp válido.");
      return;
    }

    const message = `Olá! Fiz o pedido ${order.id} na ${
      order.storeName || "loja"
    } e gostaria de acompanhar o status.`;

    const params = new URLSearchParams({
      phone: whatsappNumber,
      text: message,
    });

    if (isMobileDevice()) {
      window.location.href = `https://api.whatsapp.com/send?${params.toString()}`;
      return;
    }

    const url = `https://web.whatsapp.com/send?${params.toString()}`;

    if (
      whatsappWindowRef.current &&
      !whatsappWindowRef.current.closed
    ) {
      whatsappWindowRef.current.location.href = url;
      whatsappWindowRef.current.focus();
      return;
    }

    whatsappWindowRef.current = window.open(
      url,
      "pedisk-whatsapp"
    );

    whatsappWindowRef.current?.focus();
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <BackgroundGlow />

        <section className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.04] text-5xl">
            🧾
          </div>

          <h1 className="text-3xl font-black tracking-[-0.05em]">
            Nenhum pedido encontrado
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Não encontramos nenhum pedido finalizado nesse dispositivo.
          </p>

          <Link
            href={storeHref}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black"
          >
            Voltar para loja
            <ChevronRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pb-10 text-white">
      <BackgroundGlow />

      <section className="relative z-10 mx-auto max-w-3xl px-4 pt-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.35)]">
            <CheckCircle2 size={48} />
          </div>

          <div className="mb-3 inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-xs font-black text-orange-300">
            {order.id}
          </div>

          <h1 className="text-4xl font-black tracking-[-0.06em]">
            Pedido recebido!
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Agora a loja precisa confirmar seu pedido.
          </p>

          <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-left">
            <div className="flex items-center gap-3">
              <Clock3 className="text-yellow-300" size={20} />

              <div>
                <p className="font-black text-yellow-300">
                  Aguardando confirmação
                </p>
                <p className="text-xs text-zinc-400">
                  A loja recebeu seu pedido e vai responder em breve.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <Card title="Resumo do pedido" icon={<ReceiptText size={19} />}>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.cartId}
                  className="rounded-2xl bg-black/30 p-3"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-black">
                        {item.quantity}x {item.name}
                      </p>

                      {item.extras.length > 0 && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {item.extras.map((extra) => extra.name).join(", ")}
                        </p>
                      )}

                      {item.observation && (
                        <p className="mt-1 text-xs text-orange-300">
                          Obs: {item.observation}
                        </p>
                      )}
                    </div>

                    <p className="font-black text-yellow-300">
                      {money(item.total)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="space-y-3 rounded-2xl bg-black/30 p-4">
                <Line label="Subtotal" value={money(order.subtotal)} />
                <Line label="Entrega" value={money(order.deliveryFee)} />
                <div className="border-t border-white/10 pt-3">
                  <Line
                    label="Total"
                    value={money(order.total)}
                    strong
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Dados do cliente" icon={<User size={19} />}>
            <Line label="Nome" value={order.customer.name} />
            <Line label="Telefone" value={order.customer.phone} />
          </Card>

          <Card title="Endereço" icon={<MapPin size={19} />}>
            <Line label="Rua" value={order.address.street} />
            <Line
              label="Complemento"
              value={order.address.complement || "Sem complemento"}
            />
            <Line label="Bairro" value={order.address.neighborhood} />
          </Card>

          <Card title="Pagamento" icon={<Wallet size={19} />}>
            <Line label="Forma de pagamento" value={order.payment} />
            <Line
              label="Observação geral"
              value={order.generalObservation || "Sem observação"}
            />
          </Card>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            onClick={openWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 font-black"
          >
            <MessageCircle size={19} />
            Acompanhar pelo WhatsApp
          </button>

          <Link
            href={storeHref}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black"
          >
            <ShoppingBag size={19} />
            Voltar para loja
          </Link>

          <a
            href="#resumo"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-black"
          >
            <Home size={19} />
            Ver resumo do pedido
          </a>
        </div>
      </section>
    </main>
  );
}

export default function PedidoConcluidoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050505] text-white">
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
          </div>
        </main>
      }
    >
      <PedidoConcluidoPageContent />
    </Suspense>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-green-500/10 blur-[150px]" />
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      id={title === "Resumo do pedido" ? "resumo" : undefined}
      className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
          {icon}
        </div>
        <h2 className="text-xl font-black">{title}</h2>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 text-sm ${
        strong ? "text-xl font-black" : "text-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span className={strong ? "text-yellow-300" : "text-white"}>
        {value}
      </span>
    </div>
  );
}
