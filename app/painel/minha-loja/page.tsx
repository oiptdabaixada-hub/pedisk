"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock3,
  Copy,
  Eye,
  Globe,
  ImagePlus,
  Link2,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Upload,
} from "lucide-react";

type StoreForm = {
  id: string;
  logo: string;
  bannerUrl: string;
  name: string;
  description: string;
  slug: string;
  whatsapp: string;
  instagram: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerPrice: string;
  openingTime: string;
  closingTime: string;
  minOrder: string;
  averageTime: string;
  deliveryFee: string;
  primaryColor: string;
  isOpen: boolean;
};

type ProductPreview = {
  id: string;
  emoji: string;
  name: string;
  price: number;
  active: boolean;
};

const BUCKET_NAME = "store-image";

const emptyStore: StoreForm = {
  id: "",
  logo: "🍕",
  bannerUrl: "",
  name: "",
  description: "",
  slug: "",
  whatsapp: "",
  instagram: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "",
  bannerTitle: "",
  bannerSubtitle: "",
  bannerPrice: "",
  openingTime: "",
  closingTime: "",
  minOrder: "",
  averageTime: "",
  deliveryFee: "",
  primaryColor: "#f97316",
  isOpen: true,
};

export default function MinhaLojaPage() {
  const router = useRouter();

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [store, setStore] = useState<StoreForm>(emptyStore);
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    loadStore();
  }, []);

  const storeLink = useMemo(() => {
    return `pedisk.app/${store.slug || "sua-loja"}`;
  }, [store.slug]);

  function updateStore(field: keyof StoreForm, value: string | boolean) {
    setStore((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function money(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parseMoney(value: string) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const number = Number(normalized);
    return Number.isNaN(number) ? 0 : number;
  }

  function formatMoneyInput(value: number | null | undefined) {
    if (value === null || value === undefined) return "";
    return String(value).replace(".", ",");
  }

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function isImageUrl(value: string) {
    return value.trim().startsWith("http");
  }

  function getFileExt(file: File) {
    return file.name.split(".").pop() || "png";
  }

  async function uploadStoreImage(file: File, type: "logo" | "banner") {
    if (!store.id) return;

    if (type === "logo") setUploadingLogo(true);
    if (type === "banner") setUploadingBanner(true);

    try {
      const ext = getFileExt(file);
      const filePath = `${store.id}/${type}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        alert("Erro ao enviar imagem. Confere se o bucket store-image está público.");
        return;
      }

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (type === "logo") {
        setStore((current) => ({ ...current, logo: publicUrl }));

        await supabase
          .from("stores")
          .update({
            logo_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", store.id);
      }

      if (type === "banner") {
        setStore((current) => ({ ...current, bannerUrl: publicUrl }));

        await supabase
          .from("stores")
          .update({
            banner_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", store.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  }

  async function removeLogo() {
    setStore((current) => ({ ...current, logo: "🍕" }));

    if (store.id) {
      await supabase
        .from("stores")
        .update({
          logo_url: "🍕",
          updated_at: new Date().toISOString(),
        })
        .eq("id", store.id);
    }
  }

  async function removeBanner() {
    setStore((current) => ({ ...current, bannerUrl: "" }));

    if (store.id) {
      await supabase
        .from("stores")
        .update({
          banner_url: "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", store.id);
    }
  }

  async function loadStore() {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: storeData } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (!storeData) {
      setLoading(false);
      return;
    }

    setStore({
      id: storeData.id,
      logo: storeData.logo_url || "🍕",
      bannerUrl: storeData.banner_url || "",
      name: storeData.name || "",
      description: storeData.description || "",
      slug: storeData.slug || "",
      whatsapp: storeData.whatsapp || "",
      instagram: storeData.instagram || "",
      address: storeData.address || "",
      neighborhood: storeData.neighborhood || "",
      city: storeData.city || "",
      state: storeData.state || "",
      bannerTitle: storeData.banner_title || "",
      bannerSubtitle: storeData.banner_subtitle || "",
      bannerPrice: formatMoneyInput(storeData.banner_price),
      openingTime: storeData.opening_hours || "",
      closingTime: storeData.closing_hours || "",
      minOrder: formatMoneyInput(storeData.minimum_order),
      averageTime: storeData.delivery_time || "",
      deliveryFee: formatMoneyInput(storeData.default_delivery_fee),
      primaryColor: storeData.primary_color || "#f97316",
      isOpen: Boolean(storeData.is_open),
    });

    const { data: productsData } = await supabase
      .from("products")
      .select("id, emoji, name, price, active")
      .eq("store_id", storeData.id)
      .eq("active", true)
      .order("position", { ascending: true })
      .limit(3);

    setProducts((productsData || []) as ProductPreview[]);
    setLoading(false);
  }

  async function saveStore() {
    if (!store.id) return;

    setSaving(true);
    setSaved(false);

    const cleanSlug = normalizeSlug(store.slug || store.name || "minha-loja");

    const { error } = await supabase
      .from("stores")
      .update({
        name: store.name,
        slug: cleanSlug,
        description: store.description,
        logo_url: store.logo,
        banner_url: store.bannerUrl,
        whatsapp: store.whatsapp,
        instagram: store.instagram,
        address: store.address,
        neighborhood: store.neighborhood,
        city: store.city,
        state: store.state,
        is_open: store.isOpen,
        opening_hours: store.openingTime,
        closing_hours: store.closingTime,
        delivery_time: store.averageTime,
        minimum_order: parseMoney(store.minOrder),
        default_delivery_fee: parseMoney(store.deliveryFee),
        banner_title: store.bannerTitle,
        banner_subtitle: store.bannerSubtitle,
        banner_price: parseMoney(store.bannerPrice),
        primary_color: store.primaryColor || "#f97316",
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id);

    if (!error) {
      setStore((current) => ({ ...current, slug: cleanSlug }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }

    setSaving(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(storeLink);
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
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadStoreImage(file, "logo");
          event.target.value = "";
        }}
      />

      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadStoreImage(file, "banner");
          event.target.value = "";
        }}
      />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-220px] top-[-180px] h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-[150px]" />
        <div className="absolute bottom-[-260px] right-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_350px] lg:px-6">
        <div className="space-y-5">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
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
                  <Sparkles size={14} />
                  Minha loja
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
                  Configure sua vitrine em tempo real.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Altere nome, logo, banner, WhatsApp, horários, pedido mínimo e
                  veja tudo mudando no celular ao lado.
                </p>
              </div>

              <button
                onClick={saveStore}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar loja"}
              </button>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <Store size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Identidade da loja</h2>
                    <p className="text-xs text-zinc-500">
                      Nome, logo e descrição principal.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[150px_1fr]">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-zinc-300">
                      Logo
                    </label>

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="group relative flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-full border-4 bg-black/35 text-5xl font-black shadow-[0_0_35px_rgba(249,115,22,0.18)]"
                      style={{ borderColor: `${store.primaryColor}66` }}
                    >
                      {isImageUrl(store.logo) ? (
                        <img
                          src={store.logo}
                          alt="Logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span style={{ color: store.primaryColor }}>
                          {store.logo || "🍕"}
                        </span>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 transition group-hover:opacity-100">
                        <Upload size={22} />
                        <span className="mt-1 text-[10px] font-black">
                          {uploadingLogo ? "Enviando..." : "Trocar"}
                        </span>
                      </div>
                    </button>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-3 py-3 text-xs font-black"
                      >
                        <ImagePlus size={15} />
                        Foto
                      </button>

                      <button
                        type="button"
                        onClick={removeLogo}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <input
                      value={store.logo}
                      onChange={(event) =>
                        updateStore("logo", event.target.value)
                      }
                      placeholder="🍕 ou letra"
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-center text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
                    />

                    <p className="mt-2 text-center text-[10px] leading-4 text-zinc-600">
                      Pode usar foto, emoji ou letra.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Field
                      label="Nome da loja"
                      value={store.name}
                      onChange={(value) => updateStore("name", value)}
                    />

                    <Textarea
                      label="Descrição"
                      value={store.description}
                      onChange={(value) => updateStore("description", value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <ImagePlus size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Banner de promoção</h2>
                    <p className="text-xs text-zinc-500">
                      O primeiro destaque que o cliente vê.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="group relative mb-4 flex h-[190px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-orange-400/40 bg-black/35"
                >
                  {store.bannerUrl ? (
                    <img
                      src={store.bannerUrl}
                      alt="Banner"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto text-orange-400" size={34} />
                      <p className="mt-3 text-sm font-black">
                        Clicar para escolher banner
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Imagem do aparelho
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 transition group-hover:opacity-100">
                    <Upload size={24} />
                    <span className="mt-2 text-xs font-black">
                      {uploadingBanner ? "Enviando..." : "Trocar banner"}
                    </span>
                  </div>
                </button>

                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black"
                  >
                    <ImagePlus size={17} />
                    Selecionar imagem
                  </button>

                  <button
                    type="button"
                    onClick={removeBanner}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Field
                    label="Título"
                    value={store.bannerTitle}
                    onChange={(value) => updateStore("bannerTitle", value)}
                  />

                  <Field
                    label="Chamada"
                    value={store.bannerSubtitle}
                    onChange={(value) => updateStore("bannerSubtitle", value)}
                  />

                  <Field
                    label="Preço"
                    value={store.bannerPrice}
                    onChange={(value) => updateStore("bannerPrice", value)}
                  />
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                      <MessageCircle size={21} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Contato</h2>
                      <p className="text-xs text-zinc-500">
                        Onde o pedido vai chegar.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Input value={store.whatsapp} onChange={(value) => updateStore("whatsapp", value)} placeholder="WhatsApp" />
                    <Input value={store.instagram} onChange={(value) => updateStore("instagram", value)} placeholder="Instagram" />
                    <Input value={store.address} onChange={(value) => updateStore("address", value)} placeholder="Endereço" />
                    <Input value={store.neighborhood} onChange={(value) => updateStore("neighborhood", value)} placeholder="Bairro" />

                    <div className="grid grid-cols-2 gap-3">
                      <Input value={store.city} onChange={(value) => updateStore("city", value)} placeholder="Cidade" />
                      <Input value={store.state} onChange={(value) => updateStore("state", value)} placeholder="UF" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                      <Clock3 size={21} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Funcionamento</h2>
                      <p className="text-xs text-zinc-500">Horário e status da loja.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input value={store.openingTime} onChange={(value) => updateStore("openingTime", value)} placeholder="Abre" />
                    <Input value={store.closingTime} onChange={(value) => updateStore("closingTime", value)} placeholder="Fecha" />
                    <Input value={store.minOrder} onChange={(value) => updateStore("minOrder", value)} placeholder="Pedido mínimo" />
                    <Input value={store.averageTime} onChange={(value) => updateStore("averageTime", value)} placeholder="Tempo médio" />
                  </div>

                  <button
                    onClick={() => updateStore("isOpen", !store.isOpen)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black ${
                      store.isOpen ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    <BadgeCheck size={18} />
                    {store.isOpen ? "Loja aberta" : "Loja fechada"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                    <Link2 size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Link da loja</h2>
                    <p className="text-xs text-zinc-400">Esse é o link que o lojista divulga.</p>
                  </div>
                </div>

                <label className="mb-2 block text-xs font-bold text-zinc-300">Slug</label>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <Globe size={18} className="text-orange-400" />
                  <input
                    value={store.slug}
                    onChange={(event) => updateStore("slug", event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-black/35 px-4 py-3">
                  <p className="flex-1 truncate text-xs font-bold text-zinc-300">
                    {storeLink}
                  </p>

                  <button onClick={copyLink} className="text-orange-400">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <Truck size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Entrega rápida</h2>
                    <p className="text-xs text-zinc-500">Dados principais no topo da vitrine.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input value={store.deliveryFee} onChange={(value) => updateStore("deliveryFee", value)} placeholder="Taxa padrão" />

                  <a
                    href="/painel/entrega"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-5 py-3 text-sm font-black text-orange-300"
                  >
                    Configurar bairros
                  </a>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck size={21} className="text-green-400" />
                  <div>
                    <p className="font-black">Checklist da vitrine</p>
                    <p className="text-xs text-zinc-500">Pontos básicos antes de publicar.</p>
                  </div>
                </div>

                {[
                  store.name ? "Nome da loja definido" : "Definir nome da loja",
                  store.whatsapp ? "WhatsApp cadastrado" : "Cadastrar WhatsApp",
                  store.bannerUrl ? "Imagem do banner adicionada" : "Adicionar imagem do banner",
                  store.openingTime ? "Horário preenchido" : "Preencher horário",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 border-t border-white/10 py-3 text-sm text-zinc-300">
                    <Check size={16} className="text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black">Preview ao vivo</p>
              <p className="text-xs text-zinc-500">Tudo muda enquanto você edita.</p>
            </div>

            <Eye className="text-orange-400" size={20} />
          </div>

          <div className="mx-auto max-w-[300px] rounded-[38px] border border-white/15 bg-black p-3">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080808]">
              <div
                className="relative overflow-hidden p-4"
                style={{ backgroundColor: store.primaryColor }}
              >
                {store.bannerUrl && (
                  <img
                    src={store.bannerUrl}
                    alt="Banner"
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                  />
                )}

                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-black/35 text-2xl font-black">
                      {isImageUrl(store.logo) ? (
                        <img src={store.logo} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <span>{store.logo || "🍕"}</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black leading-none">
                        {store.name || "Nome da loja"}
                      </h3>
                      <p className="mt-1 text-[11px] text-orange-100">
                        {store.isOpen ? "Aberto agora" : "Fechado agora"} • {store.averageTime || "30-40 min"}
                      </p>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-xs text-orange-50">
                    {store.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                <Mini label="Entrega" value={`R$ ${store.deliveryFee || "0,00"}`} />
                <Mini label="Tempo" value={store.averageTime || "30-40"} />
                <Mini label="Mínimo" value={`R$ ${store.minOrder || "0,00"}`} />
              </div>

              <div className="px-3">
                <div className="rounded-[24px] p-4" style={{ backgroundColor: store.primaryColor }}>
                  <p className="mb-2 inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black">
                    🔥 {store.bannerSubtitle || "Promoção"}
                  </p>

                  <h4 className="text-2xl font-black leading-none">
                    {store.bannerTitle || "Produto destaque"}
                  </h4>

                  <p className="mt-3 text-xl font-black text-yellow-200">
                    R$ {store.bannerPrice || "0,00"}
                  </p>

                  <button className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                    Pedir agora
                  </button>
                </div>
              </div>

              <div className="space-y-2 p-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                      {product.emoji || "🍽️"}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-black">{product.name}</p>
                      <p className="mt-1 text-xs font-black text-orange-400">
                        {money(product.price)}
                      </p>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="rounded-2xl bg-white/[0.05] p-3 text-center">
                    <p className="text-xs text-zinc-500">
                      Cadastre produtos para aparecer aqui.
                    </p>
                  </div>
                )}
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

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
    />
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-300">
        {label}
      </label>
      <Input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-300">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
      />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-3">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="text-xs font-black">{value}</p>
    </div>
  );
}