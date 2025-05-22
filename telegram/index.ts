import { config } from "../config";
import { CHAT_IDS } from "../constants";

export const sendMessageTelegram = async (media) => {
  const url = `https://api.telegram.org/bot${config.BOT_TELEGRAM_TOKEN}/sendMediaGroup`;
  for (const chatId of CHAT_IDS) {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        media: media,
        parse_mode: "Markdown",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Imágenes y mensaje enviados.", res);
      })
      .catch((err) => {
        console.error("Error al enviar a Telegram:", err.response.data);
      });
  }
};
