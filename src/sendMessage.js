const fetch = require("node-fetch");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ----------------------
// VALIDATE CHAT ID
// ----------------------
function isValidChatId(chatId) {
  if (!chatId) return false;

  // valid formats:
  // -1001234567890 (channel)
  // 123456789 (user)
  return /^-?\d+$/.test(String(chatId));
}

// ----------------------
// SEND MESSAGE
// ----------------------
async function sendMessage(chatId, text) {
  try {
    // 🚨 HARD GUARD (prevents your exact bug)
    if (!isValidChatId(chatId)) {
      console.error("❌ INVALID CHAT ID:", chatId);
      console.error("❌ THIS LOOKS LIKE YOU PASSED MESSAGE INSTEAD OF CHAT ID");
      return { status: 400, body: "Invalid chat_id" };
    }

    if (!text || typeof text !== "string") {
      console.error("❌ INVALID MESSAGE TEXT");
      return { status: 400, body: "Invalid text" };
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    console.log("➡️ Sending to chat_id:", chatId);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: false
      })
    });

    const data = await res.text();

    console.log("📩 Telegram response status:", res.status);
    console.log("📩 Telegram response body:", data);

    return {
      status: res.status,
      body: data
    };

  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);

    return {
      status: 500,
      body: err.message
    };
  }
}

module.exports = sendMessage;
