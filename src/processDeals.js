import { sendMessage } from "./sendMessage.js";
import { formatMessage } from "./formatMessage.js";
import { resolveAffiliateLink } from "./affiliateResolver.js";

const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS,
};

// mock affiliate DB (replace with CJ / Impact sync later)
const affiliateDB = {
  notion: {
    url: "https://affiliate.notion.so/ref123",
  },
};

function scoreDeal(deal) {
  let score = 0;

  if (deal.name?.length > 3) score += 2;
  if (deal.description?.length > 20) score += 2;
  if (deal.trending) score += 2;

  return score;
}

function isValidDeal(deal) {
  return deal?.name && deal?.url;
}

function fetchDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion",
      url: "https://example.com/notion?", // ❌ will be ignored unless fixed affiliate exists
      trending: true,
    },
    {
      name: "ChatGPT Tool",
      description: "Helps automate workflows with AI",
      url: "https://example.com/chatgpt",
      trending: true,
    },
  ];
}

export async function run() {
  console.log("🚀 Affiliate Engine Starting...");

  const deals = fetchDeals();

  for (const deal of deals) {
    if (!isValidDeal(deal)) continue;

    const score = scoreDeal(deal);

    console.log(`🔍 ${deal.name} | Score: ${score}`);

    // 🧠 resolve affiliate
    const affiliateLink = resolveAffiliateLink(deal, affiliateDB);

    // 🚨 HARD RULE: skip if no affiliate link
    if (!affiliateLink) {
      console.log("🚫 Skipped (no affiliate link):", deal.name);
      continue;
    }

    const message = formatMessage(deal, affiliateLink);

    try {
      await sendMessage(CHANNELS.ai, message);
      console.log("✅ Sent:", deal.name);
    } catch (err) {
      console.log("❌ Failed:", deal.name, err.message);
    }
  }

  console.log("🏁 Done");
}

run();
