# 系統架構

- `src/data/institutions.json`：九筆機構及官方來源的單一資料來源。
- `src/features/institutions`：搜尋、篩選、排序及詳細資料。
- `src/features/comparison`：二至四筆比較及三種格式匯出。
- `src/features/reports`：五類規則式 Markdown 報告。
- `src/pages/StaticPages.tsx`：首頁、來源索引、治理、關於及免責聲明。
- `src/utils/core.ts`：篩選、比較、匯出、報告與共用治理規則。

網站使用語系前綴 Hash 路由 `/#/en/`、`/#/zh-TW/` 及 Vite `/acgf-strategy-os-demo/` base，輸出純靜態 Pages artifact。語言選擇只保存在瀏覽器 local storage。所有下載在瀏覽器本機產生，不上傳外部服務，也不依賴外部翻譯 API。

多語資料以 `name`、`summary`、`type` 的 `en` 與 `zh-TW` 欄位集中保存。官方英文名稱不可改寫；中文名稱另記翻譯狀態。來源紀錄保存原始語言。
