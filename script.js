// ======================================================
// JNUS ASSOCIATES LTD — GLOBAL JS (Ticker + UI Features)
// ======================================================

// === 1️⃣ Lucide Icons Activation ===
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

// === 2️⃣ GLOBAL MARKET HOURS & TICKER SPEED CONTROL ===
function adjustTickerSpeed() {
  const ticker = document.getElementById("stockTicker");
  if (!ticker) return;

  const nowUTC = new Date();
  const utcHour = nowUTC.getUTCHours();
  const utcDay = nowUTC.getUTCDay(); // 0 = Sunday, 6 = Saturday

  const markets = [
    { name: "London", open: 8, close: 16 },
    { name: "New York", open: 13, close: 21 },
    { name: "Tokyo", open: 0, close: 6 },
    { name: "Hong Kong", open: 1, close: 9 },
    { name: "Singapore", open: 1, close: 9 },
    { name: "Beijing", open: 1, close: 9 }
  ];

  const openMarkets = utcDay !== 0 && utcDay !== 6
    ? markets.filter(m => utcHour >= m.open && utcHour < m.close)
    : [];

  const anyMarketOpen = openMarkets.length > 0;

  // Update ticker appearance
  ticker.dataset.marketStatus = anyMarketOpen ? "open" : "closed";
  ticker.dataset.openMarkets = openMarkets.map(m => m.name).join(", ");

  ticker.style.animationDuration = anyMarketOpen ? "40s" : "90s";
  ticker.style.filter = anyMarketOpen
    ? "drop-shadow(0 0 12px rgba(0,255,255,0.9))"
    : "drop-shadow(0 0 4px rgba(0,255,255,0.3))";

  if (anyMarketOpen) ticker.classList.remove("closed");
  else ticker.classList.add("closed");

  console.log("🌐 Open Markets:", openMarkets.length ? openMarkets.map(m => m.name).join(", ") : "None");
}

window.addEventListener("load", adjustTickerSpeed);
setInterval(adjustTickerSpeed, 900000); // recheck every 15 minutes

// === 3️⃣ TICKER HOVER PAUSE ===
document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.querySelector(".ticker-content");
  if (ticker) {
    ticker.addEventListener("mouseenter", () => ticker.style.animationPlayState = "paused");
    ticker.addEventListener("mouseleave", () => ticker.style.animationPlayState = "running");
  }
});

// === 4️⃣ LIVE STOCK PRICE FETCH (Alpha Vantage API) ===
const stockSymbols = [
  "AAPL","MSFT","NVDA","GOOG","AMZN","META","TSLA",
  "NFLX","ORCL","INTC","AMD","IBM","BABA","SAP","V",
  "MA","PYPL","JPM","BAC","GS","C","KO","PEP","DIS",
  "NKE","MCD","SBUX","PG","UNH","BP","XOM","CVX",
  "TSM","ADBE"
];

const apiKey = "d3tjfj9r01qigeg3f3v0d3tjfj9r01qigeg3f3vg";

function movementStyle(changePercent) {
  if (typeof changePercent !== "number" || isNaN(changePercent)) return { cls: "neutral-glow", arrow: "•" };
  if (changePercent > 0.05) return { cls: "teal-glow", arrow: "▲" };
  if (changePercent < -0.05) return { cls: "red-glow", arrow: "▼" };
  return { cls: "neutral-glow", arrow: "•" };
}

async function fetchStockPrices() {
  const ticker = document.getElementById("stockTicker");
  if (!ticker) return;

  ticker.style.opacity = "0.5";
  ticker.innerHTML = `<span class="neutral-glow">Loading live market data...</span>`;

  try {
    const rows = await Promise.allSettled(
      stockSymbols.map(async (symbol) => {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();

        const q = data["Global Quote"] || {};
        const price = parseFloat(q["05. price"]);
        const pct = typeof q["10. change percent"] === "string"
          ? parseFloat(q["10. change percent"].replace("%", ""))
          : NaN;

        const priceDisplay = isFinite(price) ? price.toFixed(2) : "N/A";
        const { cls, arrow } = movementStyle(pct);
        const pctDisplay = isFinite(pct) ? `(${pct > 0 ? "+" : ""}${pct.toFixed(2)}%)` : "";

        return `<span class="${cls}">${symbol}: ${priceDisplay} ${pctDisplay} ${arrow}</span>`;
      })
    );

    ticker.innerHTML = rows.map(r =>
      r.status === "fulfilled" ? r.value : `<span class="neutral-glow">N/A</span>`
    ).join(" • ");

    ticker.style.transition = "opacity 1.2s ease";
    ticker.style.opacity = "1";

    // === GLOWING DOT + TOOLTIP + FADE EFFECT ===
    const existingNote = document.getElementById("marketStatusNote");
    const openMarkets = ticker.dataset.openMarkets || "";
    const isOpen = ticker.dataset.marketStatus === "open";

    if (!existingNote) {
      const note = document.createElement("span");
      note.id = "marketStatusNote";
      note.className = "market-status-note";
      note.innerHTML = ` • <span class="status-dot ${isOpen ? "open" : "closed"}"
        title="${isOpen ? `Markets open: ${openMarkets}` : "All major markets closed"}"></span>
        ${isOpen ? "Live data — active sessions" : "Markets closed — data delayed"}`;
      note.style.opacity = "0";
      ticker.appendChild(note);
      requestAnimationFrame(() => (note.style.opacity = "1"));
    } else {
      const dot = existingNote.querySelector(".status-dot");
      dot.className = `status-dot ${isOpen ? "open" : "closed"}`;
      dot.title = isOpen ? `Markets open: ${openMarkets}` : "All major markets closed";
      existingNote.innerHTML = ` • ${dot.outerHTML} ${isOpen ? "Live data — active sessions" : "Markets closed — data delayed"}`;
    }

  } catch (err) {
    console.error("⚠ Stock fetch failed:", err);
    ticker.innerHTML = "Error loading stock data…";
  }
}

fetchStockPrices();
setInterval(fetchStockPrices, 60000);

// === 5️⃣ MOBILE NAV TOGGLE ===
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
    hamburger.innerHTML = navbar.classList.contains("active") ? "&times;" : "&#9776;";
  });
});