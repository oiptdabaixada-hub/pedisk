const CACHE_NAME = "pedisk-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "Novo pedido na Pedisk 🔔",
      body: event.data ? event.data.text() : "Abra a central de pedidos.",
    };
  }

  const title = payload.title || "Novo pedido na Pedisk 🔔";
  const options = {
    body:
      payload.body ||
      "Um novo pedido chegou. Toque para abrir a central.",
    icon: payload.icon || "/pedisk-icon.png",
    badge: payload.badge || "/pedisk-icon.png",
    tag: payload.tag || "pedisk-new-order",
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 500],
    data: {
      url: payload.url || "/painel/pedidos",
      ...(payload.data || {}),
    },
    actions: [
      {
        action: "open-order",
        title: "Ver pedido",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "/painel/pedidos";

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      })
  );
});