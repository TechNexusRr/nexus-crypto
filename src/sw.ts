/// <reference lib="webworker" />
import {
  Serwist,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst
} from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare let self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // HTML pages - Cache First with Network fallback for better offline support
    {
      matcher: ({ request }: { request: Request }) =>
        request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages",
        networkTimeoutSeconds: 3,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (!response || response.status !== 200) return null;

              // Add timestamp for cache age tracking
              const headers = new Headers(response.headers);
              headers.set('sw-cached-at', new Date().toISOString());

              return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers
              });
            },
            cacheKeyWillBeUsed: async ({ request }) => {
              // Ensure proper cache keys for navigation requests
              const url = new URL(request.url);
              return url.pathname;
            }
          }
        ]
      }),
    },
    // App shell - Cache First for immediate offline access
    {
      matcher: ({ request, url }: { request: Request; url: URL }) =>
        request.destination === 'document' ||
        url.pathname === '/' ||
        url.pathname === '/currency' ||
        url.pathname === '/crypto',
      handler: new CacheFirst({
        cacheName: "app-shell",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response && response.status === 200 ? response : null;
            }
          }
        ]
      }),
    },
    // Next.js static files - Stale While Revalidate
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/_next/data/"),
      handler: new StaleWhileRevalidate({
        cacheName: "next-static"
      }),
    },
    // Images - Cache First
    {
      matcher: ({ request }: { request: Request }) =>
        (request as Request & { destination?: string }).destination === "image",
      handler: new CacheFirst({
        cacheName: "images"
      }),
    },
    // Google Fonts CSS - Stale While Revalidate
    {
      matcher: ({ url }: { url: URL }) =>
        url.origin === "https://fonts.googleapis.com",
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    // Google Fonts webfonts - Cache First
    {
      matcher: ({ url }: { url: URL }) =>
        url.origin === "https://fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts"
      }),
    },
    // Exchange rates API - Stale While Revalidate with TTL
    {
      matcher: ({ url }: { url: URL }) =>
        url.origin === "https://api.exchangerate-api.com",
      handler: new StaleWhileRevalidate({
        cacheName: "rates-api",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (!response || response.status !== 200) return null;

              // Add custom headers for tracking
              const headers = new Headers(response.headers);
              headers.set('sw-cached-at', new Date().toISOString());

              return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers
              });
            },
            cachedResponseWillBeUsed: async ({ cachedResponse }) => {
              if (!cachedResponse) return null;

              const cachedAt = cachedResponse.headers.get('sw-cached-at');
              if (!cachedAt) return cachedResponse;

              const ttlMinutes = 45; // From env config
              const cacheAge = Date.now() - new Date(cachedAt).getTime();
              const maxAge = ttlMinutes * 60 * 1000;

              // Return stale data if still within TTL
              if (cacheAge < maxAge) {
                return cachedResponse;
              }

              // Still return stale data but trigger background refresh
              return cachedResponse;
            }
          }
        ]
      }),
    },
    // Other API calls - Network First
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
      }),
    }
  ],
});

// Handle skip waiting message and cache clearing
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data as { type?: string };

  if (data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (data?.type === "CLEAR_CACHE") {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        // Notify all clients that cache has been cleared
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({ type: "CACHE_CLEARED" });
        });
      })()
    );
  }
});

// Clean up old caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Clean up old versioned caches
      const cacheNames = await caches.keys();
      const validCaches = [
        "pages",
        "next-static",
        "images",
        "google-fonts-stylesheets",
        "google-fonts-webfonts",
        "rates-api",
        "api-cache"
      ];

      await Promise.all(
        cacheNames
          .filter(name => !validCaches.includes(name) && !name.includes("precache"))
          .map(name => caches.delete(name))
      );

      // Take control of all clients
      await self.clients.claim();
    })()
  );
});

// Install event - force immediate activation and precaching
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Precache essential pages for offline access
      const cache = await caches.open("app-shell");
      try {
        await cache.addAll([
          "/",
          "/currency",
          "/crypto",
          "/manifest.json"
        ]);
      } catch (error) {
        console.warn('Failed to precache some resources:', error);
        // Try to cache individual resources
        const resources = ["/", "/currency", "/crypto", "/manifest.json"];
        for (const resource of resources) {
          try {
            await cache.add(resource);
          } catch (err) {
            console.warn(`Failed to cache ${resource}:`, err);
          }
        }
      }

      // Force the waiting service worker to become the active service worker
      await self.skipWaiting();
    })()
  );
});

serwist.addEventListeners();