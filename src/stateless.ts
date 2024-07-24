import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * Create a Telegram API URL
 * @param token
 * @param method
 */
function createTelegramApiUrl(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

/**
 * Send a message to a Telegram chat
 * @param token
 * @param chatId
 * @param text
 * @param mode
 */
export async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  mode: "html" | "markdown" | "markdownV2",
): Promise<null | number> {
  const telegramUrl = createTelegramApiUrl(token, "sendMessage");
  try {
    const messageResponse = await axios.post(telegramUrl, {
      chat_id: chatId,
      parse_mode: mode,
      text,
    });
    if (messageResponse.status === 200 && messageResponse.data?.message_id) {
      return messageResponse.data.message_id;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Failed to send message:`, error);
  }
  return null;
}

/**
 * Send a document to a Telegram chat
 * @param token
 * @param chatId
 * @param filePath
 * @param customFileName
 */
export async function sendTelegramDocument(
  token: string,
  chatId: number,
  filePath: string,
  customFileName?: string,
): Promise<boolean> {
  const telegramUrl = createTelegramApiUrl(token, "sendDocument");
  try {
    const fileContent = await fs.promises.readFile(path.resolve(filePath));
    const fileName = customFileName || path.basename(filePath);
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const form = new FormData();
    form.append("chat_id", chatId.toString());
    form.append("document", new Blob([fileContent]), fileName);

    await axios.post(telegramUrl, form);
    return true;
  } catch (error) {
    console.error(`Failed to send document:`, error);
  }
  return false;
}

/**
 * Delete a message from a Telegram chat
 * @param token
 * @param chatId
 * @param messageId
 */
export async function deleteTelegramMessage(
  token: string,
  chatId: number,
  messageId: number,
): Promise<boolean> {
  const telegramUrl = createTelegramApiUrl(token, "deleteMessage");
  try {
    await axios.post(telegramUrl, {
      chat_id: chatId,
      message_id: messageId,
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete message:`, error);
  }
  return false;
}
