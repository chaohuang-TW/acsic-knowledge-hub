# 完成報告

## 已完成項目

- 獨立公開展示版架構與八個繁體中文頁面。
- 四筆最低功能測試量的集中式虛構 DEMO 資料。
- 搜尋、複合篩選、排序、詳細資料、正常／空資料／錯誤狀態。
- 二至四筆跨機構比較，以及 Markdown、CSV、JSON 匯出。
- 五類規則式 Markdown 報告範本與下載。
- 響應式介面、鍵盤焦點、Hash 路由、GitHub Pages 子路徑與靜態 fallback。
- 公開安全規則、內容規則、資料替換說明、CI 與 Pages workflow。

## 技術架構

- React 19、TypeScript、Vite 7、原生 CSS。
- Vitest 單元測試與 Playwright 桌機／手機 E2E。
- 靜態 JSON，無後端、資料庫、登入、分析追蹤或外部 API。
- pnpm lockfile 與建置腳本白名單，只允許 `esbuild`。

## 主要檔案

- `src/data/institutions.json`：集中式最低量虛構資料。
- `src/data/institutions.ts`：資料單一入口。
- `src/types/index.ts`：可替換資料契約。
- `src/utils/core.ts`：搜尋、篩選、比較、匯出及報告純函式。
- `tests/core.test.ts`、`tests/e2e/demo.spec.ts`：單元與瀏覽器測試。
- `.github/workflows/ci.yml`、`.github/workflows/deploy-pages.yml`：驗證及部署。

## 測試結果

- Format：通過。
- ESLint：通過。
- TypeScript typecheck：通過。
- Vitest：17 項通過，0 項失敗。
- Playwright：12 項通過，0 項失敗；涵蓋桌機 Chromium 與 Pixel 7。
- Production build：通過。
- 子路徑、八頁導覽、重新整理、搜尋、狀態、比較、五類報告、三種下載及鍵盤焦點：通過。
- 桌機首頁與手機機構頁全頁截圖人工檢視：通過。

## 部署結果

已建立 GitHub Actions CI 與 Pages workflow。遠端 Actions 與公開網址狀態將在發布後確認。

## 安全檢查結果

- 自動敏感資訊掃描通過，未發現憑證、個人資料、本機路徑或禁止發布檔案。
- 人工檢查未發現私人聯絡資訊、內部文件、未公開數據、真實個資或官方識別。
- 所有展示資料為虛構 DEMO，來源使用保留的 `.invalid` 網域。
- 未讀取、修改或同步私人核心版；未修改主官網。
- 已設定 `noindex`、`nofollow` 與 `robots.txt`；未建立 sitemap、CNAME 或追蹤。

## 已知限制

- `noindex` 不是存取控制，任何知道公開網址者仍可能存取。
- 四筆虛構資料只為驗證最多四筆比較，不代表研究內容。
- 正式公開資料必須經來源查證、欄位映射與人工公開審查後，才可替換資料入口。
- 報告為規則式 Markdown 範本，不呼叫生成式 AI API。

## 尚需人工操作事項

若 GitHub repository 的 Pages 來源尚未允許 GitHub Actions，需在 Settings → Pages 選擇 GitHub Actions；發布後將先嘗試完成並確認此設定。
