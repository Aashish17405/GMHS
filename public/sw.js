// GMHS School Management System - PWA Service Worker
// Updated: 2025-09-21 - Simplified to bypass API requests completely
const CACHE_NAME = "gmhs-no-api-cache-v7";
const urlsToCache = [
  "/",
  "/dashboard/admin",
  "/dashboard/teacher",
  "/dashboard/parent",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];

// Enhanced API detection patterns for comprehensive no-cache
const API_PATTERNS = [
  /^\/api\//,
  /\/api$/,
  /database/i,
  /\.json$/,
  /\/auth\//,
  /\/admin\//,
  /\/teacher/,
  /\/parent/,
  /\/student/,
  /\/child/,
  /\/actions/,
  /_next\/static.*\.json/,
  /graphql/i,
  /rest/i,
  /ajax/i,
];

// Helper function to detect API requests with enhanced patterns
function isApiRequest(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const search = urlObj.search;

    // Check if URL matches any API pattern
    const isApi =
      API_PATTERNS.some((pattern) => pattern.test(pathname)) ||
      API_PATTERNS.some((pattern) => pattern.test(search)) ||
      pathname.includes("api") ||
      search.includes("api");

    return isApi;
  } catch (error) {
    // If URL parsing fails, assume it's not an API request
    return false;
  }
}

// Enhanced request modifier for PWA no-cache
function createNoCacheRequest(originalRequest) {
  const headers = new Headers(originalRequest.headers);

  // Add comprehensive no-cache headers
  headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate, max-age=0"
  );
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("If-Modified-Since", "0");
  headers.set("If-None-Match", "");
  headers.set("X-Requested-With", "XMLHttpRequest");
  headers.set("X-PWA-No-Cache", "true");
  headers.set("X-Cache-Buster", Date.now().toString());

  // Build request options safely
  const requestOptions = {
    method: originalRequest.method,
    headers: headers,
    mode: originalRequest.mode,
    credentials: originalRequest.credentials,
    cache: "no-store",
    redirect: originalRequest.redirect,
  };

  // Only add body-related properties for requests that can have bodies
  const methodsWithBody = ["POST", "PUT", "PATCH"];
  if (methodsWithBody.includes(originalRequest.method.toUpperCase())) {
    requestOptions.body = originalRequest.body;
    requestOptions.duplex = "half";
  }

  // Add other properties if they exist
  if (originalRequest.referrer) {
    requestOptions.referrer = originalRequest.referrer;
  }
  if (originalRequest.referrerPolicy) {
    requestOptions.referrerPolicy = originalRequest.referrerPolicy;
  }
  if (originalRequest.integrity) {
    requestOptions.integrity = originalRequest.integrity;
  }
  if (originalRequest.signal) {
    requestOptions.signal = originalRequest.signal;
  }

  return new Request(originalRequest.url, requestOptions);
}

// Enhanced response modifier for PWA no-cache
function createNoCacheResponse(originalResponse) {
  const headers = new Headers(originalResponse.headers);

  // Add comprehensive no-cache response headers
  headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate, max-age=0"
  );
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("Last-Modified", "0");
  headers.set("ETag", "");
  headers.set("X-PWA-No-Cache-Response", "true");
  headers.set("X-Response-Timestamp", Date.now().toString());

  return new Response(originalResponse.body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers: headers,
  });
}

// Install service worker
self.addEventListener("install", (event) => {
  // console.log("🔧 PWA Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // console.log("📦 Opened cache for static assets");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("❌ Cache addAll failed:", error);
      })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", (event) => {
  // console.log("✅ PWA Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // console.log("🗑️ Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event handler - Enhanced PWA no-cache implementation
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // ENHANCED: Complete API request bypass - no service worker interference
  if (isApiRequest(event.request.url)) {
    console.log(
      "🚫 API request detected - Bypassing service worker completely:",
      event.request.url
    );
    // Let the browser handle API requests directly without any service worker intervention
    return;
  }

  // For non-API requests, use cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // console.log("📦 Serving static asset from cache:", event.request.url);
        return response;
      }

      // console.log("🌐 Fetching static asset from network:", event.request.url);
      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();

          // Only cache GET requests - never cache POST/PUT/PATCH requests
          if (event.request.method === "GET") {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch((error) => {
          console.error("❌ Static asset fetch failed:", error);
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          throw error;
        });
    })
  );
});

// Enhanced background sync for PWA
self.addEventListener("sync", (event) => {
  // console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // console.log("🔄 Performing PWA background sync...");
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName.includes("api") || cacheName.includes("data")) {
        // console.log("🗑️ Clearing API cache during sync:", cacheName);
        await caches.delete(cacheName);
      }
    }
  } catch (error) {
    console.error("❌ Background sync failed:", error);
  }
}

// Enhanced push notifications for PWA
self.addEventListener("push", (event) => {
  // console.log("🔔 Push notification received");

  const options = {
    body: event.data ? event.data.text() : "New notification from GMHS",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
    },
    actions: [
      {
        action: "explore",
        title: "Open App",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/icon-96x96.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("GMHS Notification", options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  // console.log("🔔 Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "close") {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Enhanced message handling for PWA
self.addEventListener("message", (event) => {
  // console.log("💬 PWA Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Handle cache clearing requests from the app
  if (event.data && event.data.type === "CLEAR_API_CACHE") {
    // console.log("🗑️ Clearing all API caches on request");
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.includes("api") || cacheName.includes("data")) {
          caches.delete(cacheName);
        }
      });
    });
  }
});
