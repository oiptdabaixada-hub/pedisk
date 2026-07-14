"use client";

import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  GripVertical,
  Loader2,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  Search,
  Truck,
  User,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from "lucide-react";

type Extra = {
  id: string | number;
  name: string;
  price: number;
  emoji: string;
};

type CartItem = {
  cartId: string;
  productId: string | number;
  slug: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  emoji: string;
  quantity: number;
  observation: string;
  extras: Extra[];
  total: number;
};

type OrderStatus =
  | "novo"
  | "preparando"
  | "saiu_para_entrega"
  | "concluido"
  | "recusado";

type Order = {
  databaseId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  storeId: string;
  storeName: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    complement: string;
    neighborhood: string;
  };
  delivery: {
    zoneId?: string;
    fee?: number;
    time?: string;
    minimumOrder?: number;
  };
  payment: string;
  generalObservation: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

type OrderRow = {
  id: string;
  order_code: string;
  store_id: string;
  status: OrderStatus;
  customer: Order["customer"];
  address: Order["address"];
  delivery: Order["delivery"];
  payment: string;
  general_observation: string | null;
  items: CartItem[];
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  created_at: string;
  updated_at: string;
};

type Column = {
  status: OrderStatus;
  label: string;
  emoji: string;
  description: string;
};

const columns: Column[] = [
  {
    status: "novo",
    label: "Novos",
    emoji: "🔴",
    description: "Aguardando aceite",
  },
  {
    status: "preparando",
    label: "Preparando",
    emoji: "🟡",
    description: "Pedidos em produção",
  },
  {
    status: "saiu_para_entrega",
    label: "Em entrega",
    emoji: "🛵",
    description: "A caminho do cliente",
  },
  {
    status: "concluido",
    label: "Concluídos",
    emoji: "✅",
    description: "Pedidos finalizados",
  },
];

export default function PainelPedidosPage() {
  const router = useRouter();

  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("Minha Loja");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<OrderStatus | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(Date.now());
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "online" | "offline"
  >("connecting");

  const audioContextRef = useRef<AudioContext | null>(null);
  const orderAlarmIntervalRef = useRef<number | null>(null);
  const whatsappWindowRef = useRef<Window | null>(null);
  const initialLoadFinishedRef = useRef(false);

  // Mantém apenas um canal Realtime ativo por vez.
  const realtimeChannelRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);

  // Evita atualizações de estado depois que a página for desmontada.
  const mountedRef = useRef(true);

  // Mantém o valor mais recente do som dentro do callback do Realtime.
  const soundEnabledRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const savedSound = localStorage.getItem("pedisk-order-sound");
    const savedSoundEnabled = savedSound === "true";

    setSoundEnabled(savedSoundEnabled);
    soundEnabledRef.current = savedSoundEnabled;

    initializePanel();

    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);

      if (orderAlarmIntervalRef.current !== null) {
        window.clearInterval(orderAlarmIntervalRef.current);
        orderAlarmIntervalRef.current = null;
      }

      // Esse cleanup é o ponto principal da correção:
      // ao sair ou recarregar a página, o canal antigo é removido.
      const currentChannel = realtimeChannelRef.current;

      if (currentChannel) {
        supabase.removeChannel(currentChannel);
        realtimeChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const hasNewOrders = orders.some((order) => order.status === "novo");

    if (soundEnabled && hasNewOrders) {
      startNewOrderAlarm();
    } else {
      stopNewOrderAlarm();
    }
  }, [orders, soundEnabled]);

  async function initializePanel() {
    if (mountedRef.current) setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!store) throw new Error("Loja não encontrada.");

      setStoreId(store.id);
      setStoreName(store.name || "Minha Loja");

      await loadOrders(store.id);
      subscribeToOrders(store.id);
    } catch (error) {
      console.error("Erro ao abrir painel de pedidos:", error);
      showToast("Não foi possível carregar os pedidos.");
      setConnectionStatus("offline");
    } finally {
      initialLoadFinishedRef.current = true;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  function mapOrder(row: OrderRow): Order {
    return {
      databaseId: row.id,
      id: row.order_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.status,
      storeId: row.store_id,
      storeName,
      customer: row.customer || { name: "Cliente", phone: "" },
      address:
        row.address || {
          street: "",
          complement: "",
          neighborhood: "",
        },
      delivery: row.delivery || {},
      payment: row.payment || "Não informado",
      generalObservation: row.general_observation || "",
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal || 0),
      deliveryFee: Number(row.delivery_fee || 0),
      total: Number(row.total || 0),
    };
  }

  async function loadOrders(currentStoreId = storeId) {
    if (!currentStoreId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("store_id", currentStoreId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      showToast("Falha ao atualizar os pedidos.");
      return;
    }

    setOrders(((data || []) as OrderRow[]).map(mapOrder));
  }

  function subscribeToOrders(currentStoreId: string) {
    if (!currentStoreId) return;

    setConnectionStatus("connecting");

    // Antes de criar uma nova inscrição, remove qualquer canal antigo.
    // Isso evita o conflito de SUBSCRIBE visto no console.
    const previousChannel = realtimeChannelRef.current;

    if (previousChannel) {
      supabase.removeChannel(previousChannel);
      realtimeChannelRef.current = null;
    }

    const channel = supabase
      .channel(`pedisk-orders-${currentStoreId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${currentStoreId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;

          const newOrder = mapOrder(payload.new as OrderRow);

          setOrders((current) => {
            if (
              current.some(
                (order) => order.databaseId === newOrder.databaseId
              )
            ) {
              return current;
            }

            return [newOrder, ...current];
          });

          if (initialLoadFinishedRef.current) {
            showToast(
              `Novo pedido ${newOrder.id} — ${newOrder.customer.name}`
            );

            if (soundEnabledRef.current) {
              startNewOrderAlarm();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${currentStoreId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;

          const updatedOrder = mapOrder(payload.new as OrderRow);

          setOrders((current) =>
            current.map((order) =>
              order.databaseId === updatedOrder.databaseId
                ? updatedOrder
                : order
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${currentStoreId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;

          const deletedId = String(payload.old.id || "");

          setOrders((current) =>
            current.filter(
              (order) => order.databaseId !== deletedId
            )
          );
        }
      )
      .subscribe((status) => {
        if (!mountedRef.current) return;

        if (status === "SUBSCRIBED") {
          setConnectionStatus("online");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setConnectionStatus("offline");
        }
      });

    realtimeChannelRef.current = channel;
  }

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 3300);
  }

  function money(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function normalizePhone(phone: string) {
    const numbers = (phone || "").replace(/\D/g, "");
    if (!numbers) return "";
    if (numbers.startsWith("55")) return numbers;
    return `55${numbers}`;
  }

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );
  }

  function openWhatsApp(phone: string, message?: string) {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      showToast("O cliente não possui telefone válido.");
      return;
    }

    const params = new URLSearchParams({
      phone: normalizedPhone,
    });

    if (message) {
      params.set("text", message);
    }

    const url = `https://web.whatsapp.com/send?${params.toString()}`;

    if (isMobileDevice()) {
      const mobileParams = new URLSearchParams({
        phone: normalizedPhone,
      });

      if (message) {
        mobileParams.set("text", message);
      }

      window.location.href = `https://api.whatsapp.com/send?${mobileParams.toString()}`;
      return;
    }

    // Reutiliza SEMPRE a mesma aba/janela do WhatsApp.
    // Na primeira vez abre uma aba; nas próximas, navega a mesma aba
    // direto para a conversa do cliente e traz ela para frente.
    if (
      whatsappWindowRef.current &&
      !whatsappWindowRef.current.closed
    ) {
      whatsappWindowRef.current.location.href = url;
      whatsappWindowRef.current.focus();
      return;
    }

    whatsappWindowRef.current = window.open(
      url,
      "pedisk-whatsapp"
    );

    whatsappWindowRef.current?.focus();
  }

  function itemsSummary(order: Order) {
    return order.items
      .map((item) => {
        const extras =
          item.extras?.length > 0
            ? `\n${item.extras
                .map((extra) => `  + ${extra.name}`)
                .join("\n")}`
            : "";

        return `• ${item.quantity}x ${item.name}${extras}`;
      })
      .join("\n");
  }

  function buildCustomerMessage(order: Order, status: OrderStatus) {
    const summary = itemsSummary(order);

    if (status === "preparando") {
      return `🍔 *PEDISK*

Olá, ${order.customer.name}! 👋

Seu pedido *${order.id}* foi aceito e já está sendo preparado. 👨‍🍳

🧾 *Resumo do pedido*
${summary}

💰 *Total*
${money(order.total)}

Assim que sair para entrega, avisaremos por aqui.

Obrigado pela preferência! ❤️
_${storeName}_`;
    }

    if (status === "saiu_para_entrega") {
      return `🛵 *PEDISK*

Olá, ${order.customer.name}!

Seu pedido *${order.id}* saiu para entrega e está a caminho.

📍 *Endereço*
${order.address.street}
${order.address.complement || ""}
${order.address.neighborhood}

💰 *Total*
${money(order.total)}

Fique atento ao telefone e ao portão.`;
    }

    if (status === "concluido") {
      return `✅ *PEDISK*

Olá, ${order.customer.name}!

Seu pedido *${order.id}* foi concluído.

Esperamos que tenha gostado! Obrigado pela preferência. ❤️`;
    }

    if (status === "recusado") {
      return `Olá, ${order.customer.name}.

Infelizmente, seu pedido *${order.id}* não pôde ser aceito neste momento.

Entre em contato com a loja para mais informações.`;
    }

    return `Olá, ${order.customer.name}!`;
  }

  async function updateStatus(
    order: Order,
    status: OrderStatus,
    notify: boolean
  ) {
    setBusyOrderId(order.databaseId);

    const timestampFields: Record<string, string | null> = {
      accepted_at: status === "preparando" ? new Date().toISOString() : null,
      delivery_started_at:
        status === "saiu_para_entrega"
          ? new Date().toISOString()
          : null,
      completed_at:
        status === "concluido" ? new Date().toISOString() : null,
      rejected_at:
        status === "recusado" ? new Date().toISOString() : null,
    };

    const optimisticOrder = { ...order, status };

    setOrders((current) =>
      current.map((item) =>
        item.databaseId === order.databaseId
          ? optimisticOrder
          : item
      )
    );

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status,
          ...timestampFields,
        })
        .eq("id", order.databaseId);

      if (error) throw error;

      if (notify) {
        openWhatsApp(
          order.customer.phone,
          buildCustomerMessage(order, status)
        );
      }

      showToast(`${order.id}: ${statusLabel(status)}`);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);

      setOrders((current) =>
        current.map((item) =>
          item.databaseId === order.databaseId ? order : item
        )
      );

      showToast("Não foi possível atualizar o pedido.");
    } finally {
      setBusyOrderId(null);
    }
  }

  function statusLabel(status: OrderStatus) {
    return {
      novo: "Novo",
      preparando: "Preparando",
      saiu_para_entrega: "Saiu para entrega",
      concluido: "Concluído",
      recusado: "Recusado",
    }[status];
  }

  function statusClass(status: OrderStatus) {
    return {
      novo: "border-orange-400/30 bg-orange-500/15 text-orange-300",
      preparando:
        "border-yellow-400/30 bg-yellow-500/15 text-yellow-300",
      saiu_para_entrega:
        "border-blue-400/30 bg-blue-500/15 text-blue-300",
      concluido:
        "border-green-400/30 bg-green-500/15 text-green-300",
      recusado: "border-red-400/30 bg-red-500/15 text-red-300",
    }[status];
  }

  function timeAgo(date: string) {
    const createdAt = new Date(date).getTime();
    const seconds = Math.max(
      0,
      Math.floor((now - createdAt) / 1000)
    );

    if (seconds < 60) return `há ${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;

    return `há ${Math.floor(hours / 24)}d`;
  }

  function getDelayClass(order: Order) {
    if (
      order.status === "concluido" ||
      order.status === "recusado"
    ) {
      return "";
    }

    const minutes =
      (now - new Date(order.createdAt).getTime()) / 60000;

    if (minutes >= 45) {
      return "border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.12)]";
    }

    if (minutes >= 25) return "border-yellow-500/30";

    return "";
  }

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    databaseId: string
  ) {
    setDraggedOrderId(databaseId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", databaseId);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    status: OrderStatus
  ) {
    event.preventDefault();

    const databaseId =
      draggedOrderId || event.dataTransfer.getData("text/plain");
    const order = orders.find(
      (item) => item.databaseId === databaseId
    );

    setDraggedOrderId(null);
    setDragOverStatus(null);

    if (!order || order.status === status) return;

    updateStatus(order, status, false);
  }

  function toggleSound() {
    const next = !soundEnabled;

    setSoundEnabled(next);
    soundEnabledRef.current = next;
    localStorage.setItem("pedisk-order-sound", String(next));

    if (next) {
      // O clique do usuário libera o AudioContext nos navegadores.
      unlockAudio();
      playNewOrderSound();

      if (orders.some((order) => order.status === "novo")) {
        startNewOrderAlarm();
      }

      showToast("Som de novos pedidos ativado.");
    } else {
      stopNewOrderAlarm();
      showToast("Som desativado.");
    }
  }

  function unlockAudio() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext: typeof AudioContext;
        }).webkitAudioContext;

      const context =
        audioContextRef.current || new AudioContextClass();

      audioContextRef.current = context;

      if (context.state === "suspended") {
        context.resume();
      }
    } catch (error) {
      console.error("Erro ao liberar áudio:", error);
    }
  }

  function startNewOrderAlarm() {
    if (!soundEnabledRef.current) return;
    if (orderAlarmIntervalRef.current !== null) return;

    playNewOrderSound();

    // Repete até não existir mais nenhum pedido com status "novo".
    orderAlarmIntervalRef.current = window.setInterval(() => {
      playNewOrderSound();
    }, 1800);
  }

  function stopNewOrderAlarm() {
    if (orderAlarmIntervalRef.current !== null) {
      window.clearInterval(orderAlarmIntervalRef.current);
      orderAlarmIntervalRef.current = null;
    }
  }

  function playNewOrderSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext: typeof AudioContext;
        }).webkitAudioContext;

      const context =
        audioContextRef.current || new AudioContextClass();

      audioContextRef.current = context;

      if (context.state === "suspended") {
        context.resume();
      }

      // Alerta curto em duas sequências, estilo central de delivery.
      const notes = [
        { frequency: 784, at: 0.0, duration: 0.13 },
        { frequency: 988, at: 0.16, duration: 0.13 },
        { frequency: 1175, at: 0.32, duration: 0.18 },
        { frequency: 988, at: 0.62, duration: 0.13 },
        { frequency: 1175, at: 0.78, duration: 0.13 },
        { frequency: 1568, at: 0.94, duration: 0.22 },
      ];

      notes.forEach(({ frequency, at, duration }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + at;

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration
        );

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
      });
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  }

  function copyOrderId(id: string) {
    navigator.clipboard.writeText(id);
    showToast("Número do pedido copiado.");
  }

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return orders;

    return orders.filter((order) => {
      const productNames = order.items
        .map((item) => item.name)
        .join(" ")
        .toLowerCase();

      return (
        order.id.toLowerCase().includes(term) ||
        order.customer.name.toLowerCase().includes(term) ||
        order.customer.phone.toLowerCase().includes(term) ||
        order.address.neighborhood.toLowerCase().includes(term) ||
        productNames.includes(term)
      );
    });
  }, [orders, search]);

  const summary = useMemo(() => {
    const today = new Date().toDateString();

    const todayOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === today
    );

    const valid = todayOrders.filter(
      (order) => order.status !== "recusado"
    );

    const revenue = valid.reduce(
      (sum, order) => sum + order.total,
      0
    );

    return {
      newOrders: orders.filter((order) => order.status === "novo")
        .length,
      preparing: orders.filter(
        (order) => order.status === "preparando"
      ).length,
      delivery: orders.filter(
        (order) => order.status === "saiu_para_entrega"
      ).length,
      completed: todayOrders.filter(
        (order) => order.status === "concluido"
      ).length,
      revenue,
      averageTicket: valid.length ? revenue / valid.length : 0,
    };
  }, [orders]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-orange-400" size={42} />
          <p className="text-sm font-bold text-zinc-500">
            Conectando à central...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pb-10 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-[160px]" />
        <div className="absolute bottom-[-240px] right-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[170px]" />
      </div>

      {toast && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full border border-orange-400/30 bg-[#15100c]/95 px-5 py-3 text-sm font-black text-orange-300 shadow-2xl">
          {toast}
        </div>
      )}

      <section className="relative z-10 mx-auto max-w-[1700px] px-4 py-5">
        <header className="mb-5 rounded-[32px] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <button
                onClick={() => router.push("/painel")}
                className="mb-5 inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-orange-400"
              >
                <ArrowLeft size={16} />
                Voltar ao painel
              </button>

              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
                  <Bell size={13} />
                  Central Pedisk
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black ${
                    connectionStatus === "online"
                      ? "bg-green-500/15 text-green-300"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-500/15 text-yellow-300"
                      : "bg-red-500/15 text-red-300"
                  }`}
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                  {connectionStatus === "online"
                    ? "Tempo real conectado"
                    : connectionStatus === "connecting"
                    ? "Conectando..."
                    : "Tempo real desconectado"}
                </span>
              </div>

              <h1 className="text-4xl font-black md:text-5xl">
                Central de pedidos
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                {storeName} • pedidos atualizados automaticamente.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={toggleSound}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
                  soundEnabled
                    ? "bg-orange-500"
                    : "border border-white/10 bg-white/[0.04]"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 size={17} />
                ) : (
                  <VolumeX size={17} />
                )}
                {soundEnabled ? "Som ativo" : "Ativar som"}
              </button>

              <button
                onClick={() => loadOrders()}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black"
              >
                <RefreshCcw size={17} />
                Atualizar
              </button>
            </div>
          </div>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard title="Novos" value={summary.newOrders} icon="🔔" />
          <SummaryCard title="Preparando" value={summary.preparing} icon="👨‍🍳" />
          <SummaryCard title="Em entrega" value={summary.delivery} icon="🛵" />
          <SummaryCard title="Concluídos hoje" value={summary.completed} icon="✅" />
          <SummaryCard title="Faturamento hoje" value={money(summary.revenue)} icon="💰" />
          <SummaryCard title="Ticket médio" value={money(summary.averageTicket)} icon="📈" />
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
          <Search size={18} className="ml-2 text-orange-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar pedido, cliente, telefone, bairro ou produto..."
            className="w-full bg-transparent text-sm outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={16} className="text-zinc-500" />
            </button>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => {
            const columnOrders = visibleOrders.filter(
              (order) => order.status === column.status
            );

            return (
              <div
                key={column.status}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverStatus(column.status);
                }}
                onDrop={(event) =>
                  handleDrop(event, column.status)
                }
                className={`min-h-[420px] rounded-[28px] border p-3 ${
                  dragOverStatus === column.status
                    ? "border-orange-400/50 bg-orange-500/10"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between rounded-[20px] bg-black/25 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{column.emoji}</span>
                      <h2 className="font-black">{column.label}</h2>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {column.description}
                    </p>
                  </div>
                  <span className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-black">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnOrders.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-white/10 p-6 text-center">
                      <p className="text-2xl">🧾</p>
                      <p className="mt-2 text-xs font-black text-zinc-600">
                        Nenhum pedido
                      </p>
                    </div>
                  ) : (
                    columnOrders.map((order) => (
                      <OrderCard
                        key={order.databaseId}
                        order={order}
                        busy={busyOrderId === order.databaseId}
                        dragged={draggedOrderId === order.databaseId}
                        timeAgo={timeAgo}
                        money={money}
                        delayClass={getDelayClass(order)}
                        onDragStart={(event) => {
                          setDraggedOrderId(order.databaseId);
                          event.dataTransfer.setData(
                            "text/plain",
                            order.databaseId
                          );
                        }}
                        onDragEnd={() => {
                          setDraggedOrderId(null);
                          setDragOverStatus(null);
                        }}
                        onOpen={() => setSelectedOrder(order)}
                        onWhatsApp={() =>
                          openWhatsApp(order.customer.phone)
                        }
                        onAccept={() =>
                          updateStatus(order, "preparando", true)
                        }
                        onDelivery={() =>
                          updateStatus(
                            order,
                            "saiu_para_entrega",
                            true
                          )
                        }
                        onComplete={() =>
                          updateStatus(order, "concluido", true)
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {visibleOrders.some(
          (order) => order.status === "recusado"
        ) && (
          <div className="mt-5 rounded-[28px] border border-red-500/15 bg-red-500/[0.04] p-4">
            <h2 className="mb-3 font-black text-red-300">
              Pedidos recusados
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {visibleOrders
                .filter((order) => order.status === "recusado")
                .map((order) => (
                  <button
                    key={order.databaseId}
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-2xl border border-red-500/15 bg-black/20 p-4 text-left"
                  >
                    <p className="font-black">{order.id}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {order.customer.name}
                    </p>
                    <p className="mt-2 text-lg font-black text-red-300">
                      {money(order.total)}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}
      </section>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          busy={busyOrderId === selectedOrder.databaseId}
          money={money}
          timeAgo={timeAgo}
          statusLabel={statusLabel}
          statusClass={statusClass}
          onClose={() => setSelectedOrder(null)}
          onCopyId={() => copyOrderId(selectedOrder.id)}
          onConversation={() =>
            openWhatsApp(selectedOrder.customer.phone)
          }
          onAccept={() =>
            updateStatus(selectedOrder, "preparando", true)
          }
          onDelivery={() =>
            updateStatus(
              selectedOrder,
              "saiu_para_entrega",
              true
            )
          }
          onComplete={() =>
            updateStatus(selectedOrder, "concluido", true)
          }
          onReject={() =>
            updateStatus(selectedOrder, "recusado", true)
          }
          onNotify={() =>
            openWhatsApp(
              selectedOrder.customer.phone,
              buildCustomerMessage(
                selectedOrder,
                selectedOrder.status
              )
            )
          }
        />
      )}
    </main>
  );
}

function OrderCard({
  order,
  busy,
  dragged,
  timeAgo,
  money,
  delayClass,
  onDragStart,
  onDragEnd,
  onOpen,
  onWhatsApp,
  onAccept,
  onDelivery,
  onComplete,
}: {
  order: Order;
  busy: boolean;
  dragged: boolean;
  timeAgo: (date: string) => string;
  money: (value: number) => string;
  delayClass: string;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onOpen: () => void;
  onWhatsApp: () => void;
  onAccept: () => void;
  onDelivery: () => void;
  onComplete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-[24px] border bg-[#0b0b0b] p-4 ${
        delayClass || "border-white/10"
      } ${dragged ? "opacity-50" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[9px] font-black text-orange-300">
              {order.id}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600">
              <Clock3 size={11} />
              {timeAgo(order.createdAt)}
            </span>
          </div>
          <h3 className="text-lg font-black">
            {order.customer.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-600">
            {order.address.neighborhood}
          </p>
        </div>
        <GripVertical size={18} className="text-zinc-700" />
      </div>

      <div className="space-y-2 rounded-2xl bg-white/[0.035] p-3">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.cartId}>
            <p className="truncate text-xs font-black">
              {item.quantity}x {item.emoji || "🍽️"} {item.name}
            </p>
            {item.extras?.length > 0 && (
              <p className="mt-1 line-clamp-1 text-[9px] text-zinc-600">
                + {item.extras.map((extra) => extra.name).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-xl font-black text-orange-400">
          {money(order.total)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onWhatsApp}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-300"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={onOpen}
            className="flex h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-xs font-black"
          >
            Ver
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {order.status === "novo" && (
        <ActionButton
          onClick={onAccept}
          busy={busy}
          icon={<CheckCircle2 size={15} />}
          label="Aceitar e avisar cliente"
          className="bg-green-500"
        />
      )}

      {order.status === "preparando" && (
        <ActionButton
          onClick={onDelivery}
          busy={busy}
          icon={<Truck size={15} />}
          label="Saiu para entrega e avisar"
          className="bg-blue-500"
        />
      )}

      {order.status === "saiu_para_entrega" && (
        <ActionButton
          onClick={onComplete}
          busy={busy}
          icon={<PackageCheck size={15} />}
          label="Concluir e agradecer"
          className="bg-green-500"
        />
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  busy,
  icon,
  label,
  className,
}: {
  onClick: () => void;
  busy: boolean;
  icon: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black disabled:opacity-50 ${className}`}
    >
      {busy ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function OrderDrawer({
  order,
  busy,
  money,
  timeAgo,
  statusLabel,
  statusClass,
  onClose,
  onCopyId,
  onConversation,
  onAccept,
  onDelivery,
  onComplete,
  onReject,
  onNotify,
}: {
  order: Order;
  busy: boolean;
  money: (value: number) => string;
  timeAgo: (date: string) => string;
  statusLabel: (status: OrderStatus) => string;
  statusClass: (status: OrderStatus) => string;
  onClose: () => void;
  onCopyId: () => void;
  onConversation: () => void;
  onAccept: () => void;
  onDelivery: () => void;
  onComplete: () => void;
  onReject: () => void;
  onNotify: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/70">
      <button className="absolute inset-0" onClick={onClose} />

      <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#080808] p-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-black ${statusClass(
                  order.status
                )}`}
              >
                {statusLabel(order.status)}
              </span>
              <span className="text-xs text-zinc-600">
                {timeAgo(order.createdAt)}
              </span>
            </div>

            <button
              onClick={onCopyId}
              className="inline-flex items-center gap-2 text-3xl font-black"
            >
              {order.id}
              <Copy size={16} className="text-zinc-600" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <User size={20} />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-black">
                {order.customer.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {order.customer.phone}
              </p>
            </div>
            <button
              onClick={onConversation}
              className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-xs font-black text-green-300"
            >
              <MessageCircle size={15} />
              Conversar
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <h3 className="mb-3 font-black">Entrega</h3>
          <p className="text-sm text-zinc-400">
            {order.address.street}
          </p>
          <p className="text-sm text-zinc-400">
            {order.address.complement || "Sem complemento"}
          </p>
          <p className="text-sm text-zinc-400">
            {order.address.neighborhood}
          </p>
        </section>

        <section className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <h3 className="mb-4 font-black">Itens</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.cartId}
                className="rounded-[20px] bg-black/25 p-3"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-black">
                      {item.quantity}x {item.name}
                    </p>
                    {item.extras?.map((extra) => (
                      <p
                        key={String(extra.id)}
                        className="mt-1 text-xs text-zinc-500"
                      >
                        + {extra.name} ({money(extra.price)})
                      </p>
                    ))}
                    {item.observation && (
                      <p className="mt-2 text-xs text-orange-300">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>
                  <p className="font-black text-orange-400">
                    {money(item.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <DrawerLine label="Pagamento" value={order.payment} />
          <DrawerLine
            label="Subtotal"
            value={money(order.subtotal)}
          />
          <DrawerLine
            label="Entrega"
            value={money(order.deliveryFee)}
          />
          <DrawerLine
            label="Observação"
            value={order.generalObservation || "Sem observação"}
          />
          <div className="mt-3 border-t border-white/10 pt-3">
            <DrawerLine
              label="Total"
              value={money(order.total)}
              strong
            />
          </div>
        </section>

        <div className="mt-5 space-y-3">
          {order.status === "novo" && (
            <>
              <button
                onClick={onAccept}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 font-black disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                Aceitar e avisar cliente
              </button>
              <button
                onClick={onReject}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-5 py-4 font-black text-red-300 disabled:opacity-50"
              >
                <XCircle size={18} />
                Recusar e avisar
              </button>
            </>
          )}

          {order.status === "preparando" && (
            <button
              onClick={onDelivery}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-4 font-black"
            >
              <Truck size={18} />
              Saiu para entrega e avisar
            </button>
          )}

          {order.status === "saiu_para_entrega" && (
            <button
              onClick={onComplete}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 font-black"
            >
              <PackageCheck size={18} />
              Concluir e agradecer
            </button>
          )}

          {order.status !== "novo" &&
            order.status !== "recusado" && (
              <button
                onClick={onNotify}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-4 font-black"
              >
                <MessageCircle size={18} />
                Enviar aviso novamente
              </button>
            )}
        </div>
      </aside>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-xl">
        {icon}
      </div>
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-1 truncate text-xl font-black">{value}</p>
    </div>
  );
}

function DrawerLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`mb-3 flex justify-between gap-4 ${
        strong ? "text-xl font-black" : "text-sm text-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span
        className={
          strong ? "text-orange-400" : "max-w-[60%] text-right text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}