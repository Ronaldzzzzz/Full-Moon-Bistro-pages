# 月圓餐館 (Full Moon Bistro) V3.0 - 點餐系統與拍立得視覺計畫

> **實作指南:** 建議使用 `activate_skill:executing-plans` 逐步執行此計畫。步驟採用 Checkbox (`- [ ]`) 語法追蹤進度。

**目標:** 
1. 建立簡易點餐系統 (支援 LocalStorage 冷卻與後台管理)。
2. 實作拍立得風格的角色全身照展示，並整合 Firebase Storage 讓後台可直接更換圖片。
3. 更新 Header，實現標題放大與後台可調式的地址顯示。

**架構設計:**
- **點餐系統**: 新增 `orders` 集合，記錄點餐 ID、品項與時間。
- **配置系統**: 使用 `settings/global` 儲存地址、冷卻分鐘數及照片 URL。
- **儲存系統**: 整合 Firebase Storage 儲存宣傳全身照。
- **視覺層**: 實作 `PhotoCards.tsx` 裝飾組件。

---

### Task 1: 基礎配置與資料結構 (Base Config & DB) ✅ [DONE]

- [x] **Step 1: 更新 `src/types/index.ts`**
定義 `Order`, `GlobalSettings` 介面。
- [x] **Step 2: 初始化 Firestore 設定**
在 Firestore `settings` 集合建立 `global` 文件，包含預設地址與冷卻時間。
- [x] **Step 3: 修改 `src/lib/firestore.ts`**
新增 `getGlobalSettings`, `updateGlobalSettings`, `addOrder`, `getOrders`, `deleteOrder` 等 API。

**commit**: `5d4ddac` feat(v3): add Order and GlobalSettings types and Firestore functions

---

### Task 2: 點餐系統實作 (Ordering System) ✅ [DONE]

- [x] **Step 1: 開發 `OrderForm.tsx` 組件**
1. 讓客人輸入 ID 名稱。
2. 串接現有菜單提供勾選。
3. 實作 LocalStorage 檢查邏輯：點餐後記錄 `lastOrderTime`，若未達冷卻時間則禁止提交。
- [x] **Step 2: 開發 `OrderManager.tsx` (後台)**
1. 條列式顯示訂單。
2. 支援按時間由新到舊排序。
3. 加入「一鍵刪除」處理完畢的訂單。

**commits**: `05aa52b` feat: implement order form and order manager for v3 ordering system | `3ba8760` fix: 修正 addOrder 型別簽名與 getGlobalSettings 不安全型別轉型，新增 orders/globalSettings 測試

---

### Task 3: 拍立得視覺與圖片管理 (Visual & Storage) ✅ [DONE]

- [x] **Step 1: 配置 Firebase Storage**
確保環境變數 `VITE_FIREBASE_STORAGE_BUCKET` 已設定。
- [x] **Step 2: 開發 `PhotoCard.tsx` 裝飾組件**
1. 實作拍立得相框視覺（金邊、白色邊框、微旋轉）。
2. 避開右上方月亮，預設放置於頁面左下方。
3. 加入點擊放大查看全圖的 Modal。
- [x] **Step 3: 開發後台圖片管理功能**
1. 提供圖片選擇與上傳按鈕。
2. 上傳至 Storage 後更新 `settings/global` 中的 `photoUrls`。

**commits**: `1f2ea45` feat(v3): implement PhotoCard polaroid display and PhotoManager upload for Task 3 | `d69e8b4` fix: mount PhotoManager in AdminPage and patch Storage filename & rotations

---

### Task 4: Header 優化與全局設定 (Header & Settings) ✅ [DONE]

- [x] **Step 1: 修改 `Navbar.tsx` (或 Header 元件)**
1. 從 Firestore 讀取 `address` 並動態顯示。
2. 放大標題字體，並優化地址文字排版。
3. 添加條件式訂購按鈕（基於全局設定）。
- [x] **Step 2: 整合後台設定頁面**
新增 `GlobalSettingsManager` 分頁，用於修改地址、冷卻時間、運費、最小訂購金額及更換宣傳照。

**commit**: `a6486e9` feat: add GlobalSettingsManager with Navbar integration | `6dd9e28` Merge branch 'feature/v3-ordering'

**測試**: Navbar.test.tsx, AdminPage.test.tsx, GlobalSettingsManager.test.tsx 已完成

---

### Task 5: 整合驗證與部署 ⏳ [PENDING]

- [ ] **Step 1: 測試點餐流程與冷卻機制。**
  - 在本地測試訂購表單的冷卻邏輯
  - 驗證 LocalStorage 持久化
  - 驗證 Firestore `orders` 資料寫入
  
- [ ] **Step 2: 驗證圖片上傳與前台即時更新。**
  - 測試 PhotoManager 的上傳流程
  - 驗證 PhotoCard 即時渲染新圖片
  - 檢查 Storage 中的檔案結構
  
- [ ] **Step 3: 執行 Build 並部署至 GitHub Pages。**
  - 執行 `npm run build` 確保無編譯錯誤
  - 執行 `npm run lint` 通過代碼檢查
  - 執行 `npx vitest run` 確保所有測試通過
  - 推送到 GitHub (main) 觸發自動部署

---

## 進度統計

| Task | 狀態 | Commits | 說明 |
|------|------|---------|------|
| Task 1 | ✅ DONE | 1 | 資料模型與 Firestore API 完成 |
| Task 2 | ✅ DONE | 3 | 訂購系統全面實作 |
| Task 3 | ✅ DONE | 2 | 拍立得視覺與相片管理完成 |
| Task 4 | ✅ DONE | 2 | Navbar 整合與全局設定完成 |
| Task 5 | ⏳ PENDING | - | 待測試與部署驗證 |

**當前 main 分支**: 領先 origin/main 12 commits (commit 6dd9e28)
**worktree 狀態**: 已清理，feature/v3-ordering 已合併
