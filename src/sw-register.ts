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
}
