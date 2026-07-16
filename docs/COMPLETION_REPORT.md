# 完成報告

本版將網站重構為 ACSIC Knowledge Hub，定位為服務 ACSIC 會員機構的獨立雙語公開資料研究平台，保留既有互動、匯出、測試及 GitHub Pages 部署架構。

- 20 個正式會員及 ACGF Observer 共 21 筆真實機構集中於 `src/data/institutions.json`，涵蓋 14 個國家／經濟體。
- 21 筆機構均具官方英文名稱、繁體中文名稱、翻譯狀態、別名與類型；官方英文名稱原文保存。
- 所有來源紀錄均新增原始語言欄位。
- 首頁與未來資訊架構已雙語化；尚無官方資料的制度及活動頁使用明確空狀態。
- 比較與報告可獨立選擇英文或繁體中文輸出，下載檔名採 ACSIC Knowledge Hub 品牌。
- 每筆至少具有一個機構官方來源與會員名冊來源，並以 `fieldEvidence` 連結已填 Level 2 事實。
- Level 1 完成 21／21；Level 2 完成 7 筆、部分完成 14 筆；本輪未納入缺乏完整定義的 Level 3 數字。
- ASKRINDO 官方公司簡介標示暫時無法存取；ASIPPINDO 官方歷史頁標示過時警示。
- 功能包含搜尋、篩選、排序、詳細頁、比較、三格式匯出、五類報告及資料來源頁。
- 不連接私人核心資料，不建立後端、追蹤、自訂網域或 CNAME。

正式網站：`https://chaohuang-tw.github.io/acsic-knowledge-hub/`

雙語路由：`/#/en/`、`/#/zh-TW/`。Repository 已於 2026-07-16 更名為 `chaohuang-TW/acsic-knowledge-hub`；遷移證據與舊網址處理記錄於 `docs/REPOSITORY_MIGRATION_REPORT.md`。

## Pre-publication validation

- `pnpm check`: passed (format, lint, typecheck, 16 unit/data-governance tests, build and secret scan).
- `pnpm test:e2e`: passed, 18/18 across desktop and mobile Chromium.
- URL validation: 21 official entry points checked; temporary HTTP/bot-protection conditions are documented in `docs/SOURCE_URL_VALIDATION.md` and no non-official mirrors were substituted.
- Local paths, tokens, API keys, passwords, personal records and prohibited files: none found.
