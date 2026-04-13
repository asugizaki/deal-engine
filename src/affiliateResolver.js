const AFFILIATE_DB = {
  "notion": {
    network: "partnerstack",
    link: "https://partnerstack.com/notion?ref=YOUR_ID"
  },
  "jasper": {
    network: "impact",
    link: "https://impact.com/jasper?ref=YOUR_ID"
  }
};

function resolveAffiliate(deal) {
  const name = deal.name.toLowerCase();

  for (const key of Object.keys(AFFILIATE_DB)) {
    if (name.includes(key)) {
      return {
        hasAffiliate: true,
        affiliateNetwork: AFFILIATE_DB[key].network,
        affiliateLink: AFFILIATE_DB[key].link
      };
    }
  }

  return {
    hasAffiliate: false,
    affiliateNetwork: null,
    affiliateLink: deal.url
  };
}

module.exports = resolveAffiliate;
