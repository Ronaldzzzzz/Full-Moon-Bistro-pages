# Progress Log - FF14 RP 咖啡廳菜單系統

## 當前進度 (2026-04-23)

**版本**: v3.2 庫存連動 + 帳號權限  
**狀態**: 所有功能實作完成，build 通過，待部署  
**分支**: main (HEAD: 92e81fa)

---

## v3.2 已完成功能

### 帳號權限（staff/owner 分離）
- ✅ `src/pages/AdminPage.tsx` — staff 只見菜單/食材/點餐三頁；owner 見全部

### 點餐系統真實模式
- ✅ `src/types/index.ts` — 新增 `Order.status`, `GlobalSettings.realModeEnabled`, `MenuItem.stock`
- ✅ `src/lib/firestore.ts` — 新增 `completeOrder`, `addOrderWithStockDeduction`, `deleteOrderAndRestoreStock`, `craftMenuItemBatch`
- ✅ `src/components/GlobalSettingsManager.tsx` — 庫存模式開關 UI
- ✅ `src/components/OrderForm.tsx` — 缺貨品項不可選、真實模式下單扣庫存

### 訂單管理重構
- ✅ `src/components/admin/OrderManager.tsx` — 當前/歷史分頁、完成按鈕、批量刪除、分頁、股票回補

### 製作功能
- ✅ `src/components/admin/CraftModal.tsx` — 新建，製作 N 份，扣食材庫存
- ✅ `src/components/admin/MenuManager.tsx` — 庫存 badge、製作按鈕整合

---

## v3.1 已完成功能（上一版）

### 拍立得視覺增強
- ✅ `PhotoCard.tsx` — 拍立得尺寸升級 (w200×h220)、拖動支援
- ✅ `CropTool.tsx` + `PhotoManager.tsx` — 後台非破壞性裁剪工具
- ✅ `src/types/index.ts` — `CropData`, `PhotoUrl` 型別

---

## 最近 Commit 履歷

| SHA | 訊息 |
|-----|------|
| 92e81fa | feat: add CraftModal and integrate into MenuManager |
| ea8e355 | feat(AdminPage): pass session and realModeEnabled to OrderManager |
| 76f4bc8 | feat(OrderManager): rewrite with permissions/history/batch-delete |
| f79601b | feat(AdminPage): restrict staff to menu/inventory/orders tabs only |

---

## 下一步

- [ ] 推送至 origin/main，觸發 GitHub Pages 部署
- [ ] 實機驗證：真實模式點餐 → 訂單管理完成/刪除流程
- [ ] 實機驗證：CraftModal 製作 → 食材庫存扣減 → 菜品庫存增加
