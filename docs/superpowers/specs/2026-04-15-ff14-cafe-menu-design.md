# FF14 RP 咖啡廳菜單系統 — 設計規格

**日期**：2026-04-15  
**版本**：v1.0  
**狀態**：已確認

---

## 1. 專案概述

為 FF14 模擬 RP 咖啡廳打造的菜單展示與管理系統。提供客人瀏覽菜單、留言互動的公開頁面，以及管理員維護菜單、庫存與留言的後台。

**核心限制**：
- 部署於 GitHub Pages 或 Cloudflare Pages（純靜態，無自建伺服器）
- 完全免費（利用 Firebase 免費 Spark Plan）
- 多人後台協作（5–10 位管理員）

---

## 2. 技術棧

| 層次 | 選用 | 理由 |
|------|------|------|
| 前端框架 | React + Vite (TypeScript) | 生態成熟、開發體驗佳 |
| 樣式 | Tailwind CSS | 快速實現客製化主題 |
| 資料庫 | Firebase Firestore | BaaS、免費額度充裕、即時同步 |
| 認證 | 密碼驗證 ＋ Firebase Anonymous Auth | 無需 Google 帳號；匿名 Auth 讓 Firestore Rules 有實質效力 |
| 部署 | GitHub Pages / Cloudflare Pages | 靜態免費託管 |

---

## 3. 視覺風格

**B+C 混合**：溫馨暖色（米白、暖棕）打底，搭配優雅西式的金色線條、分隔符與 Serif 標題字體。整體氛圍如 FF14 中的溫馨酒館兼有貴族餐廳質感。

**色彩規範（參考）**：
- 背景：`#1a1510`（深暖棕）
- 卡片背景：`#2a2015`
- 金色強調：`#c9a55a` / `#d4af7a`
- 文字主色：`#d4c090`
- 供應中：`#81c784`（綠）
- 已售完：`#ef9a9a`（紅）

---

## 4. 頁面結構

### 4.1 導覽列
全站固定頂部導覽，包含：**菜單** / **留言板** / **後台**（後台以低調 icon 顯示，避免干擾客人視線）。

---

### 4.2 菜單首頁（公開）

**版型**：清單橫排（Layout B）

| 區塊 | 說明 |
|------|------|
| Banner | 咖啡廳名稱、標語，金框裝飾 |
| 分類頁籤 | 開胃菜 / 主食 / 甜品 / 飲品 / 套餐，切換不重新載入 |
| 品項清單 | 每行：縮圖 ＋ 名稱 ＋ 描述 ＋ 價格 ＋ 供應狀態徽章 |
| 售完品項 | 半透明顯示，徽章標示「已售完」 |

**品項欄位**：名稱、描述、價格、圖片、是否供應中

---

### 4.3 留言板（公開）

| 區塊 | 說明 |
|------|------|
| 留言卡片 | 作者（ID ＋ 伺服器名稱，或顯示「匿名」）、內容、發布時間 |
| 互動 | 👍 按讚 / 👎 倒讚（各自獨立計數；以 localStorage 防止同裝置重複點擊） |
| 回覆 | 可展開顯示回覆列表；回覆本身無互動功能 |
| 留言表單 | 固定於頁底；欄位：暱稱、伺服器名稱、留言內容、勾選匿名（匿名時隱藏前兩欄） |

**留言即時顯示**，不需管理員審核。

---

### 4.4 後台管理（密碼保護）

#### 密碼驗證流程
1. 顯示密碼輸入頁
2. 前端以 SHA-256 雜湊輸入值，與 Firestore `adminPasswords` collection 中的雜湊值比對
3. 比對成功 → 呼叫 `signInAnonymously()`（搭配 `browserSessionPersistence`，關閉瀏覽器即失效）；同時將 `{ role, label }` 寫入 `sessionStorage` 供 UI 顯示用
4. 每次後台操作前檢查 Firebase Auth 當前使用者是否存在

**密碼組數**：2–3 組，各自有 `role` 與 `label` 標示用途。目前所有角色享有相同後台權限（無分級），`role` 欄位保留供未來擴充使用。

> **安全備注**：`adminPasswords` 的 Firestore Security Rules 設定為「不允許前端直接讀取文件列表」；驗證邏輯透過比對已知 document ID（雜湊值即為 doc ID）來確認，避免暴力列舉。

#### 後台功能模組

**菜單管理**
- 顯示所有品項清單（依分類分組）
- 新增品項（填寫表單 ＋ 上傳圖片至 Firebase Storage）
- 編輯品項（名稱、描述、價格、圖片、分類）
- 切換供應狀態（上架 / 下架）
- 刪除品項

**食材庫存管理**
- 顯示庫存清單（名稱、數量、單位、備註）
- 新增 / 編輯 / 刪除庫存項目

**留言管理**
- 顯示所有留言（含回覆）
- 刪除留言或回覆

---

## 5. Firestore 資料模型

```
/menuItems/{itemId}
  - category: 'appetizer' | 'main' | 'dessert' | 'drink' | 'set'
  - name: string
  - description: string
  - price: number
  - imageUrl: string        // Firebase Storage URL
  - available: boolean
  - order: number           // 分類內排序

/inventory/{itemId}
  - name: string
  - stock: number
  - unit: string            // 例：份、瓶、克
  - note: string

/messages/{messageId}
  - authorId: string        // 匿名時為空字串
  - serverName: string      // 匿名時為空字串
  - isAnonymous: boolean
  - content: string
  - timestamp: Timestamp
  - likes: number
  - dislikes: number

/messages/{messageId}/replies/{replyId}
  - authorId: string
  - serverName: string
  - isAnonymous: boolean
  - content: string
  - timestamp: Timestamp

/adminPasswords/{sha256Hash}
  - role: 'owner' | 'staff'
  - label: string           // 人類可讀標籤，如「主廚密碼」
```

---

## 6. Firebase Security Rules（摘要）

由於未使用 Firebase Auth，Firestore Rules 無法驗證瀏覽器端的 sessionStorage。採取以下**務實策略**：

| Collection | 讀取 | 新增 | 更新 | 刪除 |
|------------|------|------|------|------|
| `menuItems` | 公開 | 拒絕（直接由前端管理員操作時寫入，見下） | 拒絕 | 拒絕 |
| `inventory` | 公開 | 拒絕 | 拒絕 | 拒絕 |
| `messages` | 公開 | **公開**（任何人可留言） | 僅允許更新 likes/dislikes 欄位 | 拒絕 |
| `adminPasswords` | 僅允許 get（不允許 list） | 拒絕 | 拒絕 | 拒絕 |

**管理員寫入（菜單、庫存、刪除留言）的實作策略**：  
使用 **Firebase Anonymous Auth**（匿名登入）。管理員通過密碼驗證後，前端呼叫 `signInAnonymously()`，Firestore Rules 以 `request.auth != null` 判斷是否為已登入使用者，允許對 `menuItems`、`inventory` 執行寫入，以及刪除 `messages`。匿名 session 關閉瀏覽器後自動失效（搭配 `setPersistence(browserSessionPersistence)`）。

此方案無需使用者有 Google 帳號，同時讓 Firestore Rules 有實質意義。

---

## 7. 元件架構（前端）

```
src/
├── pages/
│   ├── MenuPage.tsx          // 菜單首頁
│   ├── GuestbookPage.tsx     // 留言板
│   └── AdminPage.tsx         // 後台（含密碼驗證 Gate）
├── components/
│   ├── Navbar.tsx
│   ├── menu/
│   │   ├── CategoryTabs.tsx
│   │   └── MenuItemRow.tsx   // 橫排清單品項
│   ├── guestbook/
│   │   ├── MessageCard.tsx
│   │   ├── ReplyList.tsx
│   │   └── MessageForm.tsx
│   └── admin/
│       ├── PasswordGate.tsx
│       ├── MenuManager.tsx
│       ├── InventoryManager.tsx
│       └── MessageManager.tsx
├── lib/
│   ├── firebase.ts           // Firebase 初始化
│   ├── firestore.ts          // 所有 Firestore 操作函式
│   └── auth.ts               // 密碼雜湊、Anonymous Auth、session 管理
└── types/
    └── index.ts              // MenuItem, Message, Inventory 型別
```

---

## 8. 範圍外（Out of Scope）

以下功能不在本次實作範圍內：
- 訂位或點餐系統
- 付款功能
- 推播通知
- 多語言 i18n
- 留言按讚防刷（跨裝置）——僅 localStorage 防重複，非嚴格限制

---

## 9. 部署流程

1. `npm run build` → 產生 `dist/` 靜態檔案
2. GitHub Actions（或 Cloudflare Pages CI）自動部署至靜態主機
3. Firebase 設定允許來自部署網域的跨域請求（CORS）
4. 環境變數（Firebase config）透過 `.env` 管理，部署時設定於 CI 環境變數

---

*本文件由 Claude Code 協助生成，專案對應 PROPOSAL.md v1.0*
