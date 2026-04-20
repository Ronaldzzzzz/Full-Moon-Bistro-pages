# Implementation Plan - Full-Moon-Bistro (月圓餐館)

## 專案目標
建立一個 FF14 模擬 RP 用的鄉村餐館系統，包含：
- [DONE] 首頁菜單預覽（圖片、Icon、價格）
- [DONE] 管理員後台（調整菜單、管理食材庫存、帳號權限管理）
- [DONE] 留言板功能
- [DONE] Firebase 專案對接與資料初始化

## 實作細節

### Task 1: 專案基礎建設與整合
- [DONE] 初始化 Vite + React + TypeScript 專案
- [DONE] 設定 Tailwind CSS v4 樣式
- [DONE] 對接 Firebase `Full-Moon-Bistro` 專案
- [DONE] 實作 HashRouter 路由系統與 Navbar
- [DONE] 部署正式版 Firestore Security Rules

### Task 2: 核心功能與權限
- [DONE] 定義 TypeScript 資料型別 (MenuItem, InventoryItem, Message)
- [DONE] 實作 Auth 模組（密碼雜湊 + 匿名登入）
- [DONE] 實作 Firestore 操作模組 (CRUD for menu, inventory, messages)
- [DONE] **實作管理員權限分級 (Owner vs Staff)**
- [DONE] **實作帳號管理功能 (新增/刪除管理員密碼)**

### Task 3: 品牌重塑與 UI/UX 優化 (Next Steps)
- [ ] **更新視覺風格 (Scheme B)**：
  - [ ] 切換為深木色基調 (`#2d1e12`) 與暖色燈光效果。
  - [ ] 加入月亮圖示 🌙 與樂器元素 🪕。
  - [ ] 為卡片加入柔和的暖色光暈 (`glow-warm`)。
- [ ] **實作「今日駐演 (Live Music)」看板**：
  - [ ] 在 `MenuPage` 與 `GuestbookPage` 加入發光看板元件。
  - [ ] 在後台加入手動輸入看板文字的功能。
- [ ] **增加更多 FF14 風格之裝飾元素**：
  - [ ] 模擬五線譜或流光的金色分隔線。
  - [ ] 為月亮元素加上呼吸燈 CSS 動畫。

### Task 4: 測試與品質確保
- [DONE] 撰寫型別測試
- [DONE] 撰寫 Auth 與 Firestore 邏輯測試
- [DONE] 撰寫 UI 元件測試 (MenuItemRow, MessageCard, PasswordGate)
- [ ] 進行最終整合測試與 GA 分析代碼植入

### Task 5: 部署與維護
- [DONE] 設定 GitHub Actions 自動部署至 GitHub Pages
- [ ] 部署至 GitHub Pages 後驗證 HashRouter 路由跳轉
