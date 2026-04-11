function resolveAffiliate(deal) {
  const name = (deal.name + " " + deal.description).toLowerCase();

  // -------------------------
  // Direct SaaS affiliates
  // -------------------------
  if (name.includes("notion")) {
    return {
      ...deal,
      monetizedUrl: "https://notion.so?via=dealradar"
    };
  }

  if (name.includes("canva")) {
    return {
      ...deal,
      monetizedUrl: "https://canva.com/?ref=dealradar"
    };
  }

  if (name.includes("jasper")) {
    return {
      ...deal,
      monetizedUrl: "https://www.jasper.ai/?fpr=dealradar"
    };
  }

  // -------------------------
  // If no affiliate exists
  // -------------------------
  return {
    ...deal,
    monetizedUrl: null
  };
}

module.exports = resolveAffiliate;
