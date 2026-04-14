import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

const DEALS_FILE = "./deals.json";

app.use(express.json());

// =========================
// Helpers
// =========================

function loadDeals() {
  if (!fs.existsSync(DEALS_FILE)) return [];
  return JSON.parse(fs.readFileSync(DEALS_FILE));
}

function saveDeals(deals) {
  fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
}

// =========================
// API: Save deals (from engine)
// =========================

app.post("/api/deals", (req, res) => {
  const incomingDeals = req.body;

  if (!Array.isArray(incomingDeals)) {
    return res.status(400).json({ error: "Invalid format" });
  }

  saveDeals(incomingDeals);

  console.log(`💾 Saved ${incomingDeals.length} deals`);

  res.json({ success: true });
});

// =========================
// Redirect
// =========================

app.get("/go/:slug", (req, res) => {
  const slug = req.params.slug;
  const deals = loadDeals();

  const deal = deals.find(d => d.slug === slug);

  if (!deal) {
    return res.redirect("https://pochify.com");
  }

  // Track click
  deal.clicks = (deal.clicks || 0) + 1;
  saveDeals(deals);

  const target = deal.affiliateLink || deal.url;

  console.log(`➡️ ${slug} → ${target}`);

  res.redirect(target);
});

// =========================

app.get("/", (req, res) => {
  res.send("Pochify backend running 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
