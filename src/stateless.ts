import axios from "axios";

/**
 * Send a message to a Telegram recipient
 * @param token
 * @param recipientId
 * @param text
 * @param mode
 */
export async function sendTelegramMessage(
  token: string,
  recipientId: number,
  text: string,
  mode: "html" | "markdown",
): Promise<boolean> {
  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(telegramUrl, {
      chat_id: recipientId,
      parse_mode: mode,
      text,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send message:`, error);
  }
  return false;
}
