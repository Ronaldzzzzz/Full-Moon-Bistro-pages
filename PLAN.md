# 月圓餐館 (Full Moon Bistro) V3.1 - PhotoCard 增強計畫

> **實作指南:** 採用 Subagent-Driven 或 Executing-Plans 逐步執行實作計畫。步驟詳見 `docs/superpowers/plans/2026-04-22-photocard-enhancement-plan.md`

**目標:**
1. 放大拍立得尺寸 (w100×h120 → w200×h220)
2. 實作左側區域內自由拖動 (200px寬，上下邊界，位置獨立)
3. 後台非破壞性圖片裁剪工具 (紅框選區，儲存 cropData 參數)

**架構設計:**
- **資料層**: 擴展 `GlobalSettings.photoUrls` 型別，支援每張圖片的 cropData 參數
- **視覺層**: PhotoCard 元件升級尺寸、拖動邏輯、cropData 應用
- **管理層**: 新建 CropTool 元件，整合至 PhotoManager 後台流程

**設計文檔**: `docs/superpowers/specs/2026-04-22-photocard-enhancement-design.md`  
**實作計畫**: `docs/superpowers/plans/2026-04-22-photocard-enhancement-plan.md`

---

## 待實作任務

### Task 1: 型別定義擴展 (Type Definitions)
- [ ] 在 `src/types/index.ts` 新增 `CropData` 與 `PhotoUrl` 介面
- [ ] 更新 `GlobalSettings` 型別：`photoUrls: string[]` → `photoUrls: PhotoUrl[]`
- [ ] 驗證 TypeScript 編譯無誤

### Task 2: Firestore 函式驗證 (Compatibility Check)
- [ ] 確認 `getGlobalSettings` 與 `updateGlobalSettings` 相容新型別
- [ ] 驗證序列化/反序列化正確

### Task 3: PhotoCard 元件升級 - 尺寸 (Size Update)
- [ ] 更新左側拍立得寬度：100px → 200px
- [ ] 更新左側拍立得高度：120px → 220px
- [ ] 更新 Modal 相框尺寸與 padding（比例對應）
- [ ] 編譯與視覺驗證

### Task 4: PhotoCard 元件升級 - 拖動 (Drag Logic)
- [ ] 添加拖動狀態管理（positions, dragState）
- [ ] 實作滑鼠事件處理（mouseDown, mouseMove, mouseUp）
- [ ] 邊界檢驗邏輯（左側 200px，上下邊界）
- [ ] 更新 JSX 應用 absolute positioning
- [ ] 全域事件監聽（useEffect cleanup）
- [ ] 本地測試與 commit

### Task 5: PhotoCard 元件升級 - cropData 支援 (Crop Support)
- [ ] 更新 Props 相容 `string | PhotoUrl`
- [ ] 實作 `getCropObjectPosition` 與 `getPhotoUrl` 工具函式
- [ ] 應用 CSS `object-position` 樣式
- [ ] 同時更新左側與 Modal 圖片
- [ ] 編譯驗證

### Task 6: CropTool 元件實作 (Crop Editor)
- [ ] 建立 `src/components/admin/CropTool.tsx`
- [ ] Props 設計：imageUrl, initialCropData, onSave, onCancel
- [ ] 狀態管理：cropData, isDragging, dragType
- [ ] 拖動邏輯：move（改位置）、resize（改大小）
- [ ] JSX：圖片容器、紅框、把手、參數顯示、按鈕區
- [ ] 單元測試（CropTool.test.tsx）
- [ ] commit

### Task 7: PhotoManager 整合 CropTool (Integration)
- [ ] 添加裁剪編輯狀態（editingIndex, editingCropData）
- [ ] 導入 CropTool 元件
- [ ] 實作 `handleEditCrop`, `handleSaveCrop`, `handleCancelCrop` 回調
- [ ] 在圖片列表添加「編輯裁剪」按鈕
- [ ] 添加裁剪 Modal JSX
- [ ] 編譯驗證

### Task 8: 型別相容性與資料遷移 (Compatibility)
- [ ] 確保 MenuPage 正確接收與傳遞新型別
- [ ] 驗證舊資料（string[]）向下相容新邏輯
- [ ] 端到端流程測試

### Task 9: 測試與驗證 (Testing & QA)
- [ ] 寫 PhotoCard 尺寸測試
- [ ] 寫拖動邏輯測試
- [ ] 寫後台裁剪整合測試
- [ ] 執行全部測試：`npx vitest run`
- [ ] Linting 檢查：`npm run lint`
- [ ] Build 驗證：`npm run build`
- [ ] 視覺驗證清單（尺寸、拖動、裁剪、即時更新）

### Task 10: 最終整合與清理 (Final Cleanup)
- [ ] 代碼審查清單（註釋、型別、cleanup）
- [ ] 文檔更新（如需）
- [ ] 確認未破壞現有功能
- [ ] 最終 commit 與推送

---

## 進度追蹤

| Task | 狀態 | 預期 commits |
|------|------|----------|
| Task 1 | ⏳ PENDING | 1 |
| Task 2 | ⏳ PENDING | 0-1 |
| Task 3 | ⏳ PENDING | 1 |
| Task 4 | ⏳ PENDING | 1 |
| Task 5 | ⏳ PENDING | 1 |
| Task 6 | ⏳ PENDING | 1 |
| Task 7 | ⏳ PENDING | 1 |
| Task 8 | ⏳ PENDING | 0-1 |
| Task 9 | ⏳ PENDING | 1 |
| Task 10 | ⏳ PENDING | 0-1 |

**當前分支**: main (commit 6dd9e28)  
**下一步**: 啟動 Subagent-Driven 或 Executing-Plans 執行實作計畫
