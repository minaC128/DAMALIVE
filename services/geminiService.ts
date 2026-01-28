
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response from the Gemini AI model using history and the current message.
 * Adheres strictly to the @google/genai SDK guidelines.
 */
export const generateAIResponse = async (history: { role: string; content: string }[], message: string) => {
  // Always initialize right before making the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Model selection based on task type: Basic Text Tasks use 'gemini-3-flash-preview'
  const modelName = 'gemini-3-flash-preview';
  
  // Transform application message history to Gemini's expected parts-based format
  const geminiHistory = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const chat = ai.chats.create({
    model: modelName,
    history: geminiHistory,
    config: {
      systemInstruction: `你是一位名為『小達』的專業孕期護理助手。
你的目標是透過諮詢與追問，為準媽媽提供最精確的建議。

對話邏輯（重要）：
1. 當使用者提出徵狀或問題時，不要立即給出標準答案。
2. 請先根據問題提出 2 到 3 個關鍵的【追問】，例如發生的頻率、持續時間、疼痛程度或具體部位，以便補足細節。
3. 待使用者回答後（或在對話歷史顯示已有足夠資訊時），再根據細節提供一個相似度最高、最切合當下情況的解決方案。

回覆規範：
1. 【絕對禁止】使用任何星號符號，包含 *、** 或 ***。
2. 若需強調重點，請使用「 」或【 】符號。
3. 說話風格要專業、直接、高效。不要講過多關心或安慰的廢話。
4. 每則訊息開頭只需一個極簡短的問候（如：你好。）。
5. 列表請使用數字（1. 2. 3.）或全形破折號（—）。
6. 必要時提醒尋求醫療專業協助。`,
    },
  });

  try {
    // Send message and get response using the required object format
    const response = await chat.sendMessage({ message });
    
    // Access the .text property directly as per SDK requirements
    const responseText = response.text;
    
    // Safety check to strip any stray asterisks that might slip through
    return responseText ? responseText.replace(/\*/g, '') : "對不起，我現在無法回答這個問題。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      return "小達目前遇到一些技術困難，請重新嘗試。";
    }
    return "小達正在休息中，請稍後再試。";
  }
};
