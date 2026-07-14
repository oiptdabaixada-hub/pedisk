"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Search,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

type BlockKey =
  | "banner"
  | "info"
  | "search"
  | "categories"
  | "products"
  | "whatsapp";

type LayoutBlock = {
  key: BlockKey;
  active: boolean;
};

type StoreData = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp: string | null;
  is_open: boolean;
  is_published: boolean;
  delivery_time: string | null;
  minimum_order: number | null;
  default_delivery_fee: number | null;
  rating: number | null;
  primary_color: string | null;
  text_color: string | null;
  price_color: string | null;
  background_color: string | null;
  card_color: string | null;
  layout_config: LayoutBlock[] | null;
};

type Category = {
  id: string;
  store_id: string;
  name: string;
  emoji: string;
  position: number;
  active: boolean;
  description: string | null;
  featured: boolean;
};

type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string | null;
  description: string;
  price: number;
  image_url: string | null;
  emoji: string;
  is_promotion: boolean;
  promotion_price: number | null;
  active: boolean;
  position: number;
};

const DEFAULT_LAYOUT: LayoutBlock[] = [
  { key: "banner", active: true },
  { key: "info", active: true },
  { key: "search", active: true },
  { key: "categories", active: true },
  { key: "products", active: true },
  { key: "whatsapp", active: true },
];

export default function PublicStorePage() {
  const params = useParams<{ slug: string }>();

  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug)
    ? rawSlug[0]
    : typeof rawSlug === "string"
    ? rawSlug
    : "";

  const [store, setStore] = useState<StoreData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewAppearance, setPreviewAppearance] = useState<{ primaryColor?: string; textColor?: string; priceColor?: string; backgroundColor?: string; cardColor?: string; }>({});

  useEffect(() => {
    function handleAppearancePreview(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "PEDISK_APPEARANCE_PREVIEW") return;
      setPreviewAppearance(event.data.payload || {});
    }
    window.addEventListener("message", handleAppearancePreview);
    return () => window.removeEventListener("message", handleAppearancePreview);
  }, []);

  useEffect(() => {
    if (!slug) return;
    loadStoreBySlug(slug);
  }, [slug]);

  async function loadStoreBySlug(currentSlug: string) {
    setLoading(true);

    try {
      const normalizedSlug = currentSlug.toLowerCase().trim();

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", normalizedSlug)
        .eq("is_published", true)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setStore(null);
        setCategories([]);
        setProducts([]);
        return;
      }

      setStore(storeData as StoreData);

      const [categoriesResult, productsResult] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("active", true)
          .order("position", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("store_id", storeData.id)
          .eq("active", true)
          .order("position", { ascending: true }),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (productsResult.error) throw productsResult.error;

      setCategories((categoriesResult.data || []) as Category[]);
      setProducts((productsResult.data || []) as Product[]);
    } catch (error) {
      console.error("Erro geral na loja pública:", error);
      setStore(null);
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const visibleCategories = useMemo(() => {
    return [{ id: "todos", name: "Todos", emoji: "🔥" }, ...categories];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const category = categories.find(
        (item) => item.id === product.category_id
      );

      const matchCategory =
        selectedCategory === "Todos" ||
        category?.name === selectedCategory;

      const term = search.toLowerCase().trim();

      const matchSearch =
        product.name.toLowerCase().includes(term) ||
        (product.description || "").toLowerCase().includes(term);

      return matchCategory && matchSearch;
    });
  }, [products, categories, selectedCategory, search]);

  function money(value: number | null | undefined) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function productHref(product: Product) {
    return `/produto/${product.slug || product.id}?loja=${store?.slug || slug}`;
  }

  const checkoutHref = store
    ? `/checkout?loja=${store.slug}`
    : "/checkout";

  const primaryColor = previewAppearance.primaryColor || store?.primary_color || "#f97316";
  const textColor = previewAppearance.textColor || store?.text_color || "#ffffff";
  const priceColor = previewAppearance.priceColor || store?.price_color || "#facc15";
  const backgroundColor = previewAppearance.backgroundColor || store?.background_color || "#050505";
  const cardColor = previewAppearance.cardColor || store?.card_color || "#101010";
  const deliveryFee = store?.default_delivery_fee || 0;
  const minimumOrder = store?.minimum_order || 0;
  const deliveryTime = store?.delivery_time || "30-40 min";
  const rating = store?.rating || 4.9;

  const layout = useMemo(() => {
    if (!store?.layout_config || !Array.isArray(store.layout_config)) {
      return DEFAULT_LAYOUT;
    }

    const valid = store.layout_config.filter((block) =>
      DEFAULT_LAYOUT.some((defaultBlock) => defaultBlock.key === block.key)
    );

    return valid.length > 0 ? valid : DEFAULT_LAYOUT;
  }, [store]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
      </main>
    );
  }

  if (!store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-center text-white">
        <div>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/[0.04] text-4xl">
            🏪
          </div>
          <h1 className="text-3xl font-black">Loja não encontrada</h1>
          <p className="mt-3 text-sm text-zinc-500">
            Essa loja não existe, ainda não foi publicada ou está temporariamente indisponível.
          </p>
        </div>
      </main>
    );
  }

  function renderBlock(key: BlockKey) {
    if (key === "banner") {
      return (
        <div
          key={key}
          className="overflow-hidden rounded-[28px] border border-white/10 backdrop-blur-xl" style={{ backgroundColor: cardColor }}
        >
          <div className="relative h-[185px] overflow-hidden md:h-[250px]">
            {store.banner_url ? (
              <img
                src={store.banner_url}
                alt="Banner da loja"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: primaryColor }}
              />
            )}

            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/10 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-6">
              <div className="flex items-end gap-3">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white text-4xl shadow-[0_0_35px_rgba(249,115,22,0.35)] md:h-20 md:w-20"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.logo_url?.startsWith("http") ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    store.logo_url || "p"
                  )}
                </div>

                <div>
                  <div
                    className={`mb-1 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                      store.is_open
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    ● {store.is_open ? "Aberto agora" : "Fechado agora"}
                  </div>

                  <h1 className="text-3xl font-black tracking-[-0.05em] md:text-5xl" style={{ color: textColor }}>
                    {store.name}
                  </h1>

                  <p className="mt-1 line-clamp-2 max-w-xl text-xs text-zinc-300 md:text-sm">
                    {store.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (key === "info") {
      return (
        <div
          key={key}
          className="grid grid-cols-4 gap-2 rounded-[28px] border border-white/10 p-3 backdrop-blur-xl" style={{ backgroundColor: cardColor }}
        >
          <MiniInfo
            icon={<Truck size={15} />}
            label="Entrega"
            value={money(deliveryFee)}
            color={primaryColor}
          />
          <MiniInfo
            icon={<Clock3 size={15} />}
            label="Tempo"
            value={deliveryTime}
            color={primaryColor}
          />
          <MiniInfo
            icon={<ShoppingBag size={15} />}
            label="Mínimo"
            value={money(minimumOrder)}
            color={primaryColor}
          />
          <MiniInfo
            icon={<Star size={15} />}
            label="Nota"
            value={String(rating)}
            color={primaryColor}
          />
        </div>
      );
    }

    if (key === "search") {
      return (
        <div
          key={key}
          className="rounded-2xl border border-white/10 p-2 backdrop-blur-xl" style={{ backgroundColor: cardColor }}
        >
          <div className="flex items-center gap-3 rounded-xl bg-black/35 px-4 py-3">
            <Search size={17} style={{ color: primaryColor }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>
      );
    }

    if (key === "categories") {
      return (
        <div
          key={key}
          className="sticky top-[65px] z-30 -mx-4 border-y border-white/10 px-4 py-3 backdrop-blur-xl" style={{ backgroundColor: `${backgroundColor}EB` }}
        >
          <div className="flex gap-2 overflow-x-auto">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`min-w-fit rounded-xl border px-4 py-2.5 text-xs font-black transition ${
                  selectedCategory === category.name
                    ? "text-orange-300"
                    : "border-white/10 bg-white/[0.04] text-zinc-400"
                }`}
                style={
                  selectedCategory === category.name
                    ? {
                        borderColor: `${primaryColor}99`,
                        backgroundColor: `${primaryColor}24`,
                        color: primaryColor,
                      }
                    : {}
                }
              >
                <span className="mr-1">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (key === "products") {
      return (
        <section key={key}>
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-[-0.04em]">
              Produtos
            </h2>
            <p className="text-sm text-zinc-500">
              Toque em um item para ver detalhes.
            </p>
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-[26px] border border-white/10 p-8 text-center backdrop-blur-xl" style={{ backgroundColor: cardColor }}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-3xl">
                🍽️
              </div>
              <h3 className="text-xl font-black">
                Nenhum produto encontrado
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                Tente outra busca ou outra categoria.
              </p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {filteredProducts.map((product) => {
              const price =
                product.is_promotion && product.promotion_price
                  ? product.promotion_price
                  : product.price;

              return (
                <Link
                  href={productHref(product)}
                  key={product.id}
                  className="group flex gap-3 rounded-[24px] border border-white/10 p-3 backdrop-blur-xl transition hover:border-orange-400/40" style={{ backgroundColor: cardColor }}
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[20px] bg-black/35 md:h-32 md:w-36">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl">
                        {product.emoji || "🍽️"}
                      </div>
                    )}

                    {product.is_promotion && (
                      <div
                        className="absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-black"
                        style={{ backgroundColor: primaryColor }}
                      >
                        PROMOÇÃO
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {product.emoji || "🍽️"}
                        </span>
                        <h3 className="truncate text-base font-black md:text-lg" style={{ color: textColor }}>
                          {product.name}
                        </h3>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 md:text-sm">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        {product.is_promotion && product.promotion_price && (
                          <p className="text-xs font-bold text-zinc-600 line-through">
                            {money(product.price)}
                          </p>
                        )}

                        <p className="text-xl font-black" style={{ color: priceColor }}>
                          {money(price)}
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Ver
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      );
    }

    return null;
  }

  const showCartButton = layout.some(
    (block) => block.key === "whatsapp" && block.active
  );

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor, color: textColor }}>
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full blur-[140px]"
          style={{ backgroundColor: `${primaryColor}26` }}
        />
        <div
          className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full blur-[150px]"
          style={{ backgroundColor: `${primaryColor}1A` }}
        />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-4">
        <header className="sticky top-0 z-40 -mx-4 border-b border-white/10 px-4 py-3 backdrop-blur-xl" style={{ backgroundColor: `${backgroundColor}E6` }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]"
                aria-label="Voltar"
              >
                <ArrowLeft size={17} />
              </button>

              <div>
                <p className="text-base font-black leading-tight">
                  {store.name}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    store.is_open ? "text-green-400" : "text-red-300"
                  }`}
                >
                  {store.is_open ? "Aberto agora" : "Fechado agora"} •{" "}
                  {deliveryTime}
                </p>
              </div>
            </div>

            <Link
              href={checkoutHref}
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_25px_rgba(249,115,22,0.35)]"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag size={18} />
            </Link>
          </div>
        </header>

        <div className="space-y-4 pt-4">
          {layout
            .filter((block) => block.active && block.key !== "whatsapp")
            .map((block) => renderBlock(block.key))}
        </div>

        {showCartButton && (
          <Link
            href={checkoutHref}
            className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-2xl border border-orange-400/20 px-4 py-3 font-black shadow-[0_18px_50px_rgba(249,115,22,0.35)]"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20">
                <ShoppingBag size={18} />
              </div>

              <div>
                <p className="text-sm">Ver carrinho</p>
                <p className="text-[11px] opacity-80">Finalizar pedido</p>
              </div>
            </div>

            <ChevronRight size={20} />
          </Link>
        )}
      </section>
    </main>
  );
}

function MiniInfo({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-black/35 p-3">
      <div className="mb-2" style={{ color }}>
        {icon}
      </div>
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="mt-0.5 text-xs font-black md:text-sm">{value}</p>
    </div>
  );
}
