export function formatMessage(deal, affiliateLink) {
  const name = deal.name || "Untitled Tool";

  const description =
    deal.description ||
    "A useful AI/SaaS tool designed to improve productivity and workflows.";

  const link = affiliateLink || deal.url;

  return `
🔥 <b>${name}</b>

✨ <b>What it does:</b>
${description}

💡 <b>Why people use it:</b>
- Saves time
- Improves productivity
- Easy to integrate into workflow

👉 <a href="${link}">Try it here</a>
`.trim();
}
