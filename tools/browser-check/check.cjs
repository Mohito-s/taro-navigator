const puppeteer = require("puppeteer-core");

const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = process.env.URL || "http://localhost:8000";

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail: detail || "" });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  |  " + detail : ""}`);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const page = await browser.newPage();

  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await page.setViewport({ width: 1600, height: 1000 });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));

  check("нет ошибок консоли/страницы", errors.length === 0, errors.join("; ").slice(0, 300));

  const arcanaCount = await page.$$eval("#arcana-grid .arcana__item", (els) => els.length);
  check("10 карточек арканов в сетке", arcanaCount === 10, `найдено ${arcanaCount}`);

  const demoSign = await page.$eval("#zodiac-card h3", (el) => el.textContent.trim());
  check("демо-дата (12.05) → Телец", demoSign === "Телец", demoSign);

  await page.type("#day", "25");
  await page.type("#month", "09");
  await page.type("#year", "1985");
  await page.click("#run");
  await new Promise((r) => setTimeout(r, 400));

  const libSign = await page.$eval("#zodiac-card h3", (el) => el.textContent.trim());
  check("25.09.1985 → Весы (bugfix)", libSign === "Весы", libSign);

  const scene = await page.evaluate(() => window.__taroScene || null);
  check("сцена инициализирована", !!scene, JSON.stringify(scene || {}));
  if (scene) {
    check("на десктопе луна справа", Math.abs(scene.moon.x) > scene.aspect, `moon.x=${scene.moon.x.toFixed(2)}, aspect=${scene.aspect.toFixed(2)}`);
  }

  await page.mouse.click(700, 900);
  const modalVisible = await page.$eval("#arcana-modal", (el) => !el.hidden);
  const modalText = await page.$eval("#modal-text", (el) => el.textContent.length);
  check("модалка открывается по клику на карточку", modalVisible && modalText > 40, `text=${modalText} симв.`);
  await page.keyboard.press("Escape");
  const modalClosed = await page.$eval("#arcana-modal", (el) => el.hidden);
  check("Escape закрывает модалку", modalClosed);

  await page.evaluate(() => window.scrollTo(0, 3000));
  await new Promise((r) => setTimeout(r, 600));
  const afterScroll = await page.evaluate(() => window.__taroScene.scrollFade);
  check("при скролле луна гаснет (нет наложения на форму)", afterScroll < 0.45, `scrollFade=${afterScroll.toFixed(2)}`);

  const revealVisible = await page.evaluate(() => {
    const el = document.querySelector(".about__item.reveal");
    return el && el.classList.contains("visible");
  });
  check("reveal-анимации срабатывают при скролле", !!revealVisible);

  await page.setViewport({ width: 390, height: 844 });
  await new Promise((r) => setTimeout(r, 1200));
  const mobileScene = await page.evaluate(() => window.__taroScene);
  check("на мобильном луна уходит в центр-верх, не перекрывает форму", Math.abs(mobileScene.moon.x) < 1.2, `moon.x=${mobileScene.moon.x.toFixed(2)}`);

  await page.click('[data-tab="profile"]');
  await new Promise((r) => setTimeout(r, 400));
  const styleCount = await page.$$eval("#profile-styles .profile__style", (els) => els.length);
  check("профиль: 5 стилей интерпретации", styleCount === 5, `найдено ${styleCount}`);

  await page.click('#profile-styles .profile__style[data-style="yoda"]');
  await new Promise((r) => setTimeout(r, 300));
  const activeStyle = await page.$eval("#profile-style-active", (el) => el.textContent.trim());
  const storedStyle = await page.evaluate(() => localStorage.getItem("taro_style"));
  const queuedPayloads = await page.evaluate(() => {
    const before = __taroSendQueue.length;
    taroSend(JSON.stringify({ type: "style", style: "Мастер Йода" }));
    return { before, after: __taroSendQueue.length };
  });
  check(
    "профиль: выбор стиля сохраняется и уходит в очередь бота",
    activeStyle === "Мастер Йода" && storedStyle === "yoda" && queuedPayloads.after === queuedPayloads.before + 1,
    `label=${activeStyle}, ls=${storedStyle}, queue=${queuedPayloads.before}→${queuedPayloads.after}`,
  );

  // Прогноз: клик по блоку «На сегодня» генерирует результат и пишет в историю
  await page.click('[data-tab="forecast"]');
  await new Promise((r) => setTimeout(r, 400));
  const forecastHiddenBefore = await page.$eval("#forecast-result", (el) => el.hidden);
  await page.click('[data-horizon="day"]');
  await new Promise((r) => setTimeout(r, 400));
  const forecastText = await page.$eval("#forecast-result p", (el) => el.textContent.trim().length);
  const forecastVisible = await page.$eval("#forecast-result", (el) => !el.hidden);
  check("прогноз: клик по блоку «На сегодня» выдаёт результат", forecastHiddenBefore && forecastVisible && forecastText > 40, `text=${forecastText} симв, hidden=${forecastHiddenBefore}→${!forecastVisible}`);

  const forecastHistory = await page.evaluate(() => {
    const h = JSON.parse(localStorage.getItem("taro_history") || "[]");
    return { hasForecast: h.some((x) => x.type === "forecast"), count: h.length };
  });
  check("прогноз: сохраняется в историю", forecastHistory.hasForecast && forecastHistory.count >= 1, `count=${forecastHistory.count}`);

  // Расклад уже был посчитан в начале (25.09.1985) — должен лежать в истории
  const readsHistory = await page.evaluate(() => {
    const h = JSON.parse(localStorage.getItem("taro_history") || "[]");
    return h.some((x) => x.type === "reads");
  });
  check("расклады: расчёт сохраняется в историю", readsHistory, "type=reads найден");

  // История: вкладка рендерит сохранённые записи и раскрывает детали
  await page.click('[data-tab="history"]');
  await new Promise((r) => setTimeout(r, 400));
  const historyItems = await page.$$eval(".history__item", (els) => els.length);
  const emptyHidden = await page.$eval("#history-empty", (el) => el.hidden);
  await page.click('.history__item[data-id]');
  await new Promise((r) => setTimeout(r, 300));
  const historyOpen = await page.$$eval(".history__item--open", (els) => els.length);
  check("история: рендер записей + раскрытие деталей", historyItems >= 2 && emptyHidden && historyOpen >= 1, `items=${historyItems}, emptyHidden=${emptyHidden}, open=${historyOpen}`);

  await browser.close();
  console.log("\nИтого: " + results.filter((r) => r.ok).length + "/" + results.length + " пройдено");
  process.exit(results.every((r) => r.ok) ? 0 : 1);
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(2);
});