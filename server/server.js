import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 FIX: absolute-safe file path
const DEALS_FILE = path.resolve("./deals.json");

app.use(express.json());

// =========================
// Load / Save
// =========================

function loadDeals() {
  try {
    if (!fs.existsSync(DEALS_FILE)) return [];
    return JSON.parse(fs.readFileSync(DEALS_FILE, "utf-8"));
  } catch (e) {
    console.error("❌ loadDeals error:", e);
    return [];
  }
}

function saveDeals(deals) {
  fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
}

// =========================
// API
// =========================

app.post("/api/deals", (req, res) => {
  const deals = req.body;

  if (!Array.isArray(deals)) {
    return res.status(400).json({ error: "Invalid format" });
  }

  saveDeals(deals);

  console.log(`💾 Saved ${deals.length} deals`);
  console.log("🧪 SAMPLE SLUGS:", deals.map(d => d.slug));

  res.json({ success: true });
});

// =========================
// REDIRECT (FIXED DEBUG)
// =========================

app.get("/go/:slug", (req, res) => {
  const slug = req.params.slug;

  const deals = loadDeals();

  console.log("🔍 Looking for slug:", slug);
  console.log("📦 Available slugs:", deals.map(d => d.slug));

  const deal = deals.find(d => d.slug === slug);

  if (!deal) {
    console.log("❌ NOT FOUND → fallback");
    return res.redirect("https://pochify.com");
  }

  const target = deal.affiliateLink || deal.url;

  console.log("✅ REDIRECT:", slug, "→", target);

  res.redirect(target);
});

// =========================

app.get("/", (req, res) => {
  res.send("Pochify backend running 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
