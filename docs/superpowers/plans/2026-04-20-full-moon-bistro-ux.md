# Full-Moon-Bistro (月圓餐館) UI/UX 優化實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將「The Seventh Haven」品牌完整轉化為「月圓餐館 (Full-Moon-Bistro)」，包含視覺風格優化、深木色主題、發光效果、以及「今日駐演」看板功能。

**Architecture:** 
- 修改全域 Tailwind CSS 變數實作「深木色＋月光金」主題。
- 建立 `LiveMusicBanner` 獨立元件並與 Firestore `config/liveMusic` 文件連結。
- 在 `AdminPage` 擴充管理介面。
- 使用 CSS Keyframes 實作呼吸燈動畫效果。

**Tech Stack:** React 19, Tailwind CSS v4, Firebase Firestore, Framer Motion (選用，若需更複雜動畫)

---

## Task 1: 全域品牌重塑與色彩系統

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/pages/MenuPage.tsx`
- Modify: `src/pages/GuestbookPage.tsx`
- Modify: `src/pages/AdminPage.tsx`

- [ ] **Step 1: 更新 Tailwind v4 色彩變數**

```css
/* src/index.css */
@theme {
  --color-bg-primary: #2d1e12;
  --color-bg-card: #3e2a1b;
  --color-bg-card-hover: #4a3422;
  --color-border-primary: #5d4028;
  --color-border-gold: #8b6b4a;
  --color-gold-primary: #f4e38e;
  --color-gold-light: #fff5bc;
  --color-text-primary: #e8d5b5;
  --color-text-muted: #a68b6d;
  /* 新增暖色光暈 */
  --shadow-glow-warm: 0 0 15px rgba(244, 227, 142, 0.15);
  /* 月亮呼吸燈動畫 */
  --animate-moon-pulse: moon-pulse 3s infinite ease-in-out;
}

@keyframes moon-pulse {
  0%, 100% { filter: drop-shadow(0 0 2px #f4e38e); opacity: 0.8; }
  50% { filter: drop-shadow(0 0 8px #f4e38e); opacity: 1; }
}
```

- [ ] **Step 2: 更新 Navbar 品牌名稱與圖示**

```typescript
// src/components/Navbar.tsx (部分)
<span className="font-serif text-[#f4e38e] text-sm tracking-widest flex items-center gap-2">
  <span className="animate-[moon-pulse_3s_infinite]">🌙</span>
  FULL-MOON-BISTRO
  <span className="text-xs opacity-50">🪕</span>
</span>
```

- [ ] **Step 3: 批次替換頁面標題與 Banner 內容**

將 `src/pages/` 下所有出現的 `THE SEVENTH HAVEN` 替換為 `FULL-MOON-BISTRO (月圓餐館)`，並更新標語。

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/Navbar.tsx src/pages/
git commit -m "style: rebrand to Full-Moon-Bistro and update color scheme"
```

---

## Task 2: 「今日駐演 (Live Music)」資料模型與元件

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/components/LiveMusicBanner.tsx`
- Modify: `src/lib/firestore.ts`

- [ ] **Step 1: 新增 LiveMusic 型別定義**

```typescript
// src/types/index.ts
export interface LiveMusicConfig {
  content: string
  isActive: boolean
  updatedAt: Timestamp
}
```

- [ ] **Step 2: 新增獲取 LiveMusic 配置的 API**

```typescript
// src/lib/firestore.ts
export async function getLiveMusicConfig(): Promise<LiveMusicConfig | null> {
  const docSnap = await getDoc(doc(db, 'config', 'liveMusic'))
  if (!docSnap.exists()) return null
  return docSnap.data() as LiveMusicConfig
}

export async function updateLiveMusicConfig(data: Partial<LiveMusicConfig>): Promise<void> {
  await setDoc(doc(db, 'config', 'liveMusic'), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true })
}
```

- [ ] **Step 3: 實作 LiveMusicBanner 元件**

```typescript
// src/components/LiveMusicBanner.tsx
import { useEffect, useState } from 'react'
import { getLiveMusicConfig } from '../lib/firestore'
import type { LiveMusicConfig } from '../types'

export default function LiveMusicBanner() {
  const [config, setConfig] = useState<LiveMusicConfig | null>(null)

  useEffect(() => {
    getLiveMusicConfig().then(setConfig)
  }, [])

  if (!config || !config.isActive || !config.content) return null

  return (
    <div className="mb-6 p-3 rounded border border-[#f4e38e]/30 bg-[#3e2a1b] shadow-[0_0_10px_rgba(244,227,142,0.1)] flex items-center gap-3">
      <span className="text-xl animate-pulse">🎶</span>
      <div className="flex-1">
        <p className="text-[#f4e38e] text-sm font-medium tracking-wide">
          {config.content}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/firestore.ts src/components/LiveMusicBanner.tsx
git commit -m "feat: add LiveMusic data model and banner component"
```

---

## Task 3: 駐點樂手後台管理

**Files:**
- Create: `src/components/admin/MusicManager.tsx`
- Modify: `src/pages/AdminPage.tsx`

- [ ] **Step 1: 實作 MusicManager 管理介面**

```typescript
// src/components/admin/MusicManager.tsx
import { useEffect, useState } from 'react'
import { getLiveMusicConfig, updateLiveMusicConfig } from '../../lib/firestore'

export default function MusicManager() {
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getLiveMusicConfig().then(config => {
      if (config) {
        setContent(config.content)
        setIsActive(config.isActive)
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await updateLiveMusicConfig({ content, isActive })
      alert('更新成功！')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#2a2015] border border-[#6a5030] rounded p-4 flex flex-col gap-4">
      <h3 className="text-[#c9a55a] text-sm font-semibold">今日駐演看板管理</h3>
      <div className="flex items-center gap-2 text-xs text-[#9a8a70]">
        <input 
          type="checkbox" 
          checked={isActive} 
          onChange={(e) => setIsActive(e.target.checked)}
          className="accent-[#c9a55a]"
        />
        啟用看板顯示
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="例如：今晚 8 點：吟遊詩人現場演奏..."
        className="bg-[#1a1510] border border-[#4a3820] rounded px-3 py-2 text-sm text-[#d4c090] placeholder-[#6a5030] focus:outline-none focus:border-[#c9a55a] resize-none"
        rows={3}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="self-end bg-[#c9a55a] text-[#1a1510] text-sm font-semibold px-5 py-1.5 rounded hover:bg-[#d4af7a] transition-colors"
      >
        {saving ? '儲存中...' : '更新看板'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 在 AdminPage 整合 MusicManager**

```typescript
// src/pages/AdminPage.tsx (部分)
type AdminTab = 'menu' | 'inventory' | 'messages' | 'admins' | 'music'

const tabs = [
  // ... 其他分頁
  { key: 'music', label: '駐演看板' },
]

// ...渲染邏輯
{tab === 'music' && <MusicManager />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MusicManager.tsx src/pages/AdminPage.tsx
git commit -m "feat: add admin interface for LiveMusic management"
```

---

## Task 4: UI 細節微調與發光效果

**Files:**
- Modify: `src/components/menu/MenuItemRow.tsx`
- Modify: `src/components/guestbook/MessageCard.tsx`

- [ ] **Step 1: 為清單卡片加入暖色光暈與懸停效果**

```typescript
// src/components/menu/MenuItemRow.tsx (修改 class)
className={`flex items-center gap-4 bg-[#3e2a1b] border border-[#5d4028] rounded p-3 transition-all hover:bg-[#4a3422] hover:shadow-[0_0_15px_rgba(244,227,142,0.1)] ...`}
```

- [ ] **Step 2: 為頁面標題加入金色波浪分隔線**

在 `MenuPage` 與 `GuestbookPage` 的標題下方使用 CSS 繪製或背景圖實作裝飾線。

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "style: add glow effects and FF14 style decorations"
```
