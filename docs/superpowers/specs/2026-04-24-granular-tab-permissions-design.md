# Granular Tab Permissions Design

**Goal:** Replace the binary owner/staff permission model with per-tab, per-action permissions configurable by the owner, with real-time forced logout when permissions change.

**Architecture:** Permissions are stored in Firestore alongside the account (hash doc), loaded at login into `AdminSession`, and enforced via props passed down to each admin component. A Firestore `onSnapshot` listener in `AdminPage` detects permission changes and forces the affected account to log out immediately.

**Tech Stack:** React, Firebase Firestore (onSnapshot), sessionStorage, TypeScript

---

## 1. Data Model

### Firestore: `adminPasswords/{hash}`

```
{
  role: 'owner' | 'staff',
  label: string,
  permissions?: StaffPermissions   // only meaningful for staff; owner always has full access
}
```

### TypeScript Types (src/types/index.ts)

```typescript
export type TabKey = 'menu' | 'inventory' | 'orders' | 'messages' | 'notice'

export interface TabPermission {
  write: boolean   // can add / modify
  delete: boolean  // can delete (implies write)
}

export type StaffPermissions = Record<TabKey, TabPermission>

export interface AdminSession {
  role: 'owner' | 'staff'
  label: string
  hash: string              // password hash — used for onSnapshot listener
  permissions: StaffPermissions
}
```

### Configurable Tabs

| Tab key    | Label    | Configurable for staff |
|------------|----------|------------------------|
| menu       | 菜品管理  | ✅                     |
| inventory  | 食材庫存  | ✅                     |
| orders     | 點餐管理  | ✅                     |
| messages   | 留言管理  | ✅                     |
| notice     | 文字設定  | ✅                     |
| settings   | 系統設定  | ❌ owner only          |
| admins     | 帳號管理  | ❌ owner only          |

### Default Staff Permissions (applied when no `permissions` field exists)

```typescript
export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  menu:      { write: true,  delete: true  },
  inventory: { write: true,  delete: true  },
  orders:    { write: true,  delete: true  },
  messages:  { write: true,  delete: true  },
  notice:    { write: false, delete: false },
}
```

### Owner Permissions (computed at login, not stored)

All tabs: `{ write: true, delete: true }` — owner bypasses all permission checks.

---

## 2. Auth Flow Changes

### `src/lib/auth.ts` — `signInWithPassword`

1. Hash the password
2. Fetch `adminPasswords/{hash}` from Firestore
3. Extract `role`, `label`, and `permissions`
4. Resolve effective permissions:
   - If `role === 'owner'`: all tabs `{ write: true, delete: true }`
   - If `role === 'staff'` and `permissions` exists: use stored permissions
   - If `role === 'staff'` and no `permissions`: use `DEFAULT_STAFF_PERMISSIONS`
5. Build `AdminSession = { role, label, hash, permissions }` and save to sessionStorage

### `src/lib/firestore.ts` — New function

```typescript
export async function updateAdminPermissions(
  hash: string,
  permissions: StaffPermissions
): Promise<void>
```

Updates `adminPasswords/{hash}` with `{ permissions }` via `updateDoc`.

### `src/lib/firestore.ts` — `getAdmins` change

Return type extended to include `permissions`:
```typescript
{ id: string; role: string; label: string; permissions?: StaffPermissions }[]
```

### `src/lib/firestore.ts` — `addAdmin` change

When creating a staff account, write `DEFAULT_STAFF_PERMISSIONS` into the document so it is always explicitly stored.

---

## 3. Real-Time Forced Logout (AdminPage)

`src/pages/AdminPage.tsx` subscribes to the current account's Firestore document:

```
useEffect(() => {
  const unsub = onSnapshot(doc(db, 'adminPasswords', session.hash), (snap) => {
    if (!snap.exists()) {
      // account deleted
      signOutAdmin().then(() => setSession(null))
      return
    }
    // permissions or role changed → force logout
    signOutAdmin().then(() => setSession(null))
    // show toast: "帳號權限已變更，請重新登入"
  })
  return unsub
}, [session.hash])
```

The listener fires on any write to the document. Since it also fires once on mount (with the current data), the handler must skip the initial snapshot — compare a `mounted` ref or skip if the data matches the session.

**Implementation detail:** Use a `hasLoaded` ref that starts `false`, set to `true` after the first snapshot fires. Only act on subsequent snapshots.

---

## 4. Permission Enforcement

### Tab Visibility — `src/pages/AdminPage.tsx`

```typescript
function canAccess(tab: TabKey): boolean {
  if (session.role === 'owner') return true
  return session.permissions[tab]?.write ?? false
}
```

- `settings` and `admins`: always `role === 'owner'` guard (unchanged)
- All other tabs: use `canAccess(tab)`

### Helper Functions — `src/lib/permissions.ts` (new file)

```typescript
export function canWrite(session: AdminSession, tab: TabKey): boolean {
  if (session.role === 'owner') return true
  return session.permissions[tab]?.write ?? false
}

export function canDelete(session: AdminSession, tab: TabKey): boolean {
  if (session.role === 'owner') return true
  return session.permissions[tab]?.delete ?? false
}
```

### Component Props

| Component         | New props                              |
|-------------------|----------------------------------------|
| MenuManager       | `canWrite: boolean, canDelete: boolean` |
| InventoryManager  | `canWrite: boolean, canDelete: boolean` |
| OrderManager      | `canWrite: boolean, canDelete: boolean` |
| MessageManager    | `canDelete: boolean`                   |
| NoticeManager     | `canWrite: boolean`                    |

**Enforcement rules:**
- `canWrite = false` → hide the "新增" / "編輯" form and buttons
- `canDelete = false` → hide delete buttons (single and bulk)
- Owner always receives `true` for both

---

## 5. Permission Modal (AdminManager)

### Trigger

Each row in the admin accounts table is clickable. Clicking opens `PermissionModal` with the selected account.

### Modal Behaviour

**Owner account selected:**
- Display: "管理員帳號，擁有全部權限" — no editable checkboxes.

**Staff account selected:**
- Display a 5-row grid (one per configurable tab):

```
Tab label     | ☑ 新增/修改 | ☑ 刪除
菜品管理      |     ☑       |   ☑
食材庫存      |     ☑       |   ☑
點餐管理      |     ☑       |   ☑
留言管理      |     ☑       |   ☑
文字設定      |     ☐       |   ☐
```

**Checkbox interlock:**
- Checking "刪除" → automatically checks "新增/修改"
- Unchecking "新增/修改" → automatically unchecks "刪除"

**Save:** Calls `updateAdminPermissions(hash, permissions)` → Firestore write → triggers the target account's `onSnapshot` listener → forced logout with toast.

### New component

`src/components/admin/PermissionModal.tsx`

Props:
```typescript
interface Props {
  admin: { id: string; role: string; label: string; permissions?: StaffPermissions }
  onClose: () => void
  onSaved: () => void
}
```

---

## 6. Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `TabKey`, `TabPermission`, `StaffPermissions`, `DEFAULT_STAFF_PERMISSIONS`; update `AdminSession` |
| `src/lib/auth.ts` | Load and resolve permissions at login; store `hash` in session |
| `src/lib/firestore.ts` | Add `updateAdminPermissions()`; update `getAdmins()` to return `permissions`; update `addAdmin()` to write default permissions for staff |
| `src/lib/permissions.ts` | New: `canWrite()`, `canDelete()` helpers |
| `src/pages/AdminPage.tsx` | Add `onSnapshot` listener; update tab visibility logic; pass permission props to components |
| `src/components/admin/AdminManager.tsx` | Add row click handler; integrate `PermissionModal` |
| `src/components/admin/PermissionModal.tsx` | New: permission editing modal |
| `src/components/admin/MenuManager.tsx` | Accept `canWrite`, `canDelete`; conditionally show/hide add/edit/delete UI |
| `src/components/admin/InventoryManager.tsx` | Accept `canWrite`, `canDelete`; conditionally show/hide add/edit/delete UI |
| `src/components/admin/OrderManager.tsx` | Accept `canWrite`, `canDelete`; conditionally show/hide complete/delete UI |
| `src/components/admin/MessageManager.tsx` | Accept `canDelete`; conditionally hide delete button |
| `src/components/admin/NoticeManager.tsx` | Accept `canWrite`; conditionally disable save button and inputs |
