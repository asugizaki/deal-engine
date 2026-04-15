import { sendMessage } from "./sendMessage.js";

// =========================
// CONFIG
// =========================
const BACKEND_URL = "https://go.pochify.com/api/deals";

// =========================
// HELPERS
// =========================
function slugify(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getChatId(deal) {
  const text = `${deal.name} ${deal.description || ""}`.toLowerCase();

  if (text.includes("ai")) return process.env.TELEGRAM_AI;
  if (text.includes("saas")) return process.env.TELEGRAM_SAAS;

  return process.env.TELEGRAM_GENERAL;
}

// Replace this with your real sourcing pipeline later
function getDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion",
      url: "https://www.notion.so/product/ai",
      affiliateLink: null,
    },
    {
      name: "Jasper AI",
      description: "AI content generation tool for marketing teams",
      url: "https://www.jasper.ai",
      affiliateLink: null,
    },
  ];
}

// =========================
// MAIN
// =========================
async function run() {
  console.log("🚀 Processing deals...");

  const rawDeals = getDeals();

  const deals = rawDeals.map((d) => ({
    name: d.name,
    slug: slugify(d.name),
    description: d.description || "",
    url: d.url || "",
    affiliateLink: d.affiliateLink || null,
  }));

  console.log(`📦 Built ${deals.length} deals`);

  // 1. Save deals to backend / Supabase
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deals),
  });

  const data = await res.json();
  console.log("📡 Backend response:", data);

  if (!res.ok || !data.success) {
    throw new Error("Failed to save deals to backend");
  }

  // 2. Send Telegram messages
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

run().catch((err) => {
  console.error("❌ processDeals fatal error:", err);
  process.exit(1);
});
