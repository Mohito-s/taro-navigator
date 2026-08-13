const ARCADES = [
  { card: "Шут", kw: "Новое начало" },
  { card: "Маг", kw: "Воля и мастерство" },
  { card: "Верховная Жрица", kw: "Интуиция и тайна" },
  { card: "Императрица", kw: "Изобилие и забота" },
  { card: "Император", kw: "Порядок и власть" },
  { card: "Иерофант", kw: "Знание и традиция" },
  { card: "Влюблённые", kw: "Выбор и союз" },
  { card: "Колесница", kw: "Движение и победа" },
  { card: "Сила", kw: "Внутренняя мощь" },
  { card: "Отшельник", kw: "Мудрость и уединение" },
  { card: "Колесо Фортуны", kw: "Перемены и циклы" },
  { card: "Справедливость", kw: "Баланс и честность" },
  { card: "Повешенный", kw: "Пересмотр и пауза" },
  { card: "Смерть", kw: "Трансформация" },
  { card: "Умеренность", kw: "Гармония и мера" },
  { card: "Дьявол", kw: "Искушение и тени" },
  { card: "Башня", kw: "Прорыв и крушение" },
  { card: "Звезда", kw: "Надежда и вдохновение" },
  { card: "Луна", kw: "Интуиция и иллюзия" },
  { card: "Солнце", kw: "Радость и успех" },
  { card: "Суд", kw: "Пробуждение и призвание" },
  { card: "Мир", kw: "Целостность и завершение" },
];

const ARCANA_TEXT = {
  0: "Шут открывает начало: чистый лист, шаг в неизвестность с цветком в руке. Ты не боишься быть наивным и пробуешь то, что другие считают рискованным. Важно сохранить дерзость новичка, но учиться видеть край обрыва.",
  1: "Маг собирает силы стихий в одной точке: твоё слово становится действием. У тебя есть редкий дар воплощать идеи и влиять на реальность. Главный вызов — выбирать, во имя чего применять эту силу.",
  2: "Жрица хранит знания, недоступные рассудку, и слышит шёпот подсознания. Ты чувствуешь ситуацию целиком, ещё не видя деталей. Учись доверять этому внутреннему голосу и молчанию, из которого он рождается.",
  3: "Императрица — щедрость природы: рост, творчество, забота о близких. Ты способен создавать красоту и тепло вокруг себя и рядом с другими. Не бойся показывать мягкость — это твоя самая мощная магия.",
  4: "Император строит структуру там, где был хаос: границы, правила, опора. Ты умеешь брать ответственность и держать слово. Помни: настоящая сила — в заботе о тех, кем ты управляешь.",
  5: "Иерофант — наставник поколений, посвящённый в учение. Ты видишь смысл в традициях и учишься у тех, кто шёл раньше. Твоя миссия — передавать знание дальше, оставаясь открытым к новому пониманию.",
  6: "Влюблённые стоят у развилки сердца: выбор между зовом разума и зовом души. Ты ценишь связь, честность и гармонию в отношениях. Ключ — выбирать осознанно и нести ответственность за своё решение.",
  7: "Колесница мчится вперёд, управляемая волей и направлением. Ты умеешь двигаться к цели, преодолевая препятствия и не слушая сомнения. Держи поводья уверенно — и путь откроется сам.",
  8: "Сила — не кулаки, а смелость быть нежным и стойким одновременно. Ты можешь укрощать хаос улыбкой и словом, а не принуждением. Твоя мощь растёт, когда ты действуешь из сердца.",
  9: "Отшельник несёт свет фонаря в тишине внутреннего поиска. Иногда тебе нужно отойти, чтобы увидеть суть. В одиночестве ты находишь ответы, которыми потом согреешь других.",
  10: "Колесо вращается: взлёты сменяются спадами, и всё повторяется на новом витке. Ты часть больших циклов судьбы. Мудрость — плыть по течению перемен, зная, что после любой зимы приходит весна.",
  11: "Справедливость взвешивает поступки: каждое действие возвращается эхом. Ты ценишь правду и причинно-следственные связи в жизни. Будь честным к себе — и весы мира будут к тебе милосердны.",
  12: "Повешенный видит мир по-другому: пауза, в которой созревают новые смыслы. То, что кажется тупиком, на самом деле — приглашение перевернуть взгляд. Прими остановку — и она обернётся прозрением.",
  13: "Смерть здесь — не конец, а пауза неба: завершение этапа и перерождение. Ты способен отпускать прошлое и становиться заново. Не держись за пепел — из него расцветает новое.",
  14: "Умеренность смешивает противоположности в единый поток: золотой баланс, ангельская мера. Ты умеешь ладить с собой и находить середину у любых крайностей. Терпение — твоя суперсила.",
  15: "Дьявол показывает цепи, которые мы надеваем сами: привычки, страхи, иллюзии силы. Ты хорошо видишь, что удерживает людей, включая себя. Осознать замок — уже наполовину освободиться от него.",
  16: "Башня рушится, чтобы в фундамент не попала ложь: внезапный перелом старого строя. Такова очищающая гроза, после которой видны небо и земля. Не бойся потерь — они расчищают место для настоящего.",
  17: "Звезда светит в ночи как обещание, что путь прав и стоит идти. Ты умеешь вдохновлять себя и других даже в самый глубокий мрак. Верь в то, что зовёт — и небо ответит.",
  18: "Луна освещает сферу снов, прошлое и тайные течения подсознания. Ты остро чувствуешь миры, скрытые от глаз. Различай свет и его отражение в воде — и не бойся глубины своей души.",
  19: "Солнце — победа света: ясность, тепло, признание и детская радость. Ты способен сиять настолько, что согреваешь всех вокруг. Прими свою силу и не притворяйся меньше, чем ты есть.",
  20: "Суд зовёт из глубины: воскреснуть для того, для чего ты родился. Ты уже встречал свои прежние уроки и теперь готов прозвучать в полный голос. Услышь свой зов — он внутри.",
  21: "Мир — танец целого: завершение большого пути и гармония всех частей. Ты способен видеть взаимосвязь всего и находить целостность даже в противоречиях. Финал одного круга — начало следующего.",
};

const SIGNS = {
  Овен: { dates: "21.03 – 19.04", element: "Огонь", planet: "Марс", icon: "♈︎" },
  Телец: { dates: "20.04 – 20.05", element: "Земля", planet: "Венера", icon: "♉︎" },
  Близнецы: { dates: "21.05 – 21.06", element: "Воздух", planet: "Меркурий", icon: "♊︎" },
  Рак: { dates: "22.06 – 22.07", element: "Вода", planet: "Луна", icon: "♋︎" },
  Лев: { dates: "23.07 – 22.08", element: "Огонь", planet: "Солнце", icon: "♌︎" },
  Дева: { dates: "23.08 – 22.09", element: "Земля", planet: "Меркурий", icon: "♍︎" },
  Весы: { dates: "23.09 – 22.10", element: "Воздух", planet: "Венера", icon: "♎︎" },
  Скорпион: { dates: "23.10 – 22.11", element: "Вода", planet: "Плутон", icon: "♏︎" },
  Стрелец: { dates: "23.11 – 21.12", element: "Огонь", planet: "Юпитер", icon: "♐︎" },
  Козерог: { dates: "22.12 – 19.01", element: "Земля", planet: "Сатурн", icon: "♑︎" },
  Водолей: { dates: "20.01 – 18.02", element: "Воздух", planet: "Уран", icon: "♒︎" },
  Рыбы: { dates: "19.02 – 20.03", element: "Вода", planet: "Нептун", icon: "♓︎" },
};

const POSITIONS = [
  "Личность",
  "Таланты",
  "Духовные задачи",
  "Опыт прошлого",
  "Маска (ложный аркан)",
  "Творческая сила",
  "Путь реализации",
  "Любовь и отношения",
  "Кармические уроки",
  "Предназначение",
];

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

const RANGES = [
  [[1, 20], [2, 18], "Водолей"],
  [[2, 19], [3, 20], "Рыбы"],
  [[3, 21], [4, 19], "Овен"],
  [[4, 20], [5, 20], "Телец"],
  [[5, 21], [6, 21], "Близнецы"],
  [[6, 22], [7, 22], "Рак"],
  [[7, 23], [8, 22], "Лев"],
  [[8, 23], [9, 22], "Дева"],
  [[9, 23], [10, 22], "Весы"],
  [[10, 23], [11, 22], "Скорпион"],
  [[11, 23], [12, 21], "Стрелец"],
  [[12, 22], [12, 31], "Козерог"],
  [[1, 1], [1, 19], "Козерог"],
];

function reduce(n) {
  return Math.abs(n) % 22;
}

function zodiac(day, month) {
  const cur = month * 100 + day;
  for (const [[sm, sd], [em, ed], name] of RANGES) {
    const s = sm * 100 + sd;
    const e = em * 100 + ed;
    if (cur >= s && cur <= e) return name;
  }
  return "Козерог";
}

function arcana(day, month, year) {
  const ds = (n) => String(n).split("").reduce((a, c) => a + Number(c), 0);
  const digitsAll = ds(year) + ds(month) + ds(day);
  const dsYear = ds(year);
  const values = [
    reduce(digitsAll),
    reduce(day),
    reduce(month),
    reduce(dsYear),
    reduce(day + month - year),
    reduce(day + month),
    reduce(month + dsYear),
    reduce(day + dsYear),
    reduce(day - month),
  ];
  values.push(reduce(values.slice(0, 9).reduce((a, b) => a + b, 0)));
  return values.map((v, i) => ({ n: v, pos: POSITIONS[i], ...ARCADES[v] }));
}

const $ = (id) => document.getElementById(id);

function renderResult(day, month, year) {
  const signName = zodiac(day, month);
  const sign = SIGNS[signName];
  const arc = arcana(day, month, year);
  lastArc = arc;
  window.__taroCalc = { day, month, year };

  const wa = document.getElementById("webapp-actions");
  if (wa && window.__taroCanSend) wa.hidden = false;

  $("zodiac-card").innerHTML = `
    <div class="zodiac__ring">
      <span class="zodiac__icon">${sign.icon}</span>
    </div>
    <div class="zodiac__body">
      <h3>${signName}</h3>
      <div class="zodiac__tags">
        <span class="zodiac__tag zodiac__tag--elem">Стихия ${sign.element}</span>
        <span class="zodiac__tag zodiac__tag--plnt">Планета ${sign.planet}</span>
        <span class="zodiac__tag">${sign.dates}</span>
      </div>
      <p>Дата рождения: ${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}</p>
    </div>`;

  $("arcana-grid").innerHTML = arc
    .map(
      (a, i) => `
      <div class="arcana__item glass" data-idx="${i}" tabindex="0" role="button" aria-label="Подробнее: ${a.pos} — ${a.card}" style="animation-delay:${i * 60}ms">
        <div class="arcana__inner">
          <div class="arcana__sheen"></div>
          <div class="arcana__num">АРКАН ${ROMAN[a.n]}</div>
          <div class="arcana__title">${a.pos}</div>
          <div class="arcana__card">${a.card}</div>
          <span class="arcana__kw">${a.kw}</span>
          <span class="arcana__more">Подробнее ›</span>
        </div>
      </div>`
    )
    .join("");

  bindTilt();

  $("result").hidden = false;
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

function validate(day, month, year, daysInMonth) {
  if (!day || !month || !year || year < 1900 || year > 2100) return "Введи корректную дату.";
  if (month < 1 || month > 12) return "Месяц должен быть от 1 до 12.";
  if (day < 1 || day > daysInMonth) return `В этом месяце дней от 1 до ${daysInMonth}.`;
  return "";
}

$("run").addEventListener("click", () => {
  const year = Number($("year").value);
  const month = Number($("month").value);
  const day = Number($("day").value);
  const days = new Date(year, month, 0).getDate();
  const err = validate(day, month, year, days);
  if (err) {
    $("calc-error").textContent = err;
    $("calc-error").hidden = false;
    $("result").hidden = true;
    return;
  }
  $("calc-error").hidden = true;
  renderResult(day, month, year);
});

["day", "month", "year"].forEach((id) => {
  $(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("run").click();
  });
});

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

let lastArc = [];
let lastModalArcana = null;
const modal = $("arcana-modal");

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function openModal(item) {
  lastModalArcana = item.n;
  $("modal-num").textContent = `АРКАН ${ROMAN[item.n]}`;
  $("modal-pos").textContent = item.pos;
  $("modal-card").textContent = item.card;
  $("modal-kw").textContent = item.kw;
  $("modal-text").textContent = ARCANA_TEXT[item.n] || "Эта карта хранит свою тайну.";
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

document.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".arcana__item");
  if (cardEl) {
    openModal(lastArc[Number(cardEl.dataset.idx)]);
    return;
  }
  if (e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && e.target.classList && e.target.classList.contains("arcana__item")) {
    openModal(lastArc[Number(e.target.dataset.idx)]);
  }
});

// Объёмный наклон карт за курсором (3D Tilt)
function bindTilt() {
  document.querySelectorAll(".arcana__item").forEach((el) => {
    if (el.__tilt) return;
    el.__tilt = true;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 15;
      const ry = (px - 0.5) * 15;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

// === Натальная карта: 3D-круг Зодиака ===
function renderNatalChart() {
  const disc = document.getElementById("natal-disc");
  if (!disc) return;
  const names = Object.keys(SIGNS);
  const glyphs = names.map((n) => SIGNS[n].icon);
  const cx = 200, cy = 200, R = 180;
  let segs = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 12;
    const x = cx + Math.cos(a) * (R - 26);
    const y = cy + Math.sin(a) * (R - 26);
    segs += `<text class="natal__glyph" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${glyphs[i]}</text>`;
    const a1 = (i / 12) * Math.PI * 2;
    const a2 = ((i + 1) / 12) * Math.PI * 2;
    const x1 = cx + Math.cos(a1 - Math.PI / 2) * R;
    const y1 = cy + Math.sin(a1 - Math.PI / 2) * R;
    segs += `<line class="natal__tick" x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" />`;
  }
  // условные планеты (демо-раскладка)
  const planets = [
    { name: "☉", label: "Солнце", deg: 35 },
    { name: "☽", label: "Луна", deg: 120 },
    { name: "ASC", label: "Асцендент", deg: 210 },
  ];
  let dots = "";
  planets.forEach((p) => {
    const a = (p.deg / 360) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * (R * 0.62);
    const y = cy + Math.sin(a) * (R * 0.62);
    dots += `<circle class="natal__planet" cx="${x}" cy="${y}" r="6" />
      <text class="natal__planet-label" x="${x + 9}" y="${y + 4}">${p.label}</text>`;
  });

  disc.innerHTML = `
    <svg viewBox="0 0 400 400" aria-label="Натальная карта">
      <defs>
        <radialGradient id="discBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(62,42,116,0.95)" />
          <stop offset="58%" stop-color="rgba(22,18,52,0.92)" />
          <stop offset="100%" stop-color="rgba(6,8,22,0.97)" />
        </radialGradient>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(84,241,255,0.95)" />
          <stop offset="100%" stop-color="rgba(84,241,255,0)" />
        </radialGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#54f1ff" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#ff5fb2" />
        </linearGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <circle cx="200" cy="200" r="192" fill="url(#discBg)" stroke="url(#ringGrad)" stroke-width="2.5" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(84,241,255,0.35)" stroke-width="1" />
      <circle cx="200" cy="200" r="96" fill="none" stroke="rgba(139,92,246,0.5)" stroke-width="1" />
      <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(255,95,178,0.32)" stroke-width="1" stroke-dasharray="3 6" />

      <g class="natal__spin" filter="url(#glow)">
        ${segs}
      </g>

      ${dots}

      <circle cx="200" cy="200" r="36" fill="url(#core)" />
      <text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-size="28" fill="#ffffff">☉</text>
    </svg>`;

  // лёгкий наклон всего диска за курсором
  const chart = document.getElementById("natal-chart");
  if (chart) {
    chart.addEventListener("pointermove", (e) => {
      const r = chart.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      disc.style.transform = `rotateX(${8 - py * 14}deg) rotateY(${px * 18}deg)`;
    });
    chart.addEventListener("pointerleave", () => {
      disc.style.transform = "";
    });
  }
}
renderNatalChart();

// 3D-звёзды вокруг натального диска (наш космический стиль)
(function fillNatalStars() {
  const wrap = document.getElementById("natal-stars");
  if (!wrap) return;
  const cls = ["", "natal__star--pink", "natal__star--violet"];
  const count = 34;
  let html = "";
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const s = (Math.random() * 3 + 1.5).toFixed(1);
    const z = (Math.random() * 120 - 40).toFixed(0);
    const d = (Math.random() * 3.6).toFixed(2);
    html += `<span class="natal__star ${cls[i % 3]}" style="left:${x}%;top:${y}%;--s:${s}px;transform:translateZ(${z}px);animation-delay:${d}s"></span>`;
  }
  wrap.innerHTML = html;
})();

const natalForm = document.getElementById("natal-form");
if (natalForm) {
  natalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = document.querySelector(".natal__note");
    if (note) note.textContent = "Карта обновлена (демо). Точный расчёт домов и аспектов появится в ИИ-разборе бота.";
  });
}

// Telegram WebApp: прячем лишние «открыть бота» CTA, применяем тему и мост к боту
function initTelegram() {
  if (window.__taroInited) return;
  const tg = window.Telegram && window.Telegram.WebApp;
  // Скрываем CTA, как только мы ВНУТРИ Telegram WebApp (объект WebApp существует).
  // Скрипт Telegram иногда инъектируется позже загрузки страницы — опрашиваем.
  // initData может быть пустым в некоторых клиентах — на его наличие НЕ завязываем
  // само скрытие, иначе CTA остаются видимыми.
  if (!tg) {
    window.__taroTgTries = (window.__taroTgTries || 0) + 1;
    if (window.__taroTgTries <= 80) setTimeout(initTelegram, 150);
    return;
  }
  window.__taroInited = true;
  window.__taroWebApp = true;
  window.__taroCanSend = !!tg.initData;
  tg.ready();
  tg.expand();
  document.body.classList.add("in-webapp");

  // Тема Telegram
  const tp = tg.themeParams || {};
  const root = document.documentElement;
  const setVar = (name, val) => val && root.style.setProperty(name, val);
  setVar("--tg-bg", tp.bg_color);
  setVar("--tg-text", tp.text_color);
  setVar("--tg-hint", tp.hint_color);
  setVar("--tg-btn", tp.button_color);
  setVar("--tg-btn-text", tp.button_text_color);

  // Кнопка «Закрыть»
  const closeBtn = document.getElementById("webapp-close");
  if (closeBtn) {
    closeBtn.hidden = false;
    closeBtn.addEventListener("click", () => tg.close());
  }

  // Действия: сохранить профиль / купить разбор
  const sendToBot = (type) => {
    if (!window.__taroCanSend) {
      alert("Нет данных сессии Telegram — откройте мини-апп из бота.");
      return;
    }
    const c = window.__taroCalc || {};
    tg.sendData(JSON.stringify(Object.assign({ type }, c)));
  };
  const saveBtn = document.getElementById("wa-save");
  const buyBtn = document.getElementById("wa-buy");
  if (saveBtn) saveBtn.addEventListener("click", () => sendToBot("save"));
  if (buyBtn) buyBtn.addEventListener("click", () => sendToBot("buy"));

  // Показываем действия, если результат уже посчитан и можно отправить данные
  const wa = document.getElementById("webapp-actions");
  if (wa && window.__taroCalc && window.__taroCanSend) wa.hidden = false;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTelegram);
} else {
  initTelegram();
}
// На случай поздней инъекции скрипта Telegram
setTimeout(initTelegram, 300);
window.addEventListener("telegramWebviewReady", initTelegram);

// Внутри WebApp кнопка аркана отправляет данные боту вместо ссылки
document.addEventListener("click", (e) => {
  const cta = e.target.closest("#modal-cta");
  if (cta && window.__taroWebApp) {
    e.preventDefault();
    if (!window.__taroCanSend) {
      alert("Нет данных сессии Telegram — откройте мини-апп из бота.");
      return;
    }
    const c = window.__taroCalc || {};
    window.Telegram.WebApp.sendData(
      JSON.stringify(Object.assign({ type: "buy", arcana_n: lastModalArcana }, c))
    );
  }
});

renderResult(12, 5, 1998);