
const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = "AIzaSyBEmipKpuVJVf1RvTVCWGC7oPPr18I-FoM";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testFinalModel() {
    const modelName = "gemini-flash-latest"; // I saw this in the valid list
    console.log(`🔍 最終驗證模型: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Reply 'OK' if you can hear me.";
        const result = await model.generateContent(prompt);
        const output = await result.response.text();
        console.log(`✅ !!! 驗證通過 !!!`);
        console.log(`回應: ${output}`);
    } catch (error) {
        console.log(`❌ 驗證失敗: ${error.message}`);
    }
}
testFinalModel();
