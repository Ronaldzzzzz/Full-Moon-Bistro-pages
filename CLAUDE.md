# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

FF14 模擬 RP 咖啡廳菜單系統（React 網頁應用）：
- **首頁**：客人預覽菜單（圖片、icon、價格）
- **後台**：管理員調整菜單、管理食材庫存
- **留言板**：互動留言功能

## 語言規範

**全程使用中文回覆。** 僅在專有名詞、程式碼、技術術語時使用英文。

## 初始化任務

每次啟動時：
1. 讀取 `PROPOSAL.md` 了解願景與需求
2. 讀取 `PLAN.md`（若存在）確認當前實作計畫
3. 讀取 `PROGRESS.md`（若存在）了解最新進度與受影響檔案

## Skill 使用時機

| 模式 | 觸發條件 | 規範 |
|------|----------|------|
| **工業模式** | 核心邏輯、架構變動、複雜演算法、多檔案連動 | 啟用 Karpathy + Superpowers，執行 TDD，更新 PLAN/PROGRESS |
| **輕量模式** | 文案修改、UI 微調、單一變數命名、已知錯誤快速修復 | 直接執行，無需更新追蹤檔案 |

## 工業模式開發心法

- **Minimalism (Karpathy)**：外科手術式修改，嚴禁無關重構，保持 Diff 乾淨
- **Thinking**：編碼前先陳述邏輯假設與設計思路
- **TDD**：優先規劃測試，確保功能可驗證
- **Atomic Tasks**：將任務拆解為微小、可管理的單元執行

## 互動規則

- **禁止瞎猜**：遇指令不明確、邏輯矛盾或潛在風險時，必須主動詢問
- **主動終止**：測試失敗兩次以上，停止嘗試並列出「已知事實」與「困惑點」，尋求人類協助

## 專案追蹤文件（工業模式下維護）

| 文件 | 用途 |
|------|------|
| `PLAN.md` | 基於 PROPOSAL.md 的詳細實作計畫，完成項目標註 `[DONE]` |
| `PROGRESS.md` | 極簡紀錄當前進度、受影響檔案、改動目的，供不同 AI Agent 無縫交接 |

## 多 Agent 協作

此專案可能由多個 AI Agent（Gemini、Claude、Copilot 等）共同實作。產出必須具備高度可讀性與結構化，確保其他 Agent 能順利銜接。
