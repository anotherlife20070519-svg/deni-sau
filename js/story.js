/* «Ауырып, жазылды» анимациялық әңгімесі */
(() => {
  const root = document.getElementById("story");
  if (!root) return;

  const SCENES = [
    { h: "Ауырып қалды", p: "Күз түсіп, Сыр бойында салқын жел соқты. Ерланға суық тиіп, ол қатты жөтеле бастады." },
    { h: "Шипа іздеу", p: "Анасы Сырдың жағасына барып, мияның тамырын қазып алды. «Мия тамыры қақырық түсіреді», — деді ол." },
    { h: "Қайнатпа", p: "Тамырды жуып, ұсақтап турады. 1 шай қасық тамырға 150 мл су құйып, 15 минут баяу отта қайнатты. Кейін 30 минут тұндырып, сүзді." },
    { h: "Ем ішу", p: "Ерлан қайнатпаны күніне 2–3 рет бір кеседен ішті. Анасы оны жылы көрпеге орап, қасынан шықпады." },
    { h: "Жазылды", p: "Бірнеше күннен соң жөтел басылды. Ерлан қайтадан далаға шықты. Дені саудың — жаны сау!" },
  ];
  const DUR = 7500;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scenes = [...root.querySelectorAll(".scene")];
  const dots = document.getElementById("storyDots");
  const play = document.getElementById("storyPlay");
  const next = document.getElementById("storyNext");
  let cur = 0, timer = null, playing = !reduce, visible = false;

  dots.innerHTML = SCENES.map((s, i) => `<button aria-label="${i + 1}: ${s.h}"><i></i></button>`).join("");
  dots.style.setProperty("--dur", DUR + "ms");
  const dotEls = [...dots.children];

  function show(i) {
    cur = (i + SCENES.length) % SCENES.length;
    scenes.forEach((s, k) => {
      const on = k === cur;
      if (on && !s.classList.contains("on")) {
        // анимацияларды басынан қайта бастау
        s.classList.remove("on");
        void s.getBoundingClientRect();
      }
      s.classList.toggle("on", on);
    });
    document.getElementById("storyStep").textContent = `${cur + 1} / ${SCENES.length}`;
    document.getElementById("storyH").textContent = SCENES[cur].h;
    document.getElementById("storyP").textContent = SCENES[cur].p;
    next.textContent = cur === SCENES.length - 1 ? "Басынан ↺" : "Келесі →";
    dotEls.forEach((d, k) => {
      d.classList.toggle("done", k < cur);
      d.classList.toggle("on", k === cur);
      d.classList.remove("run", "stop");
    });
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    const d = dotEls[cur];
    d.classList.remove("run", "stop");
    void d.offsetWidth;
    if (playing && visible) {
      d.classList.add("run");
      timer = setTimeout(() => show(cur + 1), DUR);
    } else {
      d.classList.add("stop");
    }
  }

  function setPlaying(v) {
    playing = v;
    play.classList.toggle("paused", !v);
    play.setAttribute("aria-label", v ? "Тоқтату" : "Ойнату");
    schedule();
  }

  next.addEventListener("click", () => { setPlaying(false); show(cur + 1); });
  document.getElementById("storyPrev").addEventListener("click", () => { setPlaying(false); show(cur - 1); });
  dotEls.forEach((d, k) => d.addEventListener("click", () => { setPlaying(false); show(k); }));
  play.addEventListener("click", () => setPlaying(!playing));

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, { threshold: 0.35 })
      .observe(root.querySelector(".story-stage"));
  } else {
    visible = true;
  }
  setPlaying(playing);
  show(0);
})();
