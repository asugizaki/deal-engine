import { buildTrackingLink } from "./linkRouter.js";

export function formatMessage(deal, affiliateLink) {
  const name = deal.name || "Untitled Tool";

  const description =
    deal.description ||
    "A powerful tool to improve productivity.";

  const link = affiliateLink || buildTrackingLink(deal);

  return `
🔥 <b>${name}</b>

✨ ${description}

👉 <a href="${link}">Try it here</a>
`.trim();
}
