export async function sendMessage(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");
  if (!chatId) throw new Error("Missing chatId");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!data.ok) {
    console.log("❌ Telegram error:", data);
    return false;
  }

  return true;
}
