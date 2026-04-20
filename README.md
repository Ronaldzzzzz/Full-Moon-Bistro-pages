# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


1. Firebase Console 設定

  1. 建立 Firebase 專案 → 啟用 Firestore、Storage、Authentication (Anonymous)
  2. 複製 Web App 設定，建立 .env 檔案（參考 .env.example）
  3. 在 Firestore 手動新增管理員密碼文件：
    - Collection: adminPasswords
    - Document ID = 密碼的 SHA-256 雜湊值（在瀏覽器 Console 執行：crypto.subtle.digest('SHA-256', new
  TextEncoder().encode('你的密碼')).then(b => Array.from(new
  Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')).then(console.log)）
    - 欄位：role: "owner", label: "主廚密碼"
  4. 部署 Firestore Rules：firebase deploy --only firestore:rules（需先在 .firebaserc 填入實際 Project ID）

2. GitHub Pages 設定

  1. 將 repo 推送到 GitHub
  2. Settings → Pages → Source: GitHub Actions
  3. Settings → Secrets → 新增 6 個 VITE_FIREBASE_* 環境變數
  4. Firebase Console → Authentication → Authorized domains → 新增 <你的帳號>.github.io

  ▎ 注意：目前分支是 master，但 workflow 設定觸發 main 分支。推送前建議執行 git branch -m master main，或修改
  ▎ .github/workflows/deploy.yml 中的 branches: [master]。