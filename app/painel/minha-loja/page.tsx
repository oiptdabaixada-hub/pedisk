"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  Clock3,
  Copy,
  Eye,
  Globe,
  ImagePlus,
  Instagram,
  Link2,
  MapPin,
  MessageCircle,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Zap,
} from "lucide-react";

export default function MinhaLojaPage() {
  const [store, setStore] = useState({
    logo: "p",
    name: "Smash House",
    description: "Hambúrguer artesanal feito para vender mais no digital.",
    slug: "smash-house",
    whatsapp: "21999999999",
    instagram: "@smashhouse",
    address: "Centro, Duque de Caxias - RJ",
    bannerTitle: "Combo Extreme",
    bannerSubtitle: "Promoção de hoje",
    bannerPrice: "49,90",
    openingTime: "18:00",
    closingTime: "23:30",
    minOrder: "20,00",
    averageTime: "30-40 min",
    deliveryFee: "5,00",
    primaryColor: "#f97316",
    isOpen: true,
  });

  const storeLink = useMemo(() => {
    return `pedisk.app/${store.slug || "sua-loja"}`;
  }, [store.slug]);

  function updateStore(field: keyof typeof store, value: string | boolean) {
    setStore((current) => ({
      ...current,
      [field]: value,
    }));
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

              <button className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:bg-orange-400">
                <Save size={18} />
                Salvar loja
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

                <div className="grid gap-4 md:grid-cols-[110px_1fr]">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-zinc-300">
                      Logo
                    </label>

                    <div className="flex h-[110px] items-center justify-center rounded-[26px] border border-dashed border-orange-400/40 bg-black/35 text-5xl font-black text-orange-400">
                      {store.logo}
                    </div>

                    <input
                      value={store.logo}
                      onChange={(event) =>
                        updateStore("logo", event.target.value)
                      }
                      placeholder="p"
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-center text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-zinc-300">
                        Nome da loja
                      </label>
                      <input
                        value={store.name}
                        onChange={(event) =>
                          updateStore("name", event.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-zinc-300">
                        Descrição
                      </label>
                      <textarea
                        value={store.description}
                        onChange={(event) =>
                          updateStore("description", event.target.value)
                        }
                        className="h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                      />
                    </div>
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

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-zinc-300">
                      Título
                    </label>
                    <input
                      value={store.bannerTitle}
                      onChange={(event) =>
                        updateStore("bannerTitle", event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-zinc-300">
                      Chamada
                    </label>
                    <input
                      value={store.bannerSubtitle}
                      onChange={(event) =>
                        updateStore("bannerSubtitle", event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-zinc-300">
                      Preço
                    </label>
                    <input
                      value={store.bannerPrice}
                      onChange={(event) =>
                        updateStore("bannerPrice", event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>
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
                    <input
                      value={store.whatsapp}
                      onChange={(event) =>
                        updateStore("whatsapp", event.target.value)
                      }
                      placeholder="WhatsApp"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />

                    <input
                      value={store.instagram}
                      onChange={(event) =>
                        updateStore("instagram", event.target.value)
                      }
                      placeholder="Instagram"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />

                    <input
                      value={store.address}
                      onChange={(event) =>
                        updateStore("address", event.target.value)
                      }
                      placeholder="Endereço"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                      <Clock3 size={21} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Funcionamento</h2>
                      <p className="text-xs text-zinc-500">
                        Horário e status da loja.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={store.openingTime}
                      onChange={(event) =>
                        updateStore("openingTime", event.target.value)
                      }
                      placeholder="Abre"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />

                    <input
                      value={store.closingTime}
                      onChange={(event) =>
                        updateStore("closingTime", event.target.value)
                      }
                      placeholder="Fecha"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />

                    <input
                      value={store.minOrder}
                      onChange={(event) =>
                        updateStore("minOrder", event.target.value)
                      }
                      placeholder="Pedido mínimo"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />

                    <input
                      value={store.averageTime}
                      onChange={(event) =>
                        updateStore("averageTime", event.target.value)
                      }
                      placeholder="Tempo médio"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                    />
                  </div>

                  <button
                    onClick={() => updateStore("isOpen", !store.isOpen)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black ${
                      store.isOpen
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-300"
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
                    <p className="text-xs text-zinc-400">
                      Esse é o link que o lojista divulga.
                    </p>
                  </div>
                </div>

                <label className="mb-2 block text-xs font-bold text-zinc-300">
                  Slug
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                  <Globe size={18} className="text-orange-400" />
                  <input
                    value={store.slug}
                    onChange={(event) =>
                      updateStore("slug", event.target.value)
                    }
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-black/35 px-4 py-3">
                  <p className="flex-1 truncate text-xs font-bold text-zinc-300">
                    {storeLink}
                  </p>
                  <button className="text-orange-400">
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
                    <p className="text-xs text-zinc-500">
                      Dados principais no topo da vitrine.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    value={store.deliveryFee}
                    onChange={(event) =>
                      updateStore("deliveryFee", event.target.value)
                    }
                    placeholder="Taxa padrão"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-orange-400/50"
                  />

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
                    <p className="text-xs text-zinc-500">
                      Pontos básicos antes de publicar.
                    </p>
                  </div>
                </div>

                {[
                  "Nome da loja definido",
                  "WhatsApp cadastrado",
                  "Banner configurado",
                  "Horário preenchido",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 border-t border-white/10 py-3 text-sm text-zinc-300"
                  >
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
              <p className="text-xs text-zinc-500">
                Tudo muda enquanto você edita.
              </p>
            </div>

            <Eye className="text-orange-400" size={20} />
          </div>

          <div className="mx-auto max-w-[300px] rounded-[38px] border border-white/15 bg-black p-3">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080808]">
              <div
                className="p-4"
                style={{ backgroundColor: store.primaryColor }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/25 text-2xl font-black">
                    {store.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-black leading-none">
                      {store.name || "Nome da loja"}
                    </h3>
                    <p className="mt-1 text-[11px] text-orange-100">
                      {store.isOpen ? "Aberto agora" : "Fechado agora"} •{" "}
                      {store.averageTime}
                    </p>
                  </div>
                </div>

                <p className="line-clamp-2 text-xs text-orange-50">
                  {store.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                <div className="rounded-2xl bg-white/[0.05] p-3">
                  <p className="text-[10px] text-zinc-500">Entrega</p>
                  <p className="text-xs font-black">R${store.deliveryFee}</p>
                </div>

                <div className="rounded-2xl bg-white/[0.05] p-3">
                  <p className="text-[10px] text-zinc-500">Tempo</p>
                  <p className="text-xs font-black">{store.averageTime}</p>
                </div>

                <div className="rounded-2xl bg-white/[0.05] p-3">
                  <p className="text-[10px] text-zinc-500">Mínimo</p>
                  <p className="text-xs font-black">R${store.minOrder}</p>
                </div>
              </div>

              <div className="px-3">
                <div
                  className="rounded-[24px] p-4"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  <p className="mb-2 inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black">
                    🔥 {store.bannerSubtitle}
                  </p>

                  <h4 className="text-2xl font-black leading-none">
                    {store.bannerTitle}
                  </h4>

                  <p className="mt-3 text-xl font-black text-yellow-200">
                    R$ {store.bannerPrice}
                  </p>

                  <button className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                    Pedir agora
                  </button>
                </div>
              </div>

              <div className="space-y-2 p-3">
                {[
                  ["🍔", "Smash Bacon", "R$ 32,90"],
                  ["🔥", "Combo Duplo", "R$ 49,90"],
                ].map(([emoji, name, price]) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                      {emoji}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-black">{name}</p>
                      <p className="mt-1 text-xs font-black text-orange-400">
                        {price}
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