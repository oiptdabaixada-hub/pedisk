"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bell,
  Check,
  Eye,
  EyeOff,
  Gift,
  GripVertical,
  Image,
  Info,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Trophy,
  Zap,
} from "lucide-react";

type Block = {
  id: number;
  title: string;
  desc: string;
  icon: "banner" | "categorias" | "destaques" | "vendidos" | "info" | "whatsapp";
  active: boolean;
  color: string;
};

const defaultBlocks: Block[] = [
  {
    id: 1,
    title: "Banner principal",
    desc: "Promoção principal no topo da loja.",
    icon: "banner",
    active: true,
    color: "bg-orange-500",
  },
  {
    id: 2,
    title: "Categorias",
    desc: "Mostra as categorias do cardápio.",
    icon: "categorias",
    active: true,
    color: "bg-pink-500",
  },
  {
    id: 3,
    title: "Produtos em destaque",
    desc: "Produtos escolhidos pelo lojista.",
    icon: "destaques",
    active: true,
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Mais vendidos",
    desc: "Produtos que mais chamam atenção.",
    icon: "vendidos",
    active: true,
    color: "bg-red-500",
  },
  {
    id: 5,
    title: "Informações da loja",
    desc: "Horário, endereço e entrega.",
    icon: "info",
    active: true,
    color: "bg-blue-500",
  },
  {
    id: 6,
    title: "Botão WhatsApp",
    desc: "Botão rápido para finalizar pedido.",
    icon: "whatsapp",
    active: true,
    color: "bg-green-500",
  },
];

const extraBlocks = [
  {
    title: "Promoção especial",
    desc: "Adicione uma oferta extra.",
    icon: Gift,
    color: "text-yellow-400",
  },
  {
    title: "Aviso da loja",
    desc: "Comunique algo importante.",
    icon: Megaphone,
    color: "text-purple-400",
  },
  {
    title: "Depoimentos",
    desc: "Mostre avaliações de clientes.",
    icon: MessageCircle,
    color: "text-green-400",
  },
  {
    title: "Galeria de fotos",
    desc: "Mostre fotos do negócio.",
    icon: Image,
    color: "text-blue-400",
  },
];

export default function ConstrutorPage() {
  const [mode, setMode] = useState<"facil" | "avancado">("facil");
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);

  const activeBlocks = blocks.filter((block) => block.active);

  function getIcon(icon: Block["icon"]) {
    const className = "text-white";
    if (icon === "banner") return <Image size={20} className={className} />;
    if (icon === "categorias") return <LayoutGrid size={20} className={className} />;
    if (icon === "destaques") return <Star size={20} className={className} />;
    if (icon === "vendidos") return <Zap size={20} className={className} />;
    if (icon === "info") return <Info size={20} className={className} />;
    return <MessageCircle size={20} className={className} />;
  }

  function moveBlock(id: number, direction: "up" | "down") {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= current.length) return current;

      const updated = [...current];
      const [removed] = updated.splice(index, 1);
      updated.splice(newIndex, 0, removed);

      return updated;
    });
  }

  function toggleBlock(id: number) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, active: !block.active } : block
      )
    );
  }

  function resetBlocks() {
    setBlocks(defaultBlocks);
  }

  function addExtraBlock(title: string, desc: string) {
    setBlocks((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        desc,
        icon: "banner",
        active: true,
        color: "bg-orange-500",
      },
    ]);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-260px] top-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/15 blur-[160px]" />
        <div className="absolute bottom-[-260px] right-[-260px] h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:76px_76px] opacity-20" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[230px_1fr_380px] lg:px-6">
        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black">
              p
            </div>
            <div>
              <p className="text-2xl font-black">pedisk</p>
              <p className="text-xs text-zinc-500">Painel premium</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-bold text-zinc-400">
            <SideLink href="/painel" icon={<Store size={18} />} label="Início" />
            <SideLink href="/painel/minha-loja" icon={<ShoppingBag size={18} />} label="Minha loja" />
            <SideLink href="/painel/produtos" icon={<ShoppingBag size={18} />} label="Produtos" />
            <SideLink href="/painel/categorias" icon={<LayoutGrid size={18} />} label="Categorias" />
            <SideLink href="/painel/aparencia" icon={<Sparkles size={18} />} label="Aparência" />
            <SideLink active href="/painel/construtor" icon={<LayoutGrid size={18} />} label="Construtor" />
          </nav>

          <div className="mt-8 rounded-[24px] border border-orange-400/20 bg-orange-500/10 p-4">
            <Sparkles size={20} className="mb-3 text-orange-400" />
            <p className="font-black">Dica Pedisk</p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Suba, desça e oculte blocos. A vitrine muda na mesma hora.
            </p>
          </div>
        </aside>

        <div className="space-y-5">
          <header className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <a
              href="/painel"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-orange-400"
            >
              <ArrowLeft size={16} />
              Voltar
            </a>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                  <Rocket size={14} />
                  Construtor visual
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
                  Monte sua vitrine arrastando os blocos.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Organize o que aparece primeiro na loja. Simples, visual e sem
                  complicação.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={resetBlocks}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-zinc-300 hover:border-orange-400/40"
                >
                  <RefreshCw size={17} />
                  Restaurar
                </button>

                <button className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black shadow-[0_0_35px_rgba(249,115,22,0.25)] hover:bg-orange-400">
                  <Rocket size={17} />
                  Publicar alterações
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl md:grid-cols-2">
            <button
              onClick={() => setMode("facil")}
              className={`rounded-[22px] border p-4 text-left transition ${
                mode === "facil"
                  ? "border-orange-400/50 bg-orange-500/10"
                  : "border-white/10 bg-black/25"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="text-orange-400" size={22} />
                <div>
                  <p className="font-black">Modo Fácil</p>
                  <p className="text-xs text-zinc-500">
                    Ideal para organizar rápido.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("avancado")}
              className={`rounded-[22px] border p-4 text-left transition ${
                mode === "avancado"
                  ? "border-orange-400/50 bg-orange-500/10"
                  : "border-white/10 bg-black/25"
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersIcon />
                <div>
                  <p className="font-black">Modo Avançado</p>
                  <p className="text-xs text-zinc-500">
                    Mais opções para personalizar.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Blocos da vitrine</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Suba, desça ou oculte seções da loja.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-black text-orange-300">
                {activeBlocks.length} ativos
              </div>
            </div>

            <div className="space-y-2">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`rounded-[22px] border p-3 transition ${
                    block.active
                      ? "border-white/10 bg-black/25 hover:border-orange-400/30"
                      : "border-white/5 bg-black/10 opacity-45"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={18} className="text-zinc-700" />

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${block.color}`}
                    >
                      {getIcon(block.icon)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black">{block.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                        {block.desc}
                      </p>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                      <ActionButton
                        disabled={index === 0}
                        onClick={() => moveBlock(block.id, "up")}
                      >
                        <ArrowUp size={17} />
                      </ActionButton>

                      <ActionButton
                        disabled={index === blocks.length - 1}
                        onClick={() => moveBlock(block.id, "down")}
                      >
                        <ArrowDown size={17} />
                      </ActionButton>

                      <ActionButton active onClick={() => toggleBlock(block.id)}>
                        {block.active ? <Eye size={17} /> : <EyeOff size={17} />}
                      </ActionButton>

                      <ActionButton>
                        <Pencil size={17} />
                      </ActionButton>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 sm:hidden">
                    <ActionButton
                      disabled={index === 0}
                      onClick={() => moveBlock(block.id, "up")}
                    >
                      <ArrowUp size={17} />
                    </ActionButton>

                    <ActionButton
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(block.id, "down")}
                    >
                      <ArrowDown size={17} />
                    </ActionButton>

                    <ActionButton active onClick={() => toggleBlock(block.id)}>
                      {block.active ? <Eye size={17} /> : <EyeOff size={17} />}
                    </ActionButton>

                    <ActionButton>
                      <Pencil size={17} />
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="mb-4">
              <h2 className="text-xl font-black">Adicionar nova seção</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Clique para adicionar novos blocos na vitrine.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {extraBlocks.map((extra) => {
                const Icon = extra.icon;

                return (
                  <button
                    key={extra.title}
                    onClick={() => addExtraBlock(extra.title, extra.desc)}
                    className="group rounded-[24px] border border-dashed border-white/15 bg-black/25 p-4 text-left transition hover:border-orange-400/50 hover:bg-orange-500/10"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Icon size={26} className={extra.color} />
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition group-hover:bg-orange-400">
                        <Plus size={17} />
                      </div>
                    </div>

                    <p className="font-black">{extra.title}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      {extra.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:block">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xl font-black">Preview ao vivo</p>
              <p className="mt-1 text-sm text-zinc-500">
                Veja como sua loja está ficando.
              </p>
            </div>

            <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
              <button className="rounded-xl bg-orange-500 px-3 py-2">
                <Smartphone size={17} />
              </button>
              <button className="rounded-xl px-3 py-2 text-zinc-500">
                <Eye size={17} />
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-[310px] rounded-[42px] border border-white/15 bg-black p-3 shadow-[0_0_70px_rgba(249,115,22,0.12)]">
            <div className="max-h-[680px] overflow-hidden rounded-[32px] border border-white/10 bg-[#080808]">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-black">
                    SH
                  </div>
                  <div>
                    <p className="font-black">Smash House</p>
                    <p className="text-xs text-green-400">Aberto agora</p>
                  </div>
                </div>

                <Bell size={18} className="text-zinc-500" />
              </div>

              <div className="space-y-3 p-3">
                {activeBlocks.map((block) => (
                  <PreviewBlock key={block.id} block={block} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-orange-400/20 bg-orange-500/10 p-4">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="mt-1 text-orange-400" />
              <div>
                <p className="font-black">Dica Pedisk</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Deixe banner e categorias no topo. Produtos e WhatsApp logo
                  depois para facilitar o pedido.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SideLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
        active
          ? "border border-orange-400/30 bg-orange-500/15 text-orange-300"
          : "hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 items-center justify-center rounded-xl border px-3 transition ${
        active
          ? "border-orange-400/30 bg-orange-500/10 text-orange-300"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-orange-400/40"
      } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
    >
      {children}
    </button>
  );
}

function PreviewBlock({ block }: { block: Block }) {
  if (block.icon === "banner") {
    return (
      <div className="rounded-[24px] bg-orange-500 p-4">
        <p className="mb-2 inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black">
          promoção
        </p>
        <p className="text-2xl font-black leading-none">Super Smash</p>
        <p className="mt-2 text-xl font-black text-yellow-200">R$ 49,90</p>
      </div>
    );
  }

  if (block.icon === "categorias") {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-black">Categorias</p>
          <p className="text-[10px] text-zinc-500">Ver todas</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["🍔", "🍟", "🥤", "🍰"].map((emoji) => (
            <div
              key={emoji}
              className="flex h-16 items-center justify-center rounded-2xl bg-white/[0.06] text-xl"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.icon === "destaques") {
    return (
      <div>
        <p className="mb-2 text-sm font-black">Destaques</p>
        <div className="grid grid-cols-2 gap-2">
          <ProductMini emoji="🍔" name="Smash Bacon" price="R$32,90" />
          <ProductMini emoji="🔥" name="Combo Duplo" price="R$49,90" />
        </div>
      </div>
    );
  }

  if (block.icon === "vendidos") {
    return (
      <div>
        <p className="mb-2 text-sm font-black">Mais vendidos</p>
        <div className="space-y-2">
          <ProductRow emoji="🍔" name="Combo Smash" price="R$42,90" />
          <ProductRow emoji="🍟" name="Batata Especial" price="R$18,90" />
        </div>
      </div>
    );
  }

  if (block.icon === "info") {
    return (
      <div className="rounded-2xl bg-white/[0.05] p-3">
        <p className="font-black">Informações</p>
        <p className="mt-1 text-xs text-zinc-500">
          Entrega em 30-40 min • Pedido mínimo R$20
        </p>
      </div>
    );
  }

  return (
    <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-black">
      <MessageCircle size={16} />
      Pedir no WhatsApp
    </button>
  );
}

function ProductMini({
  emoji,
  name,
  price,
}: {
  emoji: string;
  name: string;
  price: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-3">
      <div className="mb-2 flex h-14 items-center justify-center rounded-xl bg-black/25 text-2xl">
        {emoji}
      </div>
      <p className="text-[11px] font-black">{name}</p>
      <p className="mt-1 text-[11px] font-black text-yellow-300">{price}</p>
    </div>
  );
}

function ProductRow({
  emoji,
  name,
  price,
}: {
  emoji: string;
  name: string;
  price: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/25 text-xl">
        {emoji}
      </div>
      <div className="flex-1">
        <p className="text-xs font-black">{name}</p>
        <p className="text-xs font-black text-yellow-300">{price}</p>
      </div>
      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
        <Plus size={15} />
      </button>
    </div>
  );
}

function SlidersIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
      <Sparkles size={22} />
    </div>
  );
}