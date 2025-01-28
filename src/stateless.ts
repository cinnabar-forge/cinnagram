import fs from "node:fs";
import path from "node:path";
import axios from "axios";

/**
 * Create a Telegram API URL
 * @param token
 * @param method
 */
function createTelegramApiUrl(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

/**
 * Do any API action
 * @param token
 * @param action
 * @param content
 */
export async function doTelegramApiAction<T extends object>(
  token: string,
  action: string,
  content: T,
): Promise<boolean | null> {
  const telegramUrl = createTelegramApiUrl(token, action);
  try {
    const messageResponse = await axios.post(telegramUrl, content);
    if (messageResponse.status === 200 && messageResponse.data?.ok) {
      return true;
    }
  } catch (error) {
    console.error(`Failed to to action ${action}:`, error);
  }
  return null;
}

/**
 * Send a message to a Telegram chat
 * @param token
 * @param chatId
 * @param text
 * @param mode
 * @param options
 */
export async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  mode: "html" | "markdown" | "markdownV2",
  options?: object,
): Promise<null | number> {
  const telegramUrl = createTelegramApiUrl(token, "sendMessage");
  try {
    const messageResponse = await axios.post(telegramUrl, {
      chat_id: chatId,
      parse_mode: mode,
      text,
      ...options,
    });
    if (
      messageResponse.status === 200 &&
      messageResponse.data?.ok &&
      messageResponse.data?.result
    ) {
      return messageResponse.data.result.message_id;
    }
  } catch (error) {
    console.error("Failed to send message:", error);
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
    console.error("Failed to send document:", error);
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
    console.error("Failed to delete message:", error);
  }
  return false;
}
