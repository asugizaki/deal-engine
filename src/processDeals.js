import { sendMessage } from "./sendMessage.js";
import { generateDealPage, generateSitemap } from "./generateDealPage.js";

const BACKEND_URL = "https://go.pochify.com/api/deals";

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

// Replace this with your real sourcing pipeline
function getDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion",
      url: "https://www.notion.so/product/ai",
      affiliateLink: null,
      audience: "Founders, students, operators, and knowledge workers",
      benefits: [
        "Helps draft and summarize content faster",
        "Works inside a tool many teams already use",
        "Useful for notes, documents, and workflows"
      ],
      whyNow:
        "If you already use Notion, this is one of the easiest ways to add AI to your existing workflow."
    },
    {
      name: "Jasper AI",
      description: "AI content generation tool for marketing teams",
      url: "https://www.jasper.ai",
      affiliateLink: null,
      audience: "Marketing teams, freelancers, and content-heavy businesses",
      benefits: [
        "Can speed up content production",
        "Useful for drafting campaign copy",
        "Popular in AI writing workflows"
      ],
      whyNow:
        "This is the kind of tool people usually test when they want faster content output without building an internal process first."
    }
  ];
}

async function run() {
  console.log("🚀 Processing deals...");

  const rawDeals = getDeals();

  const deals = rawDeals.map((d) => ({
    name: d.name,
    slug: slugify(d.name),
    description: d.description || "",
    url: d.url || "",
    affiliateLink: d.affiliateLink || null,
    audience: d.audience || "",
    benefits: d.benefits || [],
    whyNow: d.whyNow || ""
  }));

  console.log(`📦 Built ${deals.length} deals`);

  // 1. Generate static pages for GitHub Pages
  for (const deal of deals) {
    const filePath = generateDealPage(deal);
    console.log("📝 Generated page:", filePath);
  }

  generateSitemap(deals);
  console.log("🗺️ Generated sitemap");

  // 2. Save deals to backend / Supabase
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(deals)
  });

  const data = await res.json();
  console.log("📡 Backend response:", data);

  if (!res.ok || !data.success) {
    throw new Error("Failed to save deals to backend");
  }

  // 3. Send Telegram messages linking to Pochify pages
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
