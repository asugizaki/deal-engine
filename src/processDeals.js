import { sendMessage } from "./sendMessage.js";

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// mock or real deals
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

async function run() {
  console.log("🚀 Processing deals...");

  const deals = getDeals();

  console.log(`📦 Built ${deals.length} deals`);

  // 1. Send to Railway
  const res = await fetch("https://go.pochify.com/api/deals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(deals)
  });

  const data = await res.json();
  console.log("📡 Backend response:", data);

  // 2. SEND TELEGRAM (THIS WAS MISSING)
  for (const deal of deals) {
    console.log("➡️ Sending Telegram for:", deal.name);
    await sendMessage(CHAT_ID, deal);
  }

  console.log("🏁 Done");
}

run();
