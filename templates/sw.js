{% load static %}
const CACHE_NAME = 'ipse-lms-v3';
const OFFLINE_URL = '/offline/';
const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '{% static "css/tailwind.css" %}?v=3',
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Only handle GET requests (prevent body mutation/Origin loss on POST requests)
  if (request.method !== 'GET') return;

  // Static assets (CSS, JS, images, fonts): cache-first
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
      )
    );
    return;
  }

  // Navigation requests: network-first, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
});


// 🔔 Handle notification click: focus or open the gathering detail page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Get the target URL from notification data
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open at the target URL, focus it
      for (const client of clientList) {
        const clientUrl = new URL(client.url, location.origin);
        if (clientUrl.pathname === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window at the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});


// 🔔 백그라운드 웹 푸시 수신 이벤트 리스너
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'IPSE 알림',
      body: event.data.text()
    };
  }

  const title = payload.title || 'IPSE 알림';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/static/img/IPSE-LOGO.png',
    badge: payload.badge || '/static/img/favicon-ipse.svg',
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

