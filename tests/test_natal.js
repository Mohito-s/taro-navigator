// Unit-тесты для астрологического модуля js/natal.js в среде Node.js
const assert = require("assert");

// Моделируем глобальное окружение браузера для natal.js
global.window = global;
require("../js/natal.js");
const TaroNatal = global.TaroNatal;

console.log("▶ Запуск тестов модуля TaroNatal...");

// 1. Тест signOf
assert.strictEqual(TaroNatal.signOf(0).name, "Овен");
assert.strictEqual(TaroNatal.signOf(0).icon, "♈︎");
assert.strictEqual(TaroNatal.signOf(29.99).name, "Овен");
assert.strictEqual(TaroNatal.signOf(30).name, "Телец");
assert.strictEqual(TaroNatal.signOf(180).name, "Весы");
assert.strictEqual(TaroNatal.signOf(359.9).name, "Рыбы");
console.log("✔ signOf: корректно определяет знаки зодиака по градусам эклиптики");

// 2. Тест fmtDeg
assert.strictEqual(TaroNatal.fmtDeg(15.5), "15°30′");
assert.strictEqual(TaroNatal.fmtDeg(0), "0°00′");
console.log("✔ fmtDeg: корректно форматирует градусы и минуты");

// 3. Тест calcElements (баланс 4 стихий)
const mockPlanets = [
  { name: "Солнце", pos: { sign: "Весы" } },      // Воздух
  { name: "Луна", pos: { sign: "Водолей" } },      // Воздух
  { name: "Меркурий", pos: { sign: "Скорпион" } }, // Вода
  { name: "Венера", pos: { sign: "Дева" } },       // Земля
  { name: "Марс", pos: { sign: "Овен" } },         // Огонь
  { name: "Юпитер", pos: { sign: "Водолей" } },    // Воздух
  { name: "Сатурн", pos: { sign: "Скорпион" } },   // Вода
  { name: "Уран", pos: { sign: "Стрелец" } },      // Огонь
  { name: "Нептун", pos: { sign: "Козерог" } },    // Земля
  { name: "Плутон", pos: { sign: "Скорпион" } }    // Вода
];
const mockAsc = { sign: "Козерог", lon: 285 };     // Земля

const elements = TaroNatal.calcElements(mockPlanets, mockAsc);
assert(elements, "calcElements вернул пустой результат");
assert.strictEqual(typeof elements.fire, "number");
assert.strictEqual(typeof elements.earth, "number");
assert.strictEqual(typeof elements.air, "number");
assert.strictEqual(typeof elements.water, "number");

// Сумма процентов должна быть ровно 100%
const totalPct = elements.fire + elements.earth + elements.air + elements.water;
assert.strictEqual(totalPct, 100, `Сумма процентов стихий (${totalPct}) должна быть 100`);

// Доминирующая стихия должна быть в топе списка
assert(elements.dominant && elements.dominant.pct >= elements.secondary.pct);
assert(elements.deficient && elements.deficient.pct <= elements.secondary.pct);
console.log("✔ calcElements: сумма стихий 100%, корректно определены доминирующая и дефицитная стихии");

// 4. Тест calcLifeSpheres
const mockHouses = [
  { cusps: 285 }, { cusps: 315 }, { cusps: 345 }, { cusps: 15 },
  { cusps: 45 }, { cusps: 75 }, { cusps: 105 }, { cusps: 135 },
  { cusps: 165 }, { cusps: 195 }, { cusps: 225 }, { cusps: 255 }
];

const spheres = TaroNatal.calcLifeSpheres(mockPlanets, mockAsc, mockHouses);
assert(spheres, "calcLifeSpheres вернул null");
assert(spheres.love, "Сфера любви отсутствует");
assert(spheres.career, "Сфера карьеры отсутствует");
assert(spheres.destiny, "Сфера предназначения отсутствует");
assert(spheres.health, "Сфера здоровья отсутствует");

assert(spheres.love.title.includes("Любовь"));
assert(spheres.career.title.includes("Работа"));
assert(spheres.destiny.title.includes("Предназначение"));
assert(spheres.health.title.includes("Энергия"));
console.log("✔ calcLifeSpheres: сформированы 4 сферы жизни (любовь, карьера, предназначение, здоровье)");

console.log("🎉 Все JS unit-тесты успешно пройдены!");
