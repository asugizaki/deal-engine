const { syncAffiliatePrograms } = require("./sync/affiliateSync");
const { findAffiliate } = require("./affiliateResolver");

// call once at startup or cron
await syncAffiliatePrograms();

function enrichDeal(deal) {
  const affiliate = findAffiliate(deal.name);

  return {
    ...deal,
    affiliate: affiliate.affiliate,
    hasAffiliate: affiliate.hasAffiliate
  };
}
