import { loadContent, saveContent, demoMode, resetDemo, login, logout, onUser, resetPassword } from "./store.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Esquema de cada lista editable
const DISH_FIELDS = [
  { k: "nombre", label: "Nombre del plato", type: "text", cls: "span-4" },
  { k: "precio", label: "Precio ($)", type: "number", cls: "span-2" },
  { k: "desc", label: "Descripción corta", type: "textarea", cls: "span-6" },
  { k: "img", label: "URL de la foto", type: "url", cls: "span-4" },
  { k: "disponible", label: "Disponible hoy", type: "checkbox", cls: "span-2" },
];
const LISTS = {
  especiales: { title: "Platos especiales", hint: "Desmarca \"Disponible hoy\" para mostrarlo como agotado sin borrarlo.", fields: DISH_FIELDS, image: true,
    blank: { nombre: "Nuevo plato", desc: "", precio: 10000, img: "", disponible: true } },
  corrientes: { title: "Platos corrientes", hint: "Desmarca \"Disponible hoy\" para mostrarlo como agotado sin borrarlo.", fields: DISH_FIELDS, image: true,
    blank: { nombre: "Nuevo plato", desc: "", precio: 8000, img: "", disponible: true } },
  adicionales: { title: "Adicionales", fields: [
      { k: "nombre", label: "Nombre", type: "text", cls: "span-4" },
      { k: "precio", label: "Precio ($)", type: "number", cls: "span-2" }],
    blank: { nombre: "Nuevo adicional", precio: 1000 } },
  planes: { title: "Planes", hint: "Marca uno como destacado para resaltarlo en la página.", fields: [
      { k: "icono", label: "Ícono (emoji)", type: "text", cls: "span-2" },
      { k: "titulo", label: "Título", type: "text", cls: "span-4" },
      { k: "desc", label: "Descripción", type: "textarea", cls: "span-6" },
      { k: "precio", label: "Precio ($)", type: "number", cls: "span-2" },
      { k: "periodo", label: "Periodo (semana, mes…)", type: "text", cls: "span-2" },
      { k: "destacado", label: "Destacado", type: "checkbox", cls: "span-2" }],
    blank: { icono: "🍽️", titulo: "Nuevo plan", desc: "", precio: 0, periodo: "mes", destacado: false } },
  extras: { title: "Beneficios adicionales", fields: [
      { k: "icono", label: "Ícono (emoji)", type: "text", cls: "span-2" },
      { k: "titulo", label: "Título", type: "text", cls: "span-4" },
      { k: "desc", label: "Descripción", type: "textarea", cls: "span-6" }],
    blank: { icono: "✨", titulo: "Nuevo beneficio", desc: "" } },
  horarios: { title: "Horarios", hint: "El sitio usa estos horarios para mostrar \"Abierto ahora\" o \"Cerrado\" (hora de Colombia).", fields: [
      { k: "etiqueta", label: "Texto visible", type: "text", cls: "span-2" },
      { k: "abre", label: "Abre", type: "time", cls: "span-2" },
      { k: "cierra", label: "Cierra", type: "time", cls: "span-2" },
      { k: "dias", label: "Días", type: "days", cls: "span-6" }],
    blank: { etiqueta: "Nuevo horario", dias: [], abre: "08:00", cierra: "15:00" } },
};
const SECTIONS = {
  especiales: ["especiales"],
  corrientes: ["corrientes"],
  adicionales: ["adicionales", "@incluye"],
  planes: ["planes", "extras"],
  general: ["@aviso", "horarios"],
};

let saved = null; // última versión guardada
let state = null; // versión en edición
let current = "especiales";

// ---------- Utilidades UI ----------
function toast(msg, error = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("is-error", error);
  t.classList.add("is-on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("is-on"), 2800);
}
const isDirty = () => JSON.stringify(state) !== JSON.stringify(saved);
function updateSaveBar() {
  const dirty = isDirty();
  $("#saveBar").classList.toggle("is-dirty", dirty);
  $("#saveStatus").textContent = dirty ? "Tienes cambios sin guardar" : "Todo guardado";
  $("#saveBtn").disabled = $("#discardBtn").disabled = !dirty;
}

// ---------- Render ----------
function fieldHtml(f, item, path) {
  const v = item[f.k];
  const attrs = `data-path="${path}" data-key="${f.k}" data-type="${f.type}"`;
  if (f.type === "checkbox")
    return `<label class="check ${f.cls}"><input type="checkbox" ${attrs} ${v !== false ? "checked" : ""}> ${f.label}</label>`;
  if (f.type === "textarea")
    return `<label class="${f.cls}">${f.label}<textarea rows="2" ${attrs}>${esc(v)}</textarea></label>`;
  if (f.type === "days")
    return `<div class="${f.cls}"><label>${f.label}</label><div class="days">${DIAS.map(
      (d, i) => `<label><input type="checkbox" ${attrs} data-day="${i}" ${(v || []).includes(i) ? "checked" : ""}> ${d}</label>`
    ).join("")}</div></div>`;
  return `<label class="${f.cls}">${f.label}<input type="${f.type}" ${attrs} value="${esc(v)}" ${f.type === "number" ? 'min="0" step="500"' : ""}></label>`;
}

function listHtml(key) {
  const cfg = LISTS[key];
  const items = state[key] || [];
  return `
    <section class="panel">
      <div class="panel__head">
        <h2>${cfg.title}</h2>
        <button class="btn btn--primary btn--sm" data-act="add" data-list="${key}">+ Agregar</button>
        ${cfg.hint ? `<p>${cfg.hint}</p>` : ""}
      </div>
      ${items.map((item, i) => `
        <div class="item${cfg.image ? "" : " item--noimg"}${item.disponible === false ? " is-out" : ""}">
          ${cfg.image ? `<img class="item__thumb" src="${esc(item.img || "assets/logo.png")}" alt="" data-thumb="${key}.${i}">` : ""}
          <div class="item__fields">${cfg.fields.map((f) => fieldHtml(f, item, `${key}.${i}`)).join("")}</div>
          <div class="item__actions">
            <button class="btn btn--ghost btn--sm" data-act="up" data-list="${key}" data-i="${i}" ${i === 0 ? "disabled" : ""} title="Subir">↑</button>
            <button class="btn btn--ghost btn--sm" data-act="down" data-list="${key}" data-i="${i}" ${i === items.length - 1 ? "disabled" : ""} title="Bajar">↓</button>
            <button class="btn btn--danger btn--sm" data-act="del" data-list="${key}" data-i="${i}" title="Eliminar">✕</button>
          </div>
        </div>`).join("") || '<p class="muted">No hay elementos. Usa "+ Agregar".</p>'}
    </section>`;
}

function render() {
  $("#editor").innerHTML = SECTIONS[current]
    .map((key) => {
      if (key === "@aviso")
        return `<section class="panel"><div class="panel__head"><h2>Aviso destacado</h2>
          <p>Aparece como una franja verde arriba de la página. Déjalo vacío para ocultarlo. Ej: "Hoy tenemos sancocho de gallina 🍲".</p></div>
          <input type="text" id="aviso" value="${esc(state.aviso)}" placeholder="Escribe un aviso…"></section>`;
      if (key === "@incluye")
        return `<section class="panel"><div class="panel__head"><h2>Cada almuerzo incluye</h2><p>Un acompañamiento por línea.</p></div>
          <textarea id="incluye" rows="6">${esc(state.incluye.join("\n"))}</textarea></section>`;
      return listHtml(key);
    })
    .join("");
  updateSaveBar();
}

// ---------- Eventos del editor ----------
function onInput(e) {
  const el = e.target;
  if (el.id === "aviso") state.aviso = el.value;
  else if (el.id === "incluye") state.incluye = el.value.split("\n").map((s) => s.trim()).filter(Boolean);
  else if (el.dataset.path) {
    const [list, i] = el.dataset.path.split(".");
    const item = state[list][Number(i)];
    const { key, type } = el.dataset;
    if (type === "checkbox") {
      item[key] = el.checked;
      el.closest(".item")?.classList.toggle("is-out", key === "disponible" && !el.checked);
    } else if (type === "days") {
      item[key] = $$(`[data-path="${el.dataset.path}"][data-key="${key}"]`).filter((c) => c.checked).map((c) => Number(c.dataset.day));
    } else if (type === "number") item[key] = Number(el.value) || 0;
    else item[key] = el.value;

    if (key === "img") {
      const thumb = $(`[data-thumb="${el.dataset.path}"]`);
      if (thumb) thumb.src = el.value || "assets/logo.png";
    }
  }
  updateSaveBar();
}

function onClick(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const list = state[btn.dataset.list];
  const i = Number(btn.dataset.i);
  switch (btn.dataset.act) {
    case "add": list.push(structuredClone(LISTS[btn.dataset.list].blank)); break;
    case "del":
      if (!confirm(`¿Eliminar "${list[i].nombre || list[i].titulo || list[i].etiqueta}"?`)) return;
      list.splice(i, 1); break;
    case "up": [list[i - 1], list[i]] = [list[i], list[i - 1]]; break;
    case "down": [list[i + 1], list[i]] = [list[i], list[i + 1]]; break;
  }
  render();
}

async function save() {
  const btn = $("#saveBtn");
  btn.disabled = true;
  btn.textContent = "Guardando…";
  try {
    const data = structuredClone(state);
    delete data.actualizado;
    await saveContent(data);
    saved = structuredClone(state);
    toast("✅ Cambios publicados en el sitio");
  } catch (err) {
    console.error(err);
    toast("No se pudo guardar: " + (err.code === "permission-denied" ? "tu usuario no tiene permiso." : err.message), true);
  } finally {
    btn.textContent = "Guardar cambios";
    updateSaveBar();
  }
}

// ---------- Inicio de sesión ----------
const AUTH_ERRORS = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
  "auth/invalid-email": "El correo no es válido.",
};

async function showApp(email) {
  $("#loginView").hidden = true;
  $("#appView").hidden = false;
  $("#userEmail").textContent = demoMode ? "Modo demostración (solo este navegador)" : email;
  const data = await loadContent();
  delete data.actualizado;
  saved = structuredClone(data);
  state = structuredClone(data);
  render();
}
function showLogin() {
  $("#appView").hidden = true;
  $("#loginView").hidden = false;
}

function init() {
  $("#editor").addEventListener("input", onInput);
  $("#editor").addEventListener("change", onInput);
  $("#editor").addEventListener("click", onClick);
  $("#saveBtn").addEventListener("click", save);
  $("#discardBtn").addEventListener("click", () => { state = structuredClone(saved); render(); });
  $("#sectionTabs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("#sectionTabs button").forEach((x) => x.classList.toggle("is-active", x === b));
    current = b.dataset.sec;
    render();
  });
  addEventListener("beforeunload", (e) => { if (state && isDirty()) e.preventDefault(); });

  if (demoMode) {
    $("#demoNote").hidden = false;
    $("#credFields").hidden = true;
    $$("#credFields input").forEach((i) => (i.required = false));
    $("#forgotBtn").hidden = true;
    $("#loginBtn").textContent = "Entrar en modo demostración";
    $("#loginForm").addEventListener("submit", (e) => { e.preventDefault(); showApp(); });
    // Shift + clic en "Salir" restablece el contenido de demostración
    $("#logoutBtn").addEventListener("click", (e) => {
      if (e.shiftKey && confirm("¿Restablecer el contenido original?")) { resetDemo(); location.reload(); return; }
      showLogin();
    });
    showLogin();
    return;
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#loginBtn");
    btn.disabled = true;
    $("#loginError").textContent = "";
    try {
      await login($("#email").value.trim(), $("#password").value);
    } catch (err) {
      $("#loginError").textContent = AUTH_ERRORS[err.code] || "No se pudo iniciar sesión.";
    } finally {
      btn.disabled = false;
    }
  });
  $("#forgotBtn").addEventListener("click", async () => {
    const email = $("#email").value.trim();
    if (!email) return ($("#loginError").textContent = "Escribe tu correo y vuelve a pulsar el enlace.");
    try {
      await resetPassword(email);
      toast("Te enviamos un correo para restablecer la contraseña.");
    } catch {
      toast("No se pudo enviar el correo.", true);
    }
  });
  $("#logoutBtn").addEventListener("click", async () => {
    if (isDirty() && !confirm("Tienes cambios sin guardar. ¿Salir de todas formas?")) return;
    await logout();
  });
  onUser((user) => (user ? showApp(user.email) : showLogin()));
}

init();
