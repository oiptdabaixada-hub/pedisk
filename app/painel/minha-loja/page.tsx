"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Check,
  Clock3,
  Copy,
  Eye,
  Globe,
  ExternalLink,
  ImagePlus,
  Link2,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Rocket,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Upload,
  XCircle,
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
  isPublished: boolean;
};

type ProductPreview = {
  id: string;
  emoji: string;
  name: string;
  price: number;
  active: boolean;
};

const BUCKET_NAME = "store-image";

const RESERVED_SLUGS = new Set([
  "", "api", "admin", "app", "cadastro", "checkout", "login",
  "loja", "painel", "pedido-concluido", "produto", "privacidade",
  "suporte", "termos", "favicon.ico",
]);

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
  isPublished: false,
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
  const [originalSlug, setOriginalSlug] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugMessage, setSlugMessage] = useState("");
  const [toast, setToast] = useState("");
  const [previewVersion, setPreviewVersion] = useState(() => Date.now());
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    loadStore();
  }, []);

  const cleanSlug = useMemo(
    () => normalizeSlug(store.slug || store.name || ""),
    [store.slug, store.name]
  );

  const storeLink = useMemo(() => {
    if (typeof window === "undefined") {
      return `https://pedisk.com.br/${cleanSlug || "sua-loja"}`;
    }

    return `${window.location.origin}/${cleanSlug || "sua-loja"}`;
  }, [cleanSlug]);

  const previewUrl = useMemo(() => {
    if (!cleanSlug) return "";
    return `${storeLink}?preview=1&v=${previewVersion}`;
  }, [cleanSlug, storeLink, previewVersion]);

  function refreshPreview() {
    setPreviewLoading(true);
    setPreviewVersion(Date.now());
  }

  const publishChecklist = useMemo(
    () => [
      Boolean(store.name.trim()),
      Boolean(cleanSlug) && slugAvailable !== false,
      Boolean(store.whatsapp.trim()),
      Boolean(store.logo.trim()),
      Boolean(store.bannerUrl.trim()),
      Boolean(store.openingTime.trim()),
      products.length > 0,
    ],
    [store, cleanSlug, slugAvailable, products.length]
  );

  const publishProgress = Math.round(
    (publishChecklist.filter(Boolean).length / publishChecklist.length) * 100
  );

  const canPublish = publishChecklist.every(Boolean);

  function updateStore(field: keyof StoreForm, value: string | boolean) {
    setStore((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
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
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 40);
  }

  async function checkSlugAvailability(value: string) {
    const slug = normalizeSlug(value);

    if (!slug) {
      setSlugAvailable(null);
      setSlugMessage("Escolha um endereço curto e fácil de lembrar.");
      return false;
    }

    if (RESERVED_SLUGS.has(slug)) {
      setSlugAvailable(false);
      setSlugMessage("Esse endereço é reservado pelo sistema.");
      return false;
    }

    if (slug === originalSlug) {
      setSlugAvailable(true);
      setSlugMessage("Este é o endereço atual da sua loja.");
      return true;
    }

    setSlugChecking(true);

    const { data, error } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .neq("id", store.id || "00000000-0000-0000-0000-000000000000")
      .limit(1);

    setSlugChecking(false);

    if (error) {
      console.error("Erro ao verificar slug:", error);
      setSlugAvailable(null);
      setSlugMessage("Não foi possível verificar agora.");
      return false;
    }

    const available = !data || data.length === 0;
    setSlugAvailable(available);
    setSlugMessage(
      available
        ? "Endereço disponível."
        : "Esse endereço já está sendo usado por outra loja."
    );

    return available;
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
      refreshPreview();
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
      isPublished: Boolean(storeData.is_published),
    });

    setOriginalSlug(storeData.slug || "");
    setSlugAvailable(storeData.slug ? true : null);
    setSlugMessage(
      storeData.slug
        ? "Este é o endereço atual da sua loja."
        : "Escolha o endereço público da sua loja."
    );

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

  async function saveStore(options?: { publish?: boolean }) {
    if (!store.id) return false;

    setSaving(true);
    setSaved(false);

    try {
      const finalSlug = normalizeSlug(store.slug || store.name || "");

      if (!store.name.trim()) {
        showToast("Digite o nome da loja.");
        return false;
      }

      if (!finalSlug || RESERVED_SLUGS.has(finalSlug)) {
        setSlugAvailable(false);
        setSlugMessage("Escolha outro endereço para sua loja.");
        showToast("Escolha um endereço público válido.");
        return false;
      }

      if (finalSlug !== originalSlug) {
        const available = await checkSlugAvailability(finalSlug);
        if (!available) {
          showToast("Esse endereço não está disponível.");
          return false;
        }
      }

      if (options?.publish && !canPublish) {
        showToast("Complete o checklist antes de publicar.");
        return false;
      }

      const nextPublished =
        typeof options?.publish === "boolean"
          ? options.publish
          : store.isPublished;

      const { error } = await supabase
        .from("stores")
        .update({
          name: store.name.trim(),
          slug: finalSlug,
          description: store.description.trim(),
          logo_url: store.logo,
          banner_url: store.bannerUrl,
          whatsapp: store.whatsapp.trim(),
          instagram: store.instagram.trim(),
          address: store.address.trim(),
          neighborhood: store.neighborhood.trim(),
          city: store.city.trim(),
          state: store.state.trim().toUpperCase(),
          is_open: store.isOpen,
          is_published: nextPublished,
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

      if (error) throw error;

      setStore((current) => ({
        ...current,
        slug: finalSlug,
        isPublished: nextPublished,
      }));

      setOriginalSlug(finalSlug);
      setSlugAvailable(true);
      setSlugMessage("Este é o endereço atual da sua loja.");
      setSaved(true);
      refreshPreview();
      window.setTimeout(() => setSaved(false), 2200);

      showToast(
        typeof options?.publish === "boolean"
          ? nextPublished
            ? "Loja publicada com sucesso."
            : "Loja retirada do ar."
          : "Alterações salvas."
      );

      return true;
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      showToast("Não foi possível salvar. Confira o banco de dados.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(storeLink);
    showToast("Link copiado.");
  }

  async function togglePublication() {
    await saveStore({ publish: !store.isPublished });
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
      {toast && (
        <div className="fixed left-1/2 top-5 z-[130] -translate-x-1/2 rounded-full border border-orange-400/30 bg-[#15100c]/95 px-5 py-3 text-sm font-black text-orange-300 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}
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
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                    <Sparkles size={14} />
                    Minha loja
                  </span>

                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black ${store.isPublished ? "bg-green-500/10 text-green-300" : "bg-zinc-500/10 text-zinc-400"}`}>
                    <span className={`h-2 w-2 rounded-full ${store.isPublished ? "animate-pulse bg-green-400" : "bg-zinc-600"}`} />
                    {store.isPublished ? "Publicada" : "Rascunho"}
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
                  Configure sua vitrine em tempo real.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Altere nome, logo, banner, WhatsApp, horários, pedido mínimo e
                  veja tudo mudando no celular ao lado.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => saveStore()}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-black hover:border-orange-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
                </button>

                <button
                  onClick={togglePublication}
                  disabled={saving || (!store.isPublished && !canPublish)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black disabled:cursor-not-allowed disabled:opacity-45 ${store.isPublished ? "border border-red-500/20 bg-red-500/10 text-red-300" : "bg-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400"}`}
                >
                  {store.isPublished ? <LockKeyhole size={18} /> : <Rocket size={18} />}
                  {store.isPublished ? "Retirar do ar" : "Publicar loja"}
                </button>
              </div>
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

                <label className="mb-2 block text-xs font-bold text-zinc-300">
                  Seu endereço Pedisk
                </label>

                <div className={`flex items-center rounded-2xl border bg-black/40 transition ${slugAvailable === true ? "border-green-400/35" : slugAvailable === false ? "border-red-400/35" : "border-white/10 focus-within:border-orange-400/45"}`}>
                  <span className="border-r border-white/10 px-3 py-3 text-[10px] font-black text-zinc-500">
                    pedisk.com.br/
                  </span>

                  <input
                    value={store.slug}
                    onChange={(event) => {
                      const value = normalizeSlug(event.target.value);
                      updateStore("slug", value);
                      setSlugAvailable(null);
                      setSlugMessage("Salve para verificar e reservar esse endereço.");
                    }}
                    onBlur={(event) => checkSlugAvailability(event.target.value)}
                    placeholder="idealpizza"
                    maxLength={40}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-black outline-none"
                  />

                  <div className="pr-3">
                    {slugChecking && <Loader2 className="animate-spin text-orange-400" size={17} />}
                    {!slugChecking && slugAvailable === true && <CheckCircle2 className="text-green-400" size={18} />}
                    {!slugChecking && slugAvailable === false && <XCircle className="text-red-400" size={18} />}
                  </div>
                </div>

                <p className={`mt-2 text-[11px] ${slugAvailable === true ? "text-green-400" : slugAvailable === false ? "text-red-400" : "text-zinc-600"}`}>
                  {slugMessage}
                </p>

                <div className="mt-3 rounded-2xl bg-black/35 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-600">
                    Link final
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <p className="flex-1 break-all text-xs font-bold text-zinc-300">
                      {storeLink}
                    </p>

                    <button onClick={copyLink} className="text-orange-400">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {store.isPublished && cleanSlug && (
                  <Link
                    href={`/${cleanSlug}`}
                    target="_blank"
                    className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-green-400/25 bg-green-500/10 px-4 py-3 text-sm font-black text-green-300"
                  >
                    <ExternalLink size={16} />
                    Abrir loja publicada
                  </Link>
                )}
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
                  <div className="flex-1">
                    <p className="font-black">Checklist da vitrine</p>
                    <p className="text-xs text-zinc-500">Pontos básicos antes de publicar.</p>
                  </div>
                  <span className="text-lg font-black text-orange-400">
                    {publishProgress}%
                  </span>
                </div>

                <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${publishProgress}%` }}
                  />
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

        <aside className="hidden self-start rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:sticky lg:top-5 lg:block">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black">Sua loja ao vivo</p>
              <p className="text-xs text-zinc-500">
                A mesma vitrine que seus clientes acessam.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshPreview}
                disabled={!cleanSlug}
                title="Atualizar preview"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-orange-400/30 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw
                  size={17}
                  className={previewLoading ? "animate-spin" : ""}
                />
              </button>

              {cleanSlug && (
                <Link
                  href={`/${cleanSlug}`}
                  target="_blank"
                  title="Abrir loja em nova guia"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/25 bg-orange-500/10 text-orange-400 transition hover:bg-orange-500/20"
                >
                  <ExternalLink size={17} />
                </Link>
              )}
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  store.isPublished ? "bg-green-400" : "bg-yellow-400"
                }`}
              />
              <p className="truncate text-[11px] font-bold text-zinc-400">
                /{cleanSlug || "sua-loja"}
              </p>
            </div>

            <span className="ml-2 shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-600">
              {store.isPublished ? "Publicada" : "Preview"}
            </span>
          </div>

          <div className="relative mx-auto h-[690px] max-w-[318px] overflow-hidden rounded-[42px] border-[7px] border-[#171717] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

            {!cleanSlug ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <Globe size={34} className="text-orange-400" />
                <p className="mt-4 text-sm font-black">
                  Defina o endereço da sua loja
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Assim que sua loja tiver um link, a vitrine real aparecerá aqui.
                </p>
              </div>
            ) : (
              <>
                {previewLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080808]">
                    <div className="text-center">
                      <Loader2
                        size={28}
                        className="mx-auto animate-spin text-orange-400"
                      />
                      <p className="mt-3 text-[11px] font-bold text-zinc-500">
                        Carregando sua loja...
                      </p>
                    </div>
                  </div>
                )}

                <iframe
                  key={previewVersion}
                  src={previewUrl}
                  title={`Preview da loja ${store.name || ""}`}
                  onLoad={() => setPreviewLoading(false)}
                  className="h-full w-full border-0 bg-[#080808]"
                />
              </>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-orange-400/15 bg-orange-500/[0.07] p-3">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 shrink-0 text-orange-400" size={17} />
              <div>
                <p className="text-xs font-black text-orange-200">
                  Preview da loja real
                </p>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                  O preview fica fixo e só atualiza quando você salva alterações
                  ou toca no botão de atualizar. Produtos, categorias e fotos vêm da loja real.
                </p>
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
