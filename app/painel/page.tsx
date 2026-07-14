"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  Flame,
  Grid3X3,
  Loader2,
  Package,
  PackageCheck,
  Paintbrush,
  Plus,
  RefreshCcw,
  Rocket,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";

type OrderStatus =
  | "novo"
  | "preparando"
  | "saiu_para_entrega"
  | "concluido"
  | "recusado";

type Order = {
  id: string;
  order_code: string;
  status: OrderStatus;
  customer: { name?: string; phone?: string } | null;
  total: number | string;
  created_at: string;
};

type StoreData = {
  id: string;
  name: string;
  slug: string | null;
  is_open: boolean;
  description: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  whatsapp?: string | null;
};

type DashboardData = {
  store: StoreData | null;
  products: number;
  activeProducts: number;
  categories: number;
  ordersToday: Order[];
  recentOrders: Order[];
};

const emptyData: DashboardData = {
  store: null,
  products: 0,
  activeProducts: 0,
  categories: 0,
  ordersToday: [],
  recentOrders: [],
};

export default function PainelDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData>(emptyData);
  const [ownerName, setOwnerName] = useState("Lojista");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadDashboard();
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  async function loadDashboard(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);

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

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select(
          "id, name, slug, is_open, description, logo_url, banner_url, whatsapp"
        )
        .eq("owner_id", user.id)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!store) {
        setData(emptyData);
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [productsResult, categoriesResult, ordersResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("id, active")
            .eq("store_id", store.id),
          supabase
            .from("categories")
            .select("id")
            .eq("store_id", store.id),
          supabase
            .from("orders")
            .select("id, order_code, status, customer, total, created_at")
            .eq("store_id", store.id)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

      const products = productsResult.data || [];
      const categories = categoriesResult.data || [];
      const orders = (ordersResult.data || []) as Order[];

      setData({
        store: store as StoreData,
        products: products.length,
        activeProducts: products.filter((product) => product.active).length,
        categories: categories.length,
        ordersToday: orders.filter(
          (order) => new Date(order.created_at) >= todayStart
        ),
        recentOrders: orders.slice(0, 6),
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      showToast("Não foi possível atualizar alguns dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function money(value: number | string) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function copyStoreLink() {
    const link = `${window.location.origin}/loja`;
    navigator.clipboard.writeText(link);
    showToast("Link da loja copiado.");
  }

  async function shareStore() {
    const url = `${window.location.origin}/loja`;

    if (navigator.share) {
      await navigator.share({
        title: data.store?.name || "Minha loja",
        text: "Conheça nossa loja online no Pedisk.",
        url,
      });
      return;
    }

    navigator.clipboard.writeText(url);
    showToast("Link copiado para compartilhar.");
  }

  const summary = useMemo(() => {
    const validOrders = data.ordersToday.filter(
      (order) => order.status !== "recusado"
    );

    const revenue = validOrders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    return {
      orders: data.ordersToday.length,
      newOrders: data.ordersToday.filter((order) => order.status === "novo")
        .length,
      preparing: data.ordersToday.filter(
        (order) => order.status === "preparando"
      ).length,
      revenue,
      ticket: validOrders.length ? revenue / validOrders.length : 0,
    };
  }, [data.ordersToday]);

  const completion = useMemo(() => {
    const store = data.store;
    if (!store) return 0;

    const checks = [
      Boolean(store.name),
      Boolean(store.description),
      Boolean(store.logo_url),
      Boolean(store.banner_url),
      Boolean(store.whatsapp),
      data.products > 0,
      data.categories > 0,
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [data]);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, [now]);

  function statusLabel(status: OrderStatus) {
    return {
      novo: "Novo",
      preparando: "Preparando",
      saiu_para_entrega: "Em entrega",
      concluido: "Concluído",
      recusado: "Recusado",
    }[status];
  }

  function statusClass(status: OrderStatus) {
    return {
      novo: "bg-orange-500/15 text-orange-300",
      preparando: "bg-yellow-500/15 text-yellow-300",
      saiu_para_entrega: "bg-blue-500/15 text-blue-300",
      concluido: "bg-green-500/15 text-green-300",
      recusado: "bg-red-500/15 text-red-300",
    }[status];
  }

  function relativeTime(date: string) {
    const diff = Math.max(
      0,
      Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    );

    if (diff < 1) return "agora";
    if (diff < 60) return `há ${diff} min`;

    const hours = Math.floor(diff / 60);
    if (hours < 24) return `há ${hours}h`;

    return new Date(date).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/15" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-orange-400/30 bg-orange-500/10">
              <Loader2 className="animate-spin text-orange-400" size={28} />
            </div>
          </div>
          <p className="mt-5 text-sm font-black text-zinc-500">
            Preparando sua central...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-white md:px-6 lg:px-8 lg:py-7">
      {toast && (
        <div className="fixed left-1/2 top-5 z-[120] -translate-x-1/2 rounded-full border border-orange-400/30 bg-[#15100c]/95 px-5 py-3 text-sm font-black text-orange-300 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <section className="mx-auto max-w-[1600px]">
        <header className="relative mb-6 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] p-5 md:p-7">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-500/15 blur-[90px]" />
          <div className="absolute bottom-[-110px] left-[20%] h-56 w-56 rounded-full bg-orange-500/10 blur-[90px]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                  <Sparkles size={13} />
                  Central Pedisk
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-[10px] font-black text-green-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  Sistema online
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.05em] md:text-6xl">
                {greeting}, {ownerName.split(" ")[0]}.{" "}
                <span className="text-orange-500">Bora vender.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Aqui está o resumo da sua operação. Acompanhe pedidos, produtos
                e o desempenho da sua loja em um só lugar.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-orange-400/30 hover:text-white disabled:opacity-50"
              >
                <RefreshCcw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Atualizar
              </button>

              <Link
                href="/loja"
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black shadow-[0_0_35px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-400"
              >
                Ver minha loja
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Pedidos hoje"
            value={summary.orders}
            subtitle={
              summary.newOrders > 0
                ? `${summary.newOrders} aguardando`
                : "Tudo em dia"
            }
            icon={ShoppingBag}
            accent="orange"
            trend="+ operação ao vivo"
          />

          <MetricCard
            title="Faturamento hoje"
            value={money(summary.revenue)}
            subtitle={`Ticket médio ${money(summary.ticket)}`}
            icon={CircleDollarSign}
            accent="green"
            trend="receita confirmada"
          />

          <MetricCard
            title="Produtos ativos"
            value={`${data.activeProducts}/${data.products}`}
            subtitle={`${data.categories} categorias`}
            icon={Package}
            accent="blue"
            trend="vitrine atual"
          />

          <MetricCard
            title="Em preparo"
            value={summary.preparing}
            subtitle={
              summary.preparing > 0
                ? "Sua equipe está produzindo"
                : "Nenhum pedido em espera"
            }
            icon={Flame}
            accent="yellow"
            trend="ritmo da cozinha"
          />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[34px] border border-orange-400/20 bg-gradient-to-br from-orange-500/15 via-white/[0.035] to-white/[0.02] p-5 md:p-7">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />

              <div className="relative grid gap-7 xl:grid-cols-[1fr_360px] xl:items-center">
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_0_35px_rgba(249,115,22,0.3)]">
                      <Store size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">
                        Sua loja
                      </p>
                      <h2 className="text-2xl font-black">
                        {data.store?.name || "Minha Loja"}
                      </h2>
                    </div>
                  </div>

                  <h3 className="max-w-2xl text-3xl font-black tracking-[-0.04em] md:text-4xl">
                    Sua vitrine está ficando{" "}
                    <span className="text-orange-400">mais forte.</span>
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">
                    Complete os detalhes da loja, cadastre seus produtos e
                    compartilhe seu link com os clientes.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={copyStoreLink}
                      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-black transition hover:border-orange-400/30"
                    >
                      <Copy size={16} />
                      Copiar link
                    </button>

                    <button
                      onClick={shareStore}
                      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-black transition hover:border-orange-400/30"
                    >
                      <Share2 size={16} />
                      Compartilhar
                    </button>

                    <Link
                      href="/painel/minha-loja"
                      className="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black"
                    >
                      Editar loja
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-500">
                        Configuração da loja
                      </p>
                      <p className="mt-1 text-3xl font-black">{completion}%</p>
                    </div>

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-white/10">
                      <div
                        className="absolute inset-[-7px] rounded-full"
                        style={{
                          background: `conic-gradient(#f97316 ${completion * 3.6}deg, transparent 0deg)`,
                          WebkitMask:
                            "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 0)",
                          mask:
                            "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 0)",
                        }}
                      />
                      <Rocket size={24} className="text-orange-400" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <p className="mt-4 text-xs leading-5 text-zinc-500">
                    {completion === 100
                      ? "Sua loja está pronta para receber clientes."
                      : "Continue configurando para deixar sua vitrine completa."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.03] p-5 md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-400">
                    operação
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Pedidos recentes
                  </h2>
                </div>

                <Link
                  href="/painel/pedidos"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-black text-zinc-400 transition hover:text-white"
                >
                  Ver todos
                  <ChevronRight size={15} />
                </Link>
              </div>

              {data.recentOrders.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 px-5 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                    <Bell size={24} />
                  </div>
                  <h3 className="mt-4 text-lg font-black">
                    Nenhum pedido por enquanto
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Quando um cliente finalizar um pedido, ele aparecerá aqui
                    automaticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href="/painel/pedidos"
                      className="group flex flex-col gap-4 rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-orange-400/25 hover:bg-orange-500/[0.04] sm:flex-row sm:items-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                        <ShoppingBag size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{order.order_code}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-black ${statusClass(
                              order.status
                            )}`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {order.customer?.name || "Cliente"} •{" "}
                          {relativeTime(order.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                        <p className="font-black text-orange-400">
                          {money(order.total)}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-600">
                          abrir pedido
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-400">
                  atalhos
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Continue construindo
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <QuickAction
                  href="/painel/produtos"
                  title="Novo produto"
                  description="Cadastre um item"
                  icon={Plus}
                  accent="orange"
                />
                <QuickAction
                  href="/painel/categorias"
                  title="Categorias"
                  description="Organize o cardápio"
                  icon={Grid3X3}
                  accent="purple"
                />
                <QuickAction
                  href="/painel/entrega"
                  title="Entrega"
                  description="Configure regiões"
                  icon={Truck}
                  accent="blue"
                />
                <QuickAction
                  href="/painel/aparencia"
                  title="Aparência"
                  description="Personalize a loja"
                  icon={Paintbrush}
                  accent="pink"
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-400">
                    hoje
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    Ritmo da operação
                  </h2>
                </div>
                <TrendingUp size={21} className="text-orange-400" />
              </div>

              <div className="space-y-3">
                <OperationRow
                  icon={Bell}
                  label="Novos pedidos"
                  value={summary.newOrders}
                  color="orange"
                />
                <OperationRow
                  icon={Flame}
                  label="Em preparo"
                  value={summary.preparing}
                  color="yellow"
                />
                <OperationRow
                  icon={PackageCheck}
                  label="Finalizados"
                  value={
                    data.ordersToday.filter(
                      (order) => order.status === "concluido"
                    ).length
                  }
                  color="green"
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[34px] border border-orange-400/25 bg-gradient-to-br from-orange-500/20 to-orange-500/[0.04] p-5">
              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-orange-500/20 blur-[60px]" />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                  <Zap size={23} />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-300">
                  Plano atual
                </p>
                <h2 className="mt-2 text-2xl font-black">Pedisk R$29</h2>
                <p className="mt-3 text-sm leading-6 text-orange-100/70">
                  Sua central, sua loja e seus pedidos em um único plano.
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-orange-400/20 bg-black/20 px-4 py-3 text-xs font-black text-orange-200">
                  <BadgeCheck size={16} />
                  Conta ativa
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-400">
                    checklist
                  </p>
                  <h2 className="mt-1 text-xl font-black">Primeiros passos</h2>
                </div>
                <CheckCircle2 size={21} className="text-orange-400" />
              </div>

              <div className="space-y-3">
                <ChecklistItem
                  done={Boolean(data.store?.name)}
                  text="Dados da loja"
                  href="/painel/minha-loja"
                />
                <ChecklistItem
                  done={data.categories > 0}
                  text="Criar categoria"
                  href="/painel/categorias"
                />
                <ChecklistItem
                  done={data.products > 0}
                  text="Adicionar produto"
                  href="/painel/produtos"
                />
                <ChecklistItem
                  done={Boolean(data.store?.logo_url)}
                  text="Adicionar logo"
                  href="/painel/aparencia"
                />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accent: "orange" | "green" | "blue" | "yellow";
  trend: string;
}) {
  const styles = {
    orange: "bg-orange-500/10 text-orange-400 border-orange-400/20",
    green: "bg-green-500/10 text-green-400 border-green-400/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-400/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/20">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-orange-500/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-zinc-500">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em]">{value}</p>
          <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${styles[accent]}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] font-bold text-zinc-600">
        <TrendingUp size={13} className="text-orange-400" />
        {trend}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: "orange" | "purple" | "blue" | "pink";
}) {
  const styles = {
    orange: "bg-orange-500/10 text-orange-400 border-orange-400/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-400/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-400/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-400/20",
  };

  return (
    <Link
      href={href}
      className="group rounded-[26px] border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/20 hover:bg-white/[0.05]"
    >
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${styles[accent]}`}
      >
        <Icon size={21} />
      </div>
      <h3 className="font-black">{title}</h3>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-600">{description}</p>
        <ChevronRight
          size={15}
          className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-orange-400"
        />
      </div>
    </Link>
  );
}

function OperationRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "orange" | "yellow" | "green";
}) {
  const styles = {
    orange: "bg-orange-500/10 text-orange-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    green: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}
      >
        <Icon size={18} />
      </div>
      <p className="flex-1 text-sm font-bold text-zinc-400">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}

function ChecklistItem({
  done,
  text,
  href,
}: {
  done: boolean;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-orange-400/20"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          done
            ? "bg-green-500/10 text-green-400"
            : "bg-white/[0.04] text-zinc-700"
        }`}
      >
        {done ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}
      </div>
      <p
        className={`flex-1 text-sm font-bold ${
          done ? "text-zinc-300" : "text-zinc-500"
        }`}
      >
        {text}
      </p>
      <ChevronRight size={15} className="text-zinc-700" />
    </Link>
  );
}
