/* Реальный астрологический расчёт натальной карты.
 * Использует Astronomy Engine (VSOP87, CDN, глобал `Astronomy`).
 * Считает: планеты в знаках Зодиака, Асцендент/МС, дома (Порфирий),
 * аспекты планет и аспекты к углам карты.
 * Публикует глобал `TaroNatal` (window.TaroNatal). */
(function () {
  "use strict";

  var ZODIAC = [
    { name: "Овен", icon: "♈︎" },
    { name: "Телец", icon: "♉︎" },
    { name: "Близнецы", icon: "♊︎" },
    { name: "Рак", icon: "♋︎" },
    { name: "Лев", icon: "♌︎" },
    { name: "Дева", icon: "♍︎" },
    { name: "Весы", icon: "♎︎" },
    { name: "Скорпион", icon: "♏︎" },
    { name: "Стрелец", icon: "♐︎" },
    { name: "Козерог", icon: "♑︎" },
    { name: "Водолей", icon: "♒︎" },
    { name: "Рыбы", icon: "♓︎" },
  ];

  var PLANETS = [
    { body: "Sun", name: "Солнце", icon: "☉" },
    { body: "Moon", name: "Луна", icon: "☽" },
    { body: "Mercury", name: "Меркурий", icon: "☿" },
    { body: "Venus", name: "Венера", icon: "♀" },
    { body: "Mars", name: "Марс", icon: "♂" },
    { body: "Jupiter", name: "Юпитер", icon: "♃" },
    { body: "Saturn", name: "Сатурн", icon: "♄" },
    { body: "Uranus", name: "Уран", icon: "♅" },
    { body: "Neptune", name: "Нептун", icon: "♆" },
    { body: "Pluto", name: "Плутон", icon: "♇" },
  ];

  var ASPECTS = [
    { key: "conjunction", deg: 0, orb: 8, icon: "☌", label: "соединение" },
    { key: "sextile", deg: 60, orb: 5, icon: "⚹", label: "секстиль" },
    { key: "square", deg: 90, orb: 6, icon: "□", label: "квадрат" },
    { key: "trine", deg: 120, orb: 7, icon: "△", label: "тригон" },
    { key: "opposition", deg: 180, orb: 8, icon: "☍", label: "оппозиция" },
  ];

  var FALLBACK_CITIES = {
    "москва": { lat: 55.7558, lon: 37.6173 },
    "санкт-петербург": { lat: 59.9343, lon: 30.3351 },
    "новосибирск": { lat: 55.0302, lon: 82.9204 },
    "екатеринбург": { lat: 56.8389, lon: 60.6057 },
    "казань": { lat: 55.7961, lon: 49.1064 },
    "нижний новгород": { lat: 56.3269, lon: 44.0059 },
    "самара": { lat: 53.1955, lon: 50.1068 },
    "омск": { lat: 54.9924, lon: 73.3686 },
    "ростов-на-дону": { lat: 47.2313, lon: 39.7233 },
    "уфа": { lat: 54.7388, lon: 55.9721 },
    "красноярск": { lat: 56.0106, lon: 92.8526 },
    "воронеж": { lat: 51.6615, lon: 39.2003 },
    "пермь": { lat: 58.0105, lon: 56.2502 },
    "волгоград": { lat: 48.7194, lon: 44.5018 },
    "краснодар": { lat: 45.0355, lon: 38.9753 },
    "саратов": { lat: 51.5315, lon: 46.0358 },
    "тюмень": { lat: 57.1535, lon: 65.5343 },
    "ижевск": { lat: 56.8528, lon: 53.2115 },
    "барнаул": { lat: 53.3483, lon: 83.7763 },
    "иркутск": { lat: 52.2864, lon: 104.2807 },
    "хабаровск": { lat: 48.4802, lon: 135.0719 },
    "владивосток": { lat: 43.1155, lon: 131.8855 },
    "ярославль": { lat: 57.6261, lon: 39.8845 },
    "томск": { lat: 56.4846, lon: 84.9482 },
    "калининград": { lat: 54.7104, lon: 20.4522 },
    "сочи": { lat: 43.5855, lon: 39.7231 },
    "минск": { lat: 53.9006, lon: 27.559 },
    "киев": { lat: 50.4501, lon: 30.5234 },
    "алматы": { lat: 43.2383, lon: 76.9455 },
    "астана": { lat: 51.1605, lon: 71.4704 },
  };

  function norm360(x) {
    return ((x % 360) + 360) % 360;
  }

  function arc(a, b) {
    return norm360(b - a);
  }

  function signOf(lon) {
    var i = Math.floor(norm360(lon) / 30) % 12;
    return ZODIAC[i];
  }

  function degInSign(lon) {
    return norm360(lon) % 30;
  }

  function fmtDeg(lon) {
    var d = degInSign(lon);
    var dInt = Math.floor(d);
    var m = Math.round((d - dInt) * 60);
    if (m === 60) {
      dInt += 1;
      m = 0;
    }
    return dInt + "°" + (m < 10 ? "0" : "") + m + "′";
  }

  function pointOf(lon) {
    var s = signOf(lon);
    return {
      lon: norm360(lon),
      sign: s.name,
      signIcon: s.icon,
      deg: Math.floor(degInSign(lon)),
      degMin: fmtDeg(lon),
      label: fmtDeg(lon) + " " + s.name,
    };
  }

  function geocode(city) {
    city = (city || "").trim();
    if (!city || city === "не указано") return Promise.resolve(null);
    var key = city.toLowerCase();
    if (FALLBACK_CITIES[key]) return Promise.resolve(FALLBACK_CITIES[key]);
    var url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) +
      "&count=1&language=ru&format=json";
    return fetch(url)
      .then(function (resp) {
        if (!resp.ok) return null;
        return resp.json();
      })
      .then(function (data) {
        var r = data && data.results && data.results[0];
        if (!r) return null;
        return { lat: r.latitude, lon: r.longitude };
      })
      .catch(function () {
        return null;
      });
  }

  function calcPlanets(astro) {
    return PLANETS.map(function (p) {
      var lon;
      if (p.body === "Sun") {
        lon = Astronomy.SunPosition(astro).elon;
      } else if (p.body === "Moon") {
        lon = Astronomy.EclipticGeoMoon(astro).lon;
      } else {
        lon = Astronomy.Ecliptic(Astronomy.GeoVector(p.body, astro, true)).elon;
      }
      return {
        name: p.name,
        icon: p.icon,
        body: p.body,
        pos: pointOf(lon),
      };
    });
  }

  function calcAngles(astro, lat, lon) {
    var gast = Astronomy.SiderealTime(astro) * 15;
    var lst = norm360(gast + lon);
    var eps = Astronomy.e_tilt(astro).tobl;
    var epsR = (eps * Math.PI) / 180;
    var latR = (lat * Math.PI) / 180;
    var ramcR = (lst * Math.PI) / 180;
    var mc = norm360((Math.atan2(Math.sin(ramcR), Math.cos(ramcR) * Math.cos(epsR)) * 180) / Math.PI);
    var asc = norm360((Math.atan2(Math.cos(ramcR), -(Math.sin(ramcR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR))) * 180) / Math.PI);
    return {
      asc: pointOf(asc),
      mc: pointOf(mc),
    };
  }

  function porphyryHouses(asc, mc) {
    var ic = norm360(mc.lon + 180);
    var dsc = norm360(asc.lon + 180);
    var angles = [asc.lon, ic, dsc, mc.lon].sort(function (a, b) { return a - b; });
    var iAsc = angles.indexOf(asc.lon);
    var ic2 = angles[(iAsc + 1) % 4];
    var dsc2 = angles[(iAsc + 2) % 4];
    var mc2 = angles[(iAsc + 3) % 4];
    function trisect(a, b) {
      var d = arc(a, b);
      return [norm360(a + d / 3), norm360(a + (2 * d) / 3)];
    }
    var c23 = trisect(asc.lon, ic2);
    var c56 = trisect(ic2, dsc2);
    var c89 = trisect(dsc2, mc2);
    var c1112 = trisect(mc2, asc.lon);
    return {
      1: asc.lon,
      2: c23[0],
      3: c23[1],
      4: ic2,
      5: c56[0],
      6: c56[1],
      7: dsc2,
      8: c89[0],
      9: c89[1],
      10: mc2,
      11: c1112[0],
      12: c1112[1],
    };
  }

  function houseOf(planets, cusps) {
    var out = {};
    var sorted = Object.keys(cusps)
      .map(Number)
      .sort(function (a, b) { return cusps[a] - cusps[b]; });
    planets.forEach(function (p) {
      var lon = p.pos.lon;
      var house = sorted[0];
      for (var i = 0; i < 12; i++) {
        var span = arc(cusps[sorted[i]], cusps[sorted[(i + 1) % 12]]);
        if (arc(cusps[sorted[i]], lon) < span) {
          house = sorted[i];
          break;
        }
      }
      out[p.name] = house;
    });
    return out;
  }

  function angularSep(lonA, lonB) {
    var d = norm360(lonB - lonA);
    return d > 180 ? 360 - d : d;
  }

  function calcAspects(planets, asc, mc) {
    var targets = planets.slice();
    if (asc) targets.push({ name: "Асцендент", icon: "Asc", pos: asc });
    if (mc) targets.push({ name: "МС", icon: "MC", pos: mc });
    var out = [];
    for (var i = 0; i < targets.length; i++) {
      for (var j = i + 1; j < targets.length; j++) {
        var a = targets[i];
        var b = targets[j];
        if (a.name === "Солнце" && b.name === "Луна") continue;
        var sep = angularSep(a.pos.lon, b.pos.lon);
        var best = null;
        for (var k = 0; k < ASPECTS.length; k++) {
          var asp = ASPECTS[k];
          var orb = Math.abs(sep - asp.deg);
          if (orb <= asp.orb && (!best || orb < best.orb)) {
            best = { key: asp.key, icon: asp.icon, label: asp.label, orb: orb };
          }
        }
        if (best) {
          out.push({
            a: a.icon + " " + a.name,
            b: b.icon + " " + b.name,
            aspect: best.key,
            icon: best.icon,
            label: best.label,
            orb: best.orb.toFixed(1),
          });
        }
      }
    }
    return out;
  }

  var SIGN_ELEMENTS = {
    "Овен": "fire", "Лев": "fire", "Стрелец": "fire",
    "Телец": "earth", "Дева": "earth", "Козерог": "earth",
    "Близнецы": "air", "Весы": "air", "Водолей": "air",
    "Рак": "water", "Скорпион": "water", "Рыбы": "water"
  };

  var SIGN_MODALITIES = {
    "Овен": "cardinal", "Рак": "cardinal", "Весы": "cardinal", "Козерог": "cardinal",
    "Телец": "fixed", "Лев": "fixed", "Скорпион": "fixed", "Водолей": "fixed",
    "Близнецы": "mutable", "Дева": "mutable", "Стрелец": "mutable", "Рыбы": "mutable"
  };

  function calcNatalMoonPhase(astro) {
    if (!window.Astronomy) return null;
    var phaseDeg = Astronomy.MoonPhase(astro);
    var illum = Math.round(((1 - Math.cos((phaseDeg * Math.PI) / 180)) / 2) * 100);
    var phaseName = "";
    var icon = "";
    var archetype = "";
    var desc = "";

    if (phaseDeg < 22.5 || phaseDeg >= 337.5) {
      phaseName = "Новолуние";
      icon = "🌑";
      archetype = "Первопроходец и сеятель";
      desc = "Ты рождён в точке чистого космического импульса. Твоя сила — в интуиции, искренности и способности начинать с чистого листа там, где другие сдаются. Доверяй первому порыву души.";
    } else if (phaseDeg < 67.5) {
      phaseName = "Молодая Луна (Серп)";
      icon = "🌒";
      archetype = "Росток сквозь камень";
      desc = "Рождение под растущим серпом наделяет упорством и смелостью преодолевать первичное сопротивление среды. Ты здесь, чтобы воплощать смелые идеи вопреки сомнениям.";
    } else if (phaseDeg < 112.5) {
      phaseName = "Первая четверть";
      icon = "🌓";
      archetype = "Строитель и деятель";
      desc = "Точка динамического вызова. Ты умеешь принимать непростые решения, трансформировать кризис в трамплин и строить прочные жизненные фундаменты.";
    } else if (phaseDeg < 157.5) {
      phaseName = "Выпуклая (прибывающая) Луна";
      icon = "🌔";
      archetype = "Искатель совершенства";
      desc = "Ты стремишься к глубине, детальности и непрерывному развитию. Твой дар — доводить мастерство до филигранности и служить ориентиром для близких людей.";
    } else if (phaseDeg < 202.5) {
      phaseName = "Полнолуние";
      icon = "🌕";
      archetype = "Свет ясности и эмпатии";
      desc = "Максимальный расцвет психической энергии. Ты тонко чувствуешь людей, обладаешь притягательным обаянием и учишься соединять голос разума с глубиной сердца.";
    } else if (phaseDeg < 247.5) {
      phaseName = "Рассеивающая Луна";
      icon = "🌖";
      archetype = "Наставник и проводник";
      desc = "Твоя миссия — делиться мудростью, объединять людей вокруг общих смыслов и сеять осознанность. Ты щедр душой и видишь красоту в служении общему благу.";
    } else if (phaseDeg < 292.5) {
      phaseName = "Последняя четверть";
      icon = "🌗";
      archetype = "Философ и реформатор";
      desc = "Внутренняя независимость от чужих авторитетов. Ты умеешь безжалостно отсекать отжившее, зрить в корень явлений и переосмысливать привычные правила.";
    } else {
      phaseName = "Бальзамическая Луна";
      icon = "🌘";
      archetype = "Мудрец и провидец";
      desc = "Глубокая кармическая зрелость и обострённое шестое чувство. Ты способен завершать сложные жизненные циклы, отпускать прошлое и видеть скрытые механизмы судьбы.";
    }

    return {
      phaseDeg: Math.round(phaseDeg),
      illumination: illum,
      name: phaseName,
      icon: icon,
      archetype: archetype,
      desc: desc
    };
  }

  function calcElements(planets, asc) {
    var weights = {
      "Солнце": 2.5, "Луна": 2.5, "Меркурий": 1.5, "Венера": 1.5, "Марс": 1.5,
      "Юпитер": 1.0, "Сатурн": 1.0, "Уран": 0.5, "Нептун": 0.5, "Плутон": 0.5
    };
    var elements = { fire: 0, earth: 0, air: 0, water: 0 };
    var modalities = { cardinal: 0, fixed: 0, mutable: 0 };
    var total = 0;

    planets.forEach(function (p) {
      var w = weights[p.name] || 1;
      var el = SIGN_ELEMENTS[p.pos.sign];
      var mod = SIGN_MODALITIES[p.pos.sign];
      if (el) elements[el] += w;
      if (mod) modalities[mod] += w;
      total += w;
    });

    if (asc) {
      var ascEl = SIGN_ELEMENTS[asc.sign];
      var ascMod = SIGN_MODALITIES[asc.sign];
      if (ascEl) elements[ascEl] += 2.0;
      if (ascMod) modalities[ascMod] += 2.0;
      total += 2.0;
    }

    var firePct = Math.round((elements.fire / total) * 100);
    var earthPct = Math.round((elements.earth / total) * 100);
    var airPct = Math.round((elements.air / total) * 100);
    var waterPct = Math.max(0, 100 - (firePct + earthPct + airPct));

    var list = [
      { key: "fire", name: "Огонь", icon: "🔥", pct: firePct, desc: "Импульс, страсть, лидерский дух и смелость действий." },
      { key: "earth", name: "Земля", icon: "🌍", pct: earthPct, desc: "Практичность, стабильность, материализация замыслов и надёжность." },
      { key: "air", name: "Воздух", icon: "💨", pct: airPct, desc: "Интеллект, общительность, гибкость мышления и жажда знаний." },
      { key: "water", name: "Вода", icon: "🌊", pct: waterPct, desc: "Интуиция, эмпатия, глубинная чувственность и образное видение." },
    ].sort(function (a, b) { return b.pct - a.pct; });

    return {
      fire: firePct,
      earth: earthPct,
      air: airPct,
      water: waterPct,
      dominant: list[0],
      secondary: list[1],
      deficient: list[3],
      list: list
    };
  }

  function getPlanetByBody(planets, body) {
    for (var i = 0; i < planets.length; i++) {
      if (planets[i].body === body) return planets[i];
    }
    return null;
  }

  function calcLifeSpheres(planets, asc, mc, houses, moonPhase, elements) {
    var sun = getPlanetByBody(planets, "Sun");
    var moon = getPlanetByBody(planets, "Moon");
    var venus = getPlanetByBody(planets, "Venus");
    var mars = getPlanetByBody(planets, "Mars");
    var jupiter = getPlanetByBody(planets, "Jupiter");
    var saturn = getPlanetByBody(planets, "Saturn");

    // 1. Любовь и Отношения
    var loveSign = venus ? venus.pos.sign : (sun ? sun.pos.sign : "Весы");
    var moonSign = moon ? moon.pos.sign : "Рак";
    var love = {
      title: "Любовь и Отношения",
      icon: "💖",
      venusPlacement: venus ? "Венера в знаке " + venus.pos.sign + " (" + venus.pos.degMin + ")" : "Гармония чувств",
      moonPlacement: moon ? "Луна в знаке " + moon.pos.sign + " (" + moon.pos.degMin + ")" : "Эмоциональный центр",
      style: "В любви ты ценишь " + (SIGN_ELEMENTS[loveSign] === "fire" ? "яркую страсть, инициативу и открытую искренность" :
             SIGN_ELEMENTS[loveSign] === "earth" ? "преданность, заботу через поступки, надёжность и уют" :
             SIGN_ELEMENTS[loveSign] === "air" ? "интеллектуальную близость, лёгкость диалога и свободу" :
             "глубокую эмоциональную связь, душевное тепло и тонкое созвучие"),
      partnerPortrait: "Твой идеальный союз строится на партнёре, который " + (
        SIGN_ELEMENTS[moonSign] === "water" ? "понимает тебя без слов и создаёт безопасную гавань для чувств." :
        SIGN_ELEMENTS[moonSign] === "fire" ? "вдохновляет на совместные свершения и не боится проявлять огонь." :
        SIGN_ELEMENTS[moonSign] === "earth" ? "даёт твёрдую опору под ногами и разделяет долгосрочные цели." :
        "разделяет твои увлечения и всегда готов к увлекательным разговорам."
      ),
      advice: "Не бойся проявлять уязвимость: истинная близость рождается там, где ты позволяешь себе быть настоящим."
    };

    // 2. Работа, Карьера и Финансы
    var marsSign = mars ? mars.pos.sign : "Овен";
    var mcSign = mc ? mc.sign : (sun ? sun.pos.sign : "Козерог");
    var career = {
      title: "Работа, Карьера и Деньги",
      icon: "💼",
      marsPlacement: mars ? "Марс в знаке " + mars.pos.sign + " (" + mars.pos.degMin + ")" : "Вектор действий",
      mcPlacement: mc ? "Зенит карьеры (MC) в " + mc.sign + " (" + mc.degMin + ")" : "Высшие амбиции",
      drive: "Твой стиль достижения целей — " + (
        SIGN_ELEMENTS[marsSign] === "fire" ? "быстрый решительный прорыв, лидерство и умение зажигать других." :
        SIGN_ELEMENTS[marsSign] === "earth" ? "методичное упорство, выверенная стратегия и контроль качества." :
        SIGN_ELEMENTS[marsSign] === "air" ? "стратегические переговоры, поиск нестандартных решений и нетворкинг." :
        "интуитивное чутье трендов, гибкость в обходе препятствий и преданность идее."
      ),
      wealthKeys: "Финансовый поток усиливается, когда ты вкладываешь ресурсы в " + (
        SIGN_ELEMENTS[mcSign] === "earth" ? "создание осязаемых ценностей, недвижимость и системный бизнес." :
        SIGN_ELEMENTS[mcSign] === "air" ? "информационные технологии, консалтинг, медиа и полезные связи." :
        SIGN_ELEMENTS[mcSign] === "fire" ? "личный бренд, запуск авторских проектов и смелое лидерство." :
        "творческие индустрии, помогающие профессии и развитие эмпатичного сервиса."
      ),
      advice: "Помни: стабильный рост строится не на суете, а на точной концентрации энергии в одной ключевой точке."
    };

    // 3. Предназначение и Духовный путь
    var sunSign = sun ? sun.pos.sign : "Овен";
    var jupiterSign = jupiter ? jupiter.pos.sign : "Стрелец";
    var destiny = {
      title: "Предназначение и Дух",
      icon: "🧭",
      sunPlacement: sun ? "Солнце в знаке " + sun.pos.sign + " (" + sun.pos.degMin + ")" : "Ядро души",
      jupiterPlacement: jupiter ? "Юпитер в знаке " + jupiter.pos.sign + " (" + jupiter.pos.degMin + ")" : "Зона удачи",
      mission: "Твоя высшая задача — выразить уникальную энергию знака " + sunSign + ": быть источником осознанности и вдохновения для своего окружения.",
      expansionZone: "Врата изобилия и духовного роста открываются через " + (
        SIGN_ELEMENTS[jupiterSign] === "fire" ? "веру в свою звезду, смелые путешествия и передачу огня веры." :
        SIGN_ELEMENTS[jupiterSign] === "earth" ? "мастерство в материи, щедрость и созидание прочного наследия." :
        SIGN_ELEMENTS[jupiterSign] === "air" ? "расширение кругозора, непрерывное обучение и свободомыслие." :
        "глубокую внутреннюю работу, духовную чистоту и сострадание к миру."
      ),
      advice: "Твой личный компас всегда внутри. Когда ты следуешь зову сердца, пространство выстраивается навстречу."
    };

    // 4. Энергия, Витальность и Здоровье
    var health = {
      title: "Энергия и Здоровье",
      icon: "⚡",
      balance: "Доминирующая стихия — " + (elements ? elements.dominant.name : "Огонь") + ". Она питает твой жизненный тонус.",
      recharge: "Для полной перезагрузки тебе необходимо: " + (
        elements && elements.dominant.key === "fire" ? "физическая активность, спорт, солнечный свет и яркие впечатления." :
        elements && elements.dominant.key === "earth" ? "контакт с природой, качественный сон, заземление и массаж." :
        elements && elements.dominant.key === "air" ? "смена обстановки, тишина от информационного шума и прогулки на свежем воздухе." :
        "время наедине с собой, вода (плавание, ванна), медитация и спокойная музыка."
      ),
      warning: "Остерегайся дефицита стихии " + (elements ? elements.deficient.name : "Вода") + ": " + (
        elements && elements.deficient.key === "water" ? "не подавляй эмоции, позволяй себе чувствовать." :
        elements && elements.deficient.key === "fire" ? "не допускай апатии, добавляй в расписание искру и драйв." :
        elements && elements.deficient.key === "earth" ? "не забывай о регулярном питании и режиме дня." :
        "давай мозгу отдых от анализа, общайся с близкими людьми."
      )
    };

    return {
      love: love,
      career: career,
      destiny: destiny,
      health: health
    };
  }

  function compute(input) {
    if (!window.Astronomy) return Promise.resolve(null);
    var day = Number(input.day);
    var month = Number(input.month);
    var year = Number(input.year);
    var hour = 12;
    var minute = 0;
    var time = input.time || "";
    var tm = /^(\d{1,2}):(\d{2})/.exec(time);
    if (tm) {
      hour = Number(tm[1]);
      minute = Number(tm[2]);
    }
    return geocode(input.city).then(function (place) {
      var tz = place ? Math.round(place.lon / 15) : 0;
      var ut = Date.UTC(year, month - 1, day, hour - tz, minute, 0, 0);
      var astro = Astronomy.MakeTime(new Date(ut));
      var planets = calcPlanets(astro);
      var asc = null;
      var mc = null;
      var houses = null;
      var havePlace = !!(place && isFinite(place.lat) && isFinite(place.lon));
      if (havePlace) {
        var angles = calcAngles(astro, place.lat, place.lon);
        asc = angles.asc;
        mc = angles.mc;
        var cusps = porphyryHouses(asc, mc);
        houses = { cusps: cusps, positions: houseOf(planets, cusps) };
      }
      var aspects = calcAspects(planets, asc, mc);
      var moonPhase = calcNatalMoonPhase(astro);
      var elements = calcElements(planets, asc);
      var spheres = calcLifeSpheres(planets, asc, mc, houses, moonPhase, elements);
      return {
        havePlace: havePlace,
        place: place,
        planets: planets,
        asc: asc,
        mc: mc,
        houses: houses,
        aspects: aspects,
        moonPhase: moonPhase,
        elements: elements,
        spheres: spheres,
      };
    });
  }


  function computeLunarPhase() {
    if (!window.Astronomy) return null;
    var now = Astronomy.MakeTime(new Date());
    var phaseDeg = Astronomy.MoonPhase(now); 
    var phaseName = "";
    var icon = "";
    if (phaseDeg < 15 || phaseDeg > 345) { phaseName = "Новолуние"; icon = "🌑"; }
    else if (phaseDeg < 80) { phaseName = "Растущая Луна"; icon = "🌒"; }
    else if (phaseDeg < 100) { phaseName = "Первая четверть"; icon = "🌓"; }
    else if (phaseDeg < 165) { phaseName = "Растущая Луна"; icon = "🌔"; }
    else if (phaseDeg < 195) { phaseName = "Полнолуние"; icon = "🌕"; }
    else if (phaseDeg < 260) { phaseName = "Убывающая Луна"; icon = "🌖"; }
    else if (phaseDeg < 280) { phaseName = "Последняя четверть"; icon = "🌗"; }
    else { phaseName = "Убывающая Луна"; icon = "🌘"; }

    var moonLon = Astronomy.EclipticGeoMoon(now).lon;
    return {
      phaseDeg: phaseDeg,
      phaseName: phaseName,
      icon: icon,
      sign: signOf(moonLon).name,
      signIcon: signOf(moonLon).icon
    };
  }

  function computeTransits(natalPlanets) {
    if (!window.Astronomy || !natalPlanets || !natalPlanets.length) return null;
    var now = Astronomy.MakeTime(new Date());
    var transitPlanets = calcPlanets(now);
    
    var transits = [];
    for (var i = 0; i < transitPlanets.length; i++) {
      var tP = transitPlanets[i];
      for (var j = 0; j < natalPlanets.length; j++) {
        var nP = natalPlanets[j];
        // Исключаем слишком частые транзиты Луны для упрощения прогноза,
        // но оставим Солнце, Венеру, Марс и медленные
        if (tP.name === "Луна" && nP.name !== "Солнце" && nP.name !== "Луна") continue; 
        
        var sep = angularSep(tP.pos.lon, nP.pos.lon);
        for (var k = 0; k < ASPECTS.length; k++) {
          var asp = ASPECTS[k];
          // Для транзитов используем узкий орбис (max 3 градуса)
          var orb = Math.abs(sep - asp.deg);
          if (orb <= 3) {
             transits.push({
               transitPlanet: tP.icon + " " + tP.name,
               natalPlanet: nP.icon + " " + nP.name,
               aspect: asp.key,
               icon: asp.icon,
               label: asp.label,
               orb: orb.toFixed(1)
             });
          }
        }
      }
    }
    // Сортируем по точности
    transits.sort(function(a, b) { return a.orb - b.orb; });
    return transits.slice(0, 5); // Топ 5 самых точных
  }

  function computeSync(input) {
    if (!window.Astronomy || !input) return null;
    var day = Number(input.day);
    var month = Number(input.month);
    var year = Number(input.year);
    if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      return null;
    }
    var hour = 12;
    var minute = 0;
    var time = input.time || "";
    var tm = /^(\d{1,2}):(\d{2})/.exec(time);
    if (tm) {
      hour = Number(tm[1]);
      minute = Number(tm[2]);
    }
    var cityKey = (input.city || "").trim().toLowerCase();
    var place = FALLBACK_CITIES[cityKey] || null;
    var tz = place ? Math.round(place.lon / 15) : 3;
    var ut = Date.UTC(year, month - 1, day, hour - tz, minute, 0, 0);
    var astro = Astronomy.MakeTime(new Date(ut));
    var planets = calcPlanets(astro);
    var asc = null;
    var mc = null;
    if (place) {
      var angles = calcAngles(astro, place.lat, place.lon);
      asc = angles.asc;
      mc = angles.mc;
    }
    var moonPhase = calcNatalMoonPhase(astro);
    var elements = calcElements(planets, asc);
    var spheres = calcLifeSpheres(planets, asc, mc, null, moonPhase, elements);
    return {
      havePlace: !!place,
      place: place,
      planets: planets,
      asc: asc,
      mc: mc,
      moonPhase: moonPhase,
      elements: elements,
      spheres: spheres
    };
  }

  window.TaroNatal = {
    compute: compute,
    computeSync: computeSync,
    geocode: geocode,
    signOf: signOf,
    fmtDeg: fmtDeg,
    computeLunarPhase: computeLunarPhase,
    computeTransits: computeTransits,
    calcNatalMoonPhase: calcNatalMoonPhase,
    calcElements: calcElements,
    calcLifeSpheres: calcLifeSpheres
  };
})();