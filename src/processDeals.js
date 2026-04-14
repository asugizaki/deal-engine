// src/processDeals.js

import { sendMessage } from "./sendMessage.js";

// =========================
// CHANNEL ROUTING LOGIC
// =========================

function getChatId(deal) {
  const text = `${deal.name} ${deal.description}`.toLowerCase();

  // AI-related deals
  if (text.includes("ai")) {
    return process.env.TELEGRAM_AI;
  }

  // SaaS tools
  if (text.includes("saas")) {
    return process.env.TELEGRAM_SAAS;
  }

  // fallback channel
  return process.env.TELEGRAM_GENERAL;
}

// =========================
// MOCK / ENGINE OUTPUT
// (replace with your real pipeline later)
// =========================

function getDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion",
      slug: "notion-ai"
    },
    {
      name: "Jasper AI",
      description: "AI content generation tool",
      slug: "jasper-ai"
    }
  ];
}

// =========================
// MAIN
// =========================

async function run() {
  console.log("🚀 Processing deals...");

  const deals = getDeals();

  console.log(`📦 Built ${deals.length} deals`);

  for (const deal of deals) {
    const chatId = getChatId(deal);

    console.log("➡️ Routing:", deal.name, "→", chatId);

    if (!chatId) {
      console.log("❌ Missing chatId for:", deal.name);
      continue;
    }

    await sendMessage(chatId, deal);
  }

  console.log("🏁 Done");
}

run();
