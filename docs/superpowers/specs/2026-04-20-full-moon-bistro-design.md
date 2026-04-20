# Full-Moon-Bistro (月圓餐館) — 設計規格

**日期**：2026-04-20  
**版本**：v1.1 (Rebranding & Integration Update)  
**狀態**：待審閱

---

## 1. 專案概述

將原本的 FF14 RP 咖啡廳「The Seventh Haven」品牌重塑為 **「Full-Moon-Bistro (月圓餐館)」**。這是一個融合「鄉村餐館」溫馨氣息與「駐點樂手」現場表演氛圍的網頁系統。

**核心變更**：
- **品牌重塑**：更換全站名稱、標語與視覺圖示。
- **風格優化**：轉向「深木色」基調，搭配「暖色燈光」與「月亮」元素。
- **功能擴充**：新增「今日駐演 (Live Music)」看板，由管理員手動輸入內容。
- **Firebase 整合**：對接新的 Firebase 專案 `Full-Moon-Bistro`。

---

## 2. 品牌與視覺設計 (Brand & Visual)

### 2.1 品牌資產
- **正式名稱**：Full-Moon-Bistro (月圓餐館)
- **標語**：月圓人團圓，樂聲動心弦 (Where the moon is full, and music fills the soul)
- **圖示主題**：🌙 (月亮)、🪕 (樂器)、🪵 (木質)

### 2.2 色彩系統 (Tailwind CSS v4)
| 變數 | 顏色值 | 說明 |
|------|------|------|
| `--color-bg-primary` | `#2d1e12` | 深木質棕背景 |
| `--color-bg-card` | `#3e2a1b` | 暖木棕卡片，帶有暖色光暈 |
| `--color-gold-primary` | `#f4e38e` | 月光金，用於標題與重點 |
| `--color-border-warm` | `#6a5030` | 木質裝飾邊框 |
| `--color-glow-warm` | `rgba(255, 215, 0, 0.1)` | 模擬燈光的柔和陰影 |

---

## 3. 功能規格 (Functional Specs)

### 3.1 駐點樂手看板 (Live Music Banner)
- **顯示位置**：`MenuPage` 與 `GuestbookPage` 的頂部（Banner 下方）。
- **顯示內容**：手動輸入的動態文字（例如：「今晚 8 點：吟遊詩人小明現場演奏魯特琴」）。
- **視覺效果**：輕微的銀色光暈邊框，模擬發光的指示牌。

### 3.2 管理後台更新 (Admin Update)
- **MusicManager**：新增「演出管理」分頁。
- **功能**：
    - 快速切換看板顯示/隱藏。
    - 編輯看板文字。
    - 即時更新至 Firestore `config/liveMusic` 文件。

---

## 4. 技術實作與整合 (Technical Implementation)

### 4.1 Firebase 整合
- **環境變數**：更新 `.env` 中的所有 `VITE_FIREBASE_*` 變數至 `Full-Moon-Bistro` 專案。
- **Firestore 初始化**：
    - `adminPasswords`：重新手動新增管理員密碼雜湊。
    - `config/liveMusic`：初始化看板資料。

### 4.2 檔案變更路徑
- **文字替換**：`App.tsx`, `Navbar.tsx`, `MenuPage.tsx` 等。
- **樣式更新**：`src/index.css`。
- **新元件**：`src/components/LiveMusicBanner.tsx`。
- **後台擴充**：`src/components/admin/MusicManager.tsx`。

---

## 5. 資料模型擴充 (Data Model)

```
/config/liveMusic (Document)
  - content: string         // 看板文字
  - isActive: boolean       // 是否顯示
  - updatedAt: Timestamp    // 更新時間
```

---

## 6. 部署與預覽 (Deployment & Preview)

1.  **本地預覽**：完成 `.env` 設定後執行 `npm run dev`。
2.  **GitHub Actions**：Secret 需同步更新為新 Firebase 專案的值。
3.  **Authorized Domains**：在 Firebase Console 加入部署網域。

---

## Spec 自我審查 (Self-Review)
1. **佔位符掃描**：無 "TBD" 或 "TODO"。
2. **內部一致性**：色彩變數與視覺風格描述一致，功能與資料模型對應。
3. **範圍檢查**：專注於更名、整合與看板功能，不涉及複雜的點餐或音訊實作。
4. **歧義檢查**：明確定義了駐點樂手資訊為「手動輸入文字」，消除邏輯歧義。
