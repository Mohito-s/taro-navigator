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

  await browser.close();
  console.log("\nИтого: " + results.filter((r) => r.ok).length + "/" + results.length + " пройдено");
  process.exit(results.every((r) => r.ok) ? 0 : 1);
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(2);
});