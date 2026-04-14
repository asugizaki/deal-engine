const BASE_URL = "https://pochify.com/go";

export function buildTrackingLink(deal) {
  const slug = slugify(deal.name);
  return `${BASE_URL}/${slug}`;
}

function slugify(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
