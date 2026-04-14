export function formatMessage(deal, affiliateLink) {
  const name = deal.name || "Untitled Tool";
  const description =
    deal.description ||
    "A tool designed to improve productivity and workflows.";

  const link = affiliateLink;

  return `
🔥 <b>${name}</b>

✨ <b>What it does:</b>
${description}

💡 <b>Why people use it:</b>
- Saves time
- Improves workflow
- Easy to get started

👉 <a href="${link}">Try it here</a>
`.trim();
}
