# 系統架構

- `src/data/institutions.json`：九筆機構及官方來源的單一資料來源。
- `src/features/institutions`：搜尋、篩選、排序及詳細資料。
- `src/features/comparison`：二至四筆比較及三種格式匯出。
- `src/features/reports`：五類規則式 Markdown 報告。
- `src/pages/StaticPages.tsx`：首頁、來源索引、治理、關於及免責聲明。
- `src/utils/core.ts`：篩選、比較、匯出、報告與共用治理規則。

網站使用 Hash 路由及 Vite `/acgf-strategy-os-demo/` base，輸出純靜態 Pages artifact。所有下載在瀏覽器本機產生，不上傳外部服務。
