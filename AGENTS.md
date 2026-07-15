# ACGF Strategy OS 公開展示版協作規範

## 專案定位

本 repository 是完全獨立的公開展示網站，用於示範國際信用保證知識管理、資料治理、制度比較與報告工作流程。它不是政府機關、基金會、金融機構或國際組織的官方網站。

## 公開版與私人核心版邊界

- 禁止讀取、複製、連接或同步私人核心 repository。
- 禁止建立任何私人資料匯入、排程同步、跨 repository workflow 或存取權杖。
- 禁止修改 `chaohuang-tw.github.io` 主官網，也不得在主官網加入本網站連結。
- 公開版只能使用完全虛構、明確標示 DEMO 的資料。

## 語言與內容

- 使用繁體中文及臺灣用語。
- 不得捏造正式制度事實、法源、數字或機構關係。
- 已查證事實、分析推論、待查證事項與示範資料必須分開呈現。
- 每筆事實欄位保留示範來源、來源類型、發布者、網址、存取日期及說明。
- 不得移除所有頁面共用的非官方聲明、DEMO 標籤或免責聲明。

## 技術架構

- React、TypeScript、Vite、靜態 JSON。
- Vitest、Playwright、ESLint、Prettier。
- GitHub Actions 執行 CI，GitHub Pages 只部署 `acgf-strategy-os-demo`。
- Hash 路由及 Vite `base` 支援 `/acgf-strategy-os-demo/`。

## 常用指令

```bash
pnpm install
pnpm dev
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm secret:scan
```

## 程式碼與命名

- TypeScript 採嚴格模式，不以 `any` 規避型別問題。
- React 元件使用 PascalCase，函式與變數使用 camelCase，資料識別碼使用 kebab-case。
- 保持語意化 HTML、鍵盤操作、可見焦點與 WCAG AA 對比。
- 不得以刪除測試、忽略錯誤或降低規則取得綠燈。

## DEMO 資料規則

- 所有國家、機構、制度、措施、數值與來源均須完全虛構。
- 每筆資料必須包含 `demo: true`，畫面顯示 `DEMO 示範資料`。
- 虛構國家不得套用真實機構名稱，虛構機構不得搭配真實制度數字。
- 示範網址使用保留的 `.invalid` 網域。
- 缺漏內容顯示待查證，不得自動補造。

## 發布前安全檢查

1. 確認 repository 為 `chaohuang-TW/acgf-strategy-os-demo` 且為 Public。
2. 確認未讀取或修改私人核心版及主官網。
3. 檢查無個人資料、內部人名、聯絡資訊、未公開文件或未公開數據。
4. 檢查無 Token、API Key、密碼、Cookie、私鑰、本機路徑或環境設定。
5. 確認沒有 CNAME、sitemap、分析追蹤或私人 repository 存取機制。
6. 執行完整測試、建置與秘密資訊掃描。

## 修改後必要工作

重大修改後必須更新 README、架構、安全或內容治理文件及 `docs/COMPLETION_REPORT.md`，並執行 format、lint、typecheck、unit test、build、E2E 與 secret scan。
