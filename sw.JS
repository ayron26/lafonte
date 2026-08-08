// La Fonte — Service Worker minimal
// Sert uniquement à afficher les notifications locales (rappels, alertes cousins).
// Pas de push serveur pour l'instant : les alertes ne fonctionnent que quand
// l'app est ouverte ou a été ouverte récemment.

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      if (clientsArr.length > 0) {
        return clientsArr[0].focus();
      }
      return self.clients.openWindow("./");
    })
  );
});
