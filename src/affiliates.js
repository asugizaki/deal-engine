const AFFILIATE_RULES = [
  {
    match: ["notion"],
    build: (url) => url + "?ref=dealradar"
  },
  {
    match: ["midjourney"],
    build: (url) => url + "?via=dealradar"
  },
  {
    match: ["figma"],
    build: (url) => url + "?ref=dealradar"
  }
];

// Apply affiliate link if match found
function applyAffiliate(deal) {
  const name = deal.name.toLowerCase();

  for (const rule of AFFILIATE_RULES) {
    if (rule.match.some((m) => name.includes(m))) {
      return {
        ...deal,
        url: rule.build(deal.url)
      };
    }
  }

  return deal;
}

module.exports = applyAffiliate;
