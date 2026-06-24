import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Lock,
  Mail,
  MessageCircle,
  Sparkles,
  Store,
  User,
  Zap,
} from "lucide-react";

export default function CadastroPage() {
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

            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Nome da loja
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <Store size={20} className="text-orange-400" />
                  <input
                    type="text"
                    placeholder="Ex: Smash House"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  Seu nome
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <User size={20} className="text-orange-400" />
                  <input
                    type="text"
                    placeholder="Nome do responsável"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  WhatsApp da loja
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <MessageCircle size={20} className="text-orange-400" />
                  <input
                    type="text"
                    placeholder="Ex: 21999999999"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-300">
                  E-mail
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 transition focus-within:border-orange-400/50">
                  <Mail size={20} className="text-orange-400" />
                  <input
                    type="email"
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
                  <Lock size={20} className="text-orange-400" />
                  <input
                    type="password"
                    placeholder="Crie uma senha segura"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                  <Eye size={18} className="text-zinc-500" />
                </div>
              </div>

              <button
                type="button"
                className="group mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 font-black text-white shadow-[0_0_45px_rgba(249,115,22,0.35)] transition hover:-translate-y-1 hover:bg-orange-400"
              >
                Criar minha loja
                <ArrowRight size={20} className="transition group-hover:translate-x-1" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Já tem conta?{" "}
              <a href="/login" className="font-bold text-orange-400">
                Entrar agora
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}