import { syncAffiliatePrograms } from "./sync/affiliateSync.js";
import { findAffiliate } from "./affiliateResolver.js";

// run sync once at startup
await syncAffiliatePrograms();

function enrichDeal(deal) {
  const affiliate = findAffiliate(deal.name);

  return {
    ...deal,
    affiliate: affiliate.affiliate,
    hasAffiliate: affiliate.hasAffiliate
  };
}

// example usage in your pipeline
export async function run(deals) {
  return deals.map(enrichDeal);
}
