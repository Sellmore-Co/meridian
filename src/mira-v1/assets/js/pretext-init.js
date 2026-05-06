// Mira funnel — Pretext wiring
// Computes correct heights for [data-pretext] elements after fonts load,
// re-runs on resize and on contenteditable changes.

(async function () {
  if (!window.Pretext) {
    console.warn("Pretext not loaded; layout heights will use CSS defaults.");
    return;
  }
  const { prepare, layout } = window.Pretext;

  await (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve());

  const handles = new Map();

  function fontFor(el) {
    const cs = getComputedStyle(el);
    // Use shorthand — prepare() needs `[size] [family]`
    const weight = cs.fontWeight || "400";
    const style = cs.fontStyle || "normal";
    const size = cs.fontSize || "16px";
    const family = cs.fontFamily || "sans-serif";
    return `${style} ${weight} ${size} ${family}`;
  }

  function lineHeightFor(el) {
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    if (Number.isFinite(lh)) return lh;
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    return fs * 1.5;
  }

  function prepareEl(el) {
    const text = el.textContent.trim();
    if (!text) return;
    try {
      handles.set(el, { handle: prepare(text, fontFor(el)), text });
    } catch (e) {
      console.warn("Pretext prepare failed", e);
    }
  }

  function relayoutEl(el) {
    const rec = handles.get(el);
    if (!rec) return;
    const w = el.clientWidth;
    if (!w) return;
    try {
      const { height } = layout(rec.handle, w, lineHeightFor(el));
      el.style.minHeight = `${height}px`;
    } catch (e) { /* ignore */ }
  }

  function relayoutAll() {
    for (const el of handles.keys()) relayoutEl(el);
  }

  function init() {
    document.querySelectorAll("[data-pretext]").forEach(prepareEl);
    relayoutAll();
  }
  init();

  // Resize
  let raf = 0;
  const ro = new ResizeObserver(() => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(relayoutAll);
  });
  ro.observe(document.body);

  // Contenteditable — re-prepare + relayout
  document.querySelectorAll('[data-pretext][contenteditable="true"]').forEach((el) => {
    new MutationObserver(() => {
      prepareEl(el);
      relayoutEl(el);
    }).observe(el, { characterData: true, subtree: true, childList: true });
  });

  // Window focus / orientation — belt & braces
  window.addEventListener("orientationchange", () => setTimeout(relayoutAll, 50));
})();
