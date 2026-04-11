const https = require("https");

function sendMessage(token, chatId, message) {
  return new Promise((resolve, reject) => {
    console.log(`➡️ Sending message to: ${chatId}`);

    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML"
    });

    const options = {
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        console.log(`📩 Telegram response status: ${res.statusCode}`);
        console.log(`📩 Telegram response body: ${body}`);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request error:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function cleanText(text = "") {
  return text
    // remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // normalize weird spaces
    .replace(/\u00A0/g, " ")

    // remove excessive indentation
    .replace(/[ \t]+\n/g, "\n")

    // remove multiple line breaks
    .replace(/\n{3,}/g, "\n\n")

    // trim
    .trim();
}

module.exports = cleanText;

module.exports = sendMessage;
