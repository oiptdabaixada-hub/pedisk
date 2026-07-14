"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, BadgeCheck, Check, ChevronDown, Flame, LayoutDashboard,
  Link2, Menu, PackageCheck, Play, Plus, Rocket, Search, ShieldCheck,
  ShoppingBag, ShoppingCart, Smartphone, Sparkles, Store, X, Zap,
} from "lucide-react";

const DEMO_URL = "/loja";

const features = [
  { icon: Smartphone, title: "Loja com cara de aplicativo", desc: "Uma experiência moderna, rápida e pensada para vender no celular." },
  { icon: PackageCheck, title: "Pedidos organizados", desc: "Receba e acompanhe novos pedidos em um painel centralizado e em tempo real." },
  { icon: Flame, title: "Promoções que chamam atenção", desc: "Destaque ofertas, produtos e preços promocionais para vender mais." },
  { icon: LayoutDashboard, title: "Você controla tudo", desc: "Cadastre, edite, organize e ative produtos sem depender de ninguém." },
];

const steps = [
  { number: "01", icon: Store, title: "Crie sua conta", desc: "Entre no Pedisk e comece a montar a presença digital da sua loja." },
  { number: "02", icon: ShoppingBag, title: "Monte seu cardápio", desc: "Adicione fotos, categorias, produtos, adicionais, preços e promoções." },
  { number: "03", icon: Link2, title: "Compartilhe sua loja", desc: "Divulgue seu link no Instagram, WhatsApp, status, bio e onde quiser." },
  { number: "04", icon: PackageCheck, title: "Receba os pedidos", desc: "Acompanhe cada pedido em um painel organizado e mantenha o cliente atualizado." },
];

const planItems = [
  "Loja digital profissional",
  "Cadastro de produtos e categorias",
  "Fotos, descrições e adicionais",
  "Promoções e produtos em destaque",
  "Checkout organizado para o cliente",
  "Painel de pedidos em tempo real",
  "Controle de status dos pedidos",
  "Configuração de entrega",
  "Logo, banner e identidade da loja",
  "Link para compartilhar sua loja",
];

const faqs = [
  { q: "O cliente precisa baixar algum aplicativo?", a: "Não. O cliente acessa sua loja pelo link, escolhe os produtos e faz o pedido diretamente pelo navegador." },
  { q: "Preciso entender de tecnologia para usar?", a: "Não. O Pedisk foi pensado para ser simples: você cadastra sua loja, adiciona os produtos e administra tudo pelo painel." },
  { q: "Onde eu recebo os pedidos?", a: "Os pedidos ficam organizados no seu painel, onde você acompanha as etapas do atendimento e mantém o cliente atualizado." },
  { q: "Posso usar no celular e no computador?", a: "Sim. O Pedisk funciona pelo navegador e foi desenvolvido para funcionar bem tanto no celular quanto no computador." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-orange-500">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-300px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[160px]" />
        <div className="absolute right-[-280px] top-[240px] h-[620px] w-[620px] rounded-full bg-orange-600/15 blur-[170px]" />
        <div className="absolute bottom-[8%] left-[-280px] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      </div>

      <header className="relative z-50 border-b border-white/[0.06] bg-[#050505]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="Pedisk - Página inicial"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-[16px] bg-orange-500/45 blur-xl opacity-60 transition duration-300 group-hover:opacity-100" />

              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] border border-orange-200/20 bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 shadow-[0_12px_40px_rgba(249,115,22,0.35)]">
                <span className="text-[28px] font-black leading-none tracking-[-0.08em] text-white">
                  P
                </span>

                <span className="absolute inset-x-2 top-[2px] h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-white/20 blur-[2px]" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[26px] font-black leading-[0.9] tracking-[-0.06em] text-white">
                pedisk<span className="text-orange-500">.</span>
              </span>

              <span className="mt-1.5 text-[8px] font-black uppercase tracking-[0.24em] text-zinc-500">
                Sua Vitrine Digital
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-zinc-400 md:flex">
            <a href="#recursos" className="transition hover:text-white">Recursos</a>
            <a href="#como-funciona" className="transition hover:text-white">Como funciona</a>
            <a href="#plano" className="transition hover:text-white">Plano</a>
            <a href="#duvidas" className="transition hover:text-white">Dúvidas</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-2xl px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/5 hover:text-white">
              Entrar
            </Link>
            <Link href="/cadastro" className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black shadow-[0_0_35px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-400">
              Criar minha loja <ArrowRight size={17} />
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:hidden" aria-label="Abrir menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#080808] px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-2">
              {[["Recursos","#recursos"],["Como funciona","#como-funciona"],["Plano","#plano"],["Dúvidas","#duvidas"]].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 font-bold text-zinc-300 hover:bg-white/5">
                  {label}
                </a>
              ))}
              <div className="my-2 h-px bg-white/10" />
              <Link href="/login" className="rounded-2xl border border-white/10 px-4 py-3 text-center font-black">Entrar</Link>
              <Link href="/cadastro" className="rounded-2xl bg-orange-500 px-4 py-3 text-center font-black">Criar minha loja</Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative z-10 mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-5 pb-24 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-200">
            <Sparkles size={16} className="text-orange-400" />
            Seu delivery. Sua marca. Seus clientes.
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.055em] md:text-7xl lg:text-[82px]">
            Pare de perder pedidos em conversas <span className="text-orange-500">bagunçadas.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
            Transforme sua loja em um delivery profissional com cardápio online,
            checkout e painel de pedidos em tempo real — tudo em um só lugar.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/cadastro" className="group flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-7 py-4 font-black shadow-[0_0_45px_rgba(249,115,22,0.4)] transition hover:-translate-y-1 hover:bg-orange-400">
              Criar minha loja <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href={DEMO_URL} className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-black transition hover:-translate-y-1 hover:border-orange-400/40 hover:bg-orange-500/10">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-400/40 text-orange-400"><Play size={14} fill="currentColor" /></span>
              Ver loja funcionando
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-zinc-400">
            {["Sem taxa por pedido", "Feito para o celular", "Configuração simples"].map((item) => (
              <span key={item} className="flex items-center gap-2"><Check size={17} className="text-orange-400" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[540px] justify-center lg:justify-end">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[80px]" />

          <div className="relative w-[338px] rounded-[48px] border border-white/15 bg-[#0a0a0b] p-3 shadow-[0_0_90px_rgba(249,115,22,0.24)]">
            <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

            <div className="overflow-hidden rounded-[38px] border border-white/10 bg-[#080808]">
              {/* Banner separado do cabeçalho da loja para evitar qualquer sobreposição */}
              <div className="relative h-[138px] overflow-hidden bg-gradient-to-br from-[#251006] via-[#8f2e08] to-orange-500 p-4 pt-8">
                <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-black/10" />

                <span className="relative z-10 rounded-full bg-black/35 px-3 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-orange-100">
                  oferta do dia
                </span>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-orange-100/70">
                      destaque da casa
                    </p>
                    <h3 className="mt-1 text-[24px] font-black leading-[0.92] tracking-[-0.04em] text-white">
                      Sabor que
                      <br />
                      chama atenção.
                    </h3>
                  </div>

                  <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[22px] border border-white/15 bg-black/20 text-[40px] shadow-xl backdrop-blur-sm">
                    🍔
                  </div>
                </div>
              </div>

              {/* Informações da loja começam somente depois do banner */}
              <div className="px-4 pb-4 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500 text-2xl shadow-[0_0_25px_rgba(249,115,22,0.18)]">
                      👑
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">King Burguês</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Aberto agora
                      </p>
                    </div>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    <ShoppingCart size={15} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[["Entrega","R$ 5,00"],["Tempo","30-45m"],["Mínimo","R$ 20"]].map(([label,value]) => (
                    <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
                      <p className="truncate text-[9px] text-zinc-500">{label}</p>
                      <p className="mt-1 truncate text-[11px] font-black">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-zinc-500">
                  <Search size={14} />
                  <span className="text-[10px]">Buscar no cardápio...</span>
                </div>

                <div className="mt-3 flex gap-2 overflow-hidden">
                  {["🍔 Burgers","🍟 Porções","🥤 Bebidas"].map((item,index) => (
                    <span
                      key={item}
                      className={`whitespace-nowrap rounded-full border px-3 py-2 text-[9px] font-black ${
                        index === 0
                          ? "border-orange-400/40 bg-orange-500/15 text-orange-300"
                          : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <h4 className="text-sm font-black">Mais pedidos</h4>
                  <span className="text-[10px] font-black text-orange-400">Ver todos</span>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    ["🍔","Royal Bacon","Blend, cheddar e bacon crocante","R$ 34,90"],
                    ["🔥","Brutus BBQ","Burger artesanal com molho barbecue","R$ 32,90"],
                  ].map(([emoji,name,desc,price]) => (
                    <div key={name} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
                        {emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black">{name}</p>
                        <p className="mt-1 truncate text-[9px] text-zinc-500">{desc}</p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] font-black text-orange-400">{price}</span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                            <Plus size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl bg-orange-500 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-bold text-orange-100">2 itens no carrinho</p>
                    <p className="text-xs font-black">R$ 67,80</p>
                  </div>
                  <span className="text-[10px] font-black">Ver carrinho →</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-5 top-24 hidden rounded-3xl border border-white/10 bg-black/75 p-4 backdrop-blur-xl lg:block">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><PackageCheck size={20} /></div><div><p className="text-xs font-black">Novo pedido recebido</p><p className="mt-1 text-[10px] text-zinc-500">Atualização em tempo real</p></div></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-[30px] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4">
          {[["0%","taxa por pedido"],["R$29","por mês"],["24h","sua loja disponível"],["100%","pensado para mobile"]].map(([value,label]) => (
            <div key={label} className="rounded-2xl bg-black/30 p-5 text-center"><p className="text-2xl font-black text-orange-400 md:text-3xl">{value}</p><p className="mt-1 text-xs font-semibold text-zinc-500">{label}</p></div>
          ))}
        </div>
      </section>

      <section id="recursos" className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-orange-400">Mais organização. Mais presença. Mais vendas.</p>
          <h2 className="text-4xl font-black tracking-[-0.045em] md:text-6xl">Tudo que sua loja precisa para vender sem parecer improvisada.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-400">Deixe o cardápio bagunçado para trás e ofereça uma experiência que valoriza sua marca desde o primeiro clique.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="group rounded-[30px] border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-2 hover:border-orange-400/35 hover:bg-orange-500/[0.07]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-400"><Icon size={24} /></div>
                <h3 className="text-xl font-black">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[36px] border border-orange-400/25 bg-gradient-to-br from-orange-500/15 to-white/[0.025] p-8 md:p-10">
            <p className="mb-4 inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-black text-orange-300">Feito para comércio local</p>
            <h2 className="text-4xl font-black tracking-[-0.045em] md:text-5xl">Seu cliente quer comprar. Não quer ficar perguntando tudo no WhatsApp.</h2>
            <p className="mt-6 leading-8 text-zinc-300">Preço, foto, adicionais, entrega e produtos ficam organizados em uma experiência simples. O cliente escolhe com mais autonomia e sua equipe recebe o pedido com muito mais clareza.</p>
            <div className="mt-8 space-y-4">
              {["Menos perguntas repetidas durante o atendimento","Mais clareza para o cliente escolher","Pedidos centralizados em um painel","Uma vitrine que valoriza sua marca"].map((item) => (
                <div key={item} className="flex items-start gap-3"><BadgeCheck className="mt-0.5 shrink-0 text-orange-400" size={20} /><span className="font-semibold text-zinc-200">{item}</span></div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-7"><LayoutDashboard className="mb-6 text-orange-400" size={34} /><h3 className="text-2xl font-black">Painel simples de usar</h3><p className="mt-3 text-sm leading-6 text-zinc-400">Produtos, categorias, entrega e aparência da loja sob o seu controle.</p></div>
            <div className="rounded-[34px] border border-orange-400/25 bg-orange-500/10 p-7"><Zap className="mb-6 text-orange-400" size={34} /><h3 className="text-2xl font-black">Pedidos em tempo real</h3><p className="mt-3 text-sm leading-6 text-orange-100/70">Novos pedidos aparecem no painel para sua equipe acompanhar o atendimento.</p></div>
            <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-7 sm:col-span-2">
              <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400"><ShoppingCart size={25} /></div><div><h3 className="text-2xl font-black">Do cardápio ao pedido, sem bagunça.</h3><p className="mt-3 text-sm leading-6 text-zinc-400">O cliente escolhe produtos, adicionais, informa os dados de entrega e finaliza o pedido em um fluxo organizado.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-orange-400">simples de verdade</p>
          <h2 className="text-4xl font-black tracking-[-0.045em] md:text-6xl">Sua loja online em poucos passos.</h2>
          <p className="mt-5 text-zinc-400">Você monta. Compartilha. Recebe pedidos. O Pedisk organiza o caminho.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
                <span className="absolute right-5 top-3 text-6xl font-black text-white/[0.035]">{step.number}</span>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-orange-400"><Icon size={26} /></div>
                <h3 className="text-xl font-black">{step.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="plano" className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-orange-400">um plano. sem complicação.</p>
          <h2 className="text-4xl font-black tracking-[-0.045em] md:text-6xl">Tudo que você precisa por um preço que cabe no negócio.</h2>
        </div>

        <div className="mx-auto max-w-3xl rounded-[40px] border border-orange-400/35 bg-gradient-to-br from-orange-500/15 via-white/[0.04] to-white/[0.02] p-7 shadow-[0_0_80px_rgba(249,115,22,0.16)] md:p-10">
          <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <span className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-wider">Plano Pedisk</span>
              <h3 className="mt-6 text-3xl font-black">Sua loja mais profissional.</h3>
              <div className="mt-7 flex items-end gap-2"><span className="text-6xl font-black tracking-[-0.06em]">R$29</span><span className="mb-2 text-zinc-400">/mês</span></div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">Sem taxa por pedido. Uma assinatura simples para organizar e profissionalizar seu delivery.</p>
              <Link href="/cadastro" className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 font-black transition hover:bg-orange-400">Criar minha loja <ArrowRight size={19} /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {planItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"><div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-400"><Check size={13} strokeWidth={3} /></div><span className="text-sm font-semibold leading-5 text-zinc-300">{item}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="duvidas" className="relative z-10 mx-auto max-w-4xl px-5 py-24 lg:px-8">
        <div className="mb-12 text-center"><p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-orange-400">dúvidas rápidas</p><h2 className="text-4xl font-black tracking-[-0.045em] md:text-6xl">Antes de começar.</h2></div>
        <div className="space-y-3">
          {faqs.map((faq,index) => (
            <button key={faq.q} type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full rounded-[26px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-orange-400/25 md:p-6">
              <div className="flex items-center justify-between gap-5"><span className="font-black md:text-lg">{faq.q}</span><ChevronDown size={20} className={`shrink-0 text-orange-400 transition ${openFaq === index ? "rotate-180" : ""}`} /></div>
              {openFaq === index && <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{faq.a}</p>}
            </button>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-[40px] border border-orange-400/25 bg-gradient-to-r from-orange-500/20 via-white/[0.045] to-orange-500/10 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500"><Rocket size={27} /></div>
              <h2 className="max-w-3xl text-4xl font-black tracking-[-0.045em] md:text-6xl">Sua loja já vende. Agora faça ela parecer tão profissional quanto merece.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">Crie sua conta, monte sua vitrine e transforme a experiência dos seus pedidos.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/cadastro" className="flex min-w-[220px] items-center justify-center gap-3 rounded-2xl bg-orange-500 px-8 py-5 font-black shadow-[0_0_45px_rgba(249,115,22,0.35)] transition hover:-translate-y-1 hover:bg-orange-400">Criar minha loja <ArrowRight /></Link>
              <Link href="/login" className="text-center text-sm font-bold text-zinc-400 hover:text-white">Já tenho uma conta</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="Pedisk - Página inicial"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-[14px] bg-orange-500/35 blur-lg opacity-50 transition group-hover:opacity-90" />

                <div className="relative flex h-11 w-11 items-center justify-center rounded-[14px] border border-orange-200/20 bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 shadow-[0_10px_30px_rgba(249,115,22,0.28)]">
                  <span className="text-[25px] font-black leading-none tracking-[-0.08em] text-white">
                    P
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[24px] font-black leading-[0.9] tracking-[-0.06em] text-white">
                  pedisk<span className="text-orange-500">.</span>
                </span>

                <span className="mt-1.5 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-600">
                  Sua Vitrine Digital
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">Cardápio digital e gestão de pedidos para quem quer vender com mais organização e presença profissional.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-zinc-500">
            <a href="#recursos" className="hover:text-white">Recursos</a><a href="#como-funciona" className="hover:text-white">Como funciona</a><a href="#plano" className="hover:text-white">Plano</a><Link href="/login" className="hover:text-white">Entrar</Link>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Pedisk. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2"><ShieldCheck size={14} /><span>Feito para deixar seu delivery mais profissional.</span></div>
        </div>
      </footer>
    </main>
  );
}