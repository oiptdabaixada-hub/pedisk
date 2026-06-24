"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  MessageCircle,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  emoji: string;
  name: string;
  description: string;
  price: string;
  category: string;
  active: boolean;
  featured: boolean;
};

const initialProducts: Product[] = [
  {
    id: 1,
    emoji: "🍔",
    name: "Smash Bacon",
    description: "Pão brioche, cheddar e bacon.",
    price: "32,90",
    category: "Hambúrgueres",
    active: true,
    featured: true,
  },
  {
    id: 2,
    emoji: "🔥",
    name: "Combo Duplo",
    description: "Burger + fritas + refri.",
    price: "49,90",
    category: "Combos",
    active: true,
    featured: false,
  },
  {
    id: 3,
    emoji: "🍟",
    name: "Batata Suprema",
    description: "Batata com cheddar e bacon.",
    price: "18,90",
    category: "Porções",
    active: false,
    featured: false,
  },
];

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    emoji: "🍔",
    name: "",
    description: "",
    price: "",
    category: "Hambúrgueres",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  function resetForm() {
    setForm({
      emoji: "🍔",
      name: "",
      description: "",
      price: "",
      category: "Hambúrgueres",
    });
    setEditing(null);
  }

  function saveProduct() {
    if (!form.name || !form.price) return;

    if (editing) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editing.id
            ? {
                ...product,
                emoji: form.emoji,
                name: form.name,
                description: form.description,
                price: form.price,
                category: form.category,
              }
            : product
        )
      );

      resetForm();
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      emoji: form.emoji,
      name: form.name,
      description: form.description,
      price: form.price,
      category: form.category,
      active: true,
      featured: false,
    };

    setProducts((current) => [newProduct, ...current]);
    resetForm();
  }

  function editProduct(product: Product) {
    setEditing(product);
    setForm({
      emoji: product.emoji,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });
  }

  function deleteProduct(id: number) {
    setProducts((current) => current.filter((product) => product.id !== id));
  }

  function duplicateProduct(product: Product) {
    setProducts((current) => [
      {
        ...product,
        id: Date.now(),
        name: `${product.name} cópia`,
        featured: false,
      },
      ...current,
    ]);
  }

  function toggleActive(id: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, active: !product.active } : product
      )
    );
  }

  function toggleFeatured(id: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, featured: !product.featured } : product
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-220px] top-[-180px] h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-[150px]" />
        <div className="absolute bottom-[-260px] right-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_340px] lg:px-6">
        <div className="space-y-5">
          <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <a
                href="/painel"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-orange-400"
              >
                <ArrowLeft size={16} />
                Voltar
              </a>

              <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
                Produtos da vitrine
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Cadastre, edite, destaque e organize tudo em poucos cliques.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-black/35 px-4 py-3">
                <p className="text-xl font-black text-orange-400">
                  {products.length}
                </p>
                <p className="text-[11px] text-zinc-500">produtos</p>
              </div>

              <div className="rounded-2xl bg-black/35 px-4 py-3">
                <p className="text-xl font-black text-orange-400">
                  {products.filter((p) => p.active).length}
                </p>
                <p className="text-[11px] text-zinc-500">ativos</p>
              </div>

              <div className="rounded-2xl bg-black/35 px-4 py-3">
                <p className="text-xl font-black text-orange-400">
                  {products.filter((p) => p.featured).length}
                </p>
                <p className="text-[11px] text-zinc-500">destaques</p>
              </div>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
                <Search size={18} className="ml-2 text-orange-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-orange-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={18} className="text-zinc-700" />

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/35 text-2xl">
                        {product.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{product.name}</p>

                          {product.featured && (
                            <span className="rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-black text-orange-300">
                              destaque
                            </span>
                          )}

                          {!product.active && (
                            <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-[10px] font-black text-zinc-400">
                              oculto
                            </span>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                          {product.description}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-black text-orange-400">
                            R$ {product.price}
                          </span>

                          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-zinc-500">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        <Edit3 size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={() => duplicateProduct(product)}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        <Copy size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={() => toggleFeatured(product.id)}
                        className={`rounded-xl border py-2 ${
                          product.featured
                            ? "border-orange-400/40 bg-orange-500/15 text-orange-400"
                            : "border-white/10 bg-black/30 text-zinc-300"
                        }`}
                      >
                        <Star size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={() => toggleActive(product.id)}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        {product.active ? (
                          <Eye size={15} className="mx-auto" />
                        ) : (
                          <EyeOff size={15} className="mx-auto" />
                        )}
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-red-300"
                      >
                        <Trash2 size={15} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-4 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-black">
                    {editing ? "Editar produto" : "Novo produto"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Já deixa pronto pro banco.
                  </p>
                </div>

                {editing && (
                  <button
                    onClick={resetForm}
                    className="rounded-xl bg-black/30 p-2 text-zinc-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="flex h-[72px] items-center justify-center rounded-2xl border border-dashed border-orange-400/40 bg-black/35 text-3xl">
                    {form.emoji}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-300">
                      Emoji/foto
                    </label>
                    <input
                      value={form.emoji}
                      onChange={(e) =>
                        setForm({ ...form, emoji: e.target.value })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>
                </div>

                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome do produto"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                />

                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descrição curta"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="Preço"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                  />

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                  >
                    <option>Hambúrgueres</option>
                    <option>Combos</option>
                    <option>Porções</option>
                    <option>Bebidas</option>
                  </select>
                </div>

                <button
                  onClick={saveProduct}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400"
                >
                  {editing ? <Check size={18} /> : <Plus size={18} />}
                  {editing ? "Salvar alterações" : "Adicionar produto"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black">Preview ao vivo</p>
              <p className="text-xs text-zinc-500">A vitrine mudando junto.</p>
            </div>
            <Package className="text-orange-400" size={20} />
          </div>

          <div className="mx-auto max-w-[290px] rounded-[38px] border border-white/15 bg-black p-3">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080808]">
              <div className="bg-[#f97316] p-4">
                <p className="mb-2 inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black">
                  🔥 promoção
                </p>
                <h3 className="text-2xl font-black leading-none">
                  Smash House
                </h3>
                <p className="mt-2 text-xs text-orange-100">
                  Hambúrguer artesanal
                </p>
              </div>

              <div className="space-y-2 p-3">
                {products
                  .filter((product) => product.active)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-3 rounded-2xl bg-white/[0.05] p-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                        {product.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black">{product.name}</p>
                        <p className="line-clamp-1 text-[11px] text-zinc-500">
                          {product.description}
                        </p>
                        <p className="mt-1 text-xs font-black text-orange-400">
                          R$ {product.price}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black">
                  <MessageCircle size={15} />
                  Finalizar pedido
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}