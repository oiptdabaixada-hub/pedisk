"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccess, setRememberAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Preencha e-mail e senha para entrar.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Não foi possível entrar na conta.");
      }

      if (rememberAccess) {
        localStorage.setItem("pedisk-remember-access", "true");
      } else {
        localStorage.removeItem("pedisk-remember-access");
      }

      router.push("/painel/minha-loja");
    } catch (error: any) {
      setErrorMessage(
        error?.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error?.message || "Erro ao entrar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/painel/minha-loja`,
      },
    });

    if (error) {
      setErrorMessage("Não foi possível entrar com Google.");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-250px] bottom-[-250px] h-[600px] w-[600px] rounded-full bg-orange-500/20 blur-[160px]" />
        <div className="absolute right-[-250px] top-[-250px] h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-8 lg:grid-cols-2 lg:px-10">
        <div className="hidden lg:block">
          <div className="mb-20 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 text-3xl font-black text-orange-500">
              p
            </div>
            <span className="text-3xl font-black">pedisk</span>
          </div>

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            <Sparkles size={16} />
            Gerencie sua loja
          </div>

          <h1 className="max-w-xl text-6xl font-black leading-[0.95] tracking-[-0.06em]">
            Acesse já nosso painel e{" "}
            <span className="text-orange-500">
              venda + com aparência premium.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Acesse seus produtos, categorias, promoções e configurações da sua
            vitrine digital Pedisk.
          </p>

          <div className="mt-12 grid max-w-xl grid-cols-2 gap-5">
            {[
              {
                icon: Store,
                title: "Sua loja no controle",
                desc: "Edite produtos, preços e informações em segundos.",
              },
              {
                icon: ShieldCheck,
                title: "Acesso seguro",
                desc: "Painel privado para cada lojista.",
              },
              {
                icon: Zap,
                title: "Pedidos no WhatsApp",
                desc: "Receba pedidos direto no número da sua loja.",
              },
              {
                icon: BarChart3,
                title: "Desempenho",
                desc: "Acompanhe sua operação no dashboard.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-400">
                    <Icon size={25} />
                  </div>

                  <div>
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 text-3xl font-black text-orange-500">
              p
            </div>
            <span className="text-3xl font-black">pedisk</span>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_80px_rgba(249,115,22,0.10)] backdrop-blur-xl md:p-10">
            <div className="mb-9">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-orange-300">
                <Zap size={16} />
                Login
              </div>

              <h2 className="text-4xl font-black tracking-[-0.04em]">
                Entrar no painel
              </h2>

              <p className="mt-3 text-zinc-400">
                Use seu e-mail e senha para acessar sua conta.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  E-mail
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <Mail size={20} className="text-zinc-500" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@email.com"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Senha
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <Lock size={20} className="text-zinc-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Sua senha"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberAccess}
                    onChange={(event) =>
                      setRememberAccess(event.target.checked)
                    }
                    className="accent-orange-500"
                  />
                  Lembrar acesso
                </label>

                <button
                  type="button"
                  className="font-bold text-orange-400 opacity-70"
                >
                  Esqueci a senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black text-white shadow-[0_0_45px_rgba(249,115,22,0.35)] transition hover:-translate-y-1 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Entrando..." : "Entrar no painel"}
                <ArrowRight
                  size={22}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm text-zinc-500">ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-6 py-4 font-bold text-zinc-300 transition hover:border-orange-400/40 hover:bg-orange-500/10"
              >
                Entrar com Google
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-zinc-500">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-black text-orange-400">
                Criar minha loja
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}