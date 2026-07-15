"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  Wallet,
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

type DeliveryZone = {
  id: string;
  store_id: string;
  neighborhood: string;
  delivery_fee: number;
  minimum_order: number;
  delivery_time: string;
  active: boolean;
};

type StoreData = {
  id: string;
  name: string;
  slug: string | null;
  whatsapp: string | null;
  default_delivery_fee: number | null;
};

type OrderPayload = {
  order_code: string;
  store_id: string;
  status: "novo";
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
    zoneId: string;
    fee: number;
    time: string;
    minimumOrder: number;
  };
  payment: string;
  general_observation: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [store, setStore] = useState<StoreData | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [complement, setComplement] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [generalObservation, setGeneralObservation] = useState("");
  const [formError, setFormError] = useState("");

  const urlStoreSlug = (searchParams.get("loja") || "")
    .trim()
    .toLowerCase();

  const activeStoreSlug = store?.slug || urlStoreSlug;
  const storeHref = activeStoreSlug ? `/${activeStoreSlug}` : "/loja";

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("pedisk-cart", JSON.stringify(cart));

    if (cart.length > 0) {
      loadStoreFromCart(cart);
    } else {
      setStore(null);
      setDeliveryZones([]);
      setLoadingStore(false);
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("pedisk-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  function loadCart() {
    const rawCart = localStorage.getItem("pedisk-cart");

    if (!rawCart) {
      setCart([]);
      setLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawCart);
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }

    setLoaded(true);
  }

  async function loadStoreFromCart(currentCart: CartItem[]) {
    setLoadingStore(true);
    setFormError("");

    try {
      const productIds = [
        ...new Set(
          currentCart
            .map((item) => String(item.productId || ""))
            .filter(Boolean)
        ),
      ];

      if (productIds.length === 0) {
        throw new Error("O carrinho não possui produtos válidos.");
      }

      const { data: productRows, error: productsError } = await supabase
        .from("products")
        .select("id, store_id")
        .in("id", productIds);

      if (productsError) throw productsError;
      if (!productRows || productRows.length === 0) {
        throw new Error("Não foi possível localizar os produtos.");
      }

      const storeIds = [
        ...new Set(productRows.map((product) => product.store_id)),
      ];

      if (storeIds.length !== 1) {
        throw new Error(
          "O carrinho possui produtos de lojas diferentes. Limpe o carrinho e tente novamente."
        );
      }

      const storeId = storeIds[0];

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, name, slug, whatsapp, default_delivery_fee")
        .eq("id", storeId)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!storeData) throw new Error("A loja não foi encontrada.");

      setStore(storeData as StoreData);

      const { data: zonesData, error: zonesError } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("store_id", storeId)
        .eq("active", true)
        .order("neighborhood", { ascending: true });

      if (zonesError) throw zonesError;

      const zones = (zonesData || []) as DeliveryZone[];
      setDeliveryZones(zones);

      if (zones.length === 1) {
        setSelectedZoneId(zones[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar loja do checkout:", error);
      setStore(null);
      setDeliveryZones([]);
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a loja."
      );
    } finally {
      setLoadingStore(false);
    }
  }

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const extrasTotal = (item.extras || []).reduce(
        (extraSum, extra) => extraSum + Number(extra.price || 0),
        0
      );

      return (
        sum +
        (Number(item.price || 0) + extrasTotal) *
          Number(item.quantity || 1)
      );
    }, 0);
  }, [cart]);

  const selectedZone = useMemo(
    () =>
      deliveryZones.find((zone) => zone.id === selectedZoneId) || null,
    [deliveryZones, selectedZoneId]
  );

  const deliveryFee =
    cart.length > 0
      ? Number(
          selectedZone?.delivery_fee ??
            store?.default_delivery_fee ??
            0
        )
      : 0;

  const finalTotal = subtotal + deliveryFee;
  const minimumOrder = Number(selectedZone?.minimum_order || 0);
  const minimumOrderReached = subtotal >= minimumOrder;
  const missingAmount = Math.max(0, minimumOrder - subtotal);

  const canFinishOrder =
    cart.length > 0 &&
    Boolean(store) &&
    Boolean(customerName.trim()) &&
    Boolean(customerPhone.trim()) &&
    Boolean(address.trim()) &&
    Boolean(selectedZone) &&
    minimumOrderReached &&
    !submitting;

  function money(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function generateOrderCode() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PED-${day}${random}`;
  }

  function normalizeWhatsApp(value: string | null | undefined) {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("55")) return digits;
    return `55${digits}`;
  }

  function updateQuantity(
    cartId: string,
    type: "increase" | "decrease"
  ) {
    setCart((current) =>
      current.map((item) => {
        if (item.cartId !== cartId) return item;

        const nextQuantity =
          type === "increase"
            ? Number(item.quantity || 1) + 1
            : Math.max(1, Number(item.quantity || 1) - 1);

        const extrasTotal = (item.extras || []).reduce(
          (sum, extra) => sum + Number(extra.price || 0),
          0
        );

        return {
          ...item,
          quantity: nextQuantity,
          total:
            (Number(item.price || 0) + extrasTotal) * nextQuantity,
        };
      })
    );
  }

  function removeItem(cartId: string) {
    setCart((current) =>
      current.filter((item) => item.cartId !== cartId)
    );
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("pedisk-cart");
  }

  function validateCheckout() {
    if (!store) {
      setFormError("Não foi possível identificar a loja deste pedido.");
      return false;
    }

    if (!customerName.trim()) {
      setFormError("Digite o nome do cliente.");
      return false;
    }

    if (!customerPhone.trim()) {
      setFormError("Digite o telefone do cliente.");
      return false;
    }

    if (!address.trim()) {
      setFormError("Digite a rua e o número.");
      return false;
    }

    if (!selectedZone) {
      setFormError("Escolha um bairro atendido pela loja.");
      return false;
    }

    if (!minimumOrderReached) {
      setFormError(
        `Faltam ${money(
          missingAmount
        )} para atingir o pedido mínimo desse bairro.`
      );
      return false;
    }

    setFormError("");
    return true;
  }

  function buildOrderPayload(orderCode: string): OrderPayload | null {
    if (!store || !selectedZone) return null;

    return {
      order_code: orderCode,
      store_id: store.id,
      status: "novo",
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },
      address: {
        street: address.trim(),
        complement: complement.trim(),
        neighborhood: selectedZone.neighborhood,
      },
      delivery: {
        zoneId: selectedZone.id,
        fee: deliveryFee,
        time: selectedZone.delivery_time,
        minimumOrder,
      },
      payment: paymentMethod,
      general_observation: generalObservation.trim(),
      items: cart,
      subtotal,
      delivery_fee: deliveryFee,
      total: finalTotal,
    };
  }

  async function createOrder() {
    if (!validateCheckout()) return;

    setSubmitting(true);

    try {
      let orderCode = generateOrderCode();
      let payload = buildOrderPayload(orderCode);

      if (!payload) {
        throw new Error("Não foi possível preparar o pedido.");
      }

      let { data, error } = await supabase
        .from("orders")
        .insert(payload)
        .select("*")
        .single();

      if (
        error &&
        (error.code === "23505" ||
          error.message.toLowerCase().includes("duplicate"))
      ) {
        orderCode = generateOrderCode();
        const retryPayload = buildOrderPayload(orderCode);

        if (!retryPayload) {
          throw new Error("Não foi possível preparar o pedido novamente.");
        }

        payload = retryPayload;

        const retry = await supabase
          .from("orders")
          .insert(retryPayload)
          .select("*")
          .single();

        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      if (!data) throw new Error("O pedido não foi criado.");

      const lastOrder = {
        id: data.order_code,
        databaseId: data.id,
        createdAt: data.created_at,
        status: data.status,
        storeId: data.store_id,
        storeName: store?.name || "Loja",
        storeSlug: store?.slug || urlStoreSlug,
        storeWhatsapp: store?.whatsapp || "",
        customer: data.customer,
        address: data.address,
        delivery: data.delivery,
        payment: data.payment,
        generalObservation: data.general_observation || "",
        items: data.items,
        subtotal: Number(data.subtotal),
        deliveryFee: Number(data.delivery_fee),
        total: Number(data.total),
      };

      localStorage.setItem(
        "pedisk-last-order",
        JSON.stringify(lastOrder)
      );
      localStorage.removeItem("pedisk-cart");
      setCart([]);

      const concludedParams = new URLSearchParams();

      if (store?.slug || urlStoreSlug) {
        concludedParams.set("loja", store?.slug || urlStoreSlug);
      }

      concludedParams.set("pedido", data.order_code);

      router.push(
        `/pedido-concluido?${concludedParams.toString()}`
      );
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      setFormError(
        error instanceof Error
          ? `Não foi possível finalizar: ${error.message}`
          : "Não foi possível finalizar o pedido."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function buildWhatsAppMessage() {
    const itemsText = cart
      .map((item) => {
        const extrasText =
          item.extras?.length > 0
            ? item.extras
                .map(
                  (extra) =>
                    `- ${extra.emoji || "➕"} ${extra.name} (+ ${money(
                      Number(extra.price || 0)
                    )})`
                )
                .join("\n")
            : "Nenhum adicional";

        const extrasTotal = (item.extras || []).reduce(
          (sum, extra) => sum + Number(extra.price || 0),
          0
        );

        const itemTotal =
          (Number(item.price || 0) + extrasTotal) *
          Number(item.quantity || 1);

        return `${item.quantity}x ${item.name}
Adicionais:
${extrasText}
Obs: ${item.observation || "Sem observação"}
Total do item: ${money(itemTotal)}`;
      })
      .join("\n\n");

    return `*NOVO PEDIDO - PEDISK*

*Loja:*
${store?.name || "Loja"}

*Cliente:*
${customerName}
${customerPhone}

*Endereço:*
${address}
${complement || "Sem complemento"}
Bairro: ${selectedZone?.neighborhood || "Não selecionado"}

*Entrega:*
Taxa: ${money(deliveryFee)}
Tempo estimado: ${selectedZone?.delivery_time || "Não informado"}

*Itens:*
${itemsText}

*Resumo:*
Subtotal: ${money(subtotal)}
Entrega: ${money(deliveryFee)}
Total: ${money(finalTotal)}

*Pagamento:*
${paymentMethod}

*Observação geral:*
${generalObservation || "Sem observação"}`;
  }

  function sendToWhatsApp() {
    if (!validateCheckout()) return;

    const whatsappNumber = normalizeWhatsApp(store?.whatsapp);

    if (!whatsappNumber) {
      setFormError(
        "A loja ainda não cadastrou um número de WhatsApp."
      );
      return;
    }

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      buildWhatsAppMessage()
    )}`;

    window.open(url, "pedisk-whatsapp");
  }

  if (!loaded || loadingStore) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-orange-400" size={42} />
          <p className="text-sm font-bold text-zinc-500">
            Preparando checkout...
          </p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.04] text-5xl">
            🛒
          </div>
          <h1 className="text-3xl font-black">Seu carrinho está vazio</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Escolha seus produtos e volte para finalizar.
          </p>
          <Link
            href={storeHref}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black"
          >
            Voltar para loja
            <ChevronRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pb-36 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[150px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-4">
        <header className="sticky top-0 z-40 -mx-4 border-b border-white/10 bg-[#050505]/85 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="text-center">
              <p className="text-sm font-black">Checkout</p>
              <p className="text-xs text-zinc-500">
                {store?.name || "Finalizar pedido"}
              </p>
            </div>
            <Link
              href={storeHref}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500"
            >
              <ShoppingBag size={18} />
            </Link>
          </div>
        </header>

        <div className="pt-5">
          <div className="mb-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl">
                🧾
              </div>
              <div>
                <div className="mb-1 inline-flex rounded-full bg-green-500/15 px-3 py-1 text-[11px] font-black text-green-400">
                  ● Pedido em andamento
                </div>
                <h1 className="text-3xl font-black">Finalizar pedido</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  O pedido será enviado direto para o painel da loja.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">Seu carrinho</h2>
                    <p className="text-sm text-zinc-500">
                      {cart.length} produto(s)
                    </p>
                  </div>
                  <button
                    onClick={clearCart}
                    className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300"
                  >
                    Limpar
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => {
                    const extrasTotal = (item.extras || []).reduce(
                      (sum, extra) =>
                        sum + Number(extra.price || 0),
                      0
                    );
                    const itemTotal =
                      (Number(item.price || 0) + extrasTotal) *
                      Number(item.quantity || 1);

                    return (
                      <div
                        key={item.cartId}
                        className="rounded-[24px] border border-white/10 bg-black/30 p-3"
                      >
                        <div className="flex gap-3">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-white/[0.04]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-4xl">
                                {item.emoji || "🍽️"}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-black">
                                  {item.name}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                                  {item.desc}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  removeItem(item.cartId)
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {item.extras?.length > 0 && (
                              <div className="mt-3 rounded-2xl bg-white/[0.04] p-3">
                                {item.extras.map((extra) => (
                                  <div
                                    key={String(extra.id)}
                                    className="flex justify-between text-xs"
                                  >
                                    <span>
                                      {extra.emoji} {extra.name}
                                    </span>
                                    <span className="font-black text-orange-300">
                                      + {money(extra.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] p-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartId,
                                      "decrease"
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="min-w-[32px] text-center font-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartId,
                                      "increase"
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              <p className="text-lg font-black text-orange-300">
                                {money(itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <CheckoutForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                address={address}
                setAddress={setAddress}
                complement={complement}
                setComplement={setComplement}
                deliveryZones={deliveryZones}
                selectedZoneId={selectedZoneId}
                setSelectedZoneId={(value) => {
                  setSelectedZoneId(value);
                  setFormError("");
                }}
                selectedZone={selectedZone}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                generalObservation={generalObservation}
                setGeneralObservation={setGeneralObservation}
                money={money}
              />

              {deliveryZones.length === 0 && (
                <ErrorBox text="A loja ainda não cadastrou bairros de entrega." />
              )}

              {formError && <ErrorBox text={formError} />}
            </div>

            <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.04] p-5 lg:sticky lg:top-20">
              <p className="text-sm text-zinc-500">Resumo</p>
              <h2 className="text-3xl font-black">Seu pedido</h2>

              {selectedZone && (
                <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
                  <p className="font-black">
                    {selectedZone.neighborhood}
                  </p>
                  <p className="mt-1 text-xs text-orange-200">
                    {selectedZone.delivery_time} •{" "}
                    {money(selectedZone.delivery_fee)}
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-3 rounded-2xl bg-black/30 p-4">
                <Line label="Subtotal" value={money(subtotal)} />
                <Line
                  label="Entrega"
                  value={
                    selectedZone
                      ? money(deliveryFee)
                      : "Escolha o bairro"
                  }
                />
                <div className="border-t border-white/10 pt-4">
                  <Line
                    label="Total"
                    value={money(finalTotal)}
                    strong
                  />
                </div>
              </div>

              {selectedZone && minimumOrder > 0 && (
                <div
                  className={`mt-4 rounded-2xl border p-4 ${
                    minimumOrderReached
                      ? "border-green-500/20 bg-green-500/10"
                      : "border-yellow-500/20 bg-yellow-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {minimumOrderReached ? (
                      <CheckCircle2
                        className="text-green-400"
                        size={18}
                      />
                    ) : (
                      <AlertTriangle
                        className="text-yellow-300"
                        size={18}
                      />
                    )}
                    <div>
                      <p className="text-sm font-black">
                        {minimumOrderReached
                          ? "Pedido mínimo atingido"
                          : `Faltam ${money(missingAmount)}`}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Mínimo: {money(minimumOrder)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={createOrder}
                disabled={!canFinishOrder}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 size={19} className="animate-spin" />
                ) : (
                  <ShoppingBag size={19} />
                )}
                {submitting
                  ? "Enviando pedido..."
                  : "Finalizar pedido"}
              </button>

              <button
                onClick={sendToWhatsApp}
                disabled={!canFinishOrder}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-black disabled:opacity-40"
              >
                <MessageCircle size={19} />
                Enviar no WhatsApp
              </button>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}


export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-orange-400" size={42} />
            <p className="text-sm font-bold text-zinc-500">
              Preparando checkout...
            </p>
          </div>
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutForm(props: {
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  complement: string;
  setComplement: (value: string) => void;
  deliveryZones: DeliveryZone[];
  selectedZoneId: string;
  setSelectedZoneId: (value: string) => void;
  selectedZone: DeliveryZone | null;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  generalObservation: string;
  setGeneralObservation: (value: string) => void;
  money: (value: number) => string;
}) {
  return (
    <>
      <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-5 text-xl font-black">
          Dados do cliente
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Nome"
            icon={<User size={16} />}
            value={props.customerName}
            onChange={props.setCustomerName}
            placeholder="Ex: Patrick Yuri"
          />
          <Field
            label="Telefone"
            icon={<Phone size={16} />}
            value={props.customerPhone}
            onChange={props.setCustomerPhone}
            placeholder="Ex: (21) 99999-9999"
          />
        </div>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-5 text-xl font-black">
          Endereço e entrega
        </h2>

        <div className="grid gap-3">
          <Field
            label="Rua e número"
            icon={<MapPin size={16} />}
            value={props.address}
            onChange={props.setAddress}
            placeholder="Ex: Rua A, 123"
          />
          <Field
            label="Complemento"
            icon={<PackageCheck size={16} />}
            value={props.complement}
            onChange={props.setComplement}
            placeholder="Ex: Casa 2"
          />

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">
              Bairro atendido
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
              />
              <select
                value={props.selectedZoneId}
                onChange={(event) =>
                  props.setSelectedZoneId(event.target.value)
                }
                className="w-full appearance-none rounded-2xl border border-white/10 bg-black/35 py-3 pl-11 pr-12 text-sm outline-none"
              >
                <option value="">Escolha seu bairro</option>
                {props.deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.neighborhood} —{" "}
                    {props.money(zone.delivery_fee)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>

            {props.selectedZone && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <SmallInfo
                  label="Taxa"
                  value={props.money(
                    props.selectedZone.delivery_fee
                  )}
                />
                <SmallInfo
                  label="Tempo"
                  value={props.selectedZone.delivery_time}
                />
                <SmallInfo
                  label="Pedido mínimo"
                  value={props.money(
                    props.selectedZone.minimum_order
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-5 text-xl font-black">Pagamento</h2>

        <div className="grid gap-3 md:grid-cols-3">
          {["PIX", "Dinheiro", "Cartão"].map((method) => (
            <button
              type="button"
              key={method}
              onClick={() => props.setPaymentMethod(method)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-black ${
                props.paymentMethod === method
                  ? "border-orange-400/60 bg-orange-500/15 text-orange-300"
                  : "border-white/10 bg-black/30 text-zinc-400"
              }`}
            >
              {method === "PIX" ? (
                <Wallet size={17} />
              ) : method === "Cartão" ? (
                <CreditCard size={17} />
              ) : (
                <PackageCheck size={17} />
              )}
              {method}
            </button>
          ))}
        </div>

        <textarea
          value={props.generalObservation}
          onChange={(event) =>
            props.setGeneralObservation(event.target.value)
          }
          placeholder="Observação geral..."
          className="mt-5 min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm outline-none"
        />
      </section>
    </>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
        <div className="text-orange-400">{icon}</div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function SmallInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-orange-400/15 bg-orange-500/10 p-3">
      <p className="text-[10px] uppercase text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-orange-300">
        {value}
      </p>
    </div>
  );
}

function Line({
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
      className={`flex justify-between gap-4 ${
        strong ? "text-xl font-black" : "text-sm text-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span className={strong ? "text-orange-300" : ""}>
        {value}
      </span>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-300" size={20} />
        <p className="text-sm font-bold leading-6 text-red-200">
          {text}
        </p>
      </div>
    </div>
  );
}