(() => {
  const config = window.HOOFS_CONFIG || {};
  const telegramUrl = config.telegramUrl;
  const substackUrl = config.substackUrl;
  if (!telegramUrl || !substackUrl) return;

  const now = new Date();
  const dateKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const storageKey = "hoofs-community-prompt-date";

  try {
    if (localStorage.getItem(storageKey) === dateKey) return;
  } catch (_) {
    // The prompt can still work when private browsing blocks local storage.
  }

  const root = document.createElement("div");
  root.className = "hoofs-prompt";
  root.hidden = true;
  root.innerHTML = `
    <button class="hoofs-prompt__backdrop" type="button" aria-label="Close community prompt" data-prompt-close></button>
    <section class="hoofs-prompt__dialog" role="dialog" aria-modal="true" aria-labelledby="hoofs-prompt-title" aria-describedby="hoofs-prompt-copy">
      <div class="hoofs-prompt__accent"></div>
      <div class="hoofs-prompt__content">
        <button class="hoofs-prompt__close" type="button" aria-label="Close" data-prompt-close>×</button>
        <p class="hoofs-prompt__eyebrow">Stay with Hoofs</p>
        <h2 class="hoofs-prompt__title" id="hoofs-prompt-title">Get the next report when it lands.</h2>
        <p class="hoofs-prompt__copy" id="hoofs-prompt-copy">Join the Telegram conversation for daily report alerts, or subscribe on Substack for Hoofs updates in your inbox.</p>
        <div class="hoofs-prompt__actions">
          <a class="hoofs-prompt__action hoofs-prompt__action--primary" href="${telegramUrl}" target="_blank" rel="noopener noreferrer" data-prompt-action="telegram">Join Telegram ↗</a>
          <a class="hoofs-prompt__action" href="${substackUrl}" target="_blank" rel="noopener noreferrer" data-prompt-action="substack">Subscribe on Substack ↗</a>
        </div>
      </div>
    </section>`;
  document.body.appendChild(root);

  let previousFocus = null;
  const focusable = () => Array.from(root.querySelectorAll("button, a[href]"));
  const track = (name, destination) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, {
        destination: destination || "dismiss",
        page_type: "daily_report",
      });
    }
  };
  const rememberToday = () => {
    try {
      localStorage.setItem(storageKey, dateKey);
    } catch (_) {
      // No persistence is preferable to blocking the report.
    }
  };
  const close = (reason = "dismiss") => {
    if (root.hidden) return;
    root.hidden = true;
    document.body.classList.remove("hoofs-prompt-open");
    track("community_prompt_close", reason);
    previousFocus?.focus?.();
  };
  const open = () => {
    if (document.visibilityState !== "visible" || !root.hidden) return;
    previousFocus = document.activeElement;
    rememberToday();
    root.hidden = false;
    document.body.classList.add("hoofs-prompt-open");
    root.querySelector(".hoofs-prompt__close")?.focus();
    track("community_prompt_view");
  };

  root.querySelectorAll("[data-prompt-close]").forEach((button) => {
    button.addEventListener("click", () => close("dismiss"));
  });
  root.querySelectorAll("[data-prompt-action]").forEach((link) => {
    link.addEventListener("click", () => {
      const destination = link.dataset.promptAction;
      track("community_prompt_click", destination);
      close(destination);
    });
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close("escape");
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.setTimeout(open, 9000);
})();
