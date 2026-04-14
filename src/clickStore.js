import fs from "fs";

const FILE = "./clicks.json";

export function recordClick(slug) {
  const data = load();

  data[slug] = (data[slug] || 0) + 1;

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}
