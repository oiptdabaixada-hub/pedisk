"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Bike,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type DeliveryArea = {
  id: string;
  store_id: string;
  neighborhood: string;
  delivery_fee: number;
  minimum_order: number;
  delivery_time: string;
  active: boolean;
};

export default function EntregaPage() {
  const router = useRouter();

  const [storeId, setStoreId] = useState("");
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DeliveryArea | null>(null);
  const [selectedArea, setSelectedArea] = useState<DeliveryArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    neighborhood: "",
    fee: "",
    minOrder: "",
    time: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const filteredAreas = useMemo(() => {
    return areas.filter((area) =>
      area.neighborhood.toLowerCase().includes(search.toLowerCase())
    );
  }, [areas, search]);

  function parseMoney(value: string) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const number = Number(normalized);
    return Number.isNaN(number) ? 0 : number;
  }

  function formatMoney(value: number | null | undefined) {
    if (!value) return "0,00";
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  async function loadData() {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: storeData } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!storeData) {
      setLoading(false);
      return;
    }

    setStoreId(storeData.id);

    const { data: zonesData, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("store_id", storeData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar bairros:", error);
    }

    const loadedAreas = (zonesData || []) as DeliveryArea[];
    setAreas(loadedAreas);
    setSelectedArea(loadedAreas[0] || null);
    setLoading(false);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      neighborhood: "",
      fee: "",
      minOrder: "",
      time: "",
    });
  }

  async function saveArea() {
    if (!form.neighborhood || !form.fee || !storeId) return;

    setSaving(true);

    const payload = {
      store_id: storeId,
      neighborhood: form.neighborhood,
      delivery_fee: parseMoney(form.fee),
      minimum_order: parseMoney(form.minOrder),
      delivery_time: form.time || "30-50 min",
      active: true,
    };

    if (editing) {
      const { data, error } = await supabase
        .from("delivery_zones")
        .update({
          neighborhood: payload.neighborhood,
          delivery_fee: payload.delivery_fee,
          minimum_order: payload.minimum_order,
          delivery_time: payload.delivery_time,
        })
        .eq("id", editing.id)
        .select()
        .single();

      if (!error && data) {
        setAreas((current) =>
          current.map((area) => (area.id === editing.id ? data : area))
        );
        setSelectedArea(data);
        resetForm();
      }

      if (error) console.error("Erro ao editar bairro:", error);

      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("delivery_zones")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      setAreas((current) => [data, ...current]);
      setSelectedArea(data);
      resetForm();
    }

    if (error) console.error("Erro ao criar bairro:", error);

    setSaving(false);
  }

  function editArea(area: DeliveryArea) {
    setEditing(area);
    setForm({
      neighborhood: area.neighborhood,
      fee: formatMoney(area.delivery_fee),
      minOrder: formatMoney(area.minimum_order),
      time: area.delivery_time,
    });
  }

  async function duplicateArea(area: DeliveryArea) {
    const { data, error } = await supabase
      .from("delivery_zones")
      .insert({
        store_id: storeId,
        neighborhood: `${area.neighborhood} cópia`,
        delivery_fee: area.delivery_fee,
        minimum_order: area.minimum_order,
        delivery_time: area.delivery_time,
        active: true,
      })
      .select()
      .single();

    if (!error && data) {
      setAreas((current) => [data, ...current]);
    }

    if (error) console.error("Erro ao duplicar bairro:", error);
  }

  async function deleteArea(id: string) {
    const { error } = await supabase.from("delivery_zones").delete().eq("id", id);

    if (!error) {
      setAreas((current) => current.filter((area) => area.id !== id));

      if (selectedArea?.id === id) {
        setSelectedArea(null);
      }
    }

    if (error) console.error("Erro ao excluir bairro:", error);
  }

  async function toggleActive(area: DeliveryArea) {
    const nextActive = !area.active;

    const { data, error } = await supabase
      .from("delivery_zones")
      .update({ active: nextActive })
      .eq("id", area.id)
      .select()
      .single();

    if (!error && data) {
      setAreas((current) =>
        current.map((item) => (item.id === area.id ? data : item))
      );

      if (selectedArea?.id === area.id) {
        setSelectedArea(data);
      }
    }

    if (error) console.error("Erro ao alterar status:", error);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
      </main>
    );
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
                  Entrega da loja
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                  Defina bairros, taxas, pedido mínimo e tempo estimado.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xl font-black text-orange-400">
                    {areas.length}
                  </p>
                  <p className="text-[11px] text-zinc-500">áreas</p>
                </div>

                <div className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xl font-black text-orange-400">
                    {areas.filter((a) => a.active).length}
                  </p>
                  <p className="text-[11px] text-zinc-500">ativas</p>
                </div>

                <div className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xl font-black text-orange-400">bairro</p>
                  <p className="text-[11px] text-zinc-500">modelo</p>
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
                  placeholder="Buscar bairro..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                />
              </div>

              <div className="rounded-[24px] border border-orange-400/20 bg-orange-500/10 p-4 text-sm leading-6 text-orange-100">
                <b>Como funciona:</b> o lojista cadastra os bairros que atende.
                Na loja pública, o cliente escolhe o bairro. Se não estiver na
                lista, o pedido não libera.
              </div>

              {filteredAreas.length === 0 && (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
                  <p className="text-4xl">📍</p>
                  <h2 className="mt-3 text-xl font-black">
                    Nenhum bairro cadastrado
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Adicione o primeiro bairro atendido pela loja.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {filteredAreas.map((area) => (
                  <div
                    key={area.id}
                    onClick={() => setSelectedArea(area)}
                    className={`rounded-[24px] border p-4 backdrop-blur-xl transition ${
                      selectedArea?.id === area.id
                        ? "border-orange-400/40 bg-orange-500/10"
                        : "border-white/10 bg-white/[0.04] hover:border-orange-400/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/35 text-orange-400">
                        <MapPin size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{area.neighborhood}</p>

                          {!area.active && (
                            <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-[10px] font-black text-zinc-400">
                              desativado
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-zinc-500">
                          Taxa R$ {formatMoney(area.delivery_fee)} • mínimo R${" "}
                          {formatMoney(area.minimum_order)} •{" "}
                          {area.delivery_time}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          editArea(area);
                        }}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        <Edit3 size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          duplicateArea(area);
                        }}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        <Copy size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleActive(area);
                        }}
                        className="rounded-xl border border-white/10 bg-black/30 py-2 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
                      >
                        {area.active ? (
                          <Eye size={15} className="mx-auto" />
                        ) : (
                          <EyeOff size={15} className="mx-auto" />
                        )}
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedArea(area);
                        }}
                        className="rounded-xl border border-orange-400/20 bg-orange-500/10 py-2 text-orange-300"
                      >
                        <Bike size={15} className="mx-auto" />
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteArea(area.id);
                        }}
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
                    {editing ? "Editar área" : "Nova área"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Bairro, taxa e mínimo.
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
                <input
                  value={form.neighborhood}
                  onChange={(e) =>
                    setForm({ ...form, neighborhood: e.target.value })
                  }
                  placeholder="Bairro atendido"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.fee}
                    onChange={(e) => setForm({ ...form, fee: e.target.value })}
                    placeholder="Taxa ex: 5,00"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                  />

                  <input
                    value={form.minOrder}
                    onChange={(e) =>
                      setForm({ ...form, minOrder: e.target.value })
                    }
                    placeholder="Mínimo ex: 20,00"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                  />
                </div>

                <input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="Tempo ex: 30-40 min"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                />

                <button
                  onClick={saveArea}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editing ? <Check size={18} /> : <Plus size={18} />}
                  {saving
                    ? "Salvando..."
                    : editing
                    ? "Salvar alterações"
                    : "Adicionar área"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black">Preview do checkout</p>
              <p className="text-xs text-zinc-500">
                Cliente escolhendo entrega.
              </p>
            </div>
            <Bike className="text-orange-400" size={20} />
          </div>

          <div className="mx-auto max-w-[290px] rounded-[38px] border border-white/15 bg-black p-3">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080808]">
              <div className="bg-[#f97316] p-4">
                <p className="mb-2 inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black">
                  entrega
                </p>
                <h3 className="text-2xl font-black leading-none">
                  Onde entregar?
                </h3>
                <p className="mt-2 text-xs text-orange-100">
                  Escolha seu bairro
                </p>
              </div>

              <div className="space-y-2 p-3">
                {areas
                  .filter((area) => area.active)
                  .map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedArea(area)}
                      className={`w-full rounded-2xl border p-3 text-left ${
                        selectedArea?.id === area.id
                          ? "border-orange-400/50 bg-orange-500/15"
                          : "border-white/10 bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black">
                            {area.neighborhood}
                          </p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            Mínimo R$ {formatMoney(area.minimum_order)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-black text-orange-400">
                            R$ {formatMoney(area.delivery_fee)}
                          </p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            {area.delivery_time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>

              <div className="border-t border-white/10 p-3">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Taxa selecionada</span>
                  <span className="font-black text-orange-400">
                    R$ {formatMoney(selectedArea?.delivery_fee)}
                  </span>
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black">
                  <MessageCircle size={15} />
                  Continuar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}