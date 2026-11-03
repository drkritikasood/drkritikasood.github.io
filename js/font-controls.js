(() => {
  const init = () => {
    const down = document.getElementById("fontDown");
    const up = document.getElementById("fontUp");
    const reset = document.getElementById("fontReset");
    if (!down || !up || !reset) return;

    const storageKey = "kritikaPortfolioFontScale";
    let scale = 1;
    try {
      const saved = Number(window.localStorage.getItem(storageKey));
      if (Number.isFinite(saved) && saved >= 0.9 && saved <= 1.35) scale = saved;
    } catch (_) {}

    const apply = () => {
      scale = Math.min(1.35, Math.max(0.9, scale));
      document.documentElement.style.setProperty("--reader-scale", String(scale));
      try { window.localStorage.setItem(storageKey, String(scale)); } catch (_) {}
      down.disabled = scale <= 0.9;
      up.disabled = scale >= 1.35;
      reset.setAttribute("aria-label", `Reset text size; current size ${Math.round(scale * 100)} percent`);
    };

    down.addEventListener("click", (event) => { event.preventDefault(); scale -= 0.05; apply(); });
    up.addEventListener("click", (event) => { event.preventDefault(); scale += 0.05; apply(); });
    reset.addEventListener("click", (event) => { event.preventDefault(); scale = 1; apply(); });
    apply();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
