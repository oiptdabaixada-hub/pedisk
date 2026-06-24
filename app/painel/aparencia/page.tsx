"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Eye,
  ImagePlus,
  LayoutTemplate,
  MessageCircle,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Smartphone,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";

const colors = [
  { name: "Laranja", value: "#ff4800" },
  { name: "Roxo", value: "#2b008f" },
  { name: "Verde", value: "#018321" },
  { name: "Vermelho", value: "#c20707" },
  { name: "Rosa", value: "#af0058" },
];

const textColors = [
  { name: "Branco", value: "#ffffff" },
  { name: "Cinza", value: "#d4d4d8" },
  { name: "Preto", value: "#050505" },
  { name: "Dourado", value: "#facc15" },
  { name: "Principal", value: "primary" },
];

const priceColors = [
  { name: "Amarelo", value: "#facc15" },
  { name: "Neon", value: "#a3e635" },
  { name: "Branco", value: "#ffffff" },
  { name: "Laranja", value: "#ff4800" },
  { name: "Principal", value: "primary" },
];

const buttonStyles = ["Arredondado", "Moderno", "Minimalista"];
const bannerStyles = ["Grande", "Médio", "Compacto"];
const productLayouts = ["Lista", "Grade", "Premium"];

export default function AparenciaPage() {
  const [primaryColor, setPrimaryColor] = useState("#ff4800");
  const [textColor, setTextColor] = useState("#ffffff");
  const [priceColor, setPriceColor] = useState("#facc15");
  const [buttonStyle, setButtonStyle] = useState("Moderno");
  const [bannerStyle, setBannerStyle] = useState("Médio");
  const [productLayout, setProductLayout] = useState("Premium");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [bannerPositionX, setBannerPositionX] = useState(50);
  const [bannerPositionY, setBannerPositionY] = useState(50);
  const [bannerZoom, setBannerZoom] = useState(100);

  const finalTextColor = textColor === "primary" ? primaryColor : textColor;
  const finalPriceColor = priceColor === "primary" ? primaryColor : priceColor;

  const buttonRadius =
    buttonStyle === "Arredondado"
      ? "rounded-2xl"
      : buttonStyle === "Moderno"
      ? "rounded-xl"
      : "rounded-md";

  const bannerHeight =
    bannerStyle === "Grande"
      ? "h-40"
      : bannerStyle === "Médio"
      ? "h-32"
      : "h-24";

  function handleImage(
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (type === "logo") setLogoPreview(url);
    if (type === "banner") setBannerPreview(url);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
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
                  <Palette size={14} />
                  Aparência
                </div>

                <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
                  Deixe sua vitrine com cara de aplicativo premium.
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Ajuste logo, banner, cores, botões e layout com preview ao vivo.
                </p>
              </div>

              <button className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400">
                <Check size={18} />
                Salvar aparência
              </button>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <ImagePlus size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black">Logo e banner</h2>
                    <p className="text-xs text-zinc-500">
                      Envie imagens e ajuste o banner no ponto certo.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <UploadBox
                    title="Adicionar logo"
                    subtitle="PNG, JPG ou WEBP"
                    image={logoPreview}
                    onDelete={() => setLogoPreview(null)}
                    onChange={(event) => handleImage(event, "logo")}
                  />

                  <div>
                    <UploadBox
                      title="Adicionar banner"
                      subtitle="Capa ou promoção da loja"
                      image={bannerPreview}
                      onDelete={() => setBannerPreview(null)}
                      onChange={(event) => handleImage(event, "banner")}
                      imageStyle={{
                        objectPosition: `${bannerPositionX}% ${bannerPositionY}%`,
                        transform: `scale(${bannerZoom / 100})`,
                      }}
                    />
                  </div>
                </div>

                {bannerPreview && (
                  <div className="mt-4 rounded-[24px] border border-orange-400/20 bg-orange-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-orange-400" />
                      <p className="text-sm font-black">Ajustar banner</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <RangeControl
                        label="Horizontal"
                        value={bannerPositionX}
                        onChange={setBannerPositionX}
                        min={0}
                        max={100}
                      />

                      <RangeControl
                        label="Vertical"
                        value={bannerPositionY}
                        onChange={setBannerPositionY}
                        min={0}
                        max={100}
                      />

                      <RangeControl
                        label="Zoom"
                        value={bannerZoom}
                        onChange={setBannerZoom}
                        min={100}
                        max={180}
                      />
                    </div>
                  </div>
                )}
              </div>

              <ColorSection
                title="Cor principal"
                desc="Essa cor manda nos botões, banner e detalhes."
                colors={colors}
                selected={primaryColor}
                onSelect={setPrimaryColor}
              />

              <div className="grid gap-5 lg:grid-cols-3">
                <OptionCard
                  icon={<Wand2 size={21} />}
                  title="Botões"
                  desc="Formato dos botões."
                  options={buttonStyles}
                  selected={buttonStyle}
                  onSelect={setButtonStyle}
                />

                <OptionCard
                  icon={<LayoutTemplate size={21} />}
                  title="Banner"
                  desc="Tamanho do topo."
                  options={bannerStyles}
                  selected={bannerStyle}
                  onSelect={setBannerStyle}
                />

                <OptionCard
                  icon={<Smartphone size={21} />}
                  title="Produtos"
                  desc="Lista, grade ou premium."
                  options={productLayouts}
                  selected={productLayout}
                  onSelect={setProductLayout}
                />
              </div>

              <div className="rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-1 text-orange-400" size={21} />
                  <div>
                    <p className="font-black">Dica Pedisk</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Quando tiver banner, o sistema usa a imagem com uma camada
                      preta suave por cima. Assim o banner aparece bonito e o
                      texto continua legível.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <ColorSection
                title="Cor dos textos"
                desc="Define a cor dos títulos e nomes."
                colors={textColors}
                selected={textColor}
                onSelect={setTextColor}
                primaryColor={primaryColor}
                compact
              />

              <ColorSection
                title="Cor dos valores"
                desc="Define a cor dos preços."
                colors={priceColors}
                selected={priceColor}
                onSelect={setPriceColor}
                primaryColor={primaryColor}
                compact
              />

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <Eye className="text-orange-400" size={21} />
                  <div>
                    <p className="text-lg font-black">Resumo do estilo</p>
                    <p className="text-xs text-zinc-500">
                      Configuração atual da vitrine.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <InfoRow label="Cor principal" value={primaryColor} />
                  <InfoRow label="Texto" value={textColor} />
                  <InfoRow label="Valores" value={priceColor} />
                  <InfoRow label="Botões" value={buttonStyle} />
                  <InfoRow label="Banner" value={bannerStyle} />
                  <InfoRow label="Produtos" value={productLayout} />
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/35 p-4">
                  <p className="mb-3 text-sm font-black">Teste rápido</p>

                  <button
                    className={`w-full px-4 py-3 text-sm font-black text-white shadow-[0_0_35px_rgba(255,255,255,0.08)] ${buttonRadius}`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Pedir agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black">Preview ao vivo</p>
              <p className="text-xs text-zinc-500">
                Aparência aplicada na loja.
              </p>
            </div>
            <Eye className="text-orange-400" size={20} />
          </div>

          <div className="mx-auto max-w-[300px] rounded-[38px] border border-white/15 bg-black p-3">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080808]">
              <div
                className={`${bannerHeight} relative overflow-hidden p-4 transition-all`}
                style={{
                  backgroundColor: bannerPreview ? "#111111" : primaryColor,
                }}
              >
                {bannerPreview && (
                  <>
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{
                        objectPosition: `${bannerPositionX}% ${bannerPositionY}%`,
                        transform: `scale(${bannerZoom / 100})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45" />
                  </>
                )}

                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-black/35 text-xl font-black text-white">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "p"
                      )}
                    </div>

                    <div>
                      <h3
                        className="text-2xl font-black leading-none"
                        style={{ color: finalTextColor }}
                      >
                        Smash House
                      </h3>
                      <p className="mt-1 text-xs text-white/80">
                        Combo especial de hoje
                      </p>
                    </div>
                  </div>

                  {bannerStyle !== "Compacto" && (
                    <p
                      className="mt-3 text-xl font-black"
                      style={{ color: finalPriceColor }}
                    >
                      R$ 49,90
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                {[
                  ["Entrega", "R$5"],
                  ["Tempo", "30m"],
                  ["Mínimo", "R$20"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/[0.05] p-3">
                    <p className="text-[10px] text-zinc-500">{label}</p>
                    <p className="text-xs font-black">{value}</p>
                  </div>
                ))}
              </div>

              <div className="p-3">
                {productLayout === "Lista" && (
                  <div className="space-y-2">
                    <PreviewProduct emoji="🍔" name="Smash Bacon" price="R$32,90" priceColor={finalPriceColor} textColor={finalTextColor} />
                    <PreviewProduct emoji="🍟" name="Batata" price="R$18,90" priceColor={finalPriceColor} textColor={finalTextColor} />
                    <PreviewProduct emoji="🥤" name="Coca" price="R$8,00" priceColor={finalPriceColor} textColor={finalTextColor} />
                  </div>
                )}

                {productLayout === "Grade" && (
                  <div className="grid grid-cols-2 gap-2">
                    <PreviewBox emoji="🍔" name="Smash" price="R$32" priceColor={finalPriceColor} textColor={finalTextColor} />
                    <PreviewBox emoji="🍟" name="Batata" price="R$18" priceColor={finalPriceColor} textColor={finalTextColor} />
                    <PreviewBox emoji="🥤" name="Coca" price="R$8" priceColor={finalPriceColor} textColor={finalTextColor} />
                    <PreviewBox emoji="🔥" name="Combo" price="R$49" priceColor={finalPriceColor} textColor={finalTextColor} />
                  </div>
                )}

                {productLayout === "Premium" && (
                  <div className="space-y-2">
                    <div className="rounded-[22px] bg-white/[0.06] p-4">
                      <div className="mb-3 flex h-20 items-center justify-center rounded-2xl bg-white/[0.05] text-4xl">
                        🍔
                      </div>
                      <p className="text-sm font-black" style={{ color: finalTextColor }}>
                        Smash Bacon
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Pão brioche, cheddar e bacon.
                      </p>
                      <p className="mt-2 text-sm font-black" style={{ color: finalPriceColor }}>
                        R$32,90
                      </p>
                    </div>

                    <PreviewProduct emoji="🔥" name="Combo Duplo" price="R$49,90" priceColor={finalPriceColor} textColor={finalTextColor} />
                  </div>
                )}
              </div>

              <div className="p-3">
                <button
                  className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-black text-white shadow-[0_0_30px_rgba(255,255,255,0.08)] ${buttonRadius}`}
                  style={{ backgroundColor: primaryColor }}
                >
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

function UploadBox({
  title,
  subtitle,
  image,
  onDelete,
  onChange,
  imageStyle,
}: {
  title: string;
  subtitle: string;
  image: string | null;
  onDelete: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageStyle?: React.CSSProperties;
}) {
  return (
    <div className="relative rounded-[24px] border border-dashed border-white/15 bg-black/35 p-4">
      {image && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-3 top-3 z-20 rounded-xl bg-red-500/20 p-2 text-red-300 hover:bg-red-500/30"
        >
          <Trash2 size={16} />
        </button>
      )}

      <label className="block cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />

        <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
              style={imageStyle}
            />
          ) : (
            <div className="text-center">
              <Upload className="mx-auto mb-2 text-orange-400" />
              <p className="text-sm font-black">{title}</p>
              <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

function RangeControl({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-zinc-300">{label}</p>
        <p className="text-xs font-black text-orange-300">{value}</p>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-orange-500"
      />
    </div>
  );
}

function ColorSection({
  title,
  desc,
  colors,
  selected,
  onSelect,
  primaryColor,
  compact = false,
}: {
  title: string;
  desc: string;
  colors: { name: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  primaryColor?: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
          <Sparkles size={21} />
        </div>

        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>

      <div className={compact ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3 md:grid-cols-5"}>
        {colors.map((color) => {
          const realColor = color.value === "primary" ? primaryColor : color.value;

          return (
            <button
              key={color.value}
              onClick={() => onSelect(color.value)}
              className={`rounded-[22px] border p-3 text-left transition ${
                selected === color.value
                  ? "border-orange-400/60 bg-white/[0.08]"
                  : "border-white/10 bg-black/35 hover:border-white/20"
              }`}
            >
              <div
                className="mb-3 h-12 rounded-2xl shadow-[0_0_35px_rgba(255,255,255,0.12)]"
                style={{ backgroundColor: realColor }}
              />
              <p className="text-sm font-black">{color.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  title,
  desc,
  options,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>

      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              selected === option
                ? "border-orange-400/50 bg-orange-500/10 text-orange-300"
                : "border-white/10 bg-black/35 text-zinc-400 hover:border-orange-400/30"
            }`}
          >
            {option}
            {selected === option && <Check size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-black text-zinc-200">{value}</span>
    </div>
  );
}

function PreviewProduct({
  emoji,
  name,
  price,
  priceColor,
  textColor,
}: {
  emoji: string;
  name: string;
  price: string;
  priceColor: string;
  textColor: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
        {emoji}
      </div>
      <div className="flex-1">
        <p className="text-xs font-black" style={{ color: textColor }}>
          {name}
        </p>
        <p className="mt-1 text-xs font-black" style={{ color: priceColor }}>
          {price}
        </p>
      </div>
    </div>
  );
}

function PreviewBox({
  emoji,
  name,
  price,
  priceColor,
  textColor,
}: {
  emoji: string;
  name: string;
  price: string;
  priceColor: string;
  textColor: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-3">
      <div className="mb-2 flex h-10 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
        {emoji}
      </div>
      <p className="text-[11px] font-black" style={{ color: textColor }}>
        {name}
      </p>
      <p className="mt-1 text-[11px] font-black" style={{ color: priceColor }}>
        {price}
      </p>
    </div>
  );
}