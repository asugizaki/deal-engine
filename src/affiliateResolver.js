// src/affiliateResolver.js

function resolveAffiliate(deal) {
  const url = deal.url || "";
  const name = (deal.name || "").toLowerCase();

  const CJ_PID = process.env.CJ_PID;
  const IMPACT_ID = process.env.IMPACT_ID;
  const PARTNERSTACK_ID = process.env.PARTNERSTACK_ID;

  let affiliateUrl = url;
  let network = null;

  // --- CJ (Commission Junction) ---
  if (CJ_PID && matchCJ(name, url)) {
    affiliateUrl = `https://www.anrdoezrs.net/click-${CJ_PID}?url=${encodeURIComponent(url)}`;
    network = "cj";
  }

  // --- Impact ---
  else if (IMPACT_ID && matchImpact(name, url)) {
    affiliateUrl = `https://impact.com/t/${IMPACT_ID}?url=${encodeURIComponent(url)}`;
    network = "impact";
  }

  // --- PartnerStack ---
  else if (PARTNERSTACK_ID && matchPartnerStack(name, url)) {
    affiliateUrl = `${url}?via=${PARTNERSTACK_ID}`;
    network = "partnerstack";
  }

  return {
    ...deal,
    affiliateUrl,
    affiliateNetwork: network,
    hasAffiliate: !!network
  };
}

/**
 * Matching logic (expand over time)
 */

function matchCJ(name, url) {
  const brands = [
    "grammarly",
    "adobe",
    "canva",
    "shopify"
  ];
  return brands.some(b => name.includes(b) || url.includes(b));
}

function matchImpact(name, url) {
  const brands = [
    "notion",
    "wise",
    "airtable"
  ];
  return brands.some(b => name.includes(b) || url.includes(b));
}

function matchPartnerStack(name, url) {
  const brands = [
    "jasper",
    "copy.ai",
    "surfer",
    "frase",
    "writesonic"
  ];
  return brands.some(b => name.includes(b) || url.includes(b));
}

module.exports = { resolveAffiliate };
