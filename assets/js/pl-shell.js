/* Pure Light Temple — Shell JS
   - injects header/footer (optional helper)
   - mobile menu toggle
   - year
   - optional hash router: [data-page] show/hide + nav highlight
*/

function plInitShell() {
  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close on any nav click (mobile)
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => mobileMenu.classList.add("hidden"));
    });
  }

  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Optional: route-to-page system (your current single-page architecture)
  plRoute();
  window.addEventListener("hashchange", plRoute);

  // Close dropdowns when clicking outside (desktop)
  document.addEventListener("click", (e) => {
    document.querySelectorAll("details.navdrop[open]").forEach((d) => {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
  });
}

function plRoute() {
  // route format: #/home, #/dharma, etc.
  const raw = location.hash || "#/home";
  const path = raw.startsWith("#/") ? raw.slice(1) : "/home";
  const route = path.split("#")[0]; // ignore internal anchors after second #

  // If the page uses [data-page], show/hide them
  const pages = document.querySelectorAll("[data-page]");
  if (pages.length) {
    pages.forEach((p) => p.classList.remove("is-active"));
    const key = route.replace("/", "") || "home";
    const active = document.querySelector(`[data-page="${key}"]`);
    if (active) active.classList.add("is-active");
  }

  // Nav highlight (subtle)
  document.querySelectorAll(".pl-navlink").forEach((a) => {
    const r = a.getAttribute("data-route");
    if (!r) return;
    const isActive = r === route;
    a.style.outline = isActive ? "2px solid rgba(201,164,92,0.35)" : "none";
    a.style.outlineOffset = isActive ? "2px" : "0px";
  });
}

/* Optional helper for multi-page injection:
   In each HTML page:
   <div id="pl-header"></div>
   ...page...
   <div id="pl-footer"></div>
   then call plInjectPartials() before plInitShell()
*/
async function plInjectPartials() {
  const headerMount = document.getElementById("pl-header");
  const footerMount = document.getElementById("pl-footer");

  if (headerMount) {
    const res = await fetch("./partials/header.html", { cache: "no-cache" });
    headerMount.innerHTML = await res.text();
  }

  if (footerMount) {
    const res = await fetch("./partials/footer.html", { cache: "no-cache" });
    footerMount.innerHTML = await res.text();
  }
}

// Boot
document.addEventListener("DOMContentLoaded", async () => {
  // If you are using injection mounts, uncomment:
  // await plInjectPartials();
  plInitShell();
});

