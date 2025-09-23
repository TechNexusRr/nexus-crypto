// sw-register.ts
export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  const activate = () => reg.waiting?.postMessage({ type: "SKIP_WAITING" });
  if (reg.waiting) activate();

  reg.addEventListener("updatefound", () => {
    reg.installing?.addEventListener("statechange", () => {
      if (reg.waiting) activate();
    });
  });

  // fetch a new SW when user returns or gets connection back
  const poke = () => reg.update().catch(() => {});
  window.addEventListener("focus", poke);
  window.addEventListener("online", poke);

  // reload once when the new SW controls the page
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      location.reload();
    }
  });

  // Listen for cache cleared message from SW
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "CACHE_CLEARED") {
      location.reload();
    }
  });

  // Expose cache clearing function globally for debugging
  interface WindowWithSW extends Window {
    clearSWCache?: () => Promise<void>;
    unregisterSW?: () => Promise<void>;
  }

  const windowWithSW = window as WindowWithSW;

  windowWithSW.clearSWCache = async () => {
    if (reg.active) {
      reg.active.postMessage({ type: "CLEAR_CACHE" });
    }
  };

  // Add unregister function for debugging
  windowWithSW.unregisterSW = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    location.reload();
  };
}
