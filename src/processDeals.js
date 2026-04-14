const fs = require("fs");
const path = require("path");

const { resolveAffiliate } = require("./affiliateResolver");
const { scoreDeal } = require("./aiScorer");
const sendMessage = require("./sendMessage");

// ---------- CONFIG ----------
const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

const CACHE_FILE = path.join(__dirname, "../cache/deals.json");
const AFFILIATE_FILE = path.join(__dirname, "../data/affiliatePrograms.json");

// ---------- HELPERS ----------
function loadJSON(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function isCached(cache, url) {
  return cache.includes(url);
}

function addToCache(cache, url) {
  cache.push(url);
  return cache;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------- MAIN ----------
async function run() {
  console.log("🚀 Affiliate-first Deal Engine Starting...");

  const cache = loadJSON(CACHE_FILE, []);
  const programs = loadJSON(AFFILIATE_FILE, []);

  console.log(`💾 Cached deals: ${cache.length}`);
  console.log(`📦 Affiliate programs: ${programs.length}`);

  let deals = [];

  // ---------- BUILD DEALS FROM AFFILIATES ----------
  for (const program of programs) {
    deals.push({
      id: program.name.toLowerCase().replace(/\s+/g, "-"),
      name: program.name,
      url: program.url,
      category: program.category,
      price: "Check site",
      description: `Trending ${program.category} tool`
    });
  }

  console.log(`📦 Built deals: ${deals.length}`);

  // ---------- PROCESS ----------
  for (const deal of deals) {
    if (isCached(cache, deal.url)) {
      console.log(`⏭️ Skipping cached: ${deal.name}`);
      continue;
    }

    console.log(`\n🔍 Processing: ${deal.name}`);

    // Score
    const scored = scoreDeal(deal);

    // Affiliate resolution
    const enriched = resolveAffiliate(scored);

    console.log(`⭐ Score: ${enriched.score}`);
    console.log(`🏷️ Affiliate: ${enriched.affiliateNetwork || "none"}`);

    // FILTER: only send monetizable or high score
    if (!enriched.hasAffiliate && enriched.score < 5) {
      console.log("❌ Skipping (no monetization + low score)");
      continue;
    }

    // ---------- BUILD MESSAGE ----------
    const link = enriched.affiliateUrl || enriched.url;

    const message = `
🔥 <b>${enriched.name}</b>

📊 Score: ${enriched.score}/10

💰 Affiliate: ${enriched.affiliateNetwork || "none"}

💰 Price: ${enriched.price || "N/A"}

👉 ${link}
    `.trim();

    // ---------- SEND ----------
    const targetChannel = CHANNELS[enriched.category];

    if (!targetChannel) {
      console.log("⚠️ No channel match");
      continue;
    }

    console.log(`➡️ Sending to channel...`);

    try {
      await sendMessage(targetChannel, message);
      console.log("✅ Sent");

      addToCache(cache, deal.url);
      saveJSON(CACHE_FILE, cache);

      // prevent Telegram spam errors
      await sleep(1500);

    } catch (err) {
      console.log("❌ Send failed:", err.message);
    }
  }

  console.log("\n✅ Pipeline complete");
}

// ---------- RUN ----------
run();
