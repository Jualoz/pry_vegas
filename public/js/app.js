import { loadContent, money } from "./store.js";

const WHATSAPP = "573223552844";
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- Enlaces de WhatsApp ----------
function wireWhatsApp(root = document) {
  $$("[data-wa]", root).forEach((a) => (a.href = waLink(a.dataset.wa)));
}

// ---------- Navegación ----------
function initNav() {
  const nav = $("#nav");
  const burger = $("#burger");
  const links = $("#navLinks");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  // Resalta la sección visible
  const map = new Map($$("a", links).map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        map.forEach((a) => a.classList.remove("is-active"));
        map.get(e.target.id)?.classList.add("is-active");
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  map.forEach((_, id) => document.getElementById(id) && spy.observe(document.getElementById(id)));
}

// ---------- Animaciones al hacer scroll ----------
const revealer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealer.unobserve(e.target);
      }
    }),
  { threshold: 0.12 }
);
const observeReveals = (root = document) => $$(".reveal:not(.is-visible)", root).forEach((el) => revealer.observe(el));

// ---------- Horario y estado abierto/cerrado (hora de Colombia) ----------
function bogotaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const fmtHour = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suf = h >= 12 ? "p.m." : "a.m.";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suf}`;
};

function renderHours(horarios) {
  $("#hours").innerHTML = horarios
    .map((h) => `<div class="hours-row"><span>${esc(h.etiqueta)}</span><b>${fmtHour(h.abre)} – ${fmtHour(h.cierra)}</b></div>`)
    .join("");
  if (horarios[0]) $("#stripHours").textContent = `${horarios[0].etiqueta} desde las ${fmtHour(horarios[0].abre)}`;

  const { day, minutes } = bogotaNow();
  const today = horarios.find((h) => h.dias.includes(day));
  const dot = $("#statusDot");
  const text = $("#statusText");
  if (today && minutes >= toMin(today.abre) && minutes < toMin(today.cierra)) {
    dot.className = "dot is-open";
    text.textContent = `Abierto ahora · hasta las ${fmtHour(today.cierra)}`;
  } else if (today && minutes < toMin(today.abre)) {
    dot.className = "dot is-closed";
    text.textContent = `Abrimos hoy a las ${fmtHour(today.abre)}`;
  } else {
    const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    dot.className = "dot is-closed";
    text.textContent = "Cerrado por hoy";
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      const h = horarios.find((x) => x.dias.includes(d));
      if (h) {
        text.textContent = `Cerrado · abrimos ${i === 1 ? "mañana" : "el " + DIAS[d]} a las ${fmtHour(h.abre)}`;
        break;
      }
    }
  }
}

// ---------- Menú ----------
let content;

function dishCard(d, i) {
  const msg = `Hola Las Vegas 👋, quiero pedir: ${d.nombre} (${money(d.precio)}).`;
  const out = d.disponible === false;
  return `
    <article class="dish${out ? " is-out" : ""}" style="animation-delay:${i * 60}ms">
      <img class="dish__img" src="${esc(d.img || "assets/logo.png")}" alt="${esc(d.nombre)}" loading="lazy">
      <h3>${esc(d.nombre)}</h3>
      <p>${esc(d.desc)}</p>
      <div class="dish__foot">
        <span class="dish__price">${money(d.precio)}</span>
        ${out ? '<span class="dish__tag">Agotado hoy</span>' : `<a class="dish__add" href="${waLink(msg)}" target="_blank" rel="noopener" aria-label="Pedir ${esc(d.nombre)} por WhatsApp">
          <svg class="ico" viewBox="0 0 24 24"><use href="#i-wa"/></svg></a>`}
      </div>
    </article>`;
}

function renderMenu(tab) {
  const grid = $("#menuGrid");
  if (tab === "adicionales") {
    grid.innerHTML = `<div class="extras-list">${content.adicionales
      .map((a, i) => `<div class="extra" style="animation-delay:${i * 50}ms"><span>${esc(a.nombre)}</span><span>${money(a.precio)}</span></div>`)
      .join("")}</div>`;
  } else {
    grid.innerHTML = (content[tab] || []).map(dishCard).join("");
  }
}

function initTabs() {
  $$(".tab").forEach((t) =>
    t.addEventListener("click", () => {
      $$(".tab").forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("is-active");
      t.setAttribute("aria-selected", "true");
      renderMenu(t.dataset.tab);
    })
  );
}

// ---------- Planes ----------
function renderPlans() {
  $("#plans").innerHTML = content.planes
    .map((p) => {
      const msg = `Hola Las Vegas 👋, quiero información del ${p.titulo} (${money(p.precio)}/${p.periodo}).`;
      return `
      <article class="plan reveal${p.destacado ? " plan--featured" : ""}">
        ${p.destacado ? '<span class="plan__badge">⭐ Recomendado</span>' : ""}
        <span class="plan__ico">${esc(p.icono)}</span>
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="plan__price">${money(p.precio)} <small>/ ${esc(p.periodo)}</small></div>
        <a class="btn ${p.destacado ? "btn--primary" : "btn--light"}" href="${waLink(msg)}" target="_blank" rel="noopener">Quiero este plan</a>
      </article>`;
    })
    .join("");

  $("#extras").innerHTML = content.extras
    .map(
      (x) => `
      <div class="extra-card reveal">
        <span>${esc(x.icono)}</span>
        <div><h3>${esc(x.titulo)}</h3><p>${esc(x.desc)}</p></div>
        <a href="${waLink(`Hola Las Vegas 👋, quiero información sobre: ${x.titulo}.`)}" target="_blank" rel="noopener">Consultar →</a>
      </div>`
    )
    .join("");
}

// ---------- Inicio ----------
async function init() {
  wireWhatsApp();
  initNav();
  initTabs();
  $("#year").textContent = new Date().getFullYear();

  content = await loadContent();

  if (content.aviso?.trim()) {
    const bar = $("#announce");
    bar.textContent = content.aviso;
    bar.hidden = false;
  }

  $("#includes").innerHTML = content.incluye.map((i) => `<li>${esc(i)}</li>`).join("");
  const prices = [...content.especiales, ...content.corrientes].map((d) => Number(d.precio)).filter(Boolean);
  if (prices.length) $("#minPrice").textContent = money(Math.min(...prices));

  renderMenu("especiales");
  renderPlans();
  renderHours(content.horarios);
  observeReveals();
}

init();
