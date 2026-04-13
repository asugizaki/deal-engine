const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

const sendMessage = require("./sendMessage");
const scoreDeal = require("./aiScorer");

const parser = new Parser();

// ----------------------
// CONFIG
// ----------------------
const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

const CACHE_FILE = path.join(__dirname, "../cache.json");
const MIN_SCORE = 2;

// ----------------------
// CLEAN TEXT
// ----------------------
function cleanText(text = "") {
  return String(text)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

// ----------------------
// SLEEP (RATE LIMIT FIX)
// ----------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------
// CACHE HANDLING
// ----------------------
function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return [];
    return JSON.parse(fs.readFileSync(CACHE_FILE));
  } catch {
    return [];
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ----------------------
// FETCH DEALS (REAL SOURCE)
// ----------------------
async function getDeals() {
  console.log("🌐 Fetching deals...");

  const feed = await parser.parseURL("https://www.producthunt.com/feed");

  const deals = feed.items.slice(0, 20).map(item => ({
    name: item.title,
    description: item.contentSnippet || "",
    url: item.link,
    category: "ai" // default for now
  }));

  console.log(`📦 Fetched ${deals.length} deals`);

  return deals;
}

// ----------------------
// TELEGRAM SEND WITH RETRY
// ----------------------
async function sendWithRetry(chatId, message, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await sendMessage(chatId, message);

      if (res?.status === 200 || res?.ok) return true;

      throw new Error("Bad response");
    } catch (err) {
      console.log(`⚠️ Attempt ${i + 1} failed`);

      if (i === retries) return false;

      await sleep(800 + Math.random() * 500);
    }
  }
}

// ----------------------
// FORMAT MESSAGE
// ----------------------
function formatDeal(deal) {
  const name = cleanText(deal.name);
  const desc = cleanText(deal.description);

  return `
🔥 🟡 TRENDING

🔥 <b>${name}</b>

${desc ? desc.slice(0, 120) : "AI / SaaS tool"}

📊 Score: ${deal.score}/10

💰 Affiliate: ${deal.affiliateNetwork || "none"}

💰 Price: ${deal.price || "N/A"}

👉 ${deal.url}
`;
}

// ----------------------
// MAIN PROCESS
// ----------------------
async function processDeals() {
  console.log("🚀 Starting Deal Engine...");

  const cache = loadCache();
  console.log("💾 Cached deals:", cache.length);

  const deals = await getDeals();

  let sent = 0;
  let failed = 0;

  for (const rawDeal of deals) {
    try {
      if (cache.includes(rawDeal.url)) {
        console.log("⏭️ Skipping cached:", rawDeal.url);
        continue;
      }

      const deal = scoreDeal(rawDeal);

      console.log("\n==============================");
      console.log("🔍 Processing:", deal.name);
      console.log("⭐ Score:", deal.score);

      if (deal.score < MIN_SCORE) {
        console.log("⛔ Skipped (low score)");
        continue;
      }

      // ----------------------
      // CHANNEL ROUTING
      // ----------------------
      const channels = [];

      if (deal.name.toLowerCase().includes("ai")) {
        if (CHANNELS.ai) channels.push(CHANNELS.ai);
      } else {
        if (CHANNELS.saas) channels.push(CHANNELS.saas);
      }

      if (!channels.length) {
        console.log("⚠️ No channels");
        continue;
      }

      const message = cleanText(formatDeal(deal));

      console.log("🧪 LENGTH:", message.length);
      console.log("🧪 SAMPLE:", message.slice(0, 100));

      // ----------------------
      // SEND
      // ----------------------
      for (const channel of channels) {
        console.log("➡️ Sending to:", channel);

        const ok = await sendWithRetry(channel, message);

        if (ok) {
          console.log("✅ Sent");
          sent++;
        } else {
          console.log("❌ Failed");
          failed++;
        }

        // 🚨 CRITICAL FIX
        await sleep(800 + Math.random() * 400);
      }

      // ----------------------
      // UPDATE CACHE
      // ----------------------
      cache.push(rawDeal.url);

    } catch (err) {
      console.log("❌ Error:", err.message);
      failed++;
    }
  }

  saveCache(cache);

  console.log("\n==============================");
  console.log("✅ DONE");
  console.log("📤 Sent:", sent);
  console.log("❌ Failed:", failed);
}

// ----------------------
// RUN SCRIPT
// ----------------------
if (require.main === module) {
  processDeals().catch(err => {
    console.error("❌ Fatal:", err);
    process.exit(1);
  });
}
