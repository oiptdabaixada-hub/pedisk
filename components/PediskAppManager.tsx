"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Download,
  Share2,
  Smartphone,
  X,
} from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function PediskAppManager() {
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone
      );

    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(
        (error) =>
          console.error("Erro ao registrar service worker:", error)
      );
    }

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setOpen(true);
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(
        "Notificações da Pedisk ativadas 🔔",
        {
          body: "Quando um novo pedido chegar, a Pedisk vai avisar você.",
          icon: "/pedisk-icon.png",
          badge: "/pedisk-icon.png",
          tag: "pedisk-notifications-enabled",
          data: { url: "/painel/pedidos" },
        }
      );
    }
  }

  const needsSetup =
    !installed || notificationPermission !== "granted";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-[88px] right-4 z-[80] flex items-center gap-3 rounded-full border px-4 py-3 shadow-2xl backdrop-blur-xl transition lg:bottom-6 ${
          needsSetup
            ? "animate-pulse border-orange-400/40 bg-orange-500 text-white"
            : "border-green-400/30 bg-[#111]/95 text-green-300"
        }`}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/20">
          {needsSetup ? <BellRing size={20} /> : <CheckCircle2 size={20} />}
          <span
            className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#111] ${
              needsSetup ? "bg-yellow-300" : "bg-green-400"
            }`}
          />
        </span>

        <span className="text-left">
          <span className="block text-xs font-black">
            {needsSetup ? "Ativar painel no celular" : "Painel ativo"}
          </span>
          <span className="block text-[10px] opacity-75">
            {needsSetup
              ? "Instalação e notificações"
              : "Pronto para receber pedidos"}
          </span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center">
          <button
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
          />

          <section className="relative z-10 w-full max-w-md rounded-[30px] border border-white/10 bg-[#0b0b0b] p-5 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                  Pedisk no celular
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Deixe como um aplicativo
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Instale a Pedisk e ative os avisos para não perder
                  pedidos.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                    <Smartphone size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="font-black">Aplicativo Pedisk</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Abre em tela cheia e fica na Tela de Início.
                    </p>
                  </div>
                </div>

                {!installed && (
                  <button
                    onClick={installApp}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black"
                  >
                    {isIOS && !installPrompt ? (
                      <Share2 size={17} />
                    ) : (
                      <Download size={17} />
                    )}
                    {isIOS && !installPrompt
                      ? "Ver como instalar no iPhone"
                      : "Instalar Pedisk"}
                  </button>
                )}

                {installed && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-green-500/10 px-4 py-3 text-sm font-black text-green-300">
                    <CheckCircle2 size={17} />
                    Pedisk já está instalada
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                    <Bell size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="font-black">Avisos de novos pedidos</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Autorize o celular a mostrar notificações.
                    </p>
                  </div>
                </div>

                {notificationPermission !== "granted" ? (
                  <button
                    onClick={enableNotifications}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm font-black text-orange-300"
                  >
                    <BellRing size={17} />
                    Ativar notificações
                  </button>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-green-500/10 px-4 py-3 text-sm font-black text-green-300">
                    <CheckCircle2 size={17} />
                    Notificações autorizadas
                  </div>
                )}
              </div>
            </div>

            {isIOS && !installed && !installPrompt && (
              <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
                No iPhone: abra no Safari, toque em
                <strong> Compartilhar</strong> e depois em
                <strong> Adicionar à Tela de Início</strong>.
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}