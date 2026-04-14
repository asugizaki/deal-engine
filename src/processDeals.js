const { sendMessage } = require("./sendMessage");
const { formatTelegramPost } = require("./formatTelegramPost");

// example channels
const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS,
};

// 🔥 mock affiliate resolver (replace later)
function resolveAffiliateLink(deal) {
  if (!deal?.url) return null;

  // later: CJ / Impact / PartnerStack mapping
  return deal.url + "?ref=pochify";
}

// 🧠 mock scorer (you already have better one, plug it in later)
function scoreDeal(deal) {
  let score = 0;

  if (deal.name?.toLowerCase().includes("ai")) score += 3;
  if (deal.description?.length > 50) score += 2;
  if (deal.url) score += 1;

  return score;
}

// 🧪 fake deals fallback (replace with ProductHunt fetch)
function fetchDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion that helps you draft, summarize and automate content.",
      url: "https://www.notion.so/product/ai",
      audience: "Founders, students, knowledge workers",
      benefits: [
        "Write faster with AI inside docs",
        "Summarize long content instantly",
        "Boost productivity in workflows",
      ],
    },
  ];
}

async function run() {
  console.log("🚀 Deal Engine Starting...");

  const deals = fetchDeals();
  console.log("📦 Deals fetched:", deals.length);

  for (const deal of deals) {
    const score = scoreDeal(deal);

    console.log("\n🔍 Processing:", deal.name);
    console.log("⭐ Score:", score);

    const affiliateLink = resolveAffiliateLink(deal);
    const message = formatTelegramPost(deal, affiliateLink);

    const chatId = CHANNELS.ai; // route later by category

    if (!chatId) {
      console.log("❌ Missing channel chatId");
      continue;
    }

    console.log("➡️ Sending to:", chatId);

    try {
      await sendMessage(chatId, message);
      console.log("✅ Sent");
    } catch (err) {
      console.log("❌ Failed:", err.message);
    }
  }

  console.log("\n✅ Done");
}

run();
