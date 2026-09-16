
// Переключатель Светлой / Тёмной темы (Обсидиан / Перламутр)
let __taroThemeInited = false;
function initTheme() {
  if (__taroThemeInited) return;
  __taroThemeInited = true;

  const savedTheme = localStorage.getItem("taro_theme") || "dark";
  
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = document.getElementById("theme-toggle-icon");
    if (icon) {
      icon.textContent = theme === "light" ? "☀️" : "🌙";
    }
    try { localStorage.setItem("taro_theme", theme); } catch (e) {}
  }
  
  applyTheme(savedTheme);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#theme-toggle");
    if (!btn) return;
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

// Модальное окно Политики Конфиденциальности (152-ФЗ)
function initPrivacyModal() {
  const modal = document.getElementById("privacy-modal");
  if (!modal) return;
  
  document.querySelectorAll("[data-open-privacy]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      modal.hidden = false;
    });
  });
  
  document.querySelectorAll("[data-close-privacy]").forEach((el) => {
    el.addEventListener("click", () => {
      modal.hidden = true;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPrivacyModal();
});

// Сессия посетителя сайта для синхронизации с БД на сервере
function getOrCreateSessionId() {
  let id = localStorage.getItem("taro_session_id");
  if (!id) {
    id = "web_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    try { localStorage.setItem("taro_session_id", id); } catch (e) {}
  }
  return id;
}

async function saveProfileToBackend(natal) {
  if (!natal || !natal.day) return;
  try {
    const initData = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || "";
    const styleObj = (typeof getSavedStyle === "function") ? getSavedStyle() : { name: "Космо" };
    const payload = {
      session_id: getOrCreateSessionId(),
      day: natal.day,
      month: natal.month,
      year: natal.year,
      time: natal.time || "",
      city: natal.city || "",
      name: natal.name || "",
      style: styleObj ? styleObj.name : "Космо",
      chart: natal.chart ? chartBrief(natal.chart) : null,
      initData: initData
    };
    await fetch("/api/v1/save_profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    /* Сервер недоступен — данные в localStorage */
  }
}
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

const ARCANA_IMAGES = [
  'img/cards/00-fool.png',
  'img/cards/01-magician.png',
  'img/cards/02-priestess.png',
  'img/cards/03-empress.png',
  'img/cards/04-emperor.png',
  'img/cards/05-hierophant.png',
  'img/cards/06-lovers.png',
  'img/cards/07-chariot.png',
  'img/cards/08-strength.png',
  'img/cards/09-hermit.png',
  'img/cards/10-wheel.png',
  'img/cards/11-justice.png',
  'img/cards/12-hanged.png',
  'img/cards/13-death.png',
  'img/cards/14-temperance.png',
  'img/cards/15-devil.png',
  'img/cards/16-tower.png',
  'img/cards/17-star.png',
  'img/cards/18-moon.png',
  'img/cards/19-sun.png',
  'img/cards/20-judgement.png',
  'img/cards/21-world.png',
];

function getArcanaSVG(n, cardName) {
  const roman = ROMAN[n] || "";
  let art = '';
  switch(n) {
    case 0: // Шут
      art = `<path d="M60 40 L60 80 M45 40 Q60 25 75 40 M60 80 L40 105 L80 105 Z" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <circle cx="60" cy="30" r="8" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <path d="M35 115 C50 100 70 100 85 115" stroke="#c9a96e" stroke-width="1.5" fill="none"/>
             <circle cx="90" cy="35" r="5" fill="#c9a96e"/>`;
      break;
    case 1: // Маг
      art = `<path d="M50 45 C50 38 70 38 70 45 C70 52 50 52 50 45 Z M70 45 C70 38 90 38 90 45 C90 52 70 52 70 45 Z" fill="none" stroke="#e8dcc8" stroke-width="1.6"/>
             <line x1="60" y1="60" x2="60" y2="100" stroke="#c9a96e" stroke-width="2"/>
             <circle cx="60" cy="60" r="3" fill="#e8dcc8"/>
             <path d="M40 90 L80 90 M45 105 L75 105" stroke="#c9a96e" stroke-width="1.5"/>
             <polygon points="60,70 65,80 55,80" fill="#c9a96e"/>`;
      break;
    case 2: // Жрица
      art = `<path d="M40 40 L40 110 M80 40 L80 110" stroke="#c9a96e" stroke-width="3"/>
             <text x="34" y="32" fill="#e8dcc8" font-size="10" font-family="serif">B</text>
             <text x="74" y="32" fill="#e8dcc8" font-size="10" font-family="serif">J</text>
             <circle cx="60" cy="65" r="14" fill="none" stroke="#e8dcc8" stroke-width="1.8"/>
             <path d="M48 65 A 14 14 0 0 0 72 65" fill="#c9a96e" opacity="0.4"/>
             <path d="M45 95 Q60 85 75 95" stroke="#c9a96e" stroke-width="1.5" fill="none"/>`;
      break;
    case 3: // Императрица
      art = `<circle cx="60" cy="55" r="16" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <path d="M52 47 L60 38 L68 47 M46 55 L74 55 M60 71 L60 100 M50 85 L70 85" stroke="#c9a96e" stroke-width="1.8" fill="none"/>
             <circle cx="60" cy="100" r="4" fill="#e8dcc8"/>
             <path d="M35 110 Q60 100 85 110" stroke="#c9a96e" stroke-width="1.2" fill="none"/>`;
      break;
    case 4: // Император
      art = `<rect x="42" y="45" width="36" height="50" rx="4" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <path d="M50 45 L50 35 L60 40 L70 35 L70 45" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <line x1="60" y1="55" x2="60" y2="85" stroke="#c9a96e" stroke-width="2"/>
             <line x1="52" y1="65" x2="68" y2="65" stroke="#c9a96e" stroke-width="2"/>
             <circle cx="60" cy="55" r="3" fill="#e8dcc8"/>`;
      break;
    case 5: // Иерофант
      art = `<path d="M60 35 L60 95 M45 48 L75 48 M48 62 L72 62 M52 76 L68 76" stroke="#c9a96e" stroke-width="2"/>
             <path d="M40 105 L55 90 L60 100 L65 90 L80 105" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <circle cx="60" cy="35" r="3" fill="#e8dcc8"/>`;
      break;
    case 6: // Влюблённые
      art = `<path d="M60 45 C45 30 30 50 60 75 C90 50 75 30 60 45 Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" stroke-width="1.8"/>
             <path d="M35 85 L45 65 L55 85 M65 85 L75 65 L85 85" stroke="#e8dcc8" stroke-width="1.5" fill="none"/>
             <line x1="60" y1="75" x2="60" y2="105" stroke="#c9a96e" stroke-width="1.2" stroke-dasharray="2 2"/>`;
      break;
    case 7: // Колесница
      art = `<rect x="40" y="65" width="40" height="30" rx="3" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <circle cx="45" cy="100" r="8" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <circle cx="75" cy="100" r="8" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <polygon points="60,35 70,55 50,55" fill="none" stroke="#c9a96e" stroke-width="1.6"/>
             <line x1="60" y1="55" x2="60" y2="65" stroke="#c9a96e" stroke-width="1.5"/>`;
      break;
    case 8: // Сила
      art = `<path d="M50 45 C50 38 70 38 70 45 C70 52 50 52 50 45 Z M70 45 C70 38 90 38 90 45 C90 52 70 52 70 45 Z" fill="none" stroke="#c9a96e" stroke-width="1.6"/>
             <path d="M45 70 Q60 55 75 70 Q70 95 60 100 Q50 95 45 70 Z" fill="none" stroke="#e8dcc8" stroke-width="1.8"/>
             <circle cx="60" cy="75" r="4" fill="#c9a96e"/>`;
      break;
    case 9: // Отшельник
      art = `<polygon points="60,35 64,47 77,47 66,55 70,67 60,59 50,67 54,55 43,47 56,47" fill="none" stroke="#e8dcc8" stroke-width="1.4"/>
             <path d="M60 67 L60 105 M45 105 L75 105" stroke="#c9a96e" stroke-width="1.8"/>
             <path d="M40 45 Q30 75 45 105" stroke="#c9a96e" stroke-width="1.2" fill="none"/>`;
      break;
    case 10: // Колесо Фортуны
      art = `<circle cx="60" cy="65" r="25" fill="none" stroke="#c9a96e" stroke-width="2"/>
             <circle cx="60" cy="65" r="10" fill="none" stroke="#e8dcc8" stroke-width="1.4"/>
             <line x1="60" y1="40" x2="60" y2="90" stroke="#c9a96e" stroke-width="1.2"/>
             <line x1="35" y1="65" x2="85" y2="65" stroke="#c9a96e" stroke-width="1.2"/>
             <line x1="42" y1="47" x2="78" y2="83" stroke="#c9a96e" stroke-width="1.2"/>
             <line x1="42" y1="83" x2="78" y2="47" stroke="#c9a96e" stroke-width="1.2"/>`;
      break;
    case 11: // Справедливость
      art = `<line x1="60" y1="35" x2="60" y2="105" stroke="#e8dcc8" stroke-width="2"/>
             <line x1="35" y1="50" x2="85" y2="50" stroke="#c9a96e" stroke-width="2"/>
             <path d="M35 50 L25 70 Q35 80 45 70 Z M85 50 L75 70 Q85 80 95 70 Z" fill="none" stroke="#c9a96e" stroke-width="1.5"/>
             <polygon points="60,30 64,38 56,38" fill="#e8dcc8"/>`;
      break;
    case 12: // Повешенный
      art = `<path d="M35 35 L85 35 M60 35 L60 65 L45 80 M60 65 L75 80 M60 85 L60 105" stroke="#c9a96e" stroke-width="2" fill="none"/>
             <circle cx="60" cy="95" r="8" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>`;
      break;
    case 13: // Смерть
      art = `<path d="M60 35 L75 65 L60 95 L45 65 Z" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <circle cx="60" cy="65" r="10" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <path d="M54 65 L66 65 M60 59 L60 71" stroke="#e8dcc8" stroke-width="1.5"/>
             <path d="M40 105 C50 95 70 95 80 105" stroke="#c9a96e" stroke-width="1.2" fill="none"/>`;
      break;
    case 14: // Умеренность
      art = `<path d="M45 45 C45 45 35 65 45 80 M75 45 C75 45 85 65 75 80" stroke="#c9a96e" stroke-width="1.5" fill="none"/>
             <path d="M40 50 Q60 55 50 85 M80 50 Q60 55 70 85" stroke="#e8dcc8" stroke-width="1.5" fill="none"/>
             <path d="M45 65 Q60 60 75 65" stroke="#c9a96e" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>`;
      break;
    case 15: // Дьявол
      art = `<polygon points="60,35 65,48 78,48 68,57 72,70 60,61 48,70 52,57 42,48 55,48" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>
             <path d="M45 75 L60 62 L75 75 L60 105 Z" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <circle cx="60" cy="85" r="4" fill="#c9a96e"/>`;
      break;
    case 16: // Башня
      art = `<polygon points="45,105 50,45 70,45 75,105" fill="none" stroke="#c9a96e" stroke-width="1.8"/>
             <path d="M45 45 L60 30 L75 45" fill="none" stroke="#e8dcc8" stroke-width="1.8"/>
             <path d="M68 25 L55 55 L65 55 L50 85" stroke="#e8dcc8" stroke-width="2" fill="none"/>`;
      break;
    case 17: // Звезда
      art = `<polygon points="60,30 64,45 78,45 67,54 71,68 60,59 49,68 53,54 42,45 56,45" fill="rgba(201,169,110,0.2)" stroke="#e8dcc8" stroke-width="1.6"/>
             <circle cx="38" cy="40" r="2" fill="#c9a96e"/>
             <circle cx="82" cy="40" r="2" fill="#c9a96e"/>
             <circle cx="32" cy="65" r="2" fill="#c9a96e"/>
             <circle cx="88" cy="65" r="2" fill="#c9a96e"/>
             <path d="M35 90 Q60 80 85 90 M40 100 Q60 90 80 100" stroke="#c9a96e" stroke-width="1.5" fill="none"/>`;
      break;
    case 18: // Луна
      art = `<circle cx="60" cy="55" r="18" fill="none" stroke="#e8dcc8" stroke-width="1.8"/>
             <path d="M60 37 A 18 18 0 0 1 78 55 A 18 18 0 0 1 60 73 A 14 14 0 0 0 60 37" fill="#c9a96e" opacity="0.6"/>
             <path d="M40 105 L40 85 L48 85 L48 105 M80 105 L80 85 L72 85 L72 105" stroke="#c9a96e" stroke-width="1.5" fill="none"/>
             <path d="M50 100 Q60 92 70 100" stroke="#e8dcc8" stroke-width="1.2" fill="none"/>`;
      break;
    case 19: // Солнце
      art = `<circle cx="60" cy="60" r="16" fill="none" stroke="#e8dcc8" stroke-width="2"/>
             <path d="M60 38 L60 28 M60 82 L60 92 M38 60 L28 60 M82 60 L92 60 M44 44 L37 37 M76 76 L83 83 M44 76 L37 83 M76 44 L83 37" stroke="#c9a96e" stroke-width="1.8"/>
             <circle cx="54" cy="56" r="2" fill="#e8dcc8"/>
             <circle cx="66" cy="56" r="2" fill="#e8dcc8"/>
             <path d="M54 66 Q60 71 66 66" stroke="#e8dcc8" stroke-width="1.5" fill="none"/>`;
      break;
    case 20: // Суд
      art = `<path d="M60 35 L60 75 M45 45 L75 45" stroke="#e8dcc8" stroke-width="2"/>
             <path d="M60 55 L85 65 L60 75" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" stroke-width="1.5"/>
             <path d="M35 105 L45 90 M60 105 L60 88 M85 105 L75 90" stroke="#c9a96e" stroke-width="1.8"/>`;
      break;
    case 21: // Мир
      art = `<ellipse cx="60" cy="65" rx="22" ry="30" fill="none" stroke="#c9a96e" stroke-width="1.8" stroke-dasharray="4 2"/>
             <path d="M60 45 L60 85 M48 60 L72 60" stroke="#e8dcc8" stroke-width="1.6"/>
             <circle cx="60" cy="65" r="6" fill="none" stroke="#c9a96e" stroke-width="1.4"/>`;
      break;
    default:
      art = `<circle cx="60" cy="65" r="20" fill="none" stroke="#c9a96e" stroke-width="1.5"/>`;
  }

  return `
    <svg viewBox="0 0 120 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="114" height="154" rx="8" fill="#151518" stroke="#c9a96e" stroke-width="1.2"/>
      <rect x="7" y="7" width="106" height="146" rx="5" fill="none" stroke="rgba(201,169,110,0.3)" stroke-width="0.8"/>
      <text x="60" y="20" fill="#c9a96e" font-size="8" font-family="'Playfair Display', Georgia, serif" font-weight="600" text-anchor="middle" letter-spacing="1">${roman}</text>
      <line x1="20" y1="24" x2="100" y2="24" stroke="rgba(201,169,110,0.2)" stroke-width="0.8"/>
      <g>
        ${art}
      </g>
      <line x1="20" y1="134" x2="100" y2="134" stroke="rgba(201,169,110,0.2)" stroke-width="0.8"/>
      <text x="60" y="145" fill="#e8dcc8" font-size="7.5" font-family="'Playfair Display', Georgia, serif" font-weight="600" text-anchor="middle" letter-spacing="0.5">${cardName.toUpperCase()}</text>
    </svg>
  `;
}

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
const TARO_API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/api/v1"
  : "https://shadowlinkapp.online/api/v1";

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

  const getArcanaSymbol = (n) => {
    const symbols = ["✨", "🪄", "🔮", "👑", "🏛️", "📜", "💖", "⚔️", "🦁", "🕯️", "☸️", "⚖️", "⏳", "🦋", "☯️", "🔥", "⚡", "⭐", "🌙", "☉", "🎺", "🌍"];
    return symbols[n] || "✦";
  };

  $("arcana-grid").innerHTML = arc
    .map(
      (a, i) => `
      <div class="arcana__item bento-card gold-glow-hover glass" data-idx="${i}" tabindex="0" role="button" aria-label="Подробнее: ${a.pos} — ${a.card}" style="animation-delay:${i * 60}ms">
        <div class="arcana__num">АРКАН ${ROMAN[a.n]} · ${a.pos}</div>
        <div class="arcana__card">${a.card}</div>
        <span class="arcana__kw">${a.kw}</span>
        <div class="arcana__illustration">
          <img src="${ARCANA_IMAGES[a.n]}" alt="${a.card}" onerror="if(!this.dataset.t1){this.dataset.t1=1;this.src=this.src.replace('.png','.jpg');}else if(!this.dataset.t2){this.dataset.t2=1;this.src=this.src.replace('.jpg','.webp');}else{this.style.display='none';}" onload="this.style.display='block';" style="display:none;" />
          <div class="arcana__svg-card">${getArcanaSVG(a.n, a.card)}</div>
        </div>
        <button class="arcana__btn" type="button">СМОТРЕТЬ ЗНАЧЕНИЕ</button>
        <div class="arcana__author">@TaroNavigator</div>
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
  $("modal-card").textContent = item.card;
  $("modal-kw").textContent = item.kw;

  const imgEl = $("modal-img");
  if (imgEl) {
    const numStr = String(item.n).padStart(2, "0");
    imgEl.dataset.t1 = "";
    imgEl.dataset.t2 = "";
    imgEl.style.display = "none";
    imgEl.onerror = function () {
      if (!this.dataset.t1) {
        this.dataset.t1 = "1";
        this.src = this.src.replace(".png", ".jpg");
      } else if (!this.dataset.t2) {
        this.dataset.t2 = "1";
        this.src = this.src.replace(".jpg", ".webp");
      } else {
        this.style.display = "none";
      }
    };
    imgEl.onload = function () {
      this.style.display = "block";
    };
    imgEl.src = ARCANA_IMAGES[item.n] || `img/cards/${numStr}.jpg`;
  }

  const textEl = $("modal-text");
  if (textEl) {
    textEl.hidden = true;
    textEl.textContent = "";
  }

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

// === Библиотека книг про Таро и эзотерику ===
const TARO_BOOKS = [
  {
    id: "b1",
    title: "78 ступеней мудрости",
    subtitle: "Библия современного Таро и юнгианских архетипов",
    author: "Рэйчел Поллак",
    year: "1980",
    school: "Школа Уэйта / Психология",
    level: "Для всех уровней",
    coverIcon: "📖",
    coverImage: "img/books/b1-pollack.png",
    pdfUrl: "books/pollack-78-steps.pdf",
    desc: "Фундаментальный труд, объединивший традицию Райдера-Уэйта с глубинной психологией Карла Юнга, мифологией и каббалой. Считается главным учебным пособием XXI века.",
    chapters: [
      {
        title: "📌 Обзор & Концепция",
        content: `
          <h3>78 ступеней мудрости — Рэйчел Поллак</h3>
          <p>Рэйчел Поллак совершила революцию в мировой тарологии, объединив традицию Райдера-Уэйта с глубинной психологией Карла Юнга, мифологией и архаическими символами бессознательного.</p>
          <p>Книга рассматривает Таро не как инструментарий бытового гадания, а как <b>живую карту человеческого развития</b>, где 22 Старших Аркана представляют собой «Путешествие Героя» через три последовательные стадии осознанности.</p>
          <div class="book-reader__quote">«Таро — это священная книга в картинках, отражающая наше путешествие от абсолютной невинности Шута до полного космического единения Мира.»</div>
        `
      },
      {
        title: "📜 Триады Арканов",
        content: `
          <h3>Три Раунда Духовной Индивидуации</h3>
          <p>Поллак делит 21 нумерованный Старший Аркан на три равных ряда по 7 карт:</p>
          <h4>1. Первый ряд (Арканы I – VII): Материальный Мир и Эго</h4>
          <p>От Мага до Колесницы. Герой осваивает внешний мир, правила общества, развивает волю, разум и формирует эго-идентичность.</p>
          <h4>2. Второй ряд (Арканы VIII – XIV): Поворот Внутрь и Психология</h4>
          <p>От Силы до Умеренности. Путешествие в глубины бессознательного, встреча с тенью, крах иллюзий и обретение душевной гармонии.</p>
          <h4>3. Третий ряд (Арканы XV – XXI): Духовная Трансформация</h4>
          <p>От Дьявола до Мира. Освобождение от цепей материальных привязнностей, прорыв сквозь Башню и окончательное космическое объединение.</p>
        `
      },
      {
        title: "🔮 Ключи: Шут и Маг",
        content: `
          <h3>Глубинный разбор ключей первых карт</h3>
          <h4>0. Шут (The Fool) — Чистый Потенциал</h4>
          <p>Шут — это бессознательное состояние перед началом творения. Он стоит на краю пропасти, держа белую розу (чистоту) и посох с узелком (сохраненный опыт прошлых воплощений). Белая собака — инстинкты, предупреждающие, но не останавливающие порыв.</p>
          <h4>I. Маг (The Magician) — Сознательная Воля</h4>
          <p>Маг поднимает жезл вверх, а другой рукой указывает на землю («Что вверху, то и внизу»). На его столе лежат четыре инструмента мастей — кубок, меч, пентакль и жезл. Маг переводит тонкие идеи в материальную форму.</p>
        `
      },
      {
        title: "💡 Практика и Упражнения",
        content: `
          <h3>Психотерапевтическая работа с картами</h3>
          <p>Рэйчел Поллак рекомендует использовать Таро в качестве проективного теста для диалога со своим бессознательным:</p>
          <ul>
            <li><b>Расклад «Зеркало Тени»:</b> Вытащите карту из колоды на вопрос «Что я отрицаю в себе прямо сейчас?». Рассмотрите символы карты как подавленные качества.</li>
            <li><b>Медитация на Аркан:</b> Выберите карту дня и назовите три ассоциации, которые вызывает её образ перед тем, как читать официальное значение.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "b2",
    title: "Иллюстрированный ключ к Таро",
    subtitle: "Официальное руководство к классической колоде",
    author: "Артур Эдвард Уэйт",
    year: "1910",
    school: "Классика Райдера-Уэйта",
    level: "Начинающим и практикам",
    coverIcon: "🗝️",
    desc: "Первоисточник от создателя самой популярной в мире колоды Таро. Описывает канонический символизм, историю карт и оригинальный расклад «Кельтский крест».",
    chapters: [
      {
        title: "📌 Введение Уэйта",
        content: `
          <h3>Иллюстрированный ключ к Таро — А. Э. Уэйт</h3>
          <p>Настоящий труд был написан Артуром Эдвардом Уэйтом — магом, исследователем Каббалы и членом Герметического Ордена «Золотой Зари». В 1909 году под его руководством художница Памела Колман Смит нарисовала 78 карт, перевернувших мир тарологии.</p>
          <div class="book-reader__quote">«Истинное Таро — это символизм; оно не говорит ни на каком другом языке и не предстает ни в каких иных знаках.»</div>
        `
      },
      {
        title: "📜 Символы Младших Арканов",
        content: `
          <h3>Четыре Элемента Мира</h3>
          <p>Уэйт впервые прорисовал живописные сюжетами даже на численных картах от Туза до Десятки:</p>
          <ul>
            <li><b>Жезлы (Wands):</b> Огонь, страсть, инициатива, воля и предпринимательский дух.</li>
            <li><b>Кубки (Cups):</b> Вода, эмоции, любовь, интуиция и творческие порывы.</li>
            <li><b>Мечи (Swords):</b> Воздух, интеллект, мысль, испытания и концептуальный выбор.</li>
            <li><b>Пентакли (Pentacles):</b> Земля, материя, финансы, ресурсы и здоровье.</li>
          </ul>
        `
      },
      {
        title: "✝️ Расклад «Кельтский Крест»",
        content: `
          <h3>Канонический 10-карточный алгоритм Уэйта</h3>
          <p>Уэйт передал алгоритм главного расклада в 10 позициях:</p>
          <ol style="padding-left:20px; color:#d8cfc2; line-height:1.7;">
            <li>1. Сигнификатор / Суть вопроса.</li>
            <li>2. Что препятствует или помогает (поперек).</li>
            <li>3. Основание / Прошлое.</li>
            <li>4. Недавнее прошлое / Уходящие влияния.</li>
            <li>5. Высшая цель / Стремления.</li>
            <li>6. Ближайшее будущее.</li>
            <li>7. Собственная позиция / Отношение к себе.</li>
            <li>8. Окружение и друзья.</li>
            <li>9. Надежды и опасения.</li>
            <li>10. Окончательный результат.</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "b3",
    title: "Таро Райдера-Уэйта. Символы и значения",
    subtitle: "Главный европейский самоучитель по арканам",
    author: "Хайо Банцхаф",
    year: "1999",
    school: "Школа Уэйта",
    level: "Начинающим",
    coverIcon: "🔮",
    desc: "Самый структурированный самоучитель от немецкого астролога Хайо Банцхафа. Четкие трактовки для работы, отношений, совета карты и ежедневных прогнозов.",
    chapters: [
      {
        title: "📌 Структура Банцхафа",
        content: `
          <h3>Методика немецкого астролога</h3>
          <p>Хайо Банцхаф упорядочил толкования так, чтобы практик мог быстро найти нужную сферу жизни без туманных абстракций.</p>
          <div class="book-reader__quote">«Карты Таро помогают нам увидеть не неизбежное будущее, а вектор движения нашей собственной энергии.»</div>
        `
      },
      {
        title: "📜 Анализ по Сферам",
        content: `
          <h3>Четыре измерения каждой карты</h3>
          <p>Для каждого аркана Банцхаф приводит 4 четких блока:</p>
          <ul>
            <li><b>Общее значение:</b> Архетипическая суть и энергетический фон.</li>
            <li><b>Работа и карьера:</b> Профессиональные перспективы, переговоры, задачи.</li>
            <li><b>Сознание и психология:</b> Каким мыслям и осознаниям учит карта.</li>
            <li><b>Личные отношения:</b> Любовь, доверие, страсти и партнерство.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "b4",
    title: "Книга Тота",
    subtitle: "Сакральная герметическая система Таро Кроули",
    author: "Алистер Кроули",
    year: "1944",
    school: "Таро Тота (Телема)",
    level: "Продвинутый / Мастер",
    coverIcon: "👁️",
    desc: "Шедевр оккультной мысли, раскрывающий взаимосвязь Таро с астрологией, Древом Сефирот, египетской мифологией и алхимической философией.",
    chapters: [
      {
        title: "📌 Герметизм Телемы",
        content: `
          <h3>Книга Тота — Алистер Кроули</h3>
          <p>Колода Таро Тота была создана Алистером Кроули при участии художницы Фриды Харрис. Она отражает законы Нового Эона и динамическую сакральную геометрию.</p>
          <div class="book-reader__quote">«Таро — это иллюстрированная энциклопедия оккультной философии древних.»</div>
        `
      },
      {
        title: "📜 Ату Тота и Изменения",
        content: `
          <h3>Особые имена Старших Арканов</h3>
          <p>Кроули скорректировал имена нескольких Ату (Старших Арканов):</p>
          <ul>
            <li><b>VIII. Регулирование (Adjustment):</b> Вместо Справедливости — равновесие космических сил.</li>
            <li><b>XI. Вожделение (Lust):</b> Вместо Силы — радость интеграции с животной энергией.</li>
            <li><b>XIV. Искусство (Art):</b> Вместо Умеренности — алхимическое слияние противоположностей.</li>
            <li><b>XX. Эон (The Aeon):</b> Вместо Страшного Суда — проявление Новой Эпохи Гора.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "b5",
    title: "Путь Таро",
    subtitle: "Марсельское Таро, психомагия и символизм",
    author: "Алехандро Ходоровский",
    year: "2004",
    school: "Марсельская школа",
    level: "Для всех уровней",
    coverIcon: "🏛️",
    desc: "Результат 40-летнего исследования знаменитого режиссера и психотерапевта. Взгляд на Марсельское Таро как на архитектурный язык бессознательного.",
    chapters: [
      {
        title: "📌 Психомагия Ходоровского",
        content: `
          <h3>Марсельское Таро как Живой Храм</h3>
          <p>Алехандро Ходоровский воссоздал оригинальное Марсельское Таро XVII века и доказал, что карты являются геометрической и цветовой мандалой исцеления.</p>
          <div class="book-reader__quote">«Таро — это собор без стен, запечатленный в пачке карт.»</div>
        `
      },
      {
        title: "📜 Цветовой Код",
        content: `
          <h3>Язык 10 цветов Марсельской системы</h3>
          <p>В Марсельском Таро каждый цвет имеет символический статус: Голубой (Духовность/Интуиция), Железо-Желтый (Материальная мудрость), Красный (Жизненное усилие/Кровь), Белый (Чистая Непорочность).</p>
        `
      }
    ]
  },
  {
    id: "b6",
    title: "Полная книга перевёрнутых карт Таро",
    subtitle: "Глубокий анализ скрытых смыслов и теней",
    author: "Мэри Грир",
    year: "2002",
    school: "Школа Уэйта / Теневая работа",
    level: "Продвинутый",
    coverIcon: "🔄",
    desc: "Фундаментальная книга Мэри Грир о работе с перевернутыми картами. 12 методов толкования теневых аспект арканов и внутренних блоков.",
    chapters: [
      {
        title: "📌 12 Метод Грир",
        content: `
          <h3>Как читать перевернутые карты</h3>
          <p>Мэри Грир показывает, что перевернутая карта — это не «плохой знак», а направленная внутрь энергия:</p>
          <ul>
            <li>1. Внутренний процесс (то, что происходит в душе, а не снаружи).</li>
            <li>2. Блокировка или замедление проявления.</li>
            <li>3. Теневой аспект (отрицаемое качество).</li>
            <li>4. Переизбыток или недостаток энергии аркана.</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "b7",
    title: "Юнг и Таро: Архетипическое путешествие",
    subtitle: "Психологическое осмысление Старших Арканов",
    author: "Салли Николс",
    year: "1980",
    school: "Юнгианский психоанализ",
    level: "Продвинутый",
    coverIcon: "🌌",
    desc: "Исследование Салли Николс, получившее высокое признание юнгианцев. Взгляд на 22 Аркана как на этапы алхимической индивидуации души.",
    chapters: [
      {
        title: "📌 Процесс Индивидуации",
        content: `
          <h3>Архетипы в образах Таро</h3>
          <p>Салли Николс детально показывает, как Шут встречается с Персоной (Маг и Жрица), сталкивается со своей Тенью (Дьявол) и приходит к Самости (Мир).</p>
        `
      }
    ]
  },
  {
    id: "b8",
    title: "Прыжок в бездну вершины: Таро Кроули",
    subtitle: "Практическое руководство по Таро Тота",
    author: "Олег Телемский",
    year: "2012",
    school: "Таро Тота",
    level: "Практикам",
    coverIcon: "📜",
    desc: "Увлекательный и глубокий путеводитель по символике колоды Кроули, написанный исследователем юнгианства и герметической традиции.",
    chapters: [
      {
        title: "📌 Путеводитель Телемского",
        content: `
          <h3>Азбука Телемы</h3>
          <p>Олег Телемский снимает покров загадочности с терминов Кроули, делая колоду Тота живым инструментом самопознания и диалога с Бессознательным.</p>
        `
      }
    ]
  }
];

const TARO_SCHOOLS = [
  {
    icon: "🃏",
    title: "Школа Райдера-Уэйта (1910)",
    desc: "Самая популярная традиция в мире, созданная членом Ордена «Золотой Зари» А. Э. Уэйтом и художницей Памелой Смит. Главное историческое отличие — впервые Младшие Арканы получили рисунки с сюжетными персонажами.",
    details: "<b>Особенности:</b> Глубокий христианский мистицизм, Каббала, астрология и наглядный психо-символический язык. Идеально подходит для начинающих, бытовых раскладов и интуитивного анализа."
  },
  {
    icon: "👁️",
    title: "Школа Алистера Кроули / Таро Тота (1944)",
    desc: "Оккультно-герметическая система Телемы, отражающая философию Нового Эона Гора. Иллюстрации художницы Фриды Харрис выполнены с использованием сакральной геометрии и динамического света.",
    details: "<b>Особенности:</b> Прямые астрологические деканаты, Древо Сефирот, египетская пантеология и переименованные арканы (Регулирование, Вожделение, Искусство, Эон). Для глубоких оккультных медитаций и трансформаций."
  },
  {
    icon: "🏛️",
    title: "Марсельское Таро (XVII век)",
    desc: "Каноническая древняя европейская система. Младшие Арканы выполнены в виде абстрактно-числовых геометрических фигур (кубки, мечи, монеты, жезлы) без сюжетных сцен.",
    details: "<b>Особенности:</b> Первичная каноническая палитра цветов (красный, синий, желтый), геометрический ритм и психомагическая работа с архетипами (по системе Алехандро Ходоровского)."
  },
  {
    icon: "📜",
    title: "Египетская Школа / Папюс (XIX век)",
    desc: "Французская оккультная традиция (Элифас Леви, Папюс, Поль Кристиан), связывающая Таро с древними священными книгами Тота и египетскими иероглифами.",
    details: "<b>Особенности:</b> Строгая привязка 22 Старших Арканов к 22 буквам иврита и астрологическим домам. Академический герметический стиль для исследователей академического оккультизма."
  },
  {
    icon: "✨",
    title: "Современные Психологические Оракулы",
    desc: "Направление XXI века, объединяющее юнгианский психоанализ, авторские арт-колоды и Метафорические Ассоциативные Карты (МАК).",
    details: "<b>Особенности:</b> Свободный диалог с личным бессознательным без жестких оккультных догм. Созданы для арт-терапии, работы с эмоциональными блоками и самоисследования."
  }
];

function renderExploreGrid() {
  const grid = $("explore-grid");
  if (!grid || grid.children.length > 0) return;
  grid.innerHTML = ARCADES.map(
    (a, i) => `
    <div class="arcana__item bento-card gold-glow-hover glass" data-arcana="${i}" tabindex="0" role="button" aria-label="Подробнее: ${a.card}" style="animation-delay:${(i % 10) * 50}ms">
      <div class="arcana__num">АРКАН ${ROMAN[i]}</div>
      <div class="arcana__card">${a.card}</div>
      <span class="arcana__kw">${a.kw}</span>
      <div class="arcana__illustration">
        <img src="${ARCANA_IMAGES[i]}" alt="${a.card}" onerror="if(!this.dataset.t1){this.dataset.t1=1;this.src=this.src.replace('.png','.jpg');}else if(!this.dataset.t2){this.dataset.t2=1;this.src=this.src.replace('.jpg','.webp');}else{this.style.display='none';}" onload="this.style.display='block';" style="display:none;" />
        <div class="arcana__svg-card">${getArcanaSVG(i, a.card)}</div>
      </div>
      <button class="arcana__btn" type="button">СМОТРЕТЬ ЗНАЧЕНИЕ</button>
      <div class="arcana__author">@TaroNavigator</div>
    </div>`
  ).join("");
  bindTilt();
}

function renderExploreBooks() {
  const grid = $("explore-books-grid");
  if (!grid || grid.children.length > 0) return;
  grid.innerHTML = TARO_BOOKS.map(
    (b, i) => `
    <div class="bento-card book-card gold-glow-hover glass" data-book-id="${b.id}" tabindex="0" role="button" aria-label="Книга: ${b.title}" style="animation-delay:${i * 50}ms">
      <div class="book-card__cover">
        ${b.coverImage ? `<img class="book-card__img" src="${b.coverImage}" alt="${b.title}" />` : `<div class="book-card__fallback-cover"><span class="book-card__icon">${b.coverIcon}</span><span class="book-card__fallback-title">${b.title}</span></div>`}
        <span class="book-card__badge">${b.school}</span>
      </div>
      <h3 class="book-card__title">${b.title}</h3>
      <div class="book-card__author">${b.author} (${b.year})</div>
      <p class="book-card__desc">${b.desc}</p>
      <div class="book-card__meta">
        <span>🎓 ${b.level}</span>
        <span style="color:var(--gold); font-weight:600;">📖 Читать книгу онлайн ➔</span>
      </div>
    </div>`
  ).join("");
}

function renderExploreSchools() {
  const grid = $("explore-schools-grid");
  if (!grid || grid.children.length > 0) return;
  grid.innerHTML = TARO_SCHOOLS.map(
    (s, i) => `
    <div class="bento-card school-card gold-glow-hover glass" style="animation-delay:${i * 60}ms">
      <div class="school-card__head">
        <span class="school-card__icon">${s.icon}</span>
        <h3 class="school-card__title">${s.title}</h3>
      </div>
      <p class="school-card__desc">${s.desc}</p>
      <div class="school-card__section">${s.details}</div>
    </div>`
  ).join("");
}

// Открытие интерактивной читалки книги прямо на сайте
function openBookModal(book) {
  const modal = $("book-modal");
  if (!modal) return;
  $("book-modal-school").textContent = book.school.toUpperCase();
  $("book-modal-title").textContent = book.title;
  $("book-modal-author").textContent = `${book.author} · ${book.year} год · ${book.level}`;

  const coverWrap = $("book-modal-cover-wrap");
  if (coverWrap) {
    coverWrap.innerHTML = book.coverImage
      ? `<img src="${book.coverImage}" alt="${book.title}" class="book-modal__cover-img" />`
      : `<div class="book-modal__cover-fallback">${book.coverIcon || "📖"}</div>`;
  }

  const navBox = $("book-reader-nav");
  const contentBox = $("book-reader-content");
  const actionBtn = $("book-modal-action-btn");

  if (navBox && contentBox) {
    const chapters = Array.from(book.chapters || []);
    let pdfIdx = -1;
    if (book.pdfUrl) {
      pdfIdx = chapters.length;
      chapters.push({
        title: "📄 Полный PDF (в браузере)",
        isPdf: true,
        content: `
          <h3>Оригинал книги в формате PDF</h3>
          <p>Вы можете читать полную версию прямо в браузере без скачивания:</p>
          <iframe src="${book.pdfUrl}#toolbar=0" class="book-reader__pdf-iframe" title="${book.title}"></iframe>`
      });
    }

    navBox.innerHTML = chapters
      .map(
        (ch, idx) => `
        <button class="book-reader__tab ${idx === 0 ? "book-reader__tab--active" : ""}" data-chapter-idx="${idx}" type="button">
          ${ch.title}
        </button>`
      )
      .join("");

    const showChapter = (idx) => {
      navBox.querySelectorAll(".book-reader__tab").forEach((b, i) => b.classList.toggle("book-reader__tab--active", i === idx));
      const ch = chapters[idx] || chapters[0];
      contentBox.innerHTML = ch.content;
      contentBox.scrollTop = 0;
    };

    showChapter(0);

    navBox.onclick = (e) => {
      const tabBtn = e.target.closest("[data-chapter-idx]");
      if (tabBtn) {
        const idx = Number(tabBtn.dataset.chapterIdx);
        showChapter(idx);
      }
    };

    if (actionBtn) {
      if (book.pdfUrl && pdfIdx !== -1) {
        actionBtn.textContent = "📄 Открыть полный PDF в браузере ➔";
        actionBtn.onclick = () => {
          showChapter(pdfIdx);
          contentBox.scrollIntoView({ behavior: "smooth" });
        };
      } else {
        actionBtn.textContent = "📜 Читать главы книги ➔";
        actionBtn.onclick = () => {
          showChapter(0);
          contentBox.scrollIntoView({ behavior: "smooth" });
        };
      }
    }
  }

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

// Закрытие модального окна книги
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-book]")) {
    const modal = $("book-modal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
  }
});

// Переключение табов в разделе Исследуй (Арканы / Книги / Школы)
document.addEventListener("click", (e) => {
  const tabBtn = e.target.closest("[data-explore-tab]");
  if (tabBtn) {
    const target = tabBtn.dataset.exploreTab;
    document.querySelectorAll("[data-explore-tab]").forEach((b) => b.classList.toggle("explore__tab--active", b === tabBtn));

    const arcGrid = $("explore-grid");
    const booksGrid = $("explore-books-grid");
    const schoolsGrid = $("explore-schools-grid");

    if (arcGrid) {
      arcGrid.hidden = target !== "arcana";
      arcGrid.style.display = target === "arcana" ? "grid" : "none";
    }
    if (booksGrid) {
      booksGrid.hidden = target !== "books";
      booksGrid.style.display = target === "books" ? "grid" : "none";
    }
    if (schoolsGrid) {
      schoolsGrid.hidden = target !== "schools";
      schoolsGrid.style.display = target === "schools" ? "grid" : "none";
    }

    if (target === "arcana") renderExploreGrid();
    if (target === "books") renderExploreBooks();
    if (target === "schools") renderExploreSchools();
    return;
  }

  // Клик по карточке книги
  const bookCard = e.target.closest(".book-card");
  if (bookCard) {
    const bookId = bookCard.dataset.bookId;
    const book = TARO_BOOKS.find((b) => b.id === bookId);
    if (book) openBookModal(book);
  }
});

document.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".arcana__item");
  if (cardEl) {
    if (cardEl.dataset.idx !== undefined && lastArc[Number(cardEl.dataset.idx)]) {
      openModal(lastArc[Number(cardEl.dataset.idx)]);
    } else if (cardEl.dataset.arcana !== undefined) {
      const n = Number(cardEl.dataset.arcana);
      if (ARCADES[n]) {
        openModal({ n, pos: "Галерея", card: ARCADES[n].card, kw: ARCADES[n].kw });
      }
    }
    return;
  }
  if (e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && e.target.classList && e.target.classList.contains("arcana__item")) {
    const cardEl = e.target;
    if (cardEl.dataset.idx !== undefined && lastArc[Number(cardEl.dataset.idx)]) {
      openModal(lastArc[Number(cardEl.dataset.idx)]);
    } else if (cardEl.dataset.arcana !== undefined) {
      const n = Number(cardEl.dataset.arcana);
      if (ARCADES[n]) {
        openModal({ n, pos: "Галерея", card: ARCADES[n].card, kw: ARCADES[n].kw });
      }
    }
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
      const rx = (0.5 - py) * 12;
      const ry = (px - 0.5) * 12;
      el.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

// === Натальная карта: 3D-круг Зодиака (Интерактивная раскладка планет) ===
function renderNatalChart(natal) {
  const disc = document.getElementById("natal-disc");
  if (!disc) return;

  // Если готового расчёта нет, пробуем посчитать синхронно на лету
  let chart = (natal && natal.chart) || null;
  if (!chart && natal && natal.day && window.TaroNatal && window.TaroNatal.computeSync) {
    chart = window.TaroNatal.computeSync(natal);
  }

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
    const x1 = cx + Math.cos(a1 - Math.PI / 2) * R;
    const y1 = cy + Math.sin(a1 - Math.PI / 2) * R;
    segs += `<line class="natal__tick" x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" />`;
  }

  // Расставляем планеты на диске
  const planetList = [];
  if (chart && chart.planets) {
    chart.planets.forEach((p) => {
      planetList.push({
        lon: p.pos.lon,
        cls: "natal__planet",
        glyph: p.icon,
        name: p.name,
        label: p.name + " — " + p.pos.label
      });
    });
    if (chart.asc) {
      planetList.push({
        lon: chart.asc.lon,
        cls: "natal__planet--asc",
        glyph: "ASC",
        name: "Асцендент",
        label: "Асцендент — " + chart.asc.label
      });
    }
    if (chart.mc) {
      planetList.push({
        lon: chart.mc.lon,
        cls: "natal__planet--mc",
        glyph: "MC",
        name: "МС",
        label: "Медиум Цели — " + chart.mc.label
      });
    }
  } else {
    planetList.push(
      { lon: 35, cls: "natal__planet", glyph: "☉", name: "Солнце", label: "Солнце — 5° Тельца" },
      { lon: 120, cls: "natal__planet", glyph: "☽", name: "Луна", label: "Луна — 0° Льва" },
      { lon: 210, cls: "natal__planet--asc", glyph: "ASC", name: "Асцендент", label: "Асцендент — 0° Скорпиона" }
    );
  }

  // Смещение орбиты при близком расположении (чтобы иконки не перекрывались)
  let dots = "";
  planetList.sort((a, b) => a.lon - b.lon);

  for (let i = 0; i < planetList.length; i++) {
    const p = planetList[i];
    let rOffset = 0.62;
    if (i > 0 && Math.abs(p.lon - planetList[i - 1].lon) < 8) {
      rOffset = (i % 2 === 0) ? 0.70 : 0.54;
    }
    const a = (p.lon / 360) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * (R * rOffset);
    const y = cy + Math.sin(a) * (R * rOffset);

    dots += `
      <g class="natal__planet-node" data-info="${p.label}" tabindex="0" role="button" aria-label="${p.label}">
        <circle class="${p.cls}" cx="${x}" cy="${y}" r="6.5"><title>${p.label}</title></circle>
        <text class="natal__planet-label" x="${x + 10}" y="${y + 4}">${p.glyph}</text>
      </g>`;
  }

  disc.innerHTML = `
    <svg viewBox="0 0 400 400" aria-label="Натальная карта">
      <defs>
        <radialGradient id="discBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1c1b22" />
          <stop offset="65%" stop-color="#141417" />
          <stop offset="100%" stop-color="#0e0e10" />
        </radialGradient>
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(201,169,110,0.95)" />
          <stop offset="50%" stop-color="rgba(201,169,110,0.3)" />
          <stop offset="100%" stop-color="rgba(201,169,110,0)" />
        </radialGradient>
        <linearGradient id="ringGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8dcc8" />
          <stop offset="40%" stop-color="#c9a96e" />
          <stop offset="80%" stop-color="#a68540" />
          <stop offset="100%" stop-color="#e8dcc8" />
        </linearGradient>
        <filter id="goldGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- Тёмно-золотая основа диска -->
      <circle cx="200" cy="200" r="192" fill="url(#discBg)" stroke="url(#ringGoldGrad)" stroke-width="2.5" filter="url(#goldGlow)" />
      <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(201,169,110,0.18)" stroke-width="1" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(201,169,110,0.35)" stroke-width="1" />
      <circle cx="200" cy="200" r="96" fill="none" stroke="rgba(201,169,110,0.25)" stroke-width="1" stroke-dasharray="3 3" />
      <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(232,220,200,0.2)" stroke-width="1" stroke-dasharray="2 4" />

      <!-- Аспектные направляющие линии -->
      <line x1="200" y1="50" x2="200" y2="350" stroke="rgba(201,169,110,0.15)" stroke-dasharray="2 4" />
      <line x1="50" y1="200" x2="350" y2="200" stroke="rgba(201,169,110,0.15)" stroke-dasharray="2 4" />

      <!-- Вращающийся диск зодиака -->
      <g class="natal__spin">
        ${segs}
      </g>

      <!-- Интерактивные точки планет -->
      ${dots}

      <!-- Дыхание центрального Солнца -->
      <circle class="natal__sun-core" cx="200" cy="200" r="38" fill="url(#sunCore)" filter="url(#goldGlow)" />
      <circle cx="200" cy="200" r="18" fill="#1c1c20" stroke="#c9a96e" stroke-width="1.5" />
      <text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-size="20" fill="#c9a96e">☉</text>
    </svg>`;

  // Интерактивный клик/ховер по планетам
  const infoEl = document.getElementById("natal-planet-info");
  disc.querySelectorAll(".natal__planet-node").forEach((node) => {
    const info = node.getAttribute("data-info");
    const show = () => {
      if (infoEl && info) {
        infoEl.innerHTML = `🪐 <b>${info}</b>`;
        disc.querySelectorAll(".natal__planet-node").forEach((n) => n.classList.remove("active"));
        node.classList.add("active");
      }
    };
    node.addEventListener("mouseenter", show);
    node.addEventListener("click", show);
    node.addEventListener("touchstart", show, { passive: true });
  });

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

// Интерактивное обновление натального диска прямо во время ввода данных (живой расчет)
function initNatalLiveInput() {
  const ids = ["n-day", "n-month", "n-year", "n-time", "n-city"];
  const handler = () => {
    const d = Number(document.getElementById("n-day")?.value);
    const m = Number(document.getElementById("n-month")?.value);
    const y = Number(document.getElementById("n-year")?.value);
    const timeVal = document.getElementById("n-time")?.value || "";
    const cityVal = document.getElementById("n-city")?.value || "";
    if (d && m && y && d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
      if (window.TaroNatal && window.TaroNatal.computeSync) {
        const syncChart = window.TaroNatal.computeSync({ day: d, month: m, year: y, time: timeVal, city: cityVal });
        if (syncChart) {
          renderNatalChart({ day: d, month: m, year: y, time: timeVal, city: cityVal, chart: syncChart });
        }
      }
    }
  };
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    }
  });
}
initNatalLiveInput();
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
      saveProfileToBackend(natal);
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

// === Астропогода: Луна и Транзиты ===
function renderAstroWeather() {
  const box = document.getElementById("forecast-astro");
  if (!box || !window.TaroNatal) return;
  const n = getSavedNatal();
  if (!n || !n.chart || !n.chart.planets) {
    box.hidden = true;
    return;
  }

  const moon = TaroNatal.computeLunarPhase();
  if (moon) {
    document.getElementById("astro-moon-icon").textContent = moon.icon;
    document.getElementById("astro-moon-phase").textContent = moon.phaseName;
    document.getElementById("astro-moon-sign").textContent = "в знаке " + moon.sign;
  }

  const transits = TaroNatal.computeTransits(n.chart.planets);
  const list = document.getElementById("astro-transits-list");
  if (transits && transits.length > 0) {
    list.innerHTML = transits.map(t => 
      `<li>
         <span>${t.transitPlanet}</span>
         <span style="color:var(--cyan)">${t.icon}</span>
         <span>${t.natalPlanet}</span>
         <span class="orb">${t.orb}°</span>
       </li>`
    ).join("");
  } else {
    list.innerHTML = "<li>Спокойное небо: точных транзитов нет.</li>";
  }
  box.hidden = false;
}

// === Нижняя навигация & URL хэш-роутинг (#reads, #explore, #natal, #forecast, #profile, #history) ===
(function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tabbar__btn"));
  const screens = Array.from(document.querySelectorAll(".screen"));
  if (!tabs.length) return;

  const validTabs = ["reads", "explore", "natal", "forecast", "profile", "history"];

  function activate(name, updateHash = true) {
    if (!validTabs.includes(name)) name = "reads";

    const currentTab = tabs.find((t) => t.classList.contains("tabbar__btn--active"));
    const currentTabName = currentTab ? currentTab.dataset.tab : null;

    if (currentTabName === name) {
      window.scrollTo(0, 0);
      return;
    }

    // Подсвечиваем активную кнопку навигации мгновенно
    tabs.forEach((t) => t.classList.toggle("tabbar__btn--active", t.dataset.tab === name));

    // Обновляем хэш в URL адресе страницы
    if (updateHash && window.location.hash !== "#" + name) {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, "", "#" + name);
      } else {
        window.location.hash = "#" + name;
      }
    }

    const newScreen = document.getElementById("screen-" + name);

    if (newScreen) {
      // Сначала скрываем старый экран — убираем его горизонтальный overflow из layout
      screens.forEach((s) => {
        if (s !== newScreen) {
          s.classList.remove("screen--active");
        }
      });

      // Теперь сбрасываем скролл — старый экран уже скрыт и не создаёт overflow
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;

      // Показываем новый экран
      newScreen.classList.add("screen--active");

      newScreen.querySelectorAll(".reveal").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 120) el.classList.add("visible");
      });
    }

    if (name === "explore") renderExploreGrid();
    if (name === "forecast") renderAstroWeather();
    if (name === "profile") renderProfile();
    if (name === "history") renderHistory();
  }

  tabs.forEach((t) => {
    t.addEventListener("click", (e) => {
      e.preventDefault();
      activate(t.dataset.tab, true);
    });
  });

  // Реагируем на подгрузку страницы по хэшу и навигацию Назад / Вперёд в браузере
  function activateFromHash() {
    const hash = window.location.hash.replace("#", "").trim();
    if (hash && validTabs.includes(hash)) {
      activate(hash, false);
    }
  }

  window.addEventListener("popstate", activateFromHash);
  window.addEventListener("hashchange", activateFromHash);

  // Инициализация при первой загрузке
  const initialHash = window.location.hash.replace("#", "").trim();
  if (initialHash && validTabs.includes(initialHash)) {
    activate(initialHash, false);
  }
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
    $("modal-text").hidden = false;
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
        $("modal-text").hidden = false;
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
  const grids = document.querySelectorAll("#profile-styles, .profile__styles-grid");
  const activeLabels = document.querySelectorAll("#profile-style-active, .profile-style-active");
  const active = getSavedStyle();
  activeLabels.forEach((el) => el.textContent = active.name);
  if (!grids.length) return;
  grids.forEach((grid) => {
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
  });
}

function selectStyle(style) {
  try { localStorage.setItem(STYLE_STORAGE_KEY, style.id); } catch (err) { /* ignore */ }
  const activeLabel = document.getElementById("profile-style-active");
  if (activeLabel) activeLabel.textContent = style.name;
  renderStyleGrid();
  taroSend(JSON.stringify({ type: "style", style: style.name }));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderProfile);
} else {
  renderProfile();
}

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
      const payload = {
        day,
        month,
        year,
        horizon,
        chart: n.chart ? chartBrief(n.chart) : undefined,
      };
      if (window.TaroNatal && n.chart && n.chart.planets) {
        payload.transits = TaroNatal.computeTransits(n.chart.planets);
        payload.lunarPhase = TaroNatal.computeLunarPhase();
      }
      const text = await taroApi("forecast", payload);
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