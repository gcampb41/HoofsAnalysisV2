(() => {
  const compactQuery = window.matchMedia("(max-width: 900px)");
  const nav = document.querySelector(".sticky-nav");
  const navInner = nav?.querySelector(".sticky-nav-inner");
  if (!nav || !navInner || nav.querySelector(".hoofs-filter-toggle")) return;

  const toggle = document.createElement("button");
  toggle.className = "hoofs-filter-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  if (!navInner.id) navInner.id = "hoofs-report-filter-controls";
  toggle.setAttribute("aria-controls", navInner.id);
  toggle.innerHTML = `
    <span class="hoofs-filter-toggle__copy">
      <strong>Filters &amp; race navigation</strong>
      <small data-filter-summary>Tap to show controls</small>
    </span>
    <span class="hoofs-filter-toggle__icon" aria-hidden="true">⌄</span>`;
  nav.insertBefore(toggle, navInner);

  const summary = toggle.querySelector("[data-filter-summary]");
  const filterInputs = Array.from(navInner.querySelectorAll("select, input[type='checkbox']"))
    .filter((input) =>
      !input.classList.contains("race-jump")
      && input.id !== "race-jump"
      && input.id !== "cons-mode"
    );
  const updateSummary = () => {
    const active = filterInputs.filter((input) =>
      input.type === "checkbox" ? input.checked : Boolean(input.value)
    ).length;
    const expanded = nav.classList.contains("hoofs-filters-open");
    summary.textContent = active
      ? `${active} filter${active === 1 ? "" : "s"} active · ${expanded ? "Tap to hide" : "Tap to show"}`
      : expanded ? "Tap to hide controls" : "Tap to show controls";
  };
  const setExpanded = (expanded) => {
    nav.classList.toggle("hoofs-filters-open", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    updateSummary();
  };
  toggle.addEventListener("click", () => setExpanded(!nav.classList.contains("hoofs-filters-open")));
  filterInputs.forEach((input) => input.addEventListener("change", updateSummary));
  const raceJump = navInner.querySelector(".race-jump, #race-jump");
  raceJump?.addEventListener("change", () => {
    if (compactQuery.matches) setExpanded(false);
  });
  window.addEventListener("resize", () => {
    if (!compactQuery.matches) setExpanded(false);
  });
  updateSummary();
})();
