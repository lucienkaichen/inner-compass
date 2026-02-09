
# 產品規格書：InnerCompass 情緒管理系統

版本：v1.0
日期：2026-02-08
狀態：開發中 (In Progress)

---

## 1. 產品願景 (Vision)
建立一個專屬於個人的「情緒管理第二大腦」。這不僅是一個記錄情緒的樹洞，更是一個能透過 AI 自動分析、歸納脈絡，並提供具體 CBT (認知行為治療) 應對策略的智慧系統。目標是讓使用者從「碎片化的情緒」中，看見完整的自我模式，並採取有策略的行動。

---

## 2. 核心功能架構 (Core Features)

### 2.1 智慧輸入與儀表板 (Dashboard & Input)
*   **情緒樹洞 (Journaling)**：
    *   支援純文字快速輸入。
    *   **AI 自動情緒辨識**：系統自動分析文字內容並提取情緒標籤，無需手動標記，並以此作為後續統計與趨勢分析的依據。
    *   **智慧標籤 (Smart Tags)**：支援 `#標籤` 系統 (如：#工作, #家庭)，方便未來關聯檢索。
*   **總覽儀表板 (Overview)**：
    *   展示最近的情緒流動 (Timeline)。
    *   **情緒模式洞察**：AI 分析文字內容，提取出現頻率高的情緒關鍵字 (如：焦慮、平靜)，並以文字雲或列表呈現。
    *   **質性趨勢分析**：不使用冷冰冰的數值，而是透過 AI 總結這週的心情變化 (例如：「這週你似乎在工作上遇到了挑戰，但在週末找回了平靜」)。

### 2.2 AI 洞察分析 (AI Insights Loop) - 核心差異化功能
*   **自動化分析**：使用者輸入日記後，系統自動呼叫 Google Gemini Pro 進行分析。
*   **情緒拆解**：
    *   識別核心情緒 (Core Emotion)。
    *   識別認知扭曲 (Cognitive Distortions) - 例如：災難化思考、黑白思維。
*   **策略生成 (Strategy Generation)**：
    *   AI 自動生成一張「應對策略卡 (Strategy Card)」。
    *   包含：轉念技巧、具體行動建議、心理學原理 (如：課題分離)。

### 2.3 策略庫 (Strategy Bank)
*   **個人化策略卡**：收錄所有 AI 生成或使用者手動輸入的有效策略。
*   **成功經驗 (Success Stories)**：標記並回顧過去「克服困難」的時刻，增強自我效能感。

---

## 3. 技術架構 (Technical Architecture)

*   **前端框架**：Next.js 15 (App Router) + React
*   **樣式系統**：Tailwind CSS + Shadcn UI (追求 Premium 極簡質感)
*   **資料庫 (Database)**：PostgreSQL (Hosted on Neon)
*   **ORM**：Prisma (進行資料庫溝通與 schema 定義)
*   **AI 模型**：Google Gemini Pro (透過 API 串接)
*   **部署平台**：Vercel

### 3.1 資料庫設計 (Database Schema)

#### `Entry` (日記)
| 欄位 | 類型 | 描述 |
|:---|:---|:---|
| `id` | Int | 唯一識別碼 |
| `content` | String | 日記內容 |
| `mood` | String | 情緒標籤 (Happy, Sad...) |
| `tags` | String | JSON 格式標籤陣列 |
| `createdAt` | DateTime | 建立時間 |

#### `Analysis` (AI 分析結果) - *新功能*
| 欄位 | 類型 | 描述 |
|:---|:---|:---|
| `id` | Int | 唯一識別碼 |
| `entryId` | Int | 關聯到哪篇日記 |
| `summary` | String | AI 摘要/洞察 |
| `patterns` | String | 識別出的模式 (JSON) |
| `score` | Int | 情緒強度評分 (1-10) |

#### `Strategy` (策略卡片) - *新功能*
| 欄位 | 類型 | 描述 |
|:---|:---|:---|
| `id` | Int | 唯一識別碼 |
| `title` | String | 策略標題 (如：深呼吸法) |
| `content` | String | 具體執行步驟 |
| `category` | String | 分類 (CBT, 正念, 行動) |
| `trigger` | String | 適用情境關鍵字 (觸發點) |
| `isAiGenerated` | Boolean | 是否為 AI 生成 |

---

## 4. 部署指南 (Deployment Guide)

為了達成「手機可用」且「永久保存」的目標，我們採用以下雲端架構。

### 步驟 A: 準備雲端資料庫 (Neon PostgreSQL)
1.  前往 [Neon.tech](https://neon.tech) 註冊帳號 (可使用 Google/GitHub 登入)。
2.  建立新專案 (Project)，名稱可取為 `inner-compass-db`。
3.  在 Dashboard 找到 **Connection String** (連線字串)。
    *   格式範例：`postgres://user:pass@ep-cool-cloud.us-east-2.aws.neon.tech/neondb?sslmode=require`
    *   **重要**：這串網址等同你的資料庫帳號密碼，請妥善保存。

### 步驟 B: 準備 AI API (Google AI Studio)
1.  前往 [Google AI Studio](https://aistudio.google.com/)。
2.  點擊 **Get API Key**。
3.  建立一個新的 API Key。

### 步驟 C: 部署到 Vercel
1.  將程式碼推送到 GitHub (我們已經 Commit 了)。
2.  前往 [Vercel.com](https://vercel.com) 註冊/登入。
3.  點擊 **Add New Project** -> **Import** (從 GitHub 匯入 `inner-compass`)。
4.  在 **Environment Variables (環境變數)** 區域設定：
    *   `DATABASE_URL`: 填入 Neon 的連線字串。
    *   `GEMINI_API_KEY`: 填入 Google AI 的 API Key。
5.  點擊 **Deploy**。

---

## 5. 開發路徑 (Roadmap)

- [x] **v0.1**: 基礎架構搭建 (Next.js + Tailwind + SQLite) - *已完成*
- [ ] **v0.2**: 資料庫遷移至 Postgres & 部署上線 - *下一步*
- [ ] **v0.3**: 串接 Gemini API，實作「AI 自動分析」功能。
- [ ] **v0.4**: 實作「策略卡片」展示介面。
- [ ] **v1.0**: 完善 UI/UX，優化手機版體驗，正式發佈。

