"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Check,
  Eye,
  ExternalLink,
  Loader2,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";

type StoreAppearance = {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  textColor: string;
  priceColor: string;
  backgroundColor: string;
  cardColor: string;
};

type ThemePreset = {
  name: string;
  description: string;
  primaryColor: string;
  textColor: string;
  priceColor: string;
  backgroundColor: string;
  cardColor: string;
};

const DEFAULT_APPEARANCE: StoreAppearance = {
  id: "",
  name: "",
  slug: "",
  primaryColor: "#f97316",
  textColor: "#ffffff",
  priceColor: "#facc15",
  backgroundColor: "#050505",
  cardColor: "#101010",
};

const THEMES: ThemePreset[] = [
  { name: "Pedisk Dark", description: "Preto premium com laranja neon.", primaryColor: "#f97316", textColor: "#ffffff", priceColor: "#facc15", backgroundColor: "#050505", cardColor: "#101010" },
  { name: "Vermelho Street", description: "Forte, urbano e com contraste alto.", primaryColor: "#dc2626", textColor: "#ffffff", priceColor: "#fbbf24", backgroundColor: "#080808", cardColor: "#151515" },
  { name: "Roxo Neon", description: "Visual tecnológico e moderno.", primaryColor: "#8b5cf6", textColor: "#ffffff", priceColor: "#c4b5fd", backgroundColor: "#07050d", cardColor: "#151020" },
  { name: "Verde Fresh", description: "Ideal para comida natural e saudável.", primaryColor: "#22c55e", textColor: "#ffffff", priceColor: "#bef264", backgroundColor: "#04100a", cardColor: "#0c1d13" },
  { name: "Claro Premium", description: "Fundo claro com aparência sofisticada.", primaryColor: "#ea580c", textColor: "#111827", priceColor: "#c2410c", backgroundColor: "#f7f7f8", cardColor: "#ffffff" },
];

const COLOR_FIELDS = [
  { key: "primaryColor", title: "Cor principal", description: "Botões, destaques e detalhes da loja." },
  { key: "textColor", title: "Cor dos textos", description: "Nomes, títulos e informações principais." },
  { key: "priceColor", title: "Cor dos preços", description: "Valores e ofertas do cardápio." },
  { key: "backgroundColor", title: "Fundo da loja", description: "Cor geral da página pública." },
  { key: "cardColor", title: "Fundo dos cards", description: "Produtos, busca e blocos de informação." },
] as const;

export default function AparenciaPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [appearance, setAppearance] = useState<StoreAppearance>(DEFAULT_APPEARANCE);
  const [savedAppearance, setSavedAppearance] = useState<StoreAppearance>(DEFAULT_APPEARANCE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState(() => Date.now());
  const [toast, setToast] = useState("");

  const previewUrl = useMemo(() => {
    if (!appearance.slug) return "";
    const params = new URLSearchParams({ preview: "1", appearance: "1", v: String(previewVersion) });
    return `/${appearance.slug}?${params.toString()}`;
  }, [appearance.slug, previewVersion]);

  const hasChanges = useMemo(() => JSON.stringify(appearance) !== JSON.stringify(savedAppearance), [appearance, savedAppearance]);

  useEffect(() => { loadAppearance(); }, []);
  useEffect(() => { postAppearanceToPreview(); }, [appearance.primaryColor, appearance.textColor, appearance.priceColor, appearance.backgroundColor, appearance.cardColor]);

  function showToast(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2800); }

  async function loadAppearance() {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) { router.push("/login"); return; }
      const { data, error } = await supabase.from("stores").select("id, name, slug, primary_color, text_color, price_color, background_color, card_color").eq("owner_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Loja não encontrada.");
      const loaded: StoreAppearance = {
        id: data.id,
        name: data.name || "Minha Loja",
        slug: data.slug || "",
        primaryColor: data.primary_color || "#f97316",
        textColor: data.text_color || "#ffffff",
        priceColor: data.price_color || "#facc15",
        backgroundColor: data.background_color || "#050505",
        cardColor: data.card_color || "#101010",
      };
      setAppearance(loaded);
      setSavedAppearance(loaded);
    } catch (error) {
      console.error(error);
      showToast("Não foi possível carregar a aparência.");
    } finally { setLoading(false); }
  }

  function updateAppearance(field: keyof StoreAppearance, value: string) {
    setAppearance((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function applyTheme(theme: ThemePreset) {
    setAppearance((current) => ({ ...current, ...theme }));
    setSaved(false);
  }

  function restoreSaved() { setAppearance(savedAppearance); showToast("Alterações descartadas."); }
  function restoreDefault() { setAppearance((current) => ({ ...current, primaryColor: "#f97316", textColor: "#ffffff", priceColor: "#facc15", backgroundColor: "#050505", cardColor: "#101010" })); }
  function refreshPreview() { setPreviewLoading(true); setPreviewVersion(Date.now()); }

  function postAppearanceToPreview() {
    const previewWindow = iframeRef.current?.contentWindow;
    if (!previewWindow) return;
    previewWindow.postMessage({ type: "PEDISK_APPEARANCE_PREVIEW", payload: appearance }, window.location.origin);
  }

  async function saveAppearance() {
    if (!appearance.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("stores").update({
        primary_color: appearance.primaryColor,
        text_color: appearance.textColor,
        price_color: appearance.priceColor,
        background_color: appearance.backgroundColor,
        card_color: appearance.cardColor,
        updated_at: new Date().toISOString(),
      }).eq("id", appearance.id);
      if (error) throw error;
      setSavedAppearance(appearance);
      setSaved(true);
      showToast("Aparência salva com sucesso.");
      refreshPreview();
      window.setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      console.error(error);
      showToast("Não foi possível salvar a aparência.");
    } finally { setSaving(false); }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white"><Loader2 className="animate-spin text-orange-400" size={36} /></main>;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {toast && <div className="fixed left-1/2 top-5 z-[130] -translate-x-1/2 rounded-full border border-orange-400/30 bg-[#15100c]/95 px-5 py-3 text-sm font-black text-orange-300 shadow-2xl">{toast}</div>}
      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_360px] lg:px-6">
        <div className="space-y-5">
          <header className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <Link href="/painel" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-orange-400"><ArrowLeft size={16}/>Voltar</Link>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300"><Palette size={14}/>Aparência</div>
                <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">Defina o estilo da sua loja.</h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">Logo e banner ficam em Minha Loja. Aqui você controla temas e cores.</p>
              </div>
              <div className="flex gap-3">
                {hasChanges && <button onClick={restoreSaved} className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 font-black"><RotateCcw size={17}/>Descartar</button>}
                <button onClick={saveAppearance} disabled={saving || !hasChanges} className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black disabled:opacity-45">{saving ? <Loader2 className="animate-spin" size={18}/> : saved ? <Check size={18}/> : <Save size={18}/>}Salvar aparência</button>
              </div>
            </div>
          </header>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-black">Temas prontos</h2><p className="text-xs text-zinc-500">Escolha uma base e personalize.</p></div><button onClick={restoreDefault} className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs font-black"><RefreshCw size={15}/>Padrão</button></div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {THEMES.map((theme) => <button key={theme.name} onClick={() => applyTheme(theme)} className="rounded-[24px] border border-white/10 bg-black/25 p-4 text-left hover:border-orange-400/30"><div className="mb-4 flex h-20 overflow-hidden rounded-[18px]"><div className="flex-1 p-3" style={{backgroundColor: theme.backgroundColor}}><div className="h-full rounded-xl" style={{backgroundColor: theme.cardColor, borderTop: `4px solid ${theme.primaryColor}`}}/></div><div className="w-10"><div className="h-1/2" style={{backgroundColor: theme.primaryColor}}/><div className="h-1/2" style={{backgroundColor: theme.priceColor}}/></div></div><p className="font-black">{theme.name}</p><p className="mt-1 text-xs text-zinc-500">{theme.description}</p></button>)}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-black">Personalizar cores</h2>
            <p className="mt-1 text-xs text-zinc-500">A loja ao lado muda na hora.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {COLOR_FIELDS.map((field) => <ColorControl key={field.key} title={field.title} description={field.description} value={appearance[field.key]} onChange={(value) => updateAppearance(field.key, value)}/>)}
            </div>
          </section>

          <section className="rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-5"><div className="flex gap-3"><Sparkles className="text-orange-400" size={21}/><p className="text-sm text-zinc-400">Nome, logo e banner ficam em <strong>Minha Loja</strong>. Ordem dos blocos fica no <strong>Construtor</strong>.</p></div></section>
        </div>

        <aside className="hidden self-start rounded-[30px] border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-5 lg:block">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-lg font-black">Preview ao vivo</p><p className="text-xs text-zinc-500">Teste antes de salvar.</p></div><div className="flex gap-2"><button onClick={refreshPreview} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"><RefreshCw size={17} className={previewLoading ? "animate-spin" : ""}/></button>{appearance.slug && <Link href={`/${appearance.slug}`} target="_blank" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/25 bg-orange-500/10 text-orange-400"><ExternalLink size={17}/></Link>}</div></div>
          <div className="relative mx-auto h-[690px] max-w-[318px] overflow-hidden rounded-[42px] border-[7px] border-[#171717] bg-black">
            {previewLoading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080808]"><Loader2 className="animate-spin text-orange-400" size={28}/></div>}
            {previewUrl && <iframe ref={iframeRef} key={previewVersion} src={previewUrl} title={`Preview de ${appearance.name}`} onLoad={() => { setPreviewLoading(false); window.setTimeout(postAppearanceToPreview, 100); }} className="h-full w-full border-0"/>}
          </div>
          <div className="mt-4 rounded-2xl border border-orange-400/15 bg-orange-500/[0.07] p-3"><div className="flex gap-3"><Eye className="text-orange-400" size={17}/><p className="text-[10px] text-zinc-500">As mudanças só ficam públicas depois de salvar.</p></div></div>
        </aside>
      </section>
    </main>
  );
}

function ColorControl({ title, description, value, onChange }: { title: string; description: string; value: string; onChange: (value: string) => void; }) {
  return <div className="rounded-[24px] border border-white/10 bg-black/25 p-4"><p className="font-black">{title}</p><p className="mt-1 text-xs text-zinc-500">{description}</p><div className="mt-4 flex items-center gap-3"><label className="relative h-12 w-14 overflow-hidden rounded-2xl border border-white/10" style={{backgroundColor: value}}><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 h-full w-full opacity-0"/></label><input value={value} onChange={(event) => onChange(event.target.value)} maxLength={7} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-black uppercase outline-none"/></div></div>;
}
