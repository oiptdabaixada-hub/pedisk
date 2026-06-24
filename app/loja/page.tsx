"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Search,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

type Product = {
  id: number;
  slug: string;
  name: string;
  desc: string;
  price: number;
  emoji: string;
  image: string;
  category: string;
  highlight?: boolean;
};

const categories = [
  { name: "Todos", emoji: "🔥" },
  { name: "Hambúrgueres", emoji: "🍔" },
  { name: "Combos", emoji: "🔥" },
  { name: "Porções", emoji: "🍟" },
  { name: "Bebidas", emoji: "🥤" },
];

const products: Product[] = [
  {
    id: 1,
    slug: "smash-bacon",
    name: "Smash Bacon",
    desc: "Pão brioche, cheddar, bacon crocante e molho especial.",
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
    price: 8,
    emoji: "🥤",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
    category: "Bebidas",
  },
  {
    id: 5,
    slug: "batata-bacon",
    name: "Batata Bacon",
    desc: "Batata sequinha com bacon e cheddar.",
    price: 22.9,
    emoji: "🍟",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d",
    category: "Porções",
  },
  {
    id: 6,
    slug: "guarana-lata",
    name: "Guaraná Lata",
    desc: "Guaraná gelado 350ml.",
    price: 7,
    emoji: "🥤",
    image: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a",
    category: "Bebidas",
  },
];

export default function LojaPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;

      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.desc.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  function money(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main className="min-h-screen bg-[#050505] pb-24 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[150px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-4">
        <header className="sticky top-0 z-40 -mx-4 border-b border-white/10 bg-[#050505]/85 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                <ArrowLeft size={17} />
              </button>

              <div>
                <p className="text-base font-black leading-tight">Smash House</p>
                <p className="text-xs font-semibold text-green-400">
                  Aberto agora • 30-40 min
                </p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.35)]"
            >
              <ShoppingBag size={18} />
            </Link>
          </div>
        </header>

        <div className="pt-4">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="relative h-[185px] overflow-hidden md:h-[250px]">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591"
                alt="Banner da loja"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/10 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-6">
                <div className="flex items-end gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-orange-500 text-4xl shadow-[0_0_35px_rgba(249,115,22,0.35)] md:h-20 md:w-20">
                    🍔
                  </div>

                  <div>
                    <div className="mb-1 inline-flex rounded-full bg-green-500/15 px-3 py-1 text-[11px] font-black text-green-400">
                      ● Aberto agora
                    </div>

                    <h1 className="text-3xl font-black tracking-[-0.05em] md:text-5xl">
                      Smash House
                    </h1>

                    <p className="mt-1 line-clamp-2 max-w-xl text-xs text-zinc-300 md:text-sm">
                      Hambúrguer artesanal, combos e porções feitos pra pedir rápido.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 p-3">
              <MiniInfo icon={<Truck size={15} />} label="Entrega" value="R$5" />
              <MiniInfo icon={<Clock3 size={15} />} label="Tempo" value="30-40" />
              <MiniInfo icon={<ShoppingBag size={15} />} label="Mínimo" value="R$20" />
              <MiniInfo icon={<Star size={15} />} label="Nota" value="4.9" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-xl bg-black/35 px-4 py-3">
              <Search size={17} className="text-orange-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="sticky top-[65px] z-30 -mx-4 mt-4 border-y border-white/10 bg-[#050505]/90 px-4 py-3 backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`min-w-fit rounded-xl border px-4 py-2.5 text-xs font-black transition ${
                    selectedCategory === category.name
                      ? "border-orange-400/60 bg-orange-500/15 text-orange-300"
                      : "border-white/10 bg-white/[0.04] text-zinc-400"
                  }`}
                >
                  <span className="mr-1">{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <section className="mt-5">
            <div className="mb-4">
              <h2 className="text-2xl font-black tracking-[-0.04em]">
                Produtos
              </h2>
              <p className="text-sm text-zinc-500">
                Toque em um item para ver detalhes.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredProducts.map((product) => (
                <Link
                  href={`/produto/${product.slug}`}
                  key={product.id}
                  className="group flex gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl transition hover:border-orange-400/40 hover:bg-orange-500/10"
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[20px] md:h-32 md:w-36">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {product.highlight && (
                      <div className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-1 text-[9px] font-black">
                        top
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{product.emoji}</span>
                        <h3 className="truncate text-base font-black md:text-lg">
                          {product.name}
                        </h3>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 md:text-sm">
                        {product.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xl font-black text-yellow-300">
                        {money(product.price)}
                      </p>

                      <div className="flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-xs font-black">
                        Ver
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <Link
          href="/checkout"
          className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-2xl border border-orange-400/20 bg-orange-500 px-4 py-3 font-black shadow-[0_18px_50px_rgba(249,115,22,0.35)]"
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