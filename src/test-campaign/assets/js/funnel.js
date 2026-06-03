(() => {
  function pad(value) {
    return String(Math.max(0, value)).padStart(2, "0");
  }

  function initCountdown(root) {
    const duration = Number(root.getAttribute("data-duration-seconds") || 600);
    const storageKey = root.getAttribute("data-storage-key") || "campaign-countdown";
    const now = Date.now();
    let expiresAt = Number(sessionStorage.getItem(storageKey));

    if (!expiresAt || expiresAt <= now) {
      expiresAt = now + duration * 1000;
      sessionStorage.setItem(storageKey, String(expiresAt));
    }

    const render = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      root.querySelectorAll("[data-countdown-min]").forEach((el) => { el.textContent = pad(minutes); });
      root.querySelectorAll("[data-countdown-sec]").forEach((el) => { el.textContent = pad(seconds); });
    };

    render();
    window.setInterval(render, 1000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-countdown]").forEach(initCountdown);
  });
})();
