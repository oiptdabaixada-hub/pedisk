import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Flame,
  Gift,
  LayoutDashboard,
  Link2,
  Menu,
  MessageCircle,
  MousePointer2,
  Play,
  Plus,
  Rocket,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Feito pro celular",
    desc: "A vitrine abre linda, rápida e fácil de comprar no mobile.",
  },
  {
    icon: MessageCircle,
    title: "Pedido no WhatsApp",
    desc: "O cliente monta o pedido e envia tudo pronto para sua loja.",
  },
  {
    icon: Flame,
    title: "Banner de promoção",
    desc: "Destaque combos, ofertas e produtos mais vendidos no topo.",
  },
  {
    icon: MousePointer2,
    title: "Arrasta e solta",
    desc: "Organize produtos e categorias de forma simples e visual.",
  },
];

const steps = [
  {
    number: "01",
    icon: Store,
    title: "Crie sua loja",
    desc: "Cadastre nome, WhatsApp, horário, taxa e pedido mínimo.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Adicione produtos",
    desc: "Coloque fotos, preços, descrições, categorias e promoções.",
  },
  {
    number: "03",
    icon: Link2,
    title: "Compartilhe o link",
    desc: "Divulgue sua vitrine no Instagram, bio, status e QR Code.",
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Receba pedidos",
    desc: "Os pedidos chegam organizados direto no WhatsApp da loja.",
  },
];

const products = [
  {
    name: "Smash Bacon",
    desc: "Pão brioche, blend smash, cheddar e bacon crocante.",
    price: "R$ 32,90",
    tag: "Mais pedido",
    emoji: "🍔",
  },
  {
    name: "Combo Duplo",
    desc: "2 burgers artesanais + fritas + refrigerante.",
    price: "R$ 49,90",
    tag: "Promoção",
    emoji: "🔥",
  },
  {
    name: "Batata Suprema",
    desc: "Batata crocante com cheddar e bacon.",
    price: "R$ 18,90",
    tag: "Novo",
    emoji: "🍟",
  },
];

const stats = [
  { value: "0%", label: "taxa por pedido" },
  { value: "5min", label: "pra montar a vitrine" },
  { value: "100%", label: "mobile first" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[140px]" />
        <div className="absolute right-[-220px] top-[160px] h-[520px] w-[520px] rounded-full bg-orange-600/20 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-250px] h-[460px] w-[460px] rounded-full bg-orange-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 shadow-[0_0_35px_rgba(249,115,22,0.25)]">
            <div className="absolute -left-2 flex flex-col gap-1 opacity-80">
              <span className="h-1 w-5 rounded-full bg-orange-500" />
              <span className="h-1 w-7 rounded-full bg-orange-500" />
              <span className="h-1 w-4 rounded-full bg-orange-500" />
            </div>
            <span className="text-2xl font-black text-orange-500">p</span>
          </div>

          <span className="text-2xl font-black tracking-tight">
            pedisk
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
          <a className="transition hover:text-white" href="#recursos">
            Recursos
          </a>
          <a className="transition hover:text-white" href="#como-funciona">
            Como funciona
          </a>
          <a className="transition hover:text-white" href="#planos">
            Planos
          </a>
          <a className="transition hover:text-white" href="#faq">
            Dúvidas
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-full px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:text-white md:block">
            Entrar
          </button>

          <button className="group rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_40px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5 hover:bg-orange-400">
            Criar minha loja
          </button>

          <button className="rounded-2xl border border-white/10 p-3 md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pt-16">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
            <Sparkles size={16} className="text-orange-400" />
            Sua loja online com cara de aplicativo
          </div>

          <h1 className="animate-slide-up max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">
            Seu cardápio não precisa parecer{" "}
            <span className="relative inline-block text-orange-500">
              comum.
              <span className="absolute -bottom-2 left-0 h-3 w-full rounded-full bg-orange-500/20 blur-sm" />
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
            Crie uma vitrine digital moderna para vender mais, mostrar
            promoções, organizar produtos e receber pedidos prontos no WhatsApp.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button className="group flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-7 py-4 text-base font-black text-white shadow-[0_0_45px_rgba(249,115,22,0.45)] transition hover:-translate-y-1 hover:bg-orange-400">
              Começar agora
              <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </button>

            <button className="group flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-400/40 hover:bg-orange-500/10">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-400/40 text-orange-400">
                <Play size={14} fill="currentColor" />
              </span>
              Ver demonstração
            </button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
              >
                <p className="text-2xl font-black text-orange-400">{item.value}</p>
                <p className="mt-1 text-xs leading-4 text-zinc-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[520px] justify-center lg:justify-end">
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-500/20 bg-orange-500/10 blur-sm" />
          <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-[80px]" />

          <div className="relative w-[330px] animate-soft-pulse rounded-[46px] border border-white/15 bg-[#0b0b0d] p-3 shadow-[0_0_80px_rgba(249,115,22,0.25)]">
            <div className="rounded-[36px] border border-white/10 bg-black p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-orange-500/20 ring-1 ring-orange-400/30" />
                    <div>
                      <p className="text-sm font-black">Smash House</p>
                      <p className="text-[11px] text-green-400">Aberto agora • 30-40 min</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-full border border-white/10 p-2">
                  <ShoppingCart size={16} />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-[#f97316] p-5 shadow-[0_0_18px_rgba(249,115,22,0.12)]">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <p className="mb-2 inline-flex rounded-full bg-black/35 px-3 py-1 text-[10px] font-bold text-orange-100">
                  🔥 promoção de hoje
                </p>
                <h3 className="text-3xl font-black leading-none">
                  Combo
                  <br />
                  Extreme
                </h3>
                <p className="mt-3 text-2xl font-black text-yellow-300">
                  R$ 49,90
                </p>
                <button className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                  Pedir agora
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Entrega", "R$ 4,99"],
                  ["Tempo", "30-40m"],
                  ["Mínimo", "R$ 20"],
                ].map(([a, b]) => (
                  <div
                    key={a}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <p className="text-[10px] text-zinc-400">{a}</p>
                    <p className="mt-1 text-[12px] font-black">{b}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2 overflow-hidden">
                {["🍔", "🍕", "🍟", "🥤"].map((emoji, index) => (
                  <div
                    key={emoji}
                    className={`flex h-14 min-w-14 items-center justify-center rounded-2xl border text-xl ${
                      index === 0
                        ? "border-orange-400/50 bg-orange-500/20"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    {emoji}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <h4 className="font-black">Mais pedidos</h4>
                <span className="text-xs font-bold text-orange-400">Ver todos</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {products.slice(0, 2).map((product) => (
                  <div
                    key={product.name}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="mb-3 flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-zinc-950 text-4xl">
                      {product.emoji}
                    </div>
                    <p className="text-xs font-black">{product.name}</p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-400">
                      {product.desc}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-black text-orange-400">
                        {product.price}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500">
                        <Plus size={15} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          

          <div className="absolute -left-3 bottom-28 hidden scale-90 lg:block animate-pulse rounded-3xl border border-orange-400/20 bg-black/70 p-5 backdrop-blur-xl">
            <p className="text-sm font-bold text-zinc-300">Carrinho</p>
            <p className="mt-1 text-2xl font-black text-orange-400">R$ 76,69</p>
            <p className="mt-2 text-xs text-zinc-500">Pedido pronto no WhatsApp</p>
          </div>
        </div>
      </section>

      <section id="recursos" className="relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-[28px] border border-white/10 bg-black/40 p-6 transition duration-300 hover:-translate-y-2 hover:border-orange-400/40 hover:bg-orange-500/10 hover:shadow-[0_0_45px_rgba(249,115,22,0.16)]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-400 transition group-hover:scale-110">
                    <Icon size={23} />
                  </div>
                  <h3 className="text-lg font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-orange-400">
            simples e rápido
          </p>
          <h2 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
            Sua loja online em poucos minutos.
          </h2>
          <p className="mt-5 text-zinc-400">
            Sem complicação, sem sistema pesado e sem depender de marketplace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative rounded-[30px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
              >
                <span className="absolute right-5 top-5 text-5xl font-black text-white/[0.04]">
                  {step.number}
                </span>

                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-400 shadow-[0_0_35px_rgba(249,115,22,0.15)]">
                  <Icon size={26} />
                </div>

                <h3 className="text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl">
            <p className="mb-3 inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-300">
              Para comércio local
            </p>
            <h2 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
              Aparência de app grande para loja pequena vender mais.
            </h2>
            <p className="mt-5 leading-8 text-zinc-400">
              O cliente bate o olho, entende a promoção, escolhe o produto,
              adiciona no carrinho e chama sua loja no WhatsApp com o pedido
              organizado.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Cardápio interativo com categorias",
                "Produtos com foto, descrição e preço",
                "Banner de promoção no topo da loja",
                "Carrinho bonito e pedido pronto no WhatsApp",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <BadgeCheck className="text-orange-400" size={20} />
                  <span className="font-semibold text-zinc-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[34px] border border-white/10 bg-black/50 p-6">
              <LayoutDashboard className="mb-5 text-orange-400" size={32} />
              <h3 className="text-2xl font-black">Painel simples</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                O dono cadastra produtos, organiza categorias e vê a prévia da
                loja sem depender de ninguém.
              </p>
            </div>

            <div className="rounded-[34px] border border-orange-400/25 bg-orange-500/10 p-6 shadow-[0_0_45px_rgba(249,115,22,0.13)]">
              <Gift className="mb-5 text-orange-400" size={32} />
              <h3 className="text-2xl font-black">Promoções no topo</h3>
              <p className="mt-3 text-sm leading-6 text-orange-100/70">
                O produto mais lucrativo aparece primeiro e chama atenção de
                quem acabou de abrir a loja.
              </p>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-black/50 p-6 sm:col-span-2">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                  <MessageCircle size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Pedido via WhatsApp</h3>
                  <p className="text-sm text-zinc-400">sem API no começo</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 font-mono text-sm leading-7 text-zinc-300">
                🍔 Pedido - Smash House
                <br />
                1x Smash Bacon — R$ 32,90
                <br />
                1x Batata Suprema — R$ 18,90
                <br />
                Entrega — R$ 4,99
                <br />
                <span className="text-orange-400">Total — R$ 56,79</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-orange-400">
            plano inicial
          </p>
          <h2 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
            Comece simples. Venda com aparência premium.
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-[36px] border border-orange-400/40 bg-gradient-to-br from-orange-500/15 to-white/[0.03] p-8 shadow-[0_0_70px_rgba(249,115,22,0.18)]">
            <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-orange-500/20 blur-[70px]" />
            <p className="mb-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-white">
              mais escolhido
            </p>
            <h3 className="text-2xl font-black">Plano Inicial</h3>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-black">R$29</span>
              <span className="mb-2 text-zinc-400">/mês</span>
            </div>
            <p className="mt-4 text-zinc-400">
              Perfeito para começar sua vitrine digital.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Loja online com link próprio",
                "Produtos ilimitados no MVP",
                "Pedidos via WhatsApp",
                "Banner de promoção",
                "Visual mobile premium",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <BadgeCheck size={19} className="text-orange-400" />
                  <span className="text-sm font-semibold text-zinc-200">{item}</span>
                </div>
              ))}
            </div>

            <button className="mt-9 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 font-black text-white transition hover:bg-orange-400">
              Começar agora <ArrowRight size={20} />
            </button>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-white/[0.03] p-8">
            <p className="mb-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-300">
              em breve
            </p>
            <h3 className="text-2xl font-black">Plano Pro</h3>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-black text-orange-400">Pro</span>
            </div>
            <p className="mt-4 text-zinc-400">
              Para lojas que querem cupons, relatórios, temas extras e mais
              controle.
            </p>

            <div className="mt-8 space-y-4 text-zinc-400">
              {[
                "Cupons de desconto",
                "Relatórios de vendas",
                "Mais temas premium",
                "Fidelidade de clientes",
                "Domínio personalizado",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Star size={18} className="text-orange-400" />
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>

            <button className="mt-9 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black text-zinc-400">
              Em breve
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-orange-400/25 bg-gradient-to-r from-orange-500/20 via-white/[0.04] to-orange-500/10 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="max-w-2xl text-4xl font-black tracking-[-0.04em] md:text-6xl">
                Transforme sua loja em uma vitrine que dá vontade de comprar.
              </h2>
              <p className="mt-5 max-w-xl text-zinc-300">
                Visual bonito vende confiança. E confiança aumenta pedido.
              </p>
            </div>

            <button className="group flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-8 py-5 font-black text-white shadow-[0_0_45px_rgba(249,115,22,0.35)] transition hover:-translate-y-1 hover:bg-orange-400">
              Criar minha loja
              <ArrowRight className="transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-zinc-500 md:flex-row">
          <p className="font-black text-white">
            <span className="text-orange-500">p</span>edisk
          </p>
          <p>© 2026 Pedisk. Sua vitrine digital com cara de app.</p>
        </div>
      </footer>
    </main>
  );
}