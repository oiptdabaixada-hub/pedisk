"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
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
import { useRouter } from "next/navigation";

type Extra = {
  id: number;
  name: string;
  price: number;
  emoji: string;
};

type CartItem = {
  cartId: string;
  productId: number;
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

const WHATSAPP_NUMBER = "5521999999999";
const DELIVERY_FEE = 5;

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [generalObservation, setGeneralObservation] = useState("");

  useEffect(() => {
    const rawCart = localStorage.getItem("pedisk-cart");

    if (!rawCart) {
      setCart([]);
      setLoaded(true);
      return;
    }

    try {
      const parsedCart = JSON.parse(rawCart);

      if (Array.isArray(parsedCart)) {
        setCart(parsedCart);
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("pedisk-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const extrasTotal = item.extras.reduce(
        (extraSum, extra) => extraSum + extra.price,
        0
      );

      return sum + (item.price + extrasTotal) * item.quantity;
    }, 0);
  }, [cart]);

  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
  const finalTotal = subtotal + deliveryFee;

  function money(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function updateQuantity(cartId: string, type: "increase" | "decrease") {
    setCart((current) =>
      current
        .map((item) => {
          if (item.cartId !== cartId) return item;

          const nextQuantity =
            type === "increase"
              ? item.quantity + 1
              : Math.max(1, item.quantity - 1);

          const extrasTotal = item.extras.reduce(
            (sum, extra) => sum + extra.price,
            0
          );

          return {
            ...item,
            quantity: nextQuantity,
            total: (item.price + extrasTotal) * nextQuantity,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(cartId: string) {
    setCart((current) => current.filter((item) => item.cartId !== cartId));
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("pedisk-cart");
  }

  function buildWhatsAppMessage() {
    const itemsText = cart
      .map((item) => {
        const extrasText =
          item.extras.length > 0
            ? item.extras.map((extra) => `- ${extra.name}`).join("\n")
            : "Nenhum adicional";

        const extrasTotal = item.extras.reduce(
          (sum, extra) => sum + extra.price,
          0
        );

        const itemTotal = (item.price + extrasTotal) * item.quantity;

        return `${item.quantity}x ${item.name}
Adicionais:
${extrasText}
Obs: ${item.observation ? item.observation : "Sem observação"}
Total do item: ${money(itemTotal)}`;
      })
      .join("\n\n");

    return `*NOVO PEDIDO - PEDISK*

*Cliente:*
${customerName || "Não informado"}
${customerPhone || "Não informado"}

*Endereço:*
${address || "Não informado"}
${complement || "Sem complemento"}
${district || "Bairro não informado"}

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
    const message = buildWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
      "_blank"
    );
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-[140px]" />
          <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[150px]" />
        </div>

        <section className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.04] text-5xl shadow-[0_0_45px_rgba(249,115,22,0.18)]">
            🛒
          </div>

          <h1 className="text-3xl font-black tracking-[-0.05em]">
            Seu carrinho está vazio
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Escolha seus produtos na loja e depois volte aqui para finalizar seu
            pedido pelo WhatsApp.
          </p>

          <Link
            href="/loja"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black shadow-[0_18px_50px_rgba(249,115,22,0.35)]"
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
              <p className="text-xs text-zinc-500">Finalizar pedido</p>
            </div>

            <Link
              href="/loja"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500"
            >
              <ShoppingBag size={18} />
            </Link>
          </div>
        </header>

        <div className="pt-5">
          <div className="mb-5 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl shadow-[0_0_35px_rgba(249,115,22,0.35)]">
                🧾
              </div>

              <div>
                <div className="mb-1 inline-flex rounded-full bg-green-500/15 px-3 py-1 text-[11px] font-black text-green-400">
                  ● Pedido em andamento
                </div>

                <h1 className="text-3xl font-black tracking-[-0.05em]">
                  Finalizar pedido
                </h1>

                <p className="mt-1 text-sm text-zinc-400">
                  Confira os itens e envie tudo pelo WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">Seu carrinho</h2>
                    <p className="text-sm text-zinc-500">
                      {cart.length} produto(s) no pedido
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
                    const extrasTotal = item.extras.reduce(
                      (sum, extra) => sum + extra.price,
                      0
                    );

                    const itemTotal = (item.price + extrasTotal) * item.quantity;

                    return (
                      <div
                        key={item.cartId}
                        className="rounded-[24px] border border-white/10 bg-black/30 p-3"
                      >
                        <div className="flex gap-3">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-white/[0.04]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-lg backdrop-blur">
                              {item.emoji}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-base font-black">
                                  {item.name}
                                </h3>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                                  {item.desc}
                                </p>
                              </div>

                              <button
                                onClick={() => removeItem(item.cartId)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {item.extras.length > 0 && (
                              <div className="mt-3 rounded-2xl bg-white/[0.04] p-3">
                                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-zinc-500">
                                  Adicionais
                                </p>

                                <div className="space-y-1">
                                  {item.extras.map((extra) => (
                                    <div
                                      key={extra.id}
                                      className="flex items-center justify-between text-xs"
                                    >
                                      <span className="text-zinc-300">
                                        {extra.emoji} {extra.name}
                                      </span>

                                      <span className="font-black text-yellow-300">
                                        + {money(extra.price)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.observation && (
                              <div className="mt-3 rounded-2xl bg-orange-500/10 p-3">
                                <p className="text-[11px] font-black uppercase tracking-wide text-orange-300">
                                  Observação
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-300">
                                  {item.observation}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] p-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.cartId, "decrease")
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]"
                                >
                                  <Minus size={16} />
                                </button>

                                <span className="min-w-[32px] text-center text-sm font-black">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    updateQuantity(item.cartId, "increase")
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-[11px] text-zinc-500">
                                  Total do item
                                </p>
                                <p className="text-lg font-black text-yellow-300">
                                  {money(itemTotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
                    <User size={19} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Dados do cliente</h2>
                    <p className="text-sm text-zinc-500">
                      Quem vai receber o pedido?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    label="Nome do cliente"
                    icon={<User size={16} />}
                    value={customerName}
                    onChange={setCustomerName}
                    placeholder="Ex: Patrick Yuri"
                  />

                  <Field
                    label="Telefone"
                    icon={<Phone size={16} />}
                    value={customerPhone}
                    onChange={setCustomerPhone}
                    placeholder="Ex: (21) 99999-9999"
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Endereço</h2>
                    <p className="text-sm text-zinc-500">
                      Para onde o pedido vai?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Field
                    label="Rua e número"
                    icon={<MapPin size={16} />}
                    value={address}
                    onChange={setAddress}
                    placeholder="Ex: Rua A, 123"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Complemento"
                      icon={<PackageCheck size={16} />}
                      value={complement}
                      onChange={setComplement}
                      placeholder="Ex: Casa 2, apto 301"
                    />

                    <Field
                      label="Bairro"
                      icon={<MapPin size={16} />}
                      value={district}
                      onChange={setDistrict}
                      placeholder="Ex: Centro"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
                    <Wallet size={19} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Pagamento</h2>
                    <p className="text-sm text-zinc-500">
                      Escolha como deseja pagar.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {["PIX", "Dinheiro", "Cartão"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-black transition ${
                        paymentMethod === method
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

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">
                    Observação geral
                  </label>

                  <textarea
                    value={generalObservation}
                    onChange={(event) =>
                      setGeneralObservation(event.target.value)
                    }
                    placeholder="Ex: Troco para R$100, chamar no portão, entregar para Maria..."
                    className="min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:sticky lg:top-20">
              <div className="mb-5">
                <p className="text-sm text-zinc-500">Resumo</p>
                <h2 className="text-3xl font-black tracking-[-0.05em]">
                  Seu pedido
                </h2>
              </div>

              <div className="space-y-3 rounded-2xl bg-black/30 p-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Entrega</span>
                  <span>{money(deliveryFee)}</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4 text-xl font-black">
                  <span>Total</span>
                  <span className="text-yellow-300">{money(finalTotal)}</span>
                </div>
              </div>

              <button
                onClick={sendToWhatsApp}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black shadow-[0_18px_50px_rgba(249,115,22,0.35)]"
              >
                <MessageCircle size={19} />
                Enviar pedido no WhatsApp
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
                Você será redirecionado para o WhatsApp com o pedido formatado.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050505]/90 p-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={sendToWhatsApp}
          className="flex w-full items-center justify-between rounded-2xl bg-orange-500 px-4 py-3 font-black shadow-[0_18px_50px_rgba(249,115,22,0.35)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20">
              <MessageCircle size={18} />
            </div>

            <div className="text-left">
              <p className="text-sm">Enviar no WhatsApp</p>
              <p className="text-[11px] opacity-80">{money(finalTotal)}</p>
            </div>
          </div>

          <ChevronRight size={20} />
        </button>
      </div>
    </main>
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
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}