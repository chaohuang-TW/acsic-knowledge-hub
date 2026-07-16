# ACGF Strategy OS｜國際信用保證公開資料研究版

以九個真實信用保證及政策金融機構的官方公開資料，展示結構化來源治理、搜尋篩選、跨機構比較與規則式報告工作流程。

> 本網站為個人研究與 AI 知識管理實驗，並非任何政府機關、基金會、ACSIC 或國際組織的官方網站。內容僅供研究參考，正式引用及決策前應回到原始來源查證。

## 資料與安全邊界

- 僅使用信用保證機構及政府機關可公開查閱的官方網頁與文件。
- 不讀取、複製、連接或同步私人核心系統、內部文件、個案資料或未公開數據。
- 缺漏欄位維持 `null`、`待查證` 或「官方資料未揭露」，不由 AI 推測補造。
- 不保存未附資料日期及來源的動態制度數字。
- 網站沒有後端、登入、資料庫、追蹤、廣告或 API Key。

## 本機開發與驗證

需要 Node.js 22 與 pnpm 11。

```bash
pnpm install
pnpm dev
pnpm check
pnpm test:e2e
```

正式建置的 Vite base 固定為 `/acgf-strategy-os-demo/`。Pages 使用 GitHub Actions 部署至 `https://chaohuang-tw.github.io/acgf-strategy-os-demo/`。

每筆紀錄保存官方名稱、國別、機構類型、制度欄位、ACSIC 身分、查證狀態、來源網址與查閱日期。詳見 [來源方法論](docs/SOURCE_METHODOLOGY.md)、[資料變更紀錄](docs/DATA_CHANGELOG.md)與[內容規則](docs/CONTENT_RULES.md)。
