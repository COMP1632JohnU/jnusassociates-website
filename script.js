// ======================================================
// JNUS ASSOCIATES LTD — GLOBAL JS (Ticker + UI + Clock)
// ======================================================

// === 1️⃣ Lucide Icons Activation ===
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

// === 2️⃣ GLOBAL MARKET HOURS & SMART SPEED CONTROL ===
function adjustTickerSpeed() {
  const ticker = document.getElementById("stockTicker");
  const statusBar = document.getElementById("marketStatusBar");
  if (!ticker || !statusBar) return;

  const nowUTC = new Date();
  const utcHour = nowUTC.getUTCHours();
  const utcDay = nowUTC.getUTCDay();

  const markets = [
    { name: "London", open: 8, close: 16 },
    { name: "New York", open: 13, close: 21 },
    { name: "Tokyo", open: 0, close: 6 },
    { name: "Hong Kong", open: 1, close: 9 },
    { name: "Singapore", open: 1, close: 9 },
    { name: "Beijing", open: 1, close: 9 }
  ];

  const openMarkets =
    utcDay !== 0 && utcDay !== 6
      ? markets.filter((m) => utcHour >= m.open && utcHour < m.close)
      : [];

  const numOpen = openMarkets.length;
  const anyOpen = numOpen > 0;

  let duration = 90;
  if (numOpen === 1) duration = 60;
  else if (numOpen === 2) duration = 45;
  else if (numOpen >= 3) duration = 30;

  ticker.style.animationDuration = `${duration}s`;
  ticker.style.filter = anyOpen
    ? `drop-shadow(0 0 ${numOpen * 4}px rgba(0,255,255,0.9))`
    : "drop-shadow(0 0 4px rgba(0,255,255,0.3))";

  const utcTime = nowUTC.toUTCString().split(" ")[4];

  if (anyOpen) {
    statusBar.innerHTML = `
      <span class="teal-glow">
        🌍 Markets Open: ${openMarkets.map((m) => m.name).join(", ")}
        — Speed: ${
          duration === 30 ? "⚡ Fast" : duration === 45 ? "⏩ Medium" : "▶ Normal"
        }
      </span>
      <span class="neutral-glow" style="margin-left: 1rem;">
        (${utcTime} UTC)
      </span>
    `;
  } else {
    statusBar.innerHTML = `
      <span class="neutral-glow">
        💤 All markets closed — awaiting next trading session (${utcTime} UTC)
      </span>
    `;
  }

  // 🔄 Glow fade when updated
  statusBar.classList.add("refresh-fade");
  setTimeout(() => statusBar.classList.remove("refresh-fade"), 1400);
}

window.addEventListener("load", adjustTickerSpeed);
setInterval(adjustTickerSpeed, 900000);

// === 3️⃣ LIVE GLOBAL CLOCK BAR ===
function updateMarketClock() {
  const clockBar = document.getElementById("marketClockBar");
  if (!clockBar) return;

  const now = new Date();

  const zones = [
    { label: "UTC", offset: 0 },
    { label: "London", offset: 0 },
    { label: "New York", offset: -4 },
    { label: "Tokyo", offset: 9 },
    { label: "Hong Kong", offset: 8 },
    { label: "Singapore", offset: 8 }
  ];

  const html = zones
    .map((z) => {
      const local = new Date(now.getTime() + z.offset * 3600 * 1000);
      const time = local.toUTCString().split(" ")[4];
      return `<span class="clock-item"><span class="clock-label">${z.label}:</span> <span class="clock-time">${time}</span></span>`;
    })
    .join(" • ");

  clockBar.innerHTML = html;

  // 🔄 Glow fade each refresh
  clockBar.classList.add("refresh-fade");
  setTimeout(() => clockBar.classList.remove("refresh-fade"), 1400);
}

window.addEventListener("load", updateMarketClock);
setInterval(updateMarketClock, 10000); // update every 10 s

// === 4️⃣ TICKER HOVER PAUSE ===
document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.querySelector(".ticker-content");
  if (ticker) {
    ticker.addEventListener("mouseenter", () => (ticker.style.animationPlayState = "paused"));
    ticker.addEventListener("mouseleave", () => (ticker.style.animationPlayState = "running"));
  }
});

// === 5️⃣ LIVE STOCK PRICE FETCH ===
const stockSymbols = [
  "AAPL","MSFT","NVDA","GOOG","AMZN","META","TSLA",
  "NFLX","ORCL","INTC","AMD","IBM","BABA","SAP","V",
  "MA","PYPL","JPM","BAC","GS","C","KO","PEP","DIS",
  "NKE","MCD","SBUX","PG","UNH","BP","XOM","CVX","TSM","ADBE"
];

const FINNHUB_KEY = "d3tjfj9r01qigeg3f3v0d3tjfj9r01qigeg3f3vg";
const ALPHA_KEY = "HARHFLFJZZBX044Y";

function movementStyle(changePercent) {
  if (typeof changePercent !== "number" || isNaN(changePercent))
    return { cls: "neutral-glow", arrow: "•" };
  if (changePercent > 0.05) return { cls: "teal-glow", arrow: "▲" };
  if (changePercent < -0.05) return { cls: "red-glow", arrow: "▼" };
  return { cls: "neutral-glow", arrow: "•" };
}

function formatUTCTime() {
  const now = new Date();
  return now.toUTCString().split(" ")[4];
}

async function fetchStockPrices() {
  const ticker = document.getElementById("stockTicker");
  if (!ticker) return;

  ticker.style.opacity = "0.6";
  ticker.innerHTML = `<span class="neutral-glow">Loading live market data...</span>`;

  const cacheKey = "jnus_stock_cache";
  const cacheTimeKey = "jnus_stock_cache_time";
  const cacheDuration = 10 * 60 * 1000;

  try {
    const now = Date.now();
    const lastCache = localStorage.getItem(cacheKey);
    const lastCacheTime = parseInt(localStorage.getItem(cacheTimeKey), 10) || 0;

    if (lastCache && now - lastCacheTime < cacheDuration) {
      ticker.innerHTML = lastCache;
      ticker.style.opacity = "1";
      return;
    }

    const finnhubResults = await Promise.allSettled(
      stockSymbols.map(async (symbol) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();
        const price = parseFloat(data.c);
        const pct = parseFloat(data.dp);
        if (!isFinite(price)) throw new Error("Invalid data");
        const { cls, arrow } = movementStyle(pct);
        const pctDisplay = isFinite(pct) ? `(${pct > 0 ? "+" : ""}${pct.toFixed(2)}%)` : "";
        return `<span class="${cls}">${symbol}: ${price.toFixed(2)} ${pctDisplay} ${arrow}</span>`;
      })
    );

    const hasData = finnhubResults.some(
      (r) => r.status === "fulfilled" && r.value.includes(":")
    );

    let output;
    if (!hasData) {
      const alphaResults = await Promise.allSettled(
        stockSymbols.map(async (symbol) => {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_KEY}`;
          const resp = await fetch(url);
          const data = await resp.json();
          const q = data["Global Quote"] || {};
          const price = parseFloat(q["05. price"]);
          const pct = q["10. change percent"]
            ? parseFloat(q["10. change percent"].replace("%", ""))
            : NaN;
          const { cls, arrow } = movementStyle(pct);
          const pctDisplay = isFinite(pct)
            ? `(${pct > 0 ? "+" : ""}${pct.toFixed(2)}%)`
            : "";
          const priceDisplay = isFinite(price) ? price.toFixed(2) : "N/A";
          return `<span class="${cls}">${symbol}: ${priceDisplay} ${pctDisplay} ${arrow}</span>`;
        })
      );
      output = alphaResults
        .map((r) => (r.status === "fulfilled" ? r.value : `<span class="neutral-glow">N/A</span>`))
        .join(" • ");
    } else {
      output = finnhubResults
        .map((r) => (r.status === "fulfilled" ? r.value : `<span class="neutral-glow">N/A</span>`))
        .join(" • ");
    }

    const timestamp = `
      <span class="teal-glow fade-glow" style="margin-left:1.5rem;">
        🕒 Last updated: ${formatUTCTime()} UTC
      </span>`;
    ticker.innerHTML = output + timestamp;
    ticker.style.opacity = "1";

    // 🔄 Fade glow each refresh
    ticker.classList.add("refresh-fade");
    setTimeout(() => ticker.classList.remove("refresh-fade"), 1400);

    localStorage.setItem(cacheKey, output);
    localStorage.setItem(cacheTimeKey, now.toString());
  } catch {
    const cached = localStorage.getItem(cacheKey);
    ticker.innerHTML = cached
      ? cached
      : `<span class="neutral-glow">Temporarily unavailable…</span>`;
    ticker.style.opacity = "1";
  }
}

fetchStockPrices();
setInterval(fetchStockPrices, 60000);

// === 6️⃣ MOBILE NAV TOGGLE ===
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.createElement("div");
  hamburger.classList.add("hamburger");
  hamburger.innerHTML = "&#9776;";
  const navbar = document.querySelector(".navbar ul");
  const header = document.querySelector(".site-header .container");
  if (header && navbar && !document.querySelector(".hamburger")) {
    header.insertBefore(hamburger, header.lastElementChild);
  }
  hamburger.addEventListener("click", () => {
    navbar.classList.toggle("active");
    hamburger.classList.toggle("active");
    hamburger.innerHTML = navbar.classList.contains("active")
      ? "&times;"
      : "&#9776;";
  });
});