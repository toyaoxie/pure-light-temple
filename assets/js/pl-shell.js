/* Pure Light Temple — Shell JS (multipage)
   - inject header/footer using PL_BASE
   - rewrite data-pl-href to real href with base prefix
   - mobile menu toggle
   - dropdown auto-close (click outside / click link / open one closes others / Esc)
   - active nav highlight
*/

function plBase() {
  const b = (window.PL_BASE || "").trim();
  if (!b) return "";
  return b.startsWith("/") ? b : `/${b}`;
}

function plJoin(base, path) {
  if (!path) return base || "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("#")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function plInjectPartials() {
  const base = plBase();
  const headerMount = document.getElementById("pl-header");
  const footerMount = document.getElementById("pl-footer");

  if (headerMount) {
    const res = await fetch(`${base}/partials/header.html`, { cache: "no-cache" });
    headerMount.innerHTML = await res.text();
  }

  if (footerMount) {
    const res = await fetch(`${base}/partials/footer.html`, { cache: "no-cache" });
    footerMount.innerHTML = await res.text();
  }
}

function plRewriteLinks() {
  const base = plBase();
  document.querySelectorAll("[data-pl-href]").forEach((el) => {
    const raw = el.getAttribute("data-pl-href");
    const href = plJoin(base, raw);
    el.setAttribute("href", href);
  });

  // Also update script src usage if you ever add data-pl-src pattern later.
}

function plCloseAllDropdowns() {
  document.querySelectorAll("details[data-pl-dropdown][open]").forEach((d) => d.removeAttribute("open"));
}

function plInitDropdowns() {
  // Open one closes others
  document.querySelectorAll("details[data-pl-dropdown]").forEach((d) => {
    d.addEventListener("toggle", () => {
      if (d.open) {
        document.querySelectorAll("details[data-pl-dropdown][open]").forEach((other) => {
          if (other !== d) other.removeAttribute("open");
        });
      }
    });
  });

  // Click anywhere outside closes all
  document.addEventListener("click", (e) => {
    const openDrops = document.querySelectorAll("details[data-pl-dropdown][open]");
    if (!openDrops.length) return;

    const clickedInsideAny = Array.from(openDrops).some((d) => d.contains(e.target));
    if (!clickedInsideAny) plCloseAllDropdowns();
  });

  // Esc closes all
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") plCloseAllDropdowns();
  });

  // Clicking any link inside dropdown closes it immediately (before navigation)
  document.querySelectorAll("details[data-pl-dropdown] a").forEach((a) => {
    a.addEventListener("click", () => plCloseAllDropdowns(), { capture: true });
  });
}

function plInitMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    plCloseAllDropdowns(); // 防止同时开着
  });

  // Click any link => close menu
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => mobileMenu.classList.add("hidden"));
  });
}

function plSetYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function plActiveNav() {
  // normalize: ignore hash/query; compare pathname end segment after base
  const base = plBase();
  const pathname = window.location.pathname;
  const current = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const currentNorm = current || "/index.html";

  document.querySelectorAll(".pl-navlink").forEach((a) => {
    const r = a.getAttribute("data-route");
    if (!r) return;

    const isActive = (r === "/index.html" && (currentNorm === "/" || currentNorm === "/index.html"))
      || (r !== "/index.html" && currentNorm === r);

    a.style.outline = isActive ? "2px solid rgba(201,164,92,0.35)" : "none";
    a.style.outlineOffset = isActive ? "2px" : "0px";
  });
}

function plInitShell() {
  plRewriteLinks();
  plInitMobileMenu();
  plInitDropdowns();
  plSetYear();
  plActiveNav();
}

// Recommended boot sequence (multipage)
document.addEventListener("DOMContentLoaded", async () => {
  // If using injection mounts:
  if (document.getElementById("pl-header") || document.getElementById("pl-footer")) {
    await plInjectPartials();
  }
  plInitShell();
});
