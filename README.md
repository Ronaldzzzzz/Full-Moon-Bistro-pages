# 🌙 月圓餐館 - FULL MOON BISTRO

![Version](https://img.shields.io/badge/version-1.1.0-gold)
![React](https://img.shields.io/badge/React-19-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2F%20Auth-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38b2ac)

這是一個專為 FF14 模擬 RP (Roleplay) 設計的鄉村餐館菜單與互動系統。融合了溫馨的木質調風格與神祕的月相變化，致力於為冒險者提供一個舒適、愜意的休憩之所。

## ✨ 特色功能

- **🌖 實時動態月相**：主視覺背景會根據現實世界的時間，自動計算並呈現當前的月相盈缺。
- **📜 鄉村風情菜單**：依據分類展示精選餐點，支援自動分組與優雅的金色流光特效。
- **🎶 今日駐演看板**：即時更新店內駐點樂手的表演資訊，營造沉浸式的音樂餐館氛圍。
- **✍️ 冒險者留言板**：支援互動留言、按讚/倒讚功能，讓食客們分享彼此的故事。
- **⚙️ 專業後台管理**：
  - **權限分級**：區分 Owner (最高權限) 與 Staff 帳號。
  - **全能管理**：包含菜單 CRUD、食材庫存追蹤、留言管理及駐演資訊更新。

## 🛠️ 技術棧

- **前端**: React 19, TypeScript, Vite
- **樣式**: Tailwind CSS v4 (含自定義流光與呼吸燈動畫)
- **後端**: Firebase (Firestore, Authentication, Storage)
- **部署**: GitHub Pages (透過 GitHub Actions 自動化)

## 🚀 快速啟動

### 環境配置
在根目錄建立 `.env` 檔案並填入您的 Firebase 配置：
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=full-moon-bistro
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_ga_id
```

### 安裝與運行
```bash
# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev

# 建置專案
npm run build
```

## 🔐 安全性與部署

本專案採用 **Firebase Anonymous Auth** 結合自定義密碼雜湊 (SHA-256) 進行安全驗證。所有敏感金鑰均透過 GitHub Secrets 管理，確保代碼庫的純淨與安全。

---
*「月圓人團圓，樂聲動心弦。願星光照亮您的旅程。」*
