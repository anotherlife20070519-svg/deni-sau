const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pad = (n) => String(n).padStart(2, "0");
const cardImg = (p) => p.plate || p.img;

/* ---------- Мәзір ---------- */
$("#menuBtn").addEventListener("click", (e) => {
  const open = $("#navLinks").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
$("#navLinks").addEventListener("click", (e) => {
  if (e.target.tagName === "A") $("#navLinks").classList.remove("open");
});

/* ---------- Өсімдіктер ---------- */
const FILTERS = [
  { id: "all", t: "Барлығы", f: () => true },
  { id: "тамыр", t: "Тамыры", f: (p) => p.part.includes("тамыр") },
  { id: "жапырақ", t: "Жапырағы", f: (p) => p.part.includes("жапырақ") || p.part.includes("шөп") },
  { id: "гүл", t: "Гүлі", f: (p) => p.part.includes("гүл") },
  { id: "toxic", t: "Улы өсімдіктер", f: (p) => p.toxic },
];
let filter = "all";

$("#chips").innerHTML = FILTERS.map((f) => `<button class="chip${f.id === filter ? " on" : ""}" data-f="${f.id}">${f.t}</button>`).join("");
$("#chips").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  filter = b.dataset.f;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
  renderGrid();
});
$("#q").addEventListener("input", renderGrid);

function renderGrid() {
  const q = $("#q").value.trim().toLowerCase();
  const f = FILTERS.find((x) => x.id === filter).f;
  const list = PLANTS.filter((p) => f(p) && (!q || [p.kk, p.full, p.ru, p.lat].join(" ").toLowerCase().includes(q)));
  $("#grid").innerHTML = list.length
    ? list.map((p) => {
        const im = cardImg(p);
        return `<a class="card reveal" href="plant.html?id=${p.id}">
          <div class="pic${im.photo ? " photo" : ""}"><img loading="lazy" src="${COMMONS(im.file, 500)}" alt="${esc(p.kk)}"></div>
          <div class="no"><span>№ ${pad(PLANTS.indexOf(p) + 1)}</span>${p.toxic ? '<span class="warn-dot">● улы</span>' : ""}</div>
          <h3>${esc(p.kk)}</h3>
          <div class="lat">${esc(p.lat)}</div>
          <p>${esc(p.short)}</p>
        </a>`;
      }).join("")
    : `<div class="empty">Ештеңе табылмады. Басқа сөзбен іздеп көріңіз.</div>`;
  observe();
}

/* ---------- Тарих ---------- */
$("#timeline").innerHTML = HISTORY.map((h) => `
  <div class="t-item reveal">
    <div class="t-when">${esc(h.when)}</div>
    <div><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>
  </div>`).join("");

/* ---------- Әдістер ---------- */
const RELATED = {
  tunba: ["tuimedaq", "zhalbyz", "zhusan"],
  qainatpa: ["miya", "baqbaq", "zhantaq", "zhynghyl"],
  zhaqpa: ["tuimedaq"],
  alastau: ["adyraspan", "zhusan"],
};
$("#mTabs").innerHTML = METHODS.map((m, i) =>
  `<button class="m-tab${i ? "" : " on"}" role="tab" data-m="${m.id}">${esc(m.title)}<small>${esc(m.sub)}</small></button>`).join("");
$("#mTabs").addEventListener("click", (e) => {
  const b = e.target.closest(".m-tab");
  if (!b) return;
  document.querySelectorAll(".m-tab").forEach((t) => t.classList.toggle("on", t === b));
  renderMethod(b.dataset.m);
});
function renderMethod(id) {
  const m = METHODS.find((x) => x.id === id);
  const rel = (RELATED[id] || []).map((pid) => PLANTS.find((p) => p.id === pid));
  $("#mPanel").innerHTML = `
    <h3>${esc(m.title)}</h3>
    <div class="sub">${esc(m.sub)}</div>
    <ol class="steps">${m.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    ${rel.length ? `<div class="m-related">Рецепттер: ${rel.map((p) => `<a href="plant.html?id=${p.id}#dayindau">${esc(p.kk)}</a>`).join("")}</div>` : ""}`;
}
renderMethod(METHODS[0].id);

/* ---------- Карта ---------- */
const placesEl = $("#places");
placesEl.innerHTML = PLACES.map((pl, i) => `
  <button class="place" data-i="${i}"><b>${esc(pl.name)}</b><span>${esc(pl.text)}</span></button>`).join("");
if (window.L) {
  const map = L.map("map", { scrollWheelZoom: false }).setView([44.9, 64.6], 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const markers = PLACES.map((pl) => {
    const links = (pl.plants || []).map((id) => {
      const p = PLANTS.find((x) => x.id === id);
      return `<a href="plant.html?id=${id}">${esc(p.kk)}</a>`;
    }).join(", ");
    return L.marker([pl.lat, pl.lng], {
      icon: L.divIcon({ className: "", html: `<div class="pin pin-${pl.kind}"></div>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
      title: pl.name,
    }).addTo(map).bindPopup(`<b>${esc(pl.name)}</b>${esc(pl.text)}${links ? `<br>Өсімдіктер: ${links}` : ""}`);
  });
  placesEl.addEventListener("click", (e) => {
    const b = e.target.closest(".place");
    if (!b) return;
    const i = +b.dataset.i;
    document.querySelectorAll(".place").forEach((x) => x.classList.toggle("on", x === b));
    map.flyTo([PLACES[i].lat, PLACES[i].lng], 8, { duration: 0.8 });
    markers[i].openPopup();
  });
}

/* ---------- Сөздік ---------- */
$("#gloss").innerHTML = GLOSSARY.map(([kk, ru, d]) => `
  <div class="g-item"><b>${esc(kk)}</b><span class="ru">${esc(ru)}</span><span>${esc(d)}</span></div>`).join("");

$("#statPlants").textContent = PLANTS.length;
$("#statMethods").textContent = METHODS.length;

/* ---------- Анимация және мәзір белгісі ---------- */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" })
  : null;
function observe() {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
}
renderGrid();

const navLinks = [...document.querySelectorAll(".nav-links a")];
const secs = navLinks.map((a) => document.querySelector(a.getAttribute("href")));
addEventListener("scroll", () => {
  const y = scrollY + 120;
  let cur = -1;
  secs.forEach((s, i) => { if (s && s.offsetTop <= y) cur = i; });
  navLinks.forEach((a, i) => a.classList.toggle("on", i === cur));
}, { passive: true });
