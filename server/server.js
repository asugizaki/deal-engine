import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

const DEALS_FILE = "./deals.json";

function loadDeals() {
  if (!fs.existsSync(DEALS_FILE)) return [];
  return JSON.parse(fs.readFileSync(DEALS_FILE));
}

function saveDeals(deals) {
  fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
}

function recordClick(slug) {
  const deals = loadDeals();

  const updated = deals.map(d => {
    if (d.slug === slug) {
      return { ...d, clicks: (d.clicks || 0) + 1 };
    }
    return d;
  });

  saveDeals(updated);
}

app.get("/go/:slug", (req, res) => {
  const slug = req.params.slug;
  const deals = loadDeals();

  const deal = deals.find(d => d.slug === slug);

  if (!deal) {
    return res.redirect("https://pochify.com");
  }

  recordClick(slug);

  const target = deal.affiliateLink || deal.url;

  console.log(`➡️ Redirecting ${slug} → ${target}`);

  res.redirect(target);
});

app.get("/", (req, res) => {
  res.send("Pochify backend running 🚀");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
