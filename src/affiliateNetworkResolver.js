const NETWORKS = {
  CJ: {
    name: "CJ Affiliate",
    match: ["adobe", "microsoft", "shopify", "webflow"],
    build: (url, deal) => {
      return `${url}?sid=cj_dealradar`;
    }
  },

  PARTNERSTACK: {
    name: "PartnerStack",
    match: ["notion", "loom", "panda", "close", "writesonic"],
    build: (url, deal) => {
      return `${url}?via=partnerstack_dealradar`;
    }
  },

  IMPACT: {
    name: "Impact",
    match: ["canva", "grammarly", "hubspot", "semrush"],
    build: (url, deal) => {
      return `${url}?irclickid=dealradar`;
    }
  }
};

// -----------------------------
// BRAND DETECTION
// -----------------------------
function detectBrand(text) {
  const lower = text.toLowerCase();

  for (const network of Object.values(NETWORKS)) {
    for (const keyword of network.match) {
      if (lower.includes(keyword)) {
        return {
          network: network.name,
          keyword
        };
      }
    }
  }

  return null;
}

// -----------------------------
// RESOLVE AFFILIATE LINK
// -----------------------------
function resolveAffiliate(deal) {
  const text = `${deal.name} ${deal.description || ""}`;
  const match = detectBrand(text);

  if (match) {
    const network = Object.values(NETWORKS).find(
      (n) => n.name === match.network
    );

    return {
      ...deal,
      affiliateNetwork: match.network,
      monetizedUrl: network.build(deal.url, deal)
    };
  }

  // fallback: no affiliate found
  return {
    ...deal,
    affiliateNetwork: null,
    monetizedUrl: null
  };
}

module.exports = resolveAffiliate;
