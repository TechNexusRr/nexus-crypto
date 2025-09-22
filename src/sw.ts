/// <reference lib="webworker" />
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare let self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

const RUNTIME_VERSION = "v4";
const CACHES = {
  pages: `pages-${RUNTIME_VERSION}`,
  api: `api-${RUNTIME_VERSION}`,
  assets: `assets-${RUNTIME_VERSION}`,
  images: `images-${RUNTIME_VERSION}`,
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true, // keep if your Serwist version supports it; otherwise remove
  runtimeCaching: [
    {
      matcher: ({ request }: { request: Request }) =>
        request.mode === "navigate" ||
        (request as any).destination === "document",
      handler: new NetworkFirst({
        cacheName: CACHES.pages,
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: ({ url, request }: { url: URL; request: Request }) =>
        url.pathname.startsWith("/api/") ||
        request.headers.get("accept")?.includes("application/json") === true,
      handler: new NetworkFirst({
        cacheName: CACHES.api,
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: ({ request }: { request: Request }) =>
        ["script", "style", "worker"].includes((request as any).destination),
      handler: new StaleWhileRevalidate({ cacheName: CACHES.assets }),
    },
    {
      matcher: ({ request }: { request: Request }) =>
        (request as any).destination === "image",
      handler: new CacheFirst({ cacheName: CACHES.images }),
    },
  ],
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(CACHES));
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              (k.startsWith("pages-") ||
                k.startsWith("api-") ||
                k.startsWith("assets-") ||
                k.startsWith("images-")) &&
              !keep.has(k)
          )
          .map((k) => caches.delete(k))
      );

      // (optional) enable navigation preload if supported
      // @ts-ignore
      await self.registration.navigationPreload?.enable?.();
      // take control
      // @ts-ignore
      await self.clients.claim?.();
    })()
  );
});

self.addEventListener("message", (e: ExtendableMessageEvent) => {
  if ((e.data as any)?.type === "SKIP_WAITING") self.skipWaiting();
});

serwist.addEventListeners();
