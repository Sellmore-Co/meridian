const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function wireSelectors() {
  document.querySelectorAll("[data-choice-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const card = event.target.closest("[data-choice]");
      if (!card || !group.contains(card)) return;
      group.querySelectorAll("[data-choice]").forEach((item) => item.classList.remove("next-selected"));
      card.classList.add("next-selected");

      const price = card.getAttribute("data-price");
      const compare = card.getAttribute("data-compare");
      const summary = document.querySelector("[data-summary-total]");
      const subtotal = document.querySelector("[data-summary-subtotal]");
      if (price && summary) summary.textContent = money.format(Number(price));
      if (compare && subtotal) subtotal.textContent = money.format(Number(compare));
    });
  });
}

function wirePayments() {
  document.querySelectorAll(".payment-method:not([data-next-payment-method])").forEach((method) => {
    method.addEventListener("click", () => {
      const wrap = method.parentElement;
      wrap.querySelectorAll(".payment-method").forEach((item) => item.classList.remove("next-selected"));
      method.classList.add("next-selected");
      const input = method.querySelector("input[type='radio']");
      if (input) input.checked = true;
    });
  });
}

function wireQuantity() {
  document.querySelectorAll("[data-qty]").forEach((wrap) => {
    const value = wrap.querySelector("[data-qty-value]");
    wrap.addEventListener("click", (event) => {
      const action = event.target.getAttribute("data-qty-action");
      if (!action || !value) return;
      const current = Number(value.textContent || "1");
      const next = action === "increase" ? Math.min(current + 1, 5) : Math.max(current - 1, 1);
      value.textContent = String(next);
    });
  });
}

async function wirePretext() {
  const nodes = [...document.querySelectorAll("[data-pretext]")];
  if (!nodes.length) return;

  let pretext = null;
  try {
    pretext = await import("https://esm.sh/@chenglou/pretext");
  } catch {
    return;
  }

  const prepared = new Map();
  await document.fonts.ready;

  function prepareNode(node) {
    const style = getComputedStyle(node);
    prepared.set(node, pretext.prepare(node.textContent.trim(), style.font));
  }

  function relayout() {
    for (const [node, handle] of prepared) {
      const style = getComputedStyle(node);
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25;
      const result = pretext.layout(handle, node.clientWidth, lineHeight);
      if (result && result.height) node.style.minHeight = `${Math.ceil(result.height)}px`;
    }
  }

  nodes.forEach((node) => {
    prepareNode(node);
    if (node.getAttribute("contenteditable") === "true") {
      new MutationObserver(() => {
        prepareNode(node);
        relayout();
      }).observe(node, { characterData: true, childList: true, subtree: true });
    }
  });

  new ResizeObserver(relayout).observe(document.body);
  relayout();
}

wireSelectors();
wirePayments();
wireQuantity();
wirePretext();
