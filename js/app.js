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

// Позиционно-зависимые вступления: одна карта в разных позициях звучит по-разному
const POSITION_INTROS = {
  "Личность": "Как ты проявляешься в мире, твой характер и первый импульс в любой ситуации.",
  "Таланты": "Природные дары, на которые можно опираться и которые стоит развивать.",
  "Духовные задачи": "То, с чем душа пришла в этот мир и чему ей предстоит научиться.",
  "Опыт прошлого": "Уроки прошлых воплощений, которые уже работают в твоей жизни.",
  "Маска (ложный аркан)": "Твоя видимая роль для окружающих — иногда она скрывает настоящее я.",
  "Творческая сила": "Канал созидания: где рождается вдохновение и что ты создаёшь легко.",
  "Путь реализации": "Как ты движешься к целям и какими способами достигаешь результата.",
  "Любовь и отношения": "Как ты любишь, что ищешь в партнёре и как строятся твои связи.",
  "Кармические уроки": "То, что нужно отпустить и проработать, чтобы расти дальше.",
  "Предназначение": "Направление большого пути и то, ради чего ты здесь.",
};

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

// === API полных ИИ-разборов (FastAPI на shadowlinkapp.online/api) ===
// Каждая вкладка рендерит свой полный разбор прямо здесь, без ухода в бота.
const TARO_API_BASE = "https://shadowlinkapp.online/api/v1";

async function taroApi(path, body) {
  const payload = Object.assign({ style: getSavedStyle().name }, body);
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg && tg.initData) payload.initData = tg.initData;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 80000);
  try {
    const res = await fetch(TARO_API_BASE + "/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data.text || "";
  } finally {
    clearTimeout(timer);
  }
}

// Безопасный рендер ИИ-текста: экранируем HTML, затем **жирный** и переносы строк
function renderAIText(text) {
  return String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\n/g, "<br>");
}

function setLoading(box, msg) {
  if (!box) return;
  box.innerHTML = `<div class="forecast__head"><span class="forecast__hed">${msg}</span></div><p class="forecast__loading">🪐 Считаем по звёздам…</p>`;
  box.hidden = false;
}

function showInlineResult(box, title, text) {
  if (!box) return;
  box.innerHTML = `
    <div class="forecast__head">
      <span class="forecast__hed">${title}</span>
      <span class="forecast__date">${fmtDate(Date.now(), true)}</span>
    </div>
    <p>${renderAIText(text)}</p>`;
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderResult(day, month, year, opts = {}) {
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
  if (!opts.skipScroll) {
    $("result").scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
  addHistory({
    type: "reads",
    icon: "🔮",
    title: `Расклад · ${zodiac(day, month)}`,
    subtitle: `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`,
    zodiac: zodiac(day, month),
    arcana: arcana(day, month, year).slice(0, 4),
  });
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
  const intro = POSITION_INTROS[item.pos];
  const base = ARCANA_TEXT[item.n] || "Эта карта хранит свою тайну.";
  $("modal-text").textContent = (intro ? `В позиции «${item.pos}» этот аркан означает: ${intro}\n\n` : "") + base;
  resetModalCta();
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

// Восстанавливаем CTA модалки как кнопку (после сайта он мог стать ссылкой в бота)
function resetModalCta() {
  const existing = document.getElementById("modal-cta");
  if (existing && existing.tagName !== "BUTTON") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = existing.className;
    btn.id = "modal-cta";
    btn.textContent = "🔮 Расширенный разбор этого аркана";
    existing.replaceWith(btn);
  }
}

// Локальный расширенный разбор аркана для сайта (без Telegram) — детальнее, чем короткий текст
function buildExtendedArcanaText(item) {
  const base = ARCANA_TEXT[item.n] || "Эта карта хранит свою тайну.";
  const d = new Date();
  const nowNum = reduce(d.getDate() + d.getMonth() + 1);
  const prompt = ARCADES[reduce(nowNum + item.n)] || item;
  return (
    `${base}\n\n` +
    `Позиция в твоей карте: ${item.pos}. Здесь этот аркан звучит как ` +
    `${item.kw.toLowerCase()} — ресурс, который проще всего включить в повседневности.\n\n` +
    `Энергия дня: ${prompt.card} (${prompt.kw}). Созвучная карта усиливает ` +
    `проявление этого аркана прямо сейчас — присмотрись к своему настроению и делам.\n\n` +
    `Практический ключ: проживи сегодня качество аркана «${item.card}» осознанно — ` +
    `одно небольшое действие в этом ключе откроет больше, чем долгие размышления.`
  );
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
function renderNatalChart(natal) {
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
  // реальные планеты из расчёта (эфемериды) либо демо-раскладка
  const chart = (natal && natal.chart) || null;
  let dots = "";
  function placeDot(lon, cls, glyph, label) {
    const a = (lon / 360) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * (R * 0.62);
    const y = cy + Math.sin(a) * (R * 0.62);
    dots += `<circle class="${cls}" cx="${x}" cy="${y}" r="5.5"><title>${label}</title></circle>
      <text class="natal__planet-label" x="${x + 9}" y="${y + 4}">${glyph}</text>`;
  }
  if (chart && chart.planets) {
    chart.planets.forEach((p) => placeDot(p.pos.lon, "natal__planet", p.icon, p.name + " — " + p.pos.label));
    if (chart.asc) placeDot(chart.asc.lon, "natal__planet--asc", "ASC", "Асцендент — " + chart.asc.label);
    if (chart.mc) placeDot(chart.mc.lon, "natal__planet--mc", "MC", "МС — " + chart.mc.label);
  } else {
    [
      { icon: "☉", label: "Солнце", deg: 35 },
      { icon: "☽", label: "Луна", deg: 120 },
      { icon: "ASC", label: "Асцендент", deg: 210 },
    ].forEach((p) => placeDot(p.deg, p.icon === "ASC" ? "natal__planet--asc" : "natal__planet", p.icon, p.label));
  }

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
  const chartWrap = document.getElementById("natal-chart");
  if (chartWrap) {
    chartWrap.addEventListener("pointermove", (e) => {
      const r = chartWrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      disc.style.transform = `rotateX(${8 - py * 14}deg) rotateY(${px * 18}deg)`;
    });
    chartWrap.addEventListener("pointerleave", () => {
      disc.style.transform = "";
    });
  }
}
const chartNatalInit = getSavedNatal();
renderNatalChart(chartNatalInit);
// Если сохранённая карта ещё без реального расчёта — считаем эфемериды на лету
if (chartNatalInit && chartNatalInit.day && !chartNatalInit.chart && window.TaroNatal) {
  TaroNatal.compute(chartNatalInit).then((chart) => {
    if (!chart) return;
    chartNatalInit.chart = chart;
    const brief = chartBrief(chart);
    chartNatalInit.planets = brief.planets;
    chartNatalInit.asc = brief.asc;
    chartNatalInit.mc = brief.mc;
    saveNatal(chartNatalInit);
    renderNatalChart(chartNatalInit);
  });
}

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

// === Натальная карта = ФУНДАМЕНТ: сразу сохраняется и используется везде ===
// Синхронизируем «текущую персону» со всеми экранами приложения
function syncNatalToApp(natal) {
  if (!natal || !natal.day) return;
  // калькулятор «Расклады»
  const dayEl = $("day"), monthEl = $("month"), yearEl = $("year");
  if (dayEl) dayEl.value = natal.day;
  if (monthEl) monthEl.value = natal.month;
  if (yearEl) yearEl.value = natal.year;
  renderResult(natal.day, natal.month, natal.year);
  // профиль
  renderProfile();
}

// Краткое представление расчёта для бота и localStorage (без тяжёлых полей)
function chartBrief(chart) {
  if (!chart) return null;
  return {
    planets: chart.planets.map((p) => ({ name: p.name, icon: p.icon, sign: p.pos.sign, deg: p.pos.degMin })),
    asc: chart.asc ? chart.asc.label : null,
    mc: chart.mc ? chart.mc.label : null,
    houses: chart.houses ? chart.houses.positions : null,
    aspects: chart.aspects.slice(0, 15).map((a) => `${a.a} ${a.icon} ${a.b} (${a.label}, орб ${a.orb}°)`),
    havePlace: chart.havePlace,
  };
}

// Короткая строка «: ☉ 12° Льва · …» для заметки под формой
function chartSummary(chart) {
  if (!chart || !chart.planets) return "";
  const parts = chart.planets.slice(0, 5).map((p) => `${p.icon} ${p.pos.degMin} ${p.pos.sign}`);
  let s = ": " + parts.join(" · ");
  if (chart.asc) s += ` · ASC ${chart.asc.degMin} ${chart.asc.sign}`;
  if (chart.mc) s += ` · MC ${chart.mc.degMin} ${chart.mc.sign}`;
  return s;
}

const natalForm = document.getElementById("natal-form");
if (natalForm) {
  natalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = document.querySelector(".natal__note");
    const d = Number(document.getElementById("n-day").value);
    const m = Number(document.getElementById("n-month").value);
    const y = Number(document.getElementById("n-year").value);
    const timeVal = document.getElementById("n-time").value || "";
    const cityVal = document.getElementById("n-city").value.trim() || "не указано";
    const nameVal = document.getElementById("n-name").value.trim();
    if (!d || !m || !y || y < 1900 || y > 2100 || d < 1 || d > 31 || m < 1 || m > 12) {
      if (note) note.textContent = "⚠️ Введи корректную дату рождения (день, месяц, год).";
      return;
    }
    const signName = zodiac(d, m);
    const arc = arcana(d, m, y);
    const natal = { day: d, month: m, year: y, time: timeVal, city: cityVal, name: nameVal, zodiac: signName, arcana: arc, savedAt: Date.now() };

    const finish = (chart) => {
      if (chart) {
        natal.chart = chart;
        const brief = chartBrief(chart);
        natal.planets = brief.planets;
        natal.asc = brief.asc;
        natal.mc = brief.mc;
      }
      saveNatal(natal);
      // Отправляем боту, чтобы натальная карта стала фундаментом и для сервера.
      // Вместе с данными уходит реальный расчёт планет (эфемериды).
      // Если Telegram WebView ещё не инициализирован — ставим в очередь,
      // initTelegram() отправит данные, как только будет готов (см. taroSend).
      taroSend(JSON.stringify({ type: "natal", day: d, month: m, year: y, time: timeVal, city: cityVal, name: nameVal, chart: chartBrief(chart) }));
      syncNatalToApp(natal);
      renderNatalChart(natal);
      if (note) {
        if (window.__taroCanSend) {
          note.innerHTML = `✅ Натальная карта <b>${signName}</b> построена${chartSummary(chart)} — основа раскладов и прогнозов.`;
        } else {
          note.innerHTML = `✅ Сохранено на этом устройстве (<b>${signName}</b>${chartSummary(chart)}). Для синхронизации с ботом открой мини-апп из Telegram.`;
        }
      }
    };

    if (window.TaroNatal) {
      if (note) note.textContent = "🪐 Считаем эфемериды…";
      TaroNatal.compute(natal).then(finish);
    } else {
      finish(null);
    }
  });
}

// Локальный расширенный прогноз по натальной карте (для сайта без Telegram).
// Чистая астрология: знак, стихия, планета — без карт Таро.
function buildExtendedNatalText() {
  const { day, month, year } = natalForForecast();
  const signName = zodiac(day, month);
  const sign = SIGNS[signName];
  const n = getSavedNatal() || {};
  const time = n.time || "";
  const city = n.city && n.city !== "не указано" ? n.city : "";
  const name = n.name || "";
  let chartText = "";
  const chart = n.chart || null;
  if (chart && chart.planets) {
    chartText =
      "Планеты в момент рождения (эфемериды):\n" +
      chart.planets.map((p) => `• ${p.icon} ${p.name} — ${p.pos.degMin} ${p.pos.sign}`).join("\n") +
      (chart.asc ? `\n• Асцендент — ${chart.asc.degMin} ${chart.asc.sign}` : "") +
      (chart.mc ? ` • МС — ${chart.mc.degMin} ${chart.mc.sign}` : "") +
      (chart.houses ? `\n• Дома планет: ${Object.keys(chart.houses.positions).slice(0, 4).map((k) => `${k} — ${chart.houses.positions[k]}-й`).join(", ")}` : "") +
      "\n\n";
  }
  return (
    `${name ? `Для: <b>${name}</b>\n` : ""}` +
    chartText +
    `Знак: <b>${signName}</b> · стихия ${sign.element} · планета ${sign.planet}\n\n` +
    (time ? `Время рождения: <b>${time}</b>\n` : "") +
    (city ? `Место рождения: <b>${city}</b>\n` : "") +
    `\n${sign.element}-знак даёт темперамент: ${sign.text} ` +
    `Солнечный знак определяет характер и жизненную энергию. ` +
    `Луна отвечает за эмоции и интуицию — прислушивайся к внутреннему голосу. ` +
    `Асцендент, рассчитанный по времени рождения${time ? ` (${time})` : ""}, ` +
    `показывает, как ты проявляешься в новых знакомствах и начинаниях.\n\n` +
    `Общий фон периода: энергия ${signName} усиливается к середине периода. ` +
    `Любовь и отношения резонируют с планетой ${sign.planet} — держи лёгкость и честность. ` +
    `Карьере помогает ритм стихии ${sign.element.toLowerCase()}: не форсируй события, ` +
    `а действуй последовательно, и месяц принесёт рост.`
  );
}

// Расширенный прогноз по натальной карте: полный ИИ-разбор прямо на вкладке.
// Сначала пробуем API; если недоступно — бот (в WebApp) или локальный текст (сайт).
const natalForecastBtn = document.getElementById("natal-forecast");
if (natalForecastBtn) {
  natalForecastBtn.addEventListener("click", async () => {
    const { day, month, year } = natalForForecast();
    const n = getSavedNatal() || {};
    const payload = {
      day,
      month,
      year,
      time: n.time || document.getElementById("n-time").value || "",
      city: n.city || document.getElementById("n-city").value || "",
      name: n.name || "",
      chart: n.chart ? chartBrief(n.chart) : undefined,
    };
    const box = document.getElementById("natal-extended");
    const prev = natalForecastBtn.textContent;
    natalForecastBtn.disabled = true;
    natalForecastBtn.textContent = "🪐 Считаем натальный разбор…";
    setLoading(box, "Полный разбор натальной карты");
    try {
      const text = await taroApi("natal", payload);
      if (text) {
        showInlineResult(box, "Полный разбор натальной карты", text);
        addHistory({ type: "natal", icon: "🌌", title: "Разбор натальной карты", subtitle: `${zodiac(day, month)} · ${fmtDate(Date.now(), true)}`, text });
        return;
      }
    } catch (err) {
      /* API недоступно — фоллбэк ниже */
    } finally {
      natalForecastBtn.disabled = false;
      natalForecastBtn.textContent = prev;
    }
    if (window.__taroWebApp) {
      taroSend(JSON.stringify({ type: "natal_forecast", day, month, year, time: payload.time, city: payload.city, chart: payload.chart }));
      if (box) box.hidden = true;
      return;
    }
    if (box) {
      showInlineResult(box, "Расширенный прогноз по натальной карте", buildExtendedNatalText());
    }
  });
}

// Фундамент: живой источник «текущей персоны» (taro_natal в localStorage).
// Читаем на лету, чтобы ввод нового человека сразу подхватывался всеми экранами.
function getSavedNatal() {
  try { return JSON.parse(localStorage.getItem("taro_natal") || "null"); } catch (err) { return null; }
}
function saveNatal(natal) {
  try { localStorage.setItem("taro_natal", JSON.stringify(natal)); } catch (err) { /* ignore */ }
}

// Подставляем сохранённую карту в поля формы натала
const natalFormInit = getSavedNatal();
if (natalFormInit && natalFormInit.day) {
  const nd = document.getElementById("n-day");
  if (nd) nd.value = natalFormInit.day;
  const nm = document.getElementById("n-month");
  if (nm) nm.value = natalFormInit.month;
  const ny = document.getElementById("n-year");
  if (ny) ny.value = natalFormInit.year;
  const nn = document.getElementById("n-name");
  if (nn && natalFormInit.name) nn.value = natalFormInit.name;
  const nt = document.getElementById("n-time");
  if (nt && natalFormInit.time) nt.value = natalFormInit.time;
  const nc = document.getElementById("n-city");
  if (nc && natalFormInit.city) nc.value = natalFormInit.city;
}

// === Нижняя навигация: переключение экранов ===
(function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tabbar__btn"));
  const screens = Array.from(document.querySelectorAll(".screen"));
  if (!tabs.length) return;
  function activate(name) {
    tabs.forEach((t) => t.classList.toggle("tabbar__btn--active", t.dataset.tab === name));
    screens.forEach((s) => s.classList.toggle("screen--active", s.id === "screen-" + name));
    // подсветим reveal-элементы активного экрана (на случай, если они ещё не проявились)
    const active = document.getElementById("screen-" + name);
    if (active) {
      active.querySelectorAll(".reveal").forEach((el) => {
        if (!el.classList.contains("visible")) {
          // принудительно покажем, если экран уже в зоне видимости
          const r = el.getBoundingClientRect();
          if (r.top < innerHeight) el.classList.add("visible");
        }
      });
    }
    window.scrollTo(window.__taroWebApp ? 0 : { top: 0, behavior: "smooth" }, 0);
  }
  tabs.forEach((t) => t.addEventListener("click", () => activate(t.dataset.tab)));
})();

// === Telegram WebApp мост ===
// Отправляет данные боту. Если WebView ещё не готов — кладём в очередь,
// initTelegram() сбросит её сразу после инициализации.
let __taroSendQueue = [];
function taroSend(payload) {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (window.__taroCanSend && tg && tg.sendData) {
    try {
      tg.sendData(payload);
      return true;
    } catch (err) {
      /* если sendData упал — ставим в очередь и попробуем ещё раз */
    }
  }
  __taroSendQueue.push(payload);
  return false;
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
  window.__taroCanSend = true;
  tg.ready();
  tg.expand();
  document.body.classList.add("in-webapp");

  // Отправляем всё, что накопилось в очереди, пока инициализировался WebView
  if (__taroSendQueue.length) {
    const pending = __taroSendQueue.splice(0);
    pending.forEach((p) => {
      try {
        tg.sendData(p);
      } catch (err) {
        /* не повезло — сообщение потерялось, следующая отправка создаст новую очередь */
      }
    });
  }

  // Тема Telegram
  const tp = tg.themeParams || {};
  const root = document.documentElement;
  const setVar = (name, val) => val && root.style.setProperty(name, val);
  setVar("--tg-bg", tp.bg_color);
  setVar("--tg-text", tp.text_color);
  setVar("--tg-hint", tp.hint_color);
  setVar("--tg-btn", tp.button_color);
  setVar("--tg-btn-text", tp.button_text_color);

  // Кнопка закрытия у Telegram родная (в заголовке мини-аппа), свою не добавляем.

  // Действия: сохранить профиль в боте
  const sendToBot = (type) => {
    const c = window.__taroCalc || {};
    taroSend(JSON.stringify(Object.assign({ type }, c)));
  };
  const saveBtn = document.getElementById("wa-save");
  if (saveBtn) saveBtn.addEventListener("click", () => sendToBot("save"));

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

// Полный разбор аркана: сначала API (прямо в модалке), фоллбэк — бот/локальный текст.
document.addEventListener("click", (e) => {
  const cta = e.target.closest("#modal-cta");
  if (!cta || cta.tagName === "A") return;
  e.preventDefault();
  const arcItem = lastArc.find((a) => a.n === lastModalArcana) || null;
  const c = window.__taroCalc || {};

  const fallback = () => {
    if (window.__taroWebApp) {
      taroSend(JSON.stringify(Object.assign({ type: "arcana", arcana_n: lastModalArcana }, c)));
      closeModal();
      return;
    }
    const text = arcItem
      ? buildExtendedArcanaText(arcItem)
      : "Эта карта хранит свою тайну — открой бота и попроси расширенный разбор.";
    $("modal-text").textContent = text;
    const link = document.createElement("a");
    link.href = "tg://resolve?domain=MyGoodTaro_bot";
    link.target = "_blank";
    link.className = cta.className;
    link.id = "modal-cta";
    link.textContent = "🚀 Открыть в боте для ИИ-версии";
    cta.replaceWith(link);
  };

  const doApi = async () => {
    cta.disabled = true;
    cta.textContent = "🪐 Готовим разбор…";
    try {
      const text = await taroApi("arcana", { day: c.day, month: c.month, year: c.year, arcana_n: lastModalArcana });
      if (text) {
        $("modal-text").textContent = text;
        if (arcItem) addHistory({ type: "arcana", icon: "🃏", title: `Разбор аркана «${arcItem.card}»`, subtitle: arcItem.pos, text });
        cta.textContent = "🔮 Разбор готов";
        cta.disabled = false;
        return;
      }
    } catch (err) {
      /* API недоступно — фоллбэк */
    }
    cta.textContent = "🔮 Расширенный разбор этого аркана";
    cta.disabled = false;
    fallback();
  };

  doApi();
});

// Открываем с сохранённой натальной картой (фундамент), иначе — демо-дата
const initialNatal = getSavedNatal();
if (initialNatal && initialNatal.day) {
  $("day").value = initialNatal.day;
  $("month").value = initialNatal.month;
  $("year").value = initialNatal.year;
  renderResult(initialNatal.day, initialNatal.month, initialNatal.year);
} else {
  renderResult(12, 5, 1998);
}

// === Профиль: стили интерпретации ===
const TARO_STYLES = [
  {
    id: "cosmo",
    emoji: "🪐",
    name: "Космо",
    desc: "Нейтральный голос навигатора: спокойно, по делу.",
  },
  {
    id: "gandalf",
    emoji: "🧙",
    name: "Гендальф Серый",
    desc: "Мудрец Севера: торжественно, притчами и метафорами света.",
  },
  {
    id: "strange",
    emoji: "🌀",
    name: "Доктор Стрэндж",
    desc: "Хранитель Санктума: точно, о времени и тайных течениях.",
  },
  {
    id: "yoda",
    emoji: "🌿",
    name: "Мастер Йода",
    desc: "Джедай: кротко и загадочно, инверсиями и мудростью Силы.",
  },
  {
    id: "dumbledore",
    emoji: "⚡",
    name: "Дамблдор",
    desc: "Директор Хогвартса: тепло, иронично и всегда с намёком.",
  },
];

const STYLE_STORAGE_KEY = "taro_style";

function getSavedStyle() {
  try {
    const s = localStorage.getItem(STYLE_STORAGE_KEY);
    return TARO_STYLES.find((x) => x.id === s) || TARO_STYLES[0];
  } catch (err) {
    return TARO_STYLES[0];
  }
}

function renderProfile() {
  const signEl = document.getElementById("profile-sign");
  const metaEl = document.getElementById("profile-meta");
  const starsEl = document.getElementById("profile-stars");

  const savedNatal = getSavedNatal() || {};
  if (savedNatal.zodiac) {
    if (signEl) signEl.textContent = savedNatal.name ? `${savedNatal.name} · ${savedNatal.zodiac}` : savedNatal.zodiac;
    if (metaEl) {
      const arc = savedNatal.arcana && savedNatal.arcana[0];
      metaEl.textContent = `${savedNatal.day}.${String(savedNatal.month).padStart(2, "0")}.${savedNatal.year}` +
        (savedNatal.city && savedNatal.city !== "не указано" ? ` · ${savedNatal.city}` : "") +
        (arc ? ` · Аркан ${arc.n} «${arc.card}»` : "");
    }
  }
  if (starsEl) starsEl.textContent = "0";
  renderStyleGrid();
}

function renderStyleGrid() {
  const grid = document.getElementById("profile-styles");
  const activeLabel = document.getElementById("profile-style-active");
  const active = getSavedStyle();
  if (activeLabel) activeLabel.textContent = active.name;
  if (!grid) return;
  grid.innerHTML = "";
  TARO_STYLES.forEach((s) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "profile__style" + (s.id === active.id ? " profile__style--active" : "");
    el.dataset.style = s.id;
    el.innerHTML =
      `<span class="style-emoji">${s.emoji}</span>` +
      `<span class="style-name">${s.name}</span>` +
      `<span class="style-desc">${s.desc}</span>`;
    el.addEventListener("click", () => selectStyle(s));
    grid.appendChild(el);
  });
}

function selectStyle(style) {
  try { localStorage.setItem(STYLE_STORAGE_KEY, style.id); } catch (err) { /* ignore */ }
  const activeLabel = document.getElementById("profile-style-active");
  if (activeLabel) activeLabel.textContent = style.name;
  renderStyleGrid();
  taroSend(JSON.stringify({ type: "style", style: style.name }));
}

renderProfile();

// === История раскладов и прогнозов ===
const HISTORY_KEY = "taro_history";
const MAX_HISTORY = 50;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch (err) { return []; }
}

function saveHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY))); } catch (err) { /* ignore */ }
}

function addHistory(entry) {
  const list = loadHistory();
  entry.id = "h" + Date.now() + Math.floor(Math.random() * 1000);
  entry.savedAt = Date.now();
  list.unshift(entry);
  saveHistory(list);
  renderHistory();
  return entry;
}

function clearHistory() {
  saveHistory([]);
  renderHistory();
}

function fmtDate(ts, withTime) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const base = `${day}.${month}.${d.getFullYear()}`;
  if (!withTime) return base;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${base} · ${hh}:${mm}`;
}

function renderHistory() {
  const list = loadHistory();
  const wrap = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");
  const clearBtn = document.getElementById("history-clear");
  if (!wrap || !empty) return;
  if (!list.length) {
    wrap.innerHTML = "";
    empty.hidden = false;
    if (clearBtn) clearBtn.hidden = true;
    return;
  }
  empty.hidden = true;
  if (clearBtn) clearBtn.hidden = false;

  wrap.innerHTML = list
    .map(
      (h) => `
      <div class="history__item glass" data-id="${h.id}" role="button" tabindex="0" aria-expanded="false">
        <span class="history__ico">${h.icon || "🃏"}</span>
        <div class="history__info">
          <h4>${h.title}</h4>
          <p>${h.subtitle || ""}</p>
        </div>
        <span class="history__date">${fmtDate(h.savedAt)}</span>
      </div>`
    )
    .join("");
}

function renderHistoryDetail(el, entry) {
  const open = el.classList.contains("history__item--open");
  el.classList.toggle("history__item--open", !open);
  el.setAttribute("aria-expanded", String(!open));
  let detail = el.querySelector(".history__detail");
  if (!open) {
    if (entry.type === "reads") {
      const chips = (entry.arcana || [])
        .map((a) => `<span class="history__card-chip">${a.pos}: ${a.card}</span>`)
        .join("");
      detail = document.createElement("div");
      detail.className = "history__detail";
      detail.innerHTML = `<div class="history__cards">${chips}</div>${entry.zodiac ? "Принадлежишь к знаку <b>" + entry.zodiac + "</b>." : ""}`;
    } else {
      detail = document.createElement("div");
      detail.className = "history__detail";
      detail.textContent = entry.text || "Прогноз был рассчитан на твою дату.";
    }
    el.appendChild(detail);
  } else if (detail) {
    detail.remove();
  }
}

document.addEventListener("click", (e) => {
  const item = e.target.closest(".history__item");
  if (!item) return;
  const id = item.dataset.id;
  const entry = loadHistory().find((h) => h.id === id);
  if (entry) renderHistoryDetail(item, entry);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const item = e.target.closest && e.target.closest(".history__item");
  if (item) {
    const id = item.dataset.id;
    const entry = loadHistory().find((h) => h.id === id);
    if (entry) renderHistoryDetail(item, entry);
  }
});
document.getElementById("history-clear")?.addEventListener("click", clearHistory);

// === Прогноз: локальная генерация (без ИИ) ===
const FORECAST_HEADERS = {
  day: "Прогноз на сегодня",
  week: "Прогноз на неделю",
  month: "Прогноз на месяц",
};

function natalForForecast() {
  const n = getSavedNatal() || null;
  const c = window.__taroCalc || {};
  const day = (n && n.day) || c.day || 12;
  const month = (n && n.month) || c.month || 5;
  const year = (n && n.year) || c.year || 1998;
  return { day, month, year };
}

function buildForecast(horizon) {
  const { day, month, year } = natalForForecast();
  const signName = zodiac(day, month);
  const sign = SIGNS[signName];
  const arc = arcana(day, month, year);
  const now = new Date();
  const todayNum = reduce(now.getDate() + now.getMonth() + 1);
  const weekStart = reduce(String(year).split("").reduce((a, b) => a + Number(b), 0) + month + now.getDay());
  const sTitle = signName;
  const sEl = sign.element.toLowerCase();
  const sPl = sign.planet;
  const w = arc[reduce(now.getDay() * 2 + 1)] || arc[1];
  const d = arc[todayNum % 10] || arc[0];
  const m = arc[(month * 2 + now.getDate()) % 10] || arc[2];

  const texts = {
    day: `Сегодня у ${sTitle} резонирует аркан **«${d.card}»** (${d.kw}).\n\nСтихия ${sEl} и планета ${sPl} советуют не форсировать события: короткие, но честные ходы дадут больше, чем громкий рывок. Обрати внимание на первую мысль после пробуждения — это голос ${d.pos === "Личность" ? "твоего я" : "интуиции"}.`,
    week: `Неделя у ${sTitle} идёт под арканом **«${w.card}»** (${w.kw}).\n\nВлияние ${sPl} смещает акцент на ${w.pos.toLowerCase()}. Готовь пространство под середину недели — то, что откладывалось, можно безопасно запускать. Энергия ${sEl} поддерживает учёбу, переговоры и порядок дома.`,
    month: `Месяц ${sTitle} несёт энергию **«${m.card}»** (${m.kw}).\n\nЭто волна ${sEl}-знака, и планета-управитель ${sPl} требует целостности: сначала заверши старые циклы, потом открывай новые. ${m.pos} станет главной темой — держи фокус, не распыляйся, и месяц принесёт рост.`,
  };

  const text = texts[horizon] || texts.day;
  const entry = {
    type: "forecast",
    icon: horizon === "day" ? "☀" : horizon === "week" ? "🌙" : "🪐",
    title: FORECAST_HEADERS[horizon],
    subtitle: `${signName} · ${sPl}`,
    arcana: [d, w, m],
    text,
    zodiac: signName,
  };
  addHistory(entry);
  return entry;
}

function showForecast(horizon) {
  const entry = buildForecast(horizon);
  const box = document.getElementById("forecast-result");
  const chips = entry.arcana
    .map((a) => `<span class="forecast__tag">${a.card}</span>`)
    .join("");
  box.innerHTML = `
    <div class="forecast__head">
      <span class="forecast__hed">${entry.title}</span>
      <span class="forecast__date">${fmtDate(Date.now(), true)}</span>
    </div>
    ${chips}
    <p>${entry.text}</p>`;
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Прогнозы: полный ИИ-прогноз прямо на вкладке (API), фоллбэк — локальная генерация.
document.querySelectorAll(".forecast__block").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const horizon = btn.dataset.horizon;
    const box = document.getElementById("forecast-result");
    const { day, month, year } = natalForForecast();
    const n = getSavedNatal() || {};
    btn.disabled = true;
    setLoading(box, FORECAST_HEADERS[horizon]);
    try {
      const text = await taroApi("forecast", {
        day,
        month,
        year,
        horizon,
        chart: n.chart ? chartBrief(n.chart) : undefined,
      });
      if (text) {
        showInlineResult(box, FORECAST_HEADERS[horizon], text);
        addHistory({ type: "forecast", icon: horizon === "day" ? "☀" : horizon === "week" ? "🌙" : "🪐", title: FORECAST_HEADERS[horizon], subtitle: `${zodiac(day, month)} · ${fmtDate(Date.now(), true)}`, text });
        return;
      }
    } catch (err) {
      /* API недоступно — локальный фоллбэк ниже */
    } finally {
      btn.disabled = false;
    }
    showForecast(horizon);
  });
});

renderHistory();