import { sendMessage } from "./sendMessage.js";
import { formatMessage } from "./formatMessage.js";
import { resolveAffiliateLink } from "./affiliateResolver.js";

// 🧠 affiliate DB (replace later with CJ / Impact sync)
const affiliateDB = {
  notion: {
    url: "https://affiliate.notion.so/ref123",
    keywords: ["notion", "workspace", "docs"],
  },
  chatgpt: {
    url: "https://your-affiliate-link.com/chatgpt",
    keywords: ["chatgpt", "gpt", "openai"],
  },
};

const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS,
};

function scoreDeal(deal) {
  let score = 0;

  if (deal.name?.length > 3) score += 2;
  if (deal.description?.length > 20) score += 2;
  if (deal.trending) score += 2;

  return score;
}

function fetchDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion",
      url: "https://example.com/notion",
      trending: true,
    },
    {
      name: "ChatGPT Tool",
      description: "Automates workflows using GPT models",
      url: "https://example.com/chatgpt",
      trending: true,
    },
    {
      name: "Random SaaS Tool",
      description: "Some productivity tool",
      url: "https://example.com/tool",
      trending: false,
    },
  ];
}

export async function run() {
  console.log("🚀 Affiliate Engine Starting...");

  const deals = fetchDeals();

  for (const deal of deals) {
    const score = scoreDeal(deal);

    console.log(`🔍 ${deal.name} | Score: ${score}`);

    // 🚀 resolve affiliate
    const affiliateLink = resolveAffiliateLink(deal, affiliateDB);

    // 🟡 IMPORTANT: do NOT block if missing affiliate
    if (!affiliateLink) {
      console.log("⚠️ No affiliate link — sending organic traffic");
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
