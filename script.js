// ======================================================
// JNUS ASSOCIATES LTD — GLOBAL JS (Ticker + UI Features)
// ======================================================

// === 1️⃣ Lucide Icons Activation (keeps your icons glowing nicely) ===
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

// === 2️⃣ Formspree Protection / Smooth Handling (optional) ===
// (You can add form logic here later if needed)

// === 3️⃣ Global Live Market Ticker Speed Control ===

// Adjust ticker speed dynamically based on global market hours
function adjustTickerSpeed() {
  const ticker = document.getElementById("stockTicker");
  if (!ticker) return; // If ticker not found on this page, skip

  const nowUTC = new Date();
  const utcHour = nowUTC.getUTCHours();
  const utcDay = nowUTC.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Skip weekends
  if (utcDay === 0 || utcDay === 6) {
    ticker.style.animationDuration = "80s";
    ticker.style.filter = "drop-shadow(0 0 6px rgba(0,255,255,0.5))";
    return;
  }

  // Define major global markets and their open hours in UTC
  const markets = [
    { name: "LSE (London)", open: 8, close: 16 },     // 08:00–16:00 UTC
    { name: "NYSE (New York)", open: 13, close: 21 }, // 13:00–21:00 UTC
    { name: "Tokyo", open: 0, close: 6 },             // 00:00–06:00 UTC
    { name: "Hong Kong", open: 1, close: 9 },         // 01:00–09:00 UTC
    { name: "Singapore", open: 1, close: 9 },         // 01:00–09:00 UTC
    { name: "Beijing", open: 1, close: 9 }            // 01:00–09:00 UTC
  ];

  // Check if any market is open
  const anyMarketOpen = markets.some(
    market => utcHour >= market.open && utcHour < market.close
  );

  // Adjust ticker animation speed based on market activity
  ticker.style.animationDuration = anyMarketOpen ? "40s" : "80s";

  // Teal glow effect intensity depending on activity
  ticker.style.filter = anyMarketOpen
    ? "drop-shadow(0 0 12px rgba(0,255,255,0.9))"
    : "drop-shadow(0 0 6px rgba(0,255,255,0.4))";

  // Optional console feedback
  const openMarkets = markets.filter(
    m => utcHour >= m.open && utcHour < m.close
  );
  console.log(
    "🌐 Markets currently open:",
    openMarkets.length > 0 ? openMarkets.map(m => m.name).join(", ") : "None"
  );
}

// Run on page load
window.addEventListener("load", adjustTickerSpeed);

// Recheck every 15 minutes
setInterval(adjustTickerSpeed, 900000);

// === 4️⃣ Optional — Ticker Hover Pause Enhancement ===
document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.querySelector(".ticker-content");
  if (ticker) {
    ticker.addEventListener("mouseenter", () => {
      ticker.style.animationPlayState = "paused";
    });
    ticker.addEventListener("mouseleave", () => {
      ticker.style.animationPlayState = "running";
    });
  }
});
/* ===== LIVE STOCK PRICE FETCH (GLOBAL MARKETS) ===== */

// List of tickers to display




async function fetchStockPrices() {
  const ticker = document.getElementById("stockTicker");
  if (!ticker) return;

  try {
    const prices = await Promise.all(
      stockSymbols.map(async symbol => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        const price = data.c || "N/A"; // "c" = current price in Finnhub API
        return `${symbol}: ${price}`;
      })
    );

    ticker.innerHTML = prices.join(" • ");
  } catch (error) {
    console.error("❌ Stock fetch failed:", error);
    ticker.innerHTML = "Error loading stock data...";
  }
}
/* ===== LIVE STOCK PRICE FETCH (with % change, glow + arrows) ===== */
/* Put this whole block at the bottom of script.js (or where your ticker code lives),
   and remove any older fetchStockPrices() / stockSymbols duplicate blocks.        */

const stockSymbols = [
  "AAPL","MSFT","NVDA","GOOG","AMZN","META","TSLA",
  "NFLX","ORCL","INTC","AMD","IBM","BABA","SAP","V",
  "MA","PYPL","JPM","BAC","GS","C","KO","PEP","DIS",
  "NKE","MCD","SBUX","PG","UNH","BP","XOM","CVX",
  "TSM","ADBE"
];

// ⚠️ IMPORTANT: replace "demo" with your real API key.
// Alpha Vantage's "demo" key will return real data ONLY for MSFT.
// For everything to work, sign up for a free key and paste it below.
const apiKey = "d3tjfj9r01qigeg3f3v0d3tjfj9r01qigeg3f3vg";

/* Utility to classify glow color & arrow by movement (%) */
function movementStyle(changePercent) {
  if (typeof changePercent !== "number" || isNaN(changePercent)) {
    return { cls: "neutral-glow", arrow: "•" };
  }
  if (changePercent > 0.05)  return { cls: "teal-glow", arrow: "▲" };
  if (changePercent < -0.05) return { cls: "red-glow",  arrow: "▼" };
  return { cls: "neutral-glow", arrow: "•" };
}

async function fetchStockPrices() {
  const ticker = document.getElementById("stockTicker");
  if (!ticker) return;

  try {
    const rows = await Promise.allSettled(
      stockSymbols.map(async (symbol) => {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();

        // Alpha Vantage format
        const q = data["Global Quote"] || {};
        const price = parseFloat(q["05. price"]);
        // "10. change percent" is like "1.23%", so strip % and parse
        const pct = typeof q["10. change percent"] === "string"
          ? parseFloat(q["10. change percent"].replace("%", ""))
          : NaN;

        const priceDisplay = isFinite(price) ? price.toFixed(2) : "N/A";
        const { cls, arrow } = movementStyle(pct);

        // Show (+X.XX%) / (-X.XX%) beside price
        const pctDisplay = isFinite(pct)
          ? `(${pct > 0 ? "+" : ""}${pct.toFixed(2)}%)`
          : "";

        return `<span class="${cls}">${symbol}: ${priceDisplay} ${pctDisplay} ${arrow}</span>`;
      })
    );

    const pieces = rows.map(r => r.status === "fulfilled" ? r.value : `<span class="neutral-glow">N/A</span>`);
    ticker.innerHTML = pieces.join(" • ");
  } catch (err) {
    console.error("⚠ Stock fetch failed:", err);
    ticker.innerHTML = "Error loading stock data…";
  }
}

// First load + refresh every 60s
fetchStockPrices();
setInterval(fetchStockPrices, 60000);