/* «Ауырып, жазылды» — үздіксіз анимациялық әңгіме */
(() => {
  const root = document.getElementById("story");
  if (!root) return;

  const SCENES = [
    { h: "Ауырып қалды", p: "Күз түсіп, Сыр бойында салқын жел соқты. Ерланға суық тиіп, ол қатты жөтеле бастады.", d: 7000 },
    { h: "Шипа іздеу", p: "Анасы Сырдың жағасына барып, мияның тамырын қазып алды. «Мия тамыры қақырық түсіреді», — деді ол.", d: 8000 },
    { h: "Қайнатпа", p: "Тамырды жуып, ұсақтап турады. 1 шай қасық тамырға 150 мл су құйып, 15 минут баяу отта қайнатты. Кейін 30 минут тұндырып, сүзді.", d: 9500 },
    { h: "Ем ішу", p: "Ерлан қайнатпаны күніне 2–3 рет бір кеседен ішті. Анасы оны жылы көрпеге орап, қасынан шықпады.", d: 8000 },
    { h: "Жазылды", p: "Бірнеше күннен соң жөтел басылды. Ерлан қайтадан далаға шықты. Дені саудың — жаны сау!", d: 9000 },
  ];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = root.querySelector(".story-stage svg");
  const scenes = [...root.querySelectorAll(".scene")];
  const prog = document.getElementById("storyProg");
  const play = document.getElementById("storyPlay");
  const text = root.querySelector(".story-text");
  const $id = (x) => document.getElementById(x);

  prog.innerHTML = SCENES.map((s, i) =>
    `<button style="flex-grow:${s.d}" aria-label="${i + 1}: ${s.h}"><i></i></button>`).join("");
  const segs = [...prog.querySelectorAll("i")];

  let cur = -1, started = false, playing = !reduce, visible = false;
  let elapsed = 0, last = 0;

  function setText(i) {
    text.classList.add("swap");
    setTimeout(() => {
      $id("storyStep").textContent = `${i + 1} / ${SCENES.length}`;
      $id("storyH").textContent = SCENES[i].h;
      $id("storyP").textContent = SCENES[i].p;
      text.classList.remove("swap");
    }, 280);
  }

  function go(i) {
    const prev = scenes[cur];
    cur = (i + SCENES.length) % SCENES.length;
    const s = scenes[cur];
    elapsed = 0;
    // жаңа сахна әрқашан үстінде тұрсын, анимациялары басынан басталсын
    s.classList.remove("on", "enter");
    s.style.setProperty("--kb", SCENES[cur].d + 1500 + "ms");
    svg.appendChild(s);
    void s.getBoundingClientRect();
    s.classList.add("on", "enter");
    if (prev && prev !== s) {
      setTimeout(() => { if (scenes[cur] !== prev) prev.classList.remove("on", "enter"); }, 1600);
    }
    segs.forEach((g, k) => g.style.setProperty("--p", k < cur ? 1 : 0));
    setText(cur);
  }

  function tick(now) {
    const dt = last ? now - last : 0;
    last = now;
    if (playing && visible && cur >= 0) {
      elapsed += dt;
      const d = SCENES[cur].d;
      segs[cur].style.setProperty("--p", Math.min(elapsed / d, 1));
      if (elapsed >= d) go(cur + 1);
    }
    requestAnimationFrame(tick);
  }

  function setPlaying(v) {
    playing = v;
    root.classList.toggle("paused", !v);
    play.classList.toggle("paused", !v);
    play.setAttribute("aria-label", v ? "Тоқтату" : "Ойнату");
  }

  play.addEventListener("click", () => setPlaying(!playing));
  $id("storyReplay").addEventListener("click", () => { go(0); setPlaying(true); });
  prog.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { go([...prog.children].indexOf(b)); }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      // бірінші рет көрінгенде әңгіме басынан басталады
      if (visible && !started) { started = true; go(0); }
    }, { threshold: 0.4 }).observe(root.querySelector(".story-stage"));
  } else {
    visible = started = true;
  }

  setPlaying(playing);
  go(0);
  requestAnimationFrame(tick);
})();
