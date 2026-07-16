# Repository 工作規則

本 repository 是獨立的公開研究網站，使用真實且可公開查閱的官方資料。它不是任何政府機關、基金會、金融機構、ACSIC 或國際組織的官方網站。

- 不得讀取或複製私人核心 repository、內部文件、個案資料或未公開數據。
- 機構事實必須附官方來源；搜尋摘要不得作為資料來源。
- 缺漏欄位不得推測，使用 `null`、待查證或「官方資料未揭露」。
- 已查證事實、分析／推論與待查證事項必須分開。
- 動態數字必須保存資料日期、來源與最後查證日期。
- 來源集中於 `src/data/institutions.json`，頁面不得散落資料常數。
- 保留 React、TypeScript、Vite、Hash 路由、Pages 子路徑與既有視覺系統。
- 不建立 CNAME、自訂網域、追蹤碼、後端、登入、廣告或 API Key。
- 不觸碰 `chaohuang-TW.github.io` 或私人 `acgf-strategy-os`。
- 發布前執行 `pnpm check`、`pnpm test:e2e` 及敏感資訊掃描。
