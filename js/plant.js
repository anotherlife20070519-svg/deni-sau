const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pad = (n) => String(n).padStart(2, "0");

$("#menuBtn").addEventListener("click", (e) => {
  const open = $("#navLinks").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});

const id = new URLSearchParams(location.search).get("id");
const i = Math.max(0, PLANTS.findIndex((p) => p.id === id));
const p = PLANTS[i];
const prev = PLANTS[(i - 1 + PLANTS.length) % PLANTS.length];
const next = PLANTS[(i + 1) % PLANTS.length];
document.title = `${p.kk} — Дені саудың жаны сау`;
document.documentElement.style.scrollPaddingTop = "124px";

const figure = (im, cls) => `
  <figure class="${cls}" style="margin:0">
    <img src="${COMMONS(im.file, cls === "sheet" ? 900 : 1000)}" alt="${esc(p.kk)}">
    <figcaption class="credit">${esc(im.credit)} · ${esc(im.license)} ·
      <a href="${COMMONS_PAGE(im.file)}" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption>
  </figure>`;
const main = p.plate || p.img;
const extra = p.plate ? p.img : null;

const recipe = (r) => `
  <article class="recipe">
    <div class="recipe-head">
      <div><div class="label">${esc(r.kind)}</div><h3>${esc(r.title)}</h3></div>
      <span class="use">${esc(r.use)}</span>
    </div>
    <h4>Не керек</h4>
    <ul class="ingr">${r.ingredients.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <h4>Қалай дайындау керек</h4>
    <ol class="steps">${r.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
    ${r.note ? `<div class="rnote">${esc(r.note)}</div>` : ""}
    ${r.basis ? `<div class="rbasis"><span class="label">Негізі</span> ${esc(r.basis)}</div>` : ""}
  </article>`;

const TABS = [
  ["sipattama", "Сипаттамасы"],
  ["dayindau", "Дайындау"],
  ["tarih", "Тарихы мен тілі"],
  ["saqtyq", "Сақтық"],
];

$("#page").innerHTML = `
  <div class="crumbs"><a href="index.html">Басты бет</a> / <a href="index.html#osimdikter">Өсімдіктер</a> / ${esc(p.kk)}</div>
  <div class="plant">
    <div class="plant-media">
      ${figure(main, main.photo ? "photo" : "sheet")}
      ${extra ? figure(extra, "photo") : ""}
    </div>
    <div>
      <div class="label">№ ${pad(i + 1)} · ${esc(p.family)}</div>
      <h1>${esc(p.kk)}${p.toxic ? '<span class="badge">Улы</span>' : ""}</h1>
      <div class="names"><span class="lat">${esc(p.lat)}</span> · ${esc(p.ru)}</div>

      <table class="label-table">
        <caption class="label">Гербарий жапсырмасы</caption>
        <tr><th>Толық атауы</th><td>${esc(p.full)}</td></tr>
        <tr><th>Қолданылатын бөлігі</th><td>${esc(p.partText)}</td></tr>
        <tr><th>Жинау уақыты</th><td>${esc(p.harvest)}</td></tr>
        <tr><th>Сыр өңірінде</th><td>${esc(p.habitat)}</td></tr>
      </table>

      <nav class="p-tabs" id="pTabs">${TABS.map(([a, t]) => `<a href="#${a}">${t}</a>`).join("")}</nav>

      <section class="p-sec" id="sipattama">
        <h2>Сипаттамасы</h2>
        <p>${esc(p.desc)}</p>
        <h4>Халық медицинасында</h4>
        <p>${esc(p.traditional)}</p>
        <h4>Ғылым не дейді</h4>
        <p>${esc(p.science)}</p>
      </section>

      <section class="p-sec" id="dayindau">
        <h2>Дайындау</h2>
        ${p.recipes.length
          ? p.recipes.map(recipe).join("")
          : `<p>Бұл өсімдік халық тұрмысында көбіне шаруашылық мақсатта қолданылған. Үйде дайындауға ұсынылатын қауіпсіз рецепт жоқ.</p>`}
        <p style="font-size:15px;color:var(--ink-faint)">Жалпы әдістер: <a href="index.html#adister">тұнба, қайнатпа, жақпа май, аластау</a>.</p>
      </section>

      <section class="p-sec" id="tarih">
        <h2>Тарихы мен тілі</h2>
        <div class="word"><div class="label" style="margin-bottom:6px">Сөз сыры</div>${esc(p.word)}</div>
        <div class="word"><div class="label" style="margin-bottom:6px">Тарих пен дәстүр</div>${esc(p.lore)}</div>
      </section>

      <section class="p-sec" id="saqtyq">
        <h2>Сақтық шаралары</h2>
        <ul class="caution">${p.caution.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
        <div class="notice" style="margin-top:18px">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3z" stroke="currentColor" stroke-width="1.6"/><path d="M12 10v5M12 17.5v.5" stroke="currentColor" stroke-width="1.8"/></svg>
          <p>Бұл мәлімет танымдық мақсатта берілген және дәрігердің кеңесін алмастырмайды.</p>
        </div>
      </section>

      <details class="refs">
        <summary>Дереккөздер</summary>
        <ol>${p.sources.map((k) => SRC[k]).map((s) => `<li>${esc(s.t)}${s.url ? ` <a href="${s.url}" target="_blank" rel="noopener">сілтеме</a>` : ""}</li>`).join("")}</ol>
      </details>
    </div>
  </div>
  <nav class="p-nav">
    <a href="plant.html?id=${prev.id}"><span>← Алдыңғы</span><b>${esc(prev.kk)}</b></a>
    <a href="plant.html?id=${next.id}"><span>Келесі →</span><b>${esc(next.kk)}</b></a>
  </nav>`;

/* Белсенді бөлімді белгілеу */
const tabs = [...document.querySelectorAll("#pTabs a")];
const secs = tabs.map((a) => document.querySelector(a.getAttribute("href")));
const mark = () => {
  const y = scrollY + 160;
  let cur = 0;
  secs.forEach((s, k) => { if (s.offsetTop <= y) cur = k; });
  tabs.forEach((a, k) => a.classList.toggle("on", k === cur));
};
addEventListener("scroll", mark, { passive: true });
mark();
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
