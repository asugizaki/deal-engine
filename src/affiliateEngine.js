const url = require("url");

// -----------------------------
// 1. AFFILIATE PROVIDERS (EXTENSIBLE)
// -----------------------------
const PROVIDERS = {
  generic: {
    build: (baseUrl, deal) => baseUrl + "?ref=dealradar"
  },

  notion: {
    build: (baseUrl) => baseUrl + "?via=dealradar-notion"
  },

  figma: {
    build: (baseUrl) => baseUrl + "?ref=dealradar-figma"
  }
};

// -----------------------------
// 2. BRAND DETECTION (SMART MATCH)
// -----------------------------
function detectBrand(deal) {
  const text = `${deal.name} ${deal.description}`.toLowerCase();

  if (text.includes("notion")) return "notion";
  if (text.includes("figma")) return "figma";
  if (text.includes("midjourney")) return "midjourney";
  if (text.includes("chatgpt") || text.includes("openai")) return "openai";

  return "generic";
}

// -----------------------------
// 3. CLEAN URL NORMALIZATION
// -----------------------------
function cleanUrl(dealUrl) {
  try {
    const parsed = new URL(dealUrl);
    return parsed.origin + parsed.pathname;
  } catch {
    return dealUrl;
  }
}

// -----------------------------
// 4. APPLY AFFILIATE LOGIC
// -----------------------------
function applyAffiliate(deal) {
  const brand = detectBrand(deal);
  const provider = PROVIDERS[brand] || PROVIDERS.generic;

  const clean = cleanUrl(deal.url);

  const finalUrl = provider.build(clean, deal);

  return {
    ...deal,
    brand,
    url: finalUrl
  };
}

module.exports = applyAffiliate;
