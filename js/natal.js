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
      return {
        havePlace: havePlace,
        place: place,
        planets: planets,
        asc: asc,
        mc: mc,
        houses: houses,
        aspects: aspects,
      };
    });
  }

  window.TaroNatal = {
    compute: compute,
    geocode: geocode,
    signOf: signOf,
    fmtDeg: fmtDeg,
  };
})();