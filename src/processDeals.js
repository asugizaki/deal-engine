const fs = require("fs");
const path = require("path");

const { scoreDeal } = require("./aiScorer");
const { sendMessage } = require("./sendMessage");
const { injectAffiliateLink } = require("./affiliateInjector");

// -----------------------------
// CONFIG
// -----------------------------
const CACHE_FILE = path.join(__dirname, "../cache.json");

const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

// -----------------------------
// INLINE CLEAN TEXT (fix 400 errors)
// -----------------------------
function cleanText(text) {
  return text
    .replace(/\n\s+/g, "\n") // remove weird indent spacing
    .replace(/[<>]/g, "") // remove unsafe HTML brackets
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
}

// -----------------------------
// LOAD CACHE
// -----------------------------
function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return [];
    return JSON.parse(fs.readFileSync(CACHE_FILE));
  } catch {
    return [];
  }
}

// -----------------------------
// SAVE CACHE
// -----------------------------
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// -----------------------------
// AFFILIATE PROGRAM SOURCE
// (edit later with real links from secrets)
// -----------------------------
function getAffiliatePrograms() {
  return [
    {
      name: "Notion AI",
      url: process.env.AFF_NOTION || "https://www.notion.so/product/ai",
      description: "AI writing assistant inside Notion",
      price: "$10/month",
      hasAffiliate: true,
      channel: "ai"
    },
    {
      name: "Jasper AI",
      url: process.env.AFF_JASPER || "https://www.jasper.ai",
      description: "AI copywriting tool for marketing",
      price: "$39/month",
      hasAffiliate: true,
      channel: "ai"
    },
    {
      name: "Copy.ai",
      url: process.env.AFF_COPYAI || "https://www.copy.ai",
      description: "Generate marketing copy with AI",
      price: "$36/month",
      hasAffiliate: true,
      channel: "ai"
    },
    {
      name: "Writesonic",
      url: process.env.AFF_WRITESONIC || "https://writesonic.com",
      description: "AI content + chatbot platform",
      price: "$20/month",
      hasAffiliate: true,
      channel: "ai"
    },
    {
      name: "Canva Pro",
      url: process.env.AFF_CANVA || "https://www.canva.com",
      description: "Design platform with AI tools",
      price: "$15/month",
      hasAffiliate: true,
      channel: "saas"
    }
  ];
}

// -----------------------------
// BUILD MESSAGE
// -----------------------------
function buildMessage(deal) {
  return cleanText(`
🔥 TRENDING

🔥 ${deal.name}

${deal.description}

📊 Score: ${deal.score}/10

💰 Affiliate: ${deal.hasAffiliate ? "Available" : "None"}

💰 Price: ${deal.price || "N/A"}

👉 ${deal.url}
`);
}

// -----------------------------
// SEND WITH RETRY
// -----------------------------
async function sendWithRetry(chatId, message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const success = await sendMessage(chatId, message);

    if (success) return true;

    console.log(`⚠️ Retry ${i + 1} failed`);
    await new Promise(r => setTimeout(r, 1500));
  }

  return false;
}

// -----------------------------
// MAIN PIPELINE
// -----------------------------
async function run() {
  console.log("🚀 Affiliate-first Deal Engine Starting...");

  const cache = loadCache();
  console.log("💾 Cached deals:", cache.length);

  const deals = getAffiliatePrograms();
  console.log("📦 Affiliate programs:", deals.length);

  for (const deal of deals) {
    if (cache.includes(deal.url)) {
      console.log("⏭️ Skipping cached:", deal.name);
      continue;
    }

    console.log("\n🔍 Processing:", deal.name);

    // -----------------------------
    // SCORE DEAL
    // -----------------------------
    const scored = scoreDeal(deal);

    console.log("⭐ Score:", scored.score);
    console.log("🧠 Breakdown:", scored.breakdown);

    // -----------------------------
    // FILTER LOW QUALITY
    // -----------------------------
    if (scored.score < 4) {
      console.log("⛔ Skipped (low conversion)");
      continue;
    }

    // -----------------------------
    // BUILD MESSAGE
    // -----------------------------
    // Inject affiliate link
    scored.url = injectAffiliateLink(scored.url);
    
    const message = buildMessage(scored);

    console.log("🧪 LENGTH:", message.length);
    console.log("🧪 SAMPLE:", message.slice(0, 120));

    const channelId = CHANNELS[deal.channel];

    if (!channelId) {
      console.log("⚠️ No channel configured for:", deal.channel);
      continue;
    }

    console.log("➡️ Sending to:", deal.channel);

    const sent = await sendWithRetry(channelId, message);

    if (sent) {
      console.log("✅ Sent");
      cache.push(deal.url);
    } else {
      console.log("❌ Failed");
    }
  }

  saveCache(cache);
  console.log("\n💾 Cache updated:", cache.length);
}

// -----------------------------
run();
