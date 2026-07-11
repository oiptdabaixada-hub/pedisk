"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

type ProductData = {
  id: string;
  store_id: string;
  category_id: string | null;
  slug: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  emoji: string | null;
  is_promotion: boolean;
  promotion_price: number | null;
  active: boolean;
  position: number;
};

type StoreData = {
  id: string;
  name: string;
  whatsapp: string | null;
  delivery_time: string | null;
  default_delivery_fee: number | null;
  rating: number | null;
  primary_color: string | null;
};

type CategoryData = {
  id: string;
  name: string;
  emoji: string | null;
};

type ProductAddon = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  active: boolean;
  position: number;
};

type CartExtra = {
  id: string;
  name: string;
  price: number;
  emoji: string;
};

type CartItem = {
  cartId: string;
  productId: string;
  slug: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  emoji: string;
  quantity: number;
  observation: string;
  extras: CartExtra[];
  total: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function addonEmoji(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("bacon")) return "🥓";
  if (normalized.includes("queijo") || normalized.includes("cheddar"))
    return "🧀";
  if (
    normalized.includes("carne") ||
    normalized.includes("hambúrguer") ||
    normalized.includes("hamburguer")
  )
    return "🥩";
  if (normalized.includes("molho")) return "🥫";
  if (normalized.includes("ovo")) return "🍳";
  if (normalized.includes("cebola")) return "🧅";
  if (normalized.includes("batata")) return "🍟";
  if (normalized.includes("frango")) return "🍗";
  if (normalized.includes("calabresa")) return "🌭";
  if (normalized.includes("pizza")) return "🍕";
  if (
    normalized.includes("refrigerante") ||
    normalized.includes("coca") ||
    normalized.includes("guaraná") ||
    normalized.includes("guarana")
  )
    return "🥤";
  if (normalized.includes("cerveja")) return "🍺";
  if (normalized.includes("doce") || normalized.includes("sobremesa"))
    return "🍰";

  return "➕";
}

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = String(params.slug || "");

  const [product, setProduct] = useState<ProductData | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [addons, setAddons] = useState<ProductAddon[]>([]);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slugOrId]);

  async function loadProduct() {
    if (!slugOrId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setLoadError("");
    setSelectedAddonIds([]);
    setQuantity(1);
    setObservation("");

    try {
      let productData: ProductData | null = null;

      const { data: productBySlug, error: slugError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slugOrId)
        .maybeSingle();

      if (slugError) {
        console.error("Erro ao buscar produto pelo slug:", slugError);
      }

      if (productBySlug) {
        productData = productBySlug as ProductData;
      }

      if (!productData && isUuid(slugOrId)) {
        const { data: productById, error: idError } = await supabase
          .from("products")
          .select("*")
          .eq("id", slugOrId)
          .maybeSingle();

        if (idError) {
          console.error("Erro ao buscar produto pelo ID:", idError);
        }

        if (productById) {
          productData = productById as ProductData;
        }
      }

      if (!productData) {
        setNotFound(true);
        setProduct(null);
        setStore(null);
        setCategory(null);
        setAddons([]);
        return;
      }

      setProduct(productData);

      const [
        { data: storeData, error: storeError },
        categoryResult,
        { data: addonsData, error: addonsError },
      ] = await Promise.all([
        supabase
          .from("stores")
          .select(
            "id, name, whatsapp, delivery_time, default_delivery_fee, rating, primary_color"
          )
          .eq("id", productData.store_id)
          .maybeSingle(),

        productData.category_id
          ? supabase
              .from("categories")
              .select("id, name, emoji")
              .eq("id", productData.category_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        supabase
          .from("product_addons")
          .select("id, product_id, name, price, active, position")
          .eq("product_id", productData.id)
          .eq("active", true)
          .order("position", { ascending: true }),
      ]);

      if (storeError) {
        console.error("Erro ao buscar loja do produto:", storeError);
      }

      if (categoryResult.error) {
        console.error(
          "Erro ao buscar categoria do produto:",
          categoryResult.error
        );
      }

      if (addonsError) {
        console.error("Erro ao buscar adicionais do produto:", addonsError);
        throw addonsError;
      }

      setStore((storeData as StoreData | null) || null);
      setCategory((categoryResult.data as CategoryData | null) || null);
      setAddons((addonsData || []) as ProductAddon[]);
    } catch (error) {
      console.error("Erro geral ao carregar produto:", error);
      setLoadError(
        "Não foi possível carregar todas as informações deste produto."
      );
      setNotFound(false);
    } finally {
      setLoading(false);
    }
  }

  const selectedAddons = useMemo(
    () => addons.filter((addon) => selectedAddonIds.includes(addon.id)),
    [addons, selectedAddonIds]
  );

  const addonsTotal = useMemo(
    () =>
      selectedAddons.reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0
      ),
    [selectedAddons]
  );

  const productPrice = useMemo(() => {
    if (!product) return 0;

    if (
      product.is_promotion &&
      product.promotion_price !== null &&
      Number(product.promotion_price) > 0
    ) {
      return Number(product.promotion_price);
    }

    return Number(product.price || 0);
  }, [product]);

  const finalTotal = (productPrice + addonsTotal) * quantity;
  const primaryColor = store?.primary_color || "#f97316";
  const deliveryFee = Number(store?.default_delivery_fee || 0);
  const deliveryTime = store?.delivery_time || "30-40 min";
  const rating = Number(store?.rating || 4.9);

  function money(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId]
    );
  }

  function addToCart() {
    if (!product || !product.active || addingToCart) return;

    setAddingToCart(true);

    try {
      const cartExtras: CartExtra[] = selectedAddons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price || 0),
        emoji: addonEmoji(addon.name),
      }));

      const newItem: CartItem = {
        cartId: `${product.id}-${Date.now()}`,
        productId: product.id,
        slug: product.slug || product.id,
        name: product.name,
        desc: product.description || "",
        price: productPrice,
        image: product.image_url || "",
        emoji: product.emoji || "🍽️",
        quantity,
        observation: observation.trim(),
        extras: cartExtras,
        total: finalTotal,
      };

      const currentCartRaw = localStorage.getItem("pedisk-cart");
      let currentCart: CartItem[] = [];

      try {
        currentCart = currentCartRaw ? JSON.parse(currentCartRaw) : [];
        if (!Array.isArray(currentCart)) currentCart = [];
      } catch {
        currentCart = [];
      }

      localStorage.setItem(
        "pedisk-cart",
        JSON.stringify([...currentCart, newItem])
      );

      setAdded(true);
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
          <p className="text-sm font-bold text-zinc-500">
            Carregando produto...
          </p>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-center text-white">
        <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.04] p-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-white/[0.05] text-4xl">
            🍽️
          </div>

          <h1 className="text-3xl font-black">Produto não encontrado</h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Esse produto pode ter sido removido, ocultado ou o link está
            incorreto.
          </p>

          <Link
            href="/loja"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black"
          >
            Voltar para loja
            <ChevronRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pb-32 text-white">
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

      <section className="relative z-10 mx-auto max-w-5xl px-4">
        <header className="sticky top-0 z-40 -mx-4 border-b border-white/10 bg-[#050505]/85 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] transition hover:bg-white/[0.1]"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center">
              <p className="text-sm font-black">Produto</p>
              <p className="text-xs text-zinc-500">{store?.name || "Loja"}</p>
            </div>

            <Link
              href="/checkout"
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag size={18} />
            </Link>
          </div>
        </header>

        {loadError && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
            {loadError}
          </div>
        )}

        <div className="pt-4">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="relative h-[260px] overflow-hidden md:h-[420px]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-8xl"
                  style={{ backgroundColor: `${primaryColor}24` }}
                >
                  {product.emoji || "🍽️"}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

              {product.is_promotion && (
                <div
                  className="absolute left-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Flame size={14} />
                  Promoção
                </div>
              )}

              {!product.active && (
                <div className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 text-xs font-black shadow-xl">
                  Indisponível
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-3xl">{product.emoji || "🍽️"}</span>

                  <span
                    className="rounded-full bg-black/55 px-3 py-1 text-xs font-black backdrop-blur"
                    style={{ color: primaryColor }}
                  >
                    {category?.name || "Produto"}
                  </span>
                </div>

                <h1 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">
                  {product.name}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">
                  {product.description || "Produto disponível na loja."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3">
              <MiniInfo
                icon={<Truck size={15} />}
                label="Entrega"
                value={deliveryFee > 0 ? money(deliveryFee) : "Consultar"}
                color={primaryColor}
              />
              <MiniInfo
                icon={<Clock3 size={15} />}
                label="Tempo"
                value={deliveryTime}
                color={primaryColor}
              />
              <MiniInfo
                icon={<Star size={15} />}
                label="Nota"
                value={String(rating)}
                color={primaryColor}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h2 className="text-xl font-black">Descrição</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-400">
                  {product.description || "Sem descrição cadastrada."}
                </p>
              </div>

              {addons.length > 0 && (
                <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">Adicionais</h2>
                      <p className="text-sm text-zinc-500">
                        Escolha o que deseja acrescentar.
                      </p>
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-black"
                      style={{
                        backgroundColor: `${primaryColor}24`,
                        color: primaryColor,
                      }}
                    >
                      opcional
                    </span>
                  </div>

                  <div className="space-y-3">
                    {addons.map((addon) => {
                      const active = selectedAddonIds.includes(addon.id);

                      return (
                        <button
                          type="button"
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-white/20"
                          style={
                            active
                              ? {
                                  borderColor: `${primaryColor}99`,
                                  backgroundColor: `${primaryColor}24`,
                                }
                              : {}
                          }
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-xl">
                              {addonEmoji(addon.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-black">
                                {addon.name}
                              </p>
                              <p
                                className="text-sm font-black"
                                style={{ color: primaryColor }}
                              >
                                + {money(Number(addon.price))}
                              </p>
                            </div>
                          </div>

                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] transition"
                            style={
                              active
                                ? {
                                    backgroundColor: primaryColor,
                                  }
                                : {}
                            }
                          >
                            {active && <Check size={15} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h2 className="text-xl font-black">Observação</h2>

                <textarea
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  maxLength={300}
                  placeholder="Ex: sem cebola, maionese à parte, ponto da carne..."
                  className="mt-4 min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-white/20"
                />

                <p className="mt-2 text-right text-[10px] font-bold text-zinc-700">
                  {observation.length}/300
                </p>
              </div>
            </div>

            <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:sticky lg:top-20">
              <div className="mb-5">
                <p className="text-sm text-zinc-500">Preço</p>

                {product.is_promotion &&
                  product.promotion_price !== null &&
                  Number(product.promotion_price) > 0 && (
                    <p className="text-sm font-bold text-zinc-600 line-through">
                      {money(Number(product.price))}
                    </p>
                  )}

                <p
                  className="text-4xl font-black"
                  style={{ color: primaryColor }}
                >
                  {money(productPrice)}
                </p>
              </div>

              <div className="mb-5 rounded-2xl bg-black/30 p-4">
                <p className="mb-3 text-sm font-black">Quantidade</p>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    disabled={quantity <= 1}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="text-2xl font-black">{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.min(99, current + 1))
                    }
                    disabled={quantity >= 99}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-black/30 p-4">
                <div className="flex justify-between gap-3 text-sm text-zinc-400">
                  <span>Produto</span>
                  <span>{money(productPrice)}</span>
                </div>

                {addons.length > 0 && (
                  <div className="flex justify-between gap-3 text-sm text-zinc-400">
                    <span>Adicionais</span>
                    <span>{money(addonsTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between gap-3 text-sm text-zinc-400">
                  <span>Quantidade</span>
                  <span>{quantity}x</span>
                </div>

                <div className="flex justify-between gap-3 border-t border-white/10 pt-4 text-xl font-black">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>
                    {money(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={!product.active || addingToCart}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                style={
                  product.active && !addingToCart
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                {addingToCart ? (
                  <Loader2 size={19} className="animate-spin" />
                ) : (
                  <ShoppingBag size={19} />
                )}

                {!product.active
                  ? "Produto indisponível"
                  : addingToCart
                  ? "Adicionando..."
                  : "Adicionar ao carrinho"}
              </button>
            </aside>
          </div>
        </div>

        {added && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 backdrop-blur-sm md:items-center md:justify-center">
            <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[#090909] p-5 shadow-2xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500">
                <Check size={26} />
              </div>

              <h2 className="text-2xl font-black">Produto adicionado</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                O produto foi colocado no carrinho. Você pode continuar
                comprando ou finalizar o pedido.
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  href="/loja"
                  className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-black"
                >
                  Continuar comprando
                </Link>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black"
                  style={{ backgroundColor: primaryColor }}
                >
                  Finalizar pedido
                  <ChevronRight size={18} />
                </Link>

                <button
                  type="button"
                  onClick={() => setAdded(false)}
                  className="w-full py-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
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
      <p className="mt-0.5 truncate text-xs font-black md:text-sm">{value}</p>
    </div>
  );
}