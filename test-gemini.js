
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Make sure to load env vars manually if not running via next/dev
// But here I'll just use the hardcoded key from your .env for this test
const API_KEY = "AIzaSyBEmipKpuVJVf1RvTVCWGC7oPPr18I-FoM";

const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS_TO_TEST = [
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-pro-latest"
];

async function testModels() {
    console.log("🔍 開始測試 AI 模型可用性...");

    for (const modelName of MODELS_TO_TEST) {
        try {
            console.log(`正在測試: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Say Hello";
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ !!! 成功 !!! 模型 [${modelName}] 可用！`);
                console.log(`回應: ${text}`);
                return; // Stop on first success
            }
        } catch (error) {
            console.log(`❌ 失敗: ${modelName}`);
            console.log(`   原因: ${error.message}`);
        }
    }

    console.log("⚠️ 所有模型均測試失敗。這把 API Key 可能有權限問題，或者額度用盡。");
}

testModels();
