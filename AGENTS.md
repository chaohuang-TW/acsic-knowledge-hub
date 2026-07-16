# Repository 工作規則

本 repository 是獨立的公開研究網站，使用真實且可公開查閱的官方資料。它不是任何政府機關、基金會、金融機構、ACSIC 或國際組織的官方網站。

- 不得讀取或複製私人核心 repository、內部文件、個案資料或未公開數據。
- 機構事實必須附官方來源；搜尋摘要不得作為資料來源。
- 缺漏欄位不得推測，使用 `null`、待查證或「官方資料未揭露」。
- 已查證事實、分析／推論與待查證事項必須分開。
- 動態數字必須保存資料日期、來源與最後查證日期。
- 機構資料集中於 `src/data/institutions.json`，唯一來源登錄集中於 `src/data/sources.json`；頁面不得散落資料常數。
- 現行會員以 2026 CGTMSE ACSIC 名冊為主；Taiwan SMEG 名冊只作交叉查核及 Observer 證據，`node=31` 不得作為現行名冊。
- 會員身分、官方網站與機構事實分開查證；每個已填 Level 2 事實必須有 `fieldEvidence`。
- Level 2 僅依 `src/data/level2-standard.json` 的共通與角色別欄位計算；缺漏仍在分母，只有具雙語理由、依據、來源與查核日的結構化不適用紀錄可排除。
- `complete` 必須零缺漏、至少三個 Tier 1 來源、至少三種來源類型，且無關鍵來源失效或過時警示；Level 3 必須具定義、單位、日期及來源。
- 人類可讀介面與 Markdown／CSV 報告不得顯示內部 role、field、source 或 evidence ID；結構化 JSON 可保留治理 ID。
- README、覆蓋率與完成報告的統計由 `scripts/generate-coverage-docs.mjs` 產生；不得手動維護重複數字。
- 保留 React、TypeScript、Vite、Hash 路由、Pages 子路徑與既有視覺系統。
- 不建立 CNAME、自訂網域、追蹤碼、後端、登入、廣告或 API Key。
- 不觸碰 `chaohuang-TW.github.io` 或私人 `acgf-strategy-os`。
- 發布前執行 `pnpm check`、`pnpm test:e2e` 及敏感資訊掃描。
