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

<script>
  (function () {
    const mqDesktop = window.matchMedia("(min-width: 768px)"); // Tailwind md

    function closeAll(except = null) {
      document.querySelectorAll("details.navdrop[open]").forEach(d => {
        if (d !== except) d.removeAttribute("open");
      });
    }

    function bindDesktopHover() {
      const drops = Array.from(document.querySelectorAll("details.navdrop"));

      drops.forEach(d => {
        // 1) Hover open
        d.addEventListener("mouseenter", () => {
          if (!mqDesktop.matches) return;
          closeAll(d);
          d.setAttribute("open", "");
        });

        // 2) Leave close (use a tiny delay to avoid flicker)
        let t = null;
        d.addEventListener("mouseleave", () => {
          if (!mqDesktop.matches) return;
          clearTimeout(t);
          t = setTimeout(() => d.removeAttribute("open"), 120);
        });

        // 3) If user clicks inside, keep it open
        d.addEventListener("click", (e) => {
          if (!mqDesktop.matches) return;
          // Prevent <summary> toggling fighting with our hover logic:
          // We let it stay open, and rely on outside click / mouseleave to close.
          const isSummary = e.target.closest("summary");
          if (isSummary) {
            e.preventDefault();
            closeAll(d);
            d.setAttribute("open", "");
          }
        });
      });

      // 4) Outside click close
      document.addEventListener("click", (e) => {
        if (!mqDesktop.matches) return;
        const insideAny = e.target.closest("details.navdrop");
        if (!insideAny) closeAll();
      });

      // 5) ESC to close
      document.addEventListener("keydown", (e) => {
        if (!mqDesktop.matches) return;
        if (e.key === "Escape") closeAll();
      });
    }

    // Init
    bindDesktopHover();

    // On breakpoint changes, close all to avoid weird state
    mqDesktop.addEventListener?.("change", () => closeAll());
  })();
</script>


