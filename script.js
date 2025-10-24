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