"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  Info,
  LayoutGrid,
  Loader2,
  MessageCircle,
  RefreshCw,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

type BlockKey =
  | "banner"
  | "info"
  | "search"
  | "categories"
  | "products"
  | "whatsapp";

type Block = {
  key: BlockKey;
  title: string;
  desc: string;
  active: boolean;
};

type StoreData = {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  layout_config: Array<{
    key: BlockKey;
    active: boolean;
  }> | null;
};

const DEFAULT_BLOCKS: Block[] = [
  {
    key: "banner",
    title: "Banner e identidade",
    desc: "Banner, logo, nome e descrição da loja.",
    active: true,
  },
  {
    key: "info",
    title: "Informações rápidas",
    desc: "Entrega, tempo, pedido mínimo e avaliação.",
    active: true,
  },
  {
    key: "search",
    title: "Busca do cardápio",
    desc: "Campo para o cliente encontrar produtos.",
    active: true,
  },
  {
    key: "categories",
    title: "Categorias",
    desc: "Filtros horizontais do cardápio.",
    active: true,
  },
  {
    key: "products",
    title: "Produtos",
    desc: "Lista principal de itens da loja.",
    active: true,
  },
  {
    key: "whatsapp",
    title: "Botão do carrinho",
    desc: "Atalho fixo para finalizar o pedido.",
    active: true,
  },
];

export default function ConstrutorPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const activeCount = useMemo(
    () => blocks.filter((block) => block.active).length,
    [blocks]
  );

  useEffect(() => {
    loadStore();
  }, []);

  async function loadStore() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Sessão não encontrada. Entre novamente.");
      }

      const { data, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug, is_published, layout_config")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!data) throw new Error("Nenhuma loja encontrada para esta conta.");

      const storeData = data as StoreData;
      setStore(storeData);

      const savedLayout = Array.isArray(storeData.layout_config)
        ? storeData.layout_config
        : [];

      if (savedLayout.length === 0) {
        setBlocks(DEFAULT_BLOCKS);
        return;
      }

      const merged = savedLayout
        .map((savedBlock) => {
          const defaultBlock = DEFAULT_BLOCKS.find(
            (block) => block.key === savedBlock.key
          );

          return defaultBlock
            ? {
                ...defaultBlock,
                active: savedBlock.active !== false,
              }
            : null;
        })
        .filter(Boolean) as Block[];

      DEFAULT_BLOCKS.forEach((defaultBlock) => {
        if (!merged.some((block) => block.key === defaultBlock.key)) {
          merged.push(defaultBlock);
        }
      });

      setBlocks(merged);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o construtor."
      );
    } finally {
      setLoading(false);
    }
  }

  function moveBlock(key: BlockKey, direction: "up" | "down") {
    setSaved(false);

    setBlocks((current) => {
      const index = current.findIndex((block) => block.key === key);
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= current.length) return current;

      const updated = [...current];
      const [removed] = updated.splice(index, 1);
      updated.splice(newIndex, 0, removed);

      return updated;
    });
  }

  function toggleBlock(key: BlockKey) {
    setSaved(false);

    setBlocks((current) =>
      current.map((block) =>
        block.key === key
          ? { ...block, active: !block.active }
          : block
      )
    );
  }

  function restoreDefault() {
    setBlocks(DEFAULT_BLOCKS);
    setSaved(false);
  }

  async function saveLayout() {
    if (!store) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const layoutConfig = blocks.map((block) => ({
        key: block.key,
        active: block.active,
      }));

      const { error: updateError } = await supabase
        .from("stores")
        .update({
          layout_config: layoutConfig,
        })
        .eq("id", store.id);

      if (updateError) throw updateError;

      setStore((current) =>
        current
          ? {
              ...current,
              layout_config: layoutConfig,
            }
          : current
      );

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSaving(false);
    }
  }

  function getIcon(key: BlockKey) {
    if (key === "banner") return <Image size={20} />;
    if (key === "info") return <Info size={20} />;
    if (key === "search") return <Search size={20} />;
    if (key === "categories") return <LayoutGrid size={20} />;
    if (key === "products") return <ShoppingBag size={20} />;
    return <MessageCircle size={20} />;
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-orange-400" size={34} />
          <p className="mt-4 text-sm font-bold text-zinc-500">
            Carregando construtor...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-260px] top-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/15 blur-[160px]" />
        <div className="absolute bottom-[-260px] right-[-260px] h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[180px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-5 lg:px-6">
        <header className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                <Rocket size={14} />
                Construtor visual
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-5xl">
                Organize a vitrine da sua loja.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Suba, desça ou esconda blocos. As alterações serão aplicadas em
                <strong className="text-white">
                  {" "}
                  {store?.slug ? `pedisk.com.br/${store.slug}` : "sua loja pública"}
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={restoreDefault}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-zinc-300"
              >
                <RefreshCw size={17} />
                Restaurar
              </button>

              <button
                onClick={saveLayout}
                disabled={saving || !store}
                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black shadow-[0_0_35px_rgba(249,115,22,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : saved ? (
                  <Check size={17} />
                ) : (
                  <Rocket size={17} />
                )}

                {saving
                  ? "Salvando..."
                  : saved
                  ? "Alterações salvas"
                  : "Publicar alterações"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Blocos da vitrine</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    A ordem abaixo será a mesma ordem da loja pública.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-black text-orange-300">
                  {activeCount} ativos
                </div>
              </div>

              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div
                    key={block.key}
                    className={`rounded-[22px] border p-3 transition ${
                      block.active
                        ? "border-white/10 bg-black/25"
                        : "border-white/5 bg-black/10 opacity-45"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={18} className="text-zinc-700" />

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
                        {getIcon(block.key)}
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
                          onClick={() => moveBlock(block.key, "up")}
                        >
                          <ArrowUp size={17} />
                        </ActionButton>

                        <ActionButton
                          disabled={index === blocks.length - 1}
                          onClick={() => moveBlock(block.key, "down")}
                        >
                          <ArrowDown size={17} />
                        </ActionButton>

                        <ActionButton
                          active
                          onClick={() => toggleBlock(block.key)}
                        >
                          {block.active ? (
                            <Eye size={17} />
                          ) : (
                            <EyeOff size={17} />
                          )}
                        </ActionButton>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
                      <ActionButton
                        disabled={index === 0}
                        onClick={() => moveBlock(block.key, "up")}
                      >
                        <ArrowUp size={17} />
                      </ActionButton>

                      <ActionButton
                        disabled={index === blocks.length - 1}
                        onClick={() => moveBlock(block.key, "down")}
                      >
                        <ArrowDown size={17} />
                      </ActionButton>

                      <ActionButton
                        active
                        onClick={() => toggleBlock(block.key)}
                      >
                        {block.active ? <Eye size={17} /> : <EyeOff size={17} />}
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-5">
              <p className="text-xl font-black">Resumo da vitrine</p>
              <p className="mt-1 text-sm text-zinc-500">
                Confira rapidamente a ordem publicada.
              </p>
            </div>

            <div className="space-y-2">
              {blocks
                .filter((block) => block.active)
                .map((block, index) => (
                  <div
                    key={block.key}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-sm font-black text-orange-300">
                      {index + 1}
                    </div>
                    <div className="text-orange-300">
                      {getIcon(block.key)}
                    </div>
                    <p className="text-sm font-black">{block.title}</p>
                  </div>
                ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-orange-400/20 bg-orange-500/10 p-4">
              <Sparkles size={20} className="mb-3 text-orange-400" />
              <p className="font-black">Dica Pedisk</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Para uma loja simples e rápida, mantenha identidade, informações,
                busca, categorias e produtos nessa ordem.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
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
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 items-center justify-center rounded-xl border px-3 transition ${
        active
          ? "border-orange-400/30 bg-orange-500/10 text-orange-300"
          : "border-white/10 bg-white/[0.04] text-zinc-300"
      } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
    >
      {children}
    </button>
  );
}
