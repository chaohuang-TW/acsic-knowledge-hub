# 發布檢查表

- [x] 品牌、metadata、導覽與下載檔名均使用 ACSIC Knowledge Hub。
- [x] 英文與繁體中文路由、切換與記憶已測試。
- [x] 所有語言版本均保留非官方聲明。
- [x] 官方英文機構名稱原文保存，中文名稱具有翻譯狀態。
- [x] 每筆來源記錄原始語言。

- [x] 21 筆機構皆有官方網站、會員身分證據與機構自身官方來源。
- [x] ACGF 為唯一 Observer，其餘 20 筆為 Member，正式會員分布於 14 個國家／經濟體。
- [x] Level 1 為 21／21；嚴格 Level 2 由單一中央標準計算為 1 完整、19 部分、1 證據不足。
- [x] 缺漏適用欄位保留於分母；只有具理由、依據、來源與日期的結構化不適用紀錄可排除。
- [x] 33 個唯一官方來源、52 個機構—來源關聯與 203 個欄位證據分開統計。
- [x] 生產資料可見內容的英文／繁體中文治理覆蓋率由測試計算為 100%。
- [x] PHILGUARANTEE 與 ACGF 的 SMEG 錯誤 href 未進入官方網站欄位。
- [x] 舊 `node=31` 只在方法文件中列為歷史差異，不作為生產名冊來源。
- [x] 匯出及報告含來源、日期、免責聲明及比較限制。
- [x] 不含憑證、本機路徑、私人資料或禁止內容。
- [x] `pnpm check` 通過：文件統計、格式、lint、型別、56 項單元／資料治理測試、建置及敏感資訊掃描均成功。
- [x] Playwright 28／28 通過，涵蓋桌機、手機、雙語、21 筆詳細頁、篩選、比較與下載。
- [ ] Pages 英文與繁體中文子路徑、21 筆資料、下載與桌面／手機版通過（部署後更新）。
- [x] `noindex`、`robots.txt` 保留，未建立 CNAME。
- [x] Repository 已更名為 `chaohuang-TW/acsic-knowledge-hub`，visibility 維持 Public，預設分支維持 `main`。
- [x] Vite、Playwright 與 404 fallback 均使用 `/acsic-knowledge-hub/`，操作設定不再使用舊 Pages base。
- [x] 文件中的正式網站改為 `https://chaohuang-tw.github.io/acsic-knowledge-hub/`。
- [x] GitHub Pages 仍由 Actions 部署，未建立 CNAME，未部署至個人首頁根目錄。
