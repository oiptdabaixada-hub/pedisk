"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  Sparkles,
  Store,
  User,
  Zap,
} from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function normalizeStoreName(value: string) {
    return value.trim().replace(/\s+/g, " ");
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function getSlugCandidates(value: string) {
    const hyphenatedSlug = generateSlug(value);
    const compactSlug = hyphenatedSlug.replace(/-/g, "");

    if (!compactSlug) {
      return [];
    }

    const candidates = [
      compactSlug,
      ...(hyphenatedSlug !== compactSlug ? [hyphenatedSlug] : []),
    ];

    for (let index = 1; index <= 50; index += 1) {
      candidates.push(`${compactSlug}${index}`);
    }

    return Array.from(new Set(candidates));
  }

  async function createStoreWithAvailableSlug({
    ownerId,
    name,
    phone,
  }: {
    ownerId: string;
    name: string;
    phone: string;
  }) {
    const candidates = getSlugCandidates(name);

    if (candidates.length === 0) {
      throw new Error(
        "Não conseguimos criar o endereço da sua loja. Confira o nome informado."
      );
    }

    for (const slug of candidates) {
      const { error } = await supabase.from("stores").insert({
        owner_id: ownerId,
        name,
        slug,
        whatsapp: phone,
        description:
          "Loja criada no Pedisk. Edite sua descrição no painel Minha Loja.",
        is_open: true,
        delivery_time: "30-40 min",
        minimum_order: 20,
        default_delivery_fee: 5,
        rating: 4.9,
      });

      if (!error) {
        return slug;
      }

      const duplicateSlug =
        error.code === "23505" ||
        error.message?.toLowerCase().includes("duplicate") ||
        error.message?.toLowerCase().includes("unique");

      if (!duplicateSlug) {
        throw error;
      }
    }

    const fallbackSlug = `${candidates[0]}${Date.now()
      .toString()
      .slice(-6)}`;

    const { error: fallbackError } = await supabase.from("stores").insert({
      owner_id: ownerId,
      name,
      slug: fallbackSlug,
      whatsapp: phone,
      description:
        "Loja criada no Pedisk. Edite sua descrição no painel Minha Loja.",
      is_open: true,
      delivery_time: "30-40 min",
      minimum_order: 20,
      default_delivery_fee: 5,
      rating: 4.9,
    });

    if (fallbackError) {
      throw fallbackError;
    }

    return fallbackSlug;
  }

  async function handleCadastro(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const cleanStoreName = normalizeStoreName(storeName);
    const cleanOwnerName = ownerName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanWhatsapp = whatsapp.replace(/\D/g, "");

    if (
      !cleanStoreName ||
      !cleanOwnerName ||
      !cleanWhatsapp ||
      !cleanEmail ||
      !password
    ) {
      setErrorMessage("Preencha todos os campos para criar sua loja.");
      return;
    }

    if (cleanStoreName.length < 3) {
      setErrorMessage("O nome da loja precisa ter pelo menos 3 caracteres.");
      return;
    }

    if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 13) {
      setErrorMessage(
        "Digite um WhatsApp válido com DDD. Exemplo: 21999999999."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanOwnerName,
              store_name: cleanStoreName,
              whatsapp: cleanWhatsapp,
            },
          },
        });

      if (authError) {
        throw authError;
      }

      const user = authData.user;

      if (!user) {
        throw new Error("Não foi possível criar o usuário.");
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        name: cleanOwnerName,
        email: cleanEmail,
      });

      if (profileError && profileError.code !== "23505") {
        throw profileError;
      }

      await createStoreWithAvailableSlug({
        ownerId: user.id,
        name: cleanStoreName,
        phone: cleanWhatsapp,
      });

      router.push("/painel/minha-loja");
      router.refresh();
    } catch (error: any) {
      const message = String(error?.message || "").toLowerCase();

      if (
        message.includes("user already registered") ||
        message.includes("already been registered") ||
        message.includes("already registered")
      ) {
        setErrorMessage(
          "Este e-mail já possui uma conta. Entre com sua senha ou use outro e-mail."
        );
      } else if (message.includes("stores_slug_format")) {
        setErrorMessage(
          "O endereço da loja não pôde ser criado. Confirme se a atualização do banco foi executada."
        );
      } else {
        setErrorMessage(
          error?.message || "Erro ao criar sua loja. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[140px]" />
        <div className="absolute bottom-[-260px] right-[-200px] h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-8 lg:grid-cols-[0.9fr_1fr] lg:px-8">
        <div className="hidden lg:flex lg:min-h-[720px] lg:flex-col lg:justify-center">
          <div className="absolute left-8 top-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 text-2xl font-black text-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.25)]">
              p
            </div>
            <span className="text-3xl font-black">pedisk</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-200">
            <Sparkles size={16} className="text-orange-400" />
            Comece sua loja online agora
          </div>

          <h1 className="mt-7 max-w-xl text-6xl font-black leading-[0.95] tracking-[-0.05em]">
            Crie sua vitrine digital em poucos minutos.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Cadastre sua loja, organize produtos e comece a receber pedidos no
            WhatsApp com aparência de aplicativo profissional.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Link próprio da sua loja",
              "Pedidos direto no WhatsApp",
              "Visual premium no celular",
              "Produtos, categorias e promoções",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <BadgeCheck size={21} className="text-orange-400" />
                <span className="font-semibold text-zinc-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 text-2xl font-black text-orange-500">
              p
            </div>
            <span className="text-3xl font-black">pedisk</span>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_70px_rgba(249,115,22,0.12)] backdrop-blur-xl md:p-8">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                <Zap size={14} />
                cadastro
              </div>

              <h2 className="text-4xl font-black tracking-[-0.04em]">
                Criar minha loja
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Preencha os dados abaixo para iniciar sua vitrine no Pedisk.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCadastro} className="space-y-4">
              <InputBox
                label="Nome da loja *"
                icon={<Store size={20} className="text-orange-400" />}
                value={storeName}
                onChange={setStoreName}
                placeholder="Ex: Smash House"
                type="text"
              />

              <InputBox
                label="Seu nome *"
                icon={<User size={20} className="text-orange-400" />}
                value={ownerName}
                onChange={setOwnerName}
                placeholder="Nome do responsável"
                type="text"
              />

              <InputBox
                label="WhatsApp da loja *"
                icon={<MessageCircle size={20} className="text-orange-400" />}
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="Ex: 21999999999"
                type="text"
              />

              <InputBox
                label="E-mail *"
                icon={<Mail size={20} className="text-orange-400" />}
                value={email}
                onChange={setEmail}
                placeholder="voce@email.com"
                type="email"
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Senha *
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <Lock size={20} className="text-orange-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Crie uma senha segura"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-zinc-500 transition hover:text-orange-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 font-black text-white shadow-[0_0_45px_rgba(249,115,22,0.35)] transition hover:-translate-y-1 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Criando sua loja..." : "Criar loja grátis"}
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Já tem conta?{" "}
              <Link href="/login" className="font-bold text-orange-400">
                Entrar agora
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function InputBox({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-zinc-300">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
        {icon}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}