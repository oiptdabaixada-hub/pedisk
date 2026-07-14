"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Boxes,
  ChevronRight,
  ExternalLink,
  Grid3X3,
  House,
  Layers3,
  LogOut,
  Menu,
  Package,
  Paintbrush,
  Settings2,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
};

const navItems: NavItem[] = [
  {
    label: "Início",
    href: "/painel",
    icon: House,
    description: "Visão geral",
  },
  {
    label: "Pedidos",
    href: "/painel/pedidos",
    icon: ShoppingBag,
    description: "Acompanhe tudo",
  },
  {
    label: "Produtos",
    href: "/painel/produtos",
    icon: Package,
    description: "Cadastre e organize",
  },
  {
    label: "Categorias",
    href: "/painel/categorias",
    icon: Grid3X3,
    description: "Organize o cardápio",
  },
  {
    label: "Entrega",
    href: "/painel/entrega",
    icon: Truck,
    description: "Taxas e regiões",
  },
  {
    label: "Aparência",
    href: "/painel/aparencia",
    icon: Paintbrush,
    description: "Visual da loja",
  },
  {
    label: "Construtor",
    href: "/painel/construtor",
    icon: Layers3,
    description: "Monte sua vitrine",
  },
  {
    label: "Minha Loja",
    href: "/painel/minha-loja",
    icon: Store,
    description: "Dados e publicação",
  },
];

const mobileMainItems = navItems.slice(0, 4);

export default function PainelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const closeTimerRef = useRef<number | null>(null);

  const [desktopOpen, setDesktopOpen] = useState(false);
  const [desktopPinned, setDesktopPinned] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [storeName, setStoreName] = useState("Minha Loja");
  const [storeSlug, setStoreSlug] = useState("");
  const [ownerName, setOwnerName] = useState("Lojista");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const savedPinned = localStorage.getItem("pedisk-menu-pinned");
    const isPinned = savedPinned === "true";

    setDesktopPinned(isPinned);
    setDesktopOpen(isPinned);

    loadUser();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function loadUser() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      setOwnerName(
        user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Lojista"
      );

      const { data: store } = await supabase
        .from("stores")
        .select("name, slug")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (store?.name) setStoreName(store.name);
      if (store?.slug) setStoreSlug(store.slug);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoadingUser(false);
    }
  }

  function isActive(href: string) {
    if (href === "/painel") return pathname === "/painel";
    return pathname.startsWith(href);
  }

  function handleMouseEnter() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setDesktopOpen(true);
  }

  function handleMouseLeave() {
    if (desktopPinned) return;

    closeTimerRef.current = window.setTimeout(() => {
      setDesktopOpen(false);
      setProfileOpen(false);
    }, 140);
  }

  function togglePinned() {
    const next = !desktopPinned;
    setDesktopPinned(next);
    setDesktopOpen(next);
    localStorage.setItem("pedisk-menu-pinned", String(next));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const currentPage = useMemo(() => {
    return (
      navItems.find((item) => isActive(item.href)) || {
        label: "Painel",
        description: "Gerencie sua operação",
      }
    );
  }, [pathname]);

  const publicStoreHref = storeSlug ? `/${storeSlug}` : "/loja";

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-220px] top-[-220px] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute bottom-[-260px] right-[-220px] h-[540px] w-[540px] rounded-full bg-orange-500/10 blur-[170px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      </div>

      {/* MENU DESKTOP — TRILHO COMPACTO + PAINEL FLUTUANTE */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed inset-y-0 left-0 z-50 hidden w-[78px] border-r border-white/10 bg-[#080808]/95 backdrop-blur-2xl lg:block"
      >
        <div className="flex h-20 items-center justify-center border-b border-white/10">
          <Link
            href="/painel"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 shadow-[0_0_26px_rgba(249,115,22,0.16)]"
            aria-label="Pedisk"
          >
            <span className="text-2xl font-black tracking-[-0.08em] text-orange-500">
              p
            </span>
          </Link>
        </div>

        <nav className="flex flex-col items-center gap-2 px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                  active
                    ? "border-orange-400/30 bg-orange-500 text-white shadow-[0_0_28px_rgba(249,115,22,0.28)]"
                    : "border-transparent bg-white/[0.025] text-zinc-600 hover:border-white/10 hover:bg-white/[0.05] hover:text-orange-400"
                }`}
              >
                {active && (
                  <span className="absolute -left-[10px] h-7 w-1 rounded-r-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                )}
                <Icon size={19} />
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 px-2">
          <Link
            href={publicStoreHref}
            target="_blank"
            title="Ver loja pública"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-400 transition hover:bg-orange-500/15"
          >
            <ExternalLink size={18} />
          </Link>

          <button
            onClick={() => setProfileOpen((current) => !current)}
            title="Perfil"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:text-white"
          >
            <UserRound size={18} />
          </button>
        </div>
      </aside>

      {/* PAINEL FLUTUANTE DO MENU — NÃO EMPURRA O CONTEÚDO */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-[78px] z-40 hidden w-[248px] border-r border-white/10 bg-[#090909]/98 shadow-[24px_0_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-200 lg:flex lg:flex-col ${
          desktopOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-4 opacity-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/painel" className="min-w-0">
            <p className="text-xl font-black tracking-[-0.045em]">pedisk</p>
            <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              painel do lojista
            </p>
          </Link>

          <button
            onClick={togglePinned}
            title={desktopPinned ? "Desafixar menu" : "Fixar menu aberto"}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              desktopPinned
                ? "border-orange-400/30 bg-orange-500/10 text-orange-400"
                : "border-white/10 bg-white/[0.03] text-zinc-600 hover:text-white"
            }`}
          >
            <Settings2 size={16} />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-300">
              Loja conectada
            </p>
            <p className="mt-1 truncate text-sm font-black">{storeName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                  active
                    ? "border-orange-400/25 bg-orange-500/12 text-white"
                    : "border-transparent text-zinc-500 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-white/[0.035] text-zinc-600 group-hover:text-orange-400"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">{item.label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                    {item.description}
                  </p>
                </div>

                {active && (
                  <ChevronRight size={15} className="text-orange-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <Link
            href={publicStoreHref}
            target="_blank"
            className="flex items-center justify-between rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-sm font-black text-orange-300 transition hover:bg-orange-500/15"
          >
            Ver loja pública
            <ExternalLink size={16} />
          </Link>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-sm font-black">
              {ownerName.slice(0, 1).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black">{ownerName}</p>
              <p className="truncate text-[10px] text-zinc-600">{storeName}</p>
            </div>

            <button
              onClick={handleLogout}
              title="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* POPUP DE PERFIL NO MODO COMPACTO */}
      {profileOpen && !desktopOpen && (
        <div className="fixed bottom-4 left-[88px] z-[70] hidden w-[230px] rounded-3xl border border-white/10 bg-[#0d0d0d]/98 p-3 shadow-2xl backdrop-blur-2xl lg:block">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 font-black">
              {ownerName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{ownerName}</p>
              <p className="truncate text-[10px] text-zinc-600">{storeName}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      )}

      {/* CABEÇALHO MOBILE */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#050505]/88 px-4 backdrop-blur-2xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-black">{currentPage.label}</p>
          <p className="truncate text-[9px] text-zinc-600">{storeName}</p>
        </div>

        <Link
          href={publicStoreHref}
          target="_blank"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-400"
          aria-label="Ver loja pública"
        >
          <ExternalLink size={18} />
        </Link>
      </header>

      {/* MENU MOBILE */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />

          <div className="absolute inset-y-0 left-0 w-[88%] max-w-[340px] overflow-y-auto border-r border-white/10 bg-[#080808] p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <Link href="/painel" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-2xl font-black text-orange-500">
                  p
                </div>
                <div>
                  <p className="text-xl font-black">pedisk</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                    painel do lojista
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
              <p className="text-xs font-bold text-orange-300">Loja conectada</p>
              <p className="mt-1 truncate font-black">{storeName}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                      active
                        ? "border-orange-400/30 bg-orange-500/15"
                        : "border-transparent bg-white/[0.025] text-zinc-500"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        active ? "bg-orange-500 text-white" : "bg-white/[0.04]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-black">{item.label}</p>
                      <p className="text-[10px] text-zinc-600">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
              <Link
                href={publicStoreHref}
                target="_blank"
                className="flex items-center justify-between rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 font-black text-orange-300"
              >
                Ver loja pública
                <ExternalLink size={17} />
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-black text-red-300"
              >
                <LogOut size={17} />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO — SOMENTE 78PX DE RECUO NO DESKTOP */}
      <div className="relative z-10 min-h-screen lg:pl-[78px]">
        <div className="min-h-screen pb-24 lg:pb-0">{children}</div>
      </div>

      {/* BARRA INFERIOR MOBILE */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-white/10 bg-[#080808]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl lg:hidden">
        {mobileMainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[9px] font-black ${
                active ? "text-orange-400" : "text-zinc-600"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active ? "bg-orange-500/15" : ""
                }`}
              >
                <Icon size={18} />
              </div>
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[9px] font-black text-zinc-600"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl">
            <Boxes size={18} />
          </div>
          Mais
        </button>
      </nav>
    </div>
  );
}
