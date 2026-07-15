# 實作計畫

## 技術架構

- React、TypeScript、Vite 與原生 CSS 建立靜態單頁網站。
- Hash 路由避免 GitHub Pages 子頁面重新整理 404。
- Vite `base` 設為 `/acgf-strategy-os-demo/`。
- 完全虛構的靜態 JSON 提供搜尋、篩選、詳細頁、比較及報告資料。
- Vitest 驗證純函式與資料安全規則，Playwright 驗證桌機與手機流程。
- GitHub Actions 執行 CI，CI 成功後由官方 Pages Actions 部署。

## 執行步驟

1. 建立安全文件與維護規範。
2. 建立八個頁面及共用非官方聲明。
3. 建立完全虛構的 DEMO 資料及來源。
4. 完成搜尋、七類篩選、詳細資料與介面狀態。
5. 完成二至四筆比較及 Markdown、CSV、JSON 匯出。
6. 完成五類規則式報告範本與 Markdown 匯出。
7. 建立測試、CI、Pages workflow 與秘密資訊掃描。
8. 執行桌機、手機、子路徑、路由、下載與無障礙檢查。
9. 發布後讀取遠端檔案、Actions 與實際 Pages 網址。

## 安全邊界

- 不讀取、複製或連接私人核心版。
- 不修改主官網，不建立主官網連結。
- 不使用真實個人、內部或未公開資料。
- 不使用官方 Logo，不模仿機關識別。
- 不建立後端、登入、追蹤、廣告、API Key 或跨 repository 同步。
