// La Fonte — Service Worker
// Affiche les notifications locales (rappels) ET les vraies notifications
// push envoyées via Firebase Cloud Messaging, même app fermée.

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAJeWqvX2aoG-2kxJs_Yr6sYjlsegCiXNg",
  authDomain: "lafonte-muscu.firebaseapp.com",
  projectId: "lafonte-muscu",
  storageBucket: "lafonte-muscu.firebasestorage.app",
  messagingSenderId: "37478179131",
  appId: "1:37478179131:web:2341ed54d34c22351ad71e"
});

// Initialise Firebase Messaging : affiche automatiquement les notifications
// reçues quand l'app est fermée ou en arrière-plan.
firebase.messaging();

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
