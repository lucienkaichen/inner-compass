
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyBEmipKpuVJVf1RvTVCWGC7oPPr18I-FoM";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    console.log("🔍 列出可用模型...");
    try {
        // 這裡我需要直接用 REST API 呼叫，因為 SDK 的 listModels 可能需要 admin 權限或者有些隱藏邏輯
        // 但 SDK 應該有 getGenerativeModel 方法，我們試試看能不能直接 fetch
        // Google 的 listModels 一般是 v1beta/models

        // 直接用 fetch 試試看最原始的 API
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ 找到以下模型：");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("❌ 無法列出模型，API 回應:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log("❌ 發生錯誤:", error);
    }
}

listModels();
