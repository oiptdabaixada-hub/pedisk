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
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from "lucide-react";

type Category = {
  id: number;
  emoji: string;
  name: string;
  description: string;
  active: boolean;
  featured: boolean;
};

const initialCategories: Category[] = [
  {
    id: 1,
    emoji: "🍔",
    name: "Hambúrgueres",
    description: "Smash, artesanais e combos principais.",
    active: true,
    featured: true,
  },
  {
    id: 2,
    emoji: "🍟",
    name: "Porções",
    description: "Batata, acompanhamentos e entradas.",
    active: true,
    featured: false,
  },
  {
    id: 3,
    emoji: "🥤",
    name: "Bebidas",
    description: "Refrigerantes, sucos e adicionais.",
    active: true,
    featured: false,
  },
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    emoji: "🍔",
    name: "",
    description: "",
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  function resetForm() {
    setEditing(null);
    setForm({
      emoji: "🍔",
      name: "",
      description: "",
    });
  }

  function saveCategory() {
    if (!form.name) return;

    if (editing) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editing.id
            ? {
                ...category,
                emoji: form.emoji,
                name: form.name,
                description: form.description,
              }
            : category
        )
      );
      resetForm();
      return;
    }

    setCategories((current) => [
      {
        id: Date.now(),
        emoji: form.emoji,
        name: form.name,
        description: form.description,
        active: true,
        featured: false,
      },
      ...current,
    ]);

    resetForm();
  }

  function editCategory(category: Category) {
    setEditing(category);
    setForm({
      emoji: category.emoji,
      name: category.name,
      description: category.description,
    });
  }

  function deleteCategory(id: number) {
    setCategories((current) => current.filter((category) => category.id !== id));
  }

  function duplicateCategory(category: Category) {
    setCategories((current) => [
      {
        ...category,
        id: Date.now(),
        name: `${category.name} cópia`,
        featured: false,
      },
      ...current,
    ]);
  }

  function toggleActive(id: number) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? { ...category, active: !category.active }
          : category
      )
    );
  }

  function toggleFeatured(id: number) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? { ...category, featured: !category.featured }
          : category
      )
    );
  }

  function moveCategory(id: number, direction: "up" | "down") {
    setCategories((current) => {
      const index = current.findIndex((category) => category.id === id);
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= current.length) return current;

      const updated = [...current];
      const [removed] = updated.splice(index, 1);
      updated.splice(newIndex, 0, removed);

      return updated;
    });
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-220px] top-[-180px] h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-[150px]" />
        <div className="absolute bottom-[-260px] right-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_330px] lg:px-6">
        <div className="space-y-5">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <a
              href="/painel"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-orange-400"
            >
              <ArrowLeft size={16} />
              Voltar
            </a>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
                  Categorias da vitrine
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                  Organize o cardápio do jeito mais simples possível.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xl font-black text-orange-400">
                    {categories.length}
                  </p>
                  <p className="text-[11px] text-zinc-500">categorias</p>
                </div>

                <div className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xl font-black text-orange-400">
                    {categories.filter((c) => c.active).length}
                  </p>
                  <p className="text-[11px] text-zinc-500">ativas</p>
                </div>

                <div className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xl font-black text-orange-400">
                    {categories.filter((c) => c.featured).length}
                  </p>
                  <p className="text-[11px] text-zinc-500">destaques</p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
                <Search size={18} className="ml-2 text-orange-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar categoria..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-3">
                {filteredCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-orange-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={18} className="text-zinc-700" />

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/35 text-2xl">
                        {category.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{category.name}</p>

                          {category.featured && (
                            <span className="rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-black text-orange-300">
                              destaque
                            </span>
                          )}

                          {!category.active && (
                            <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-[10px] font-black text-zinc-400">
                              oculta
                            </span>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                          {category.description}
                        </p>

                        <p className="mt-2 text-[11px] font-bold text-zinc-600">
                          Ordem #{index + 1}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-2">
                      <button
                        onClick={() => moveCategory(category.id, "up")}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-xs font-black text-zinc-300 hover:border-orange-400/40"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() => moveCategory(category.id, "down")}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-xs font-black text-zinc-300 hover:border-orange-400/40"
                      >
                        ↓
                      </button>

                      <button
                        onClick={() => editCategory(category)}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        <Edit3 size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={() => duplicateCategory(category)}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        <Copy size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={() => toggleFeatured(category.id)}
                        className={`rounded-xl border py-2 ${
                          category.featured
                            ? "border-orange-400/40 bg-orange-500/15 text-orange-400"
                            : "border-white/10 bg-black/30 text-zinc-300"
                        }`}
                      >
                        <Star size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={() => toggleActive(category.id)}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        {category.active ? (
                          <Eye size={15} className="mx-auto" />
                        ) : (
                          <EyeOff size={15} className="mx-auto" />
                        )}
                      </button>

                      <button
                        onClick={() => deleteCategory(category.id)}
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
                    {editing ? "Editar categoria" : "Nova categoria"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Simples, rápido e visual.
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
                      Emoji
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
                  placeholder="Nome da categoria"
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

                <button
                  onClick={saveCategory}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400"
                >
                  {editing ? <Check size={18} /> : <Plus size={18} />}
                  {editing ? "Salvar alterações" : "Adicionar categoria"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black">Preview ao vivo</p>
              <p className="text-xs text-zinc-500">
                Ordem das categorias na loja.
              </p>
            </div>
            <ShoppingBag className="text-orange-400" size={20} />
          </div>

          <div className="mx-auto max-w-[290px] rounded-[38px] border border-white/15 bg-black p-3">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080808]">
              <div className="bg-[#f97316] p-4">
                <p className="mb-2 inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black">
                  categorias
                </p>
                <h3 className="text-2xl font-black leading-none">
                  Smash House
                </h3>
                <p className="mt-2 text-xs text-orange-100">
                  Escolha uma seção
                </p>
              </div>

              <div className="space-y-2 p-3">
                {categories
                  .filter((category) => category.active)
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                        {category.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black">{category.name}</p>
                        <p className="line-clamp-1 text-[11px] text-zinc-500">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black">
                  <MessageCircle size={15} />
                  Fazer pedido
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}