"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

type Product = {
  id: number;
  slug: string;
  name: string;
  desc: string;
  fullDesc: string;
  price: number;
  emoji: string;
  image: string;
  category: string;
  highlight?: boolean;
};

type Extra = {
  id: number;
  name: string;
  price: number;
  emoji: string;
};

type CartItem = {
  cartId: string;
  productId: number;
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

const products: Product[] = [
  {
    id: 1,
    slug: "smash-bacon",
    name: "Smash Bacon",
    desc: "Pão brioche, cheddar, bacon crocante e molho especial.",
    fullDesc:
      "Burger artesanal feito na chapa com pão brioche selado, carne smash suculenta, cheddar cremoso, bacon crocante e molho especial da casa.",
    price: 32.9,
    emoji: "🍔",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    category: "Hambúrgueres",
    highlight: true,
  },
  {
    id: 2,
    slug: "combo-duplo",
    name: "Combo Duplo",
    desc: "Burger artesanal, fritas crocantes e refrigerante gelado.",
    fullDesc:
      "Combo completo com burger artesanal, batata frita crocante e refrigerante gelado. Ideal pra quem quer pedir tudo em um só clique.",
    price: 49.9,
    emoji: "🔥",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349",
    category: "Combos",
    highlight: true,
  },
  {
    id: 3,
    slug: "batata-suprema",
    name: "Batata Suprema",
    desc: "Batata crocante com cheddar cremoso e bacon.",
    fullDesc:
      "Porção de batata frita sequinha, coberta com cheddar cremoso e bacon crocante. Perfeita pra acompanhar qualquer pedido.",
    price: 18.9,
    emoji: "🍟",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
    category: "Porções",
  },
  {
    id: 4,
    slug: "coca-cola-lata",
    name: "Coca-Cola Lata",
    desc: "Refrigerante gelado 350ml.",
    fullDesc:
      "Coca-Cola lata 350ml bem gelada para acompanhar seu pedido.",
    price: 8,
    emoji: "🥤",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
    category: "Bebidas",
  },
];

const extras: Extra[] = [
  {
    id: 1,
    name: "Bacon extra",
    price: 5,
    emoji: "🥓",
  },
  {
    id: 2,
    name: "Cheddar extra",
    price: 4,
    emoji: "🧀",
  },
  {
    id: 3,
    name: "Carne extra",
    price: 9,
    emoji: "🥩",
  },
  {
    id: 4,
    name: "Molho especial",
    price: 3,
    emoji: "🔥",
  },
];

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();

  const slug = String(params.slug || "");

  const product =
    products.find((item) => item.slug === slug) || products[0];

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [added, setAdded] = useState(false);

  const extrasTotal = useMemo(() => {
    return selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  }, [selectedExtras]);

  const unitTotal = product.price + extrasTotal;
  const finalTotal = unitTotal * quantity;

  function money(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function toggleExtra(extra: Extra) {
    const exists = selectedExtras.some((item) => item.id === extra.id);

    if (exists) {
      setSelectedExtras((current) =>
        current.filter((item) => item.id !== extra.id)
      );
      return;
    }

    setSelectedExtras((current) => [...current, extra]);
  }

  function addToCart() {
    const newItem: CartItem = {
      cartId: `${product.slug}-${Date.now()}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      desc: product.desc,
      price: product.price,
      image: product.image,
      emoji: product.emoji,
      quantity,
      observation,
      extras: selectedExtras,
      total: finalTotal,
    };

    const currentCartRaw = localStorage.getItem("pedisk-cart");
    const currentCart: CartItem[] = currentCartRaw
      ? JSON.parse(currentCartRaw)
      : [];

    localStorage.setItem(
      "pedisk-cart",
      JSON.stringify([...currentCart, newItem])
    );

    setAdded(true);
  }

  return (
    <main className="min-h-screen bg-[#050505] pb-32 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[150px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-5xl px-4">
        <header className="sticky top-0 z-40 -mx-4 border-b border-white/10 bg-[#050505]/85 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center">
              <p className="text-sm font-black">Produto</p>
              <p className="text-xs text-zinc-500">Smash House</p>
            </div>

            <Link
              href="/checkout"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500"
            >
              <ShoppingBag size={18} />
            </Link>
          </div>
        </header>

        <div className="pt-4">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="relative h-[260px] overflow-hidden md:h-[420px]">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {product.highlight && (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-black">
                  <Flame size={14} />
                  Mais pedido
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-3xl">{product.emoji}</span>
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-black text-orange-300 backdrop-blur">
                    {product.category}
                  </span>
                </div>

                <h1 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">
                  {product.name}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">
                  {product.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3">
              <MiniInfo icon={<Truck size={15} />} label="Entrega" value="R$5" />
              <MiniInfo icon={<Clock3 size={15} />} label="Tempo" value="30-40" />
              <MiniInfo icon={<Star size={15} />} label="Nota" value="4.9" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h2 className="text-xl font-black">Descrição</h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {product.fullDesc}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">Adicionais</h2>
                    <p className="text-sm text-zinc-500">
                      Turbine seu pedido.
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
                    opcional
                  </span>
                </div>

                <div className="space-y-3">
                  {extras.map((extra) => {
                    const active = selectedExtras.some(
                      (item) => item.id === extra.id
                    );

                    return (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-orange-400/60 bg-orange-500/15"
                            : "border-white/10 bg-black/25"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-xl">
                            {extra.emoji}
                          </div>

                          <div>
                            <p className="font-black">{extra.name}</p>
                            <p className="text-sm text-yellow-300">
                              + {money(extra.price)}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            active
                              ? "bg-orange-500"
                              : "bg-white/[0.06]"
                          }`}
                        >
                          {active && <Check size={15} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h2 className="text-xl font-black">Observação</h2>

                <textarea
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  placeholder="Ex: sem cebola, maionese à parte, ponto da carne..."
                  className="mt-4 min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:sticky lg:top-20">
              <div className="mb-5">
                <p className="text-sm text-zinc-500">Preço</p>
                <p className="text-4xl font-black text-yellow-300">
                  {money(product.price)}
                </p>
              </div>

              <div className="mb-5 rounded-2xl bg-black/30 p-4">
                <p className="mb-3 text-sm font-black">Quantidade</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="text-2xl font-black">{quantity}</span>

                  <button
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-black/30 p-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Produto</span>
                  <span>{money(product.price)}</span>
                </div>

                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Adicionais</span>
                  <span>{money(extrasTotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Quantidade</span>
                  <span>{quantity}x</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4 text-xl font-black">
                  <span>Total</span>
                  <span className="text-yellow-300">
                    {money(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black shadow-[0_18px_50px_rgba(249,115,22,0.35)]"
              >
                <ShoppingBag size={19} />
                Adicionar ao carrinho
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

              <h2 className="text-2xl font-black">
                Produto adicionado
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Seu produto foi salvo no carrinho. Você pode continuar
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black"
                >
                  Finalizar pedido
                  <ChevronRight size={18} />
                </Link>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-black/35 p-3">
      <div className="mb-2 text-orange-400">{icon}</div>
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="mt-0.5 text-xs font-black md:text-sm">{value}</p>
    </div>
  );
}