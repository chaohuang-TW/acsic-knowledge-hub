# 系統架構

## 元件

- `src/components`：共用 Layout、導覽、DEMO 標籤與頁面標題。
- `src/pages`：首頁、系統概念、資料治理、關於與免責聲明。
- `src/features/institutions`：搜尋、篩選、狀態展示與詳細資料。
- `src/features/comparison`：二至四筆比較及三種格式匯出。
- `src/features/reports`：五類規則式報告範本及 Markdown 匯出。
- `src/data/institutions.json`：功能測試所需的四筆最低量虛構資料。
- `src/data/institutions.ts`：資料單一入口，頁面與功能層不直接讀取 JSON。
- `src/utils`：篩選、比較、匯出與報告產生純函式。

## 資料流

資料蒐集 → 來源登錄 → 結構化整理 → 資料驗證 → 跨機構比較 → 報告與簡報素材。

公開展示版只實作流程與欄位，不接觸正式或私人資料。

## 路由策略

網站使用 Hash 路由。路徑維持在 `/#/institutions` 等形式，因此重新整理時仍由 GitHub Pages 載入根目錄 `index.html`。`public/404.html` 另提供靜態 fallback，將非 Hash 路徑導回相同頁面。

## 子路徑部署

- Vite `base`：`/acgf-strategy-os-demo/`
- Pages artifact：`dist`
- 圖片使用 `import.meta.env.BASE_URL` 組合子路徑。
- 不建立自訂網域、CNAME 或 sitemap。

## 匯出功能

匯出內容在瀏覽器本機產生 Blob，不上傳外部服務。Markdown、CSV、JSON 都保留 DEMO 與非官方聲明；報告只匯出 Markdown。

## 技術選擇

原生 CSS 減少不必要的第三方 JavaScript，React 提供狀態互動，TypeScript 維持資料與函式契約，靜態 JSON 讓公開邊界容易人工審查。

## 未來擴充

如需加入正式公開資料，必須另建來源審查流程、欄位版本紀錄與人工發布核准，不得連接私人核心版。可在維持純靜態的前提下，把經審核的公開資料映射至 `Institution` 契約，再由 `src/data/institutions.ts` 輸出；搜尋、篩選、比較、匯出、報告與介面不需改寫。
