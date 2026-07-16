# 發布檢查表

- [x] 品牌、metadata、導覽與下載檔名均使用 ACSIC Knowledge Hub。
- [x] 英文與繁體中文路由、切換與記憶已測試。
- [x] 所有語言版本均保留非官方聲明。
- [x] 官方英文機構名稱原文保存，中文名稱具有翻譯狀態。
- [x] 每筆來源記錄原始語言。

- [x] 21 筆機構皆有官方網站、會員身分證據與機構自身官方來源。
- [x] ACGF 為唯一 Observer，其餘 20 筆為 Member，正式會員分布於 14 個國家／經濟體。
- [x] Level 1 為 21／21；Level 2 依機構類型計算，不適用欄位不列入缺漏。
- [x] PHILGUARANTEE 與 ACGF 的 SMEG 錯誤 href 未進入官方網站欄位。
- [x] 舊 `node=31` 只在方法文件中列為歷史差異，不作為生產名冊來源。
- [x] 匯出及報告含來源、日期、免責聲明及比較限制。
- [x] 不含憑證、本機路徑、私人資料或禁止內容。
- [x] 格式、lint、型別、16 個單元／資料驗證測試、建置及敏感資訊掃描通過。
- [x] Playwright 桌面與手機共 18 個測試通過。
- [ ] Pages 英文與繁體中文子路徑、21 筆資料、下載與桌面／手機版通過（部署後更新）。
- [x] `noindex`、`robots.txt` 保留，未建立 CNAME。
- [x] Repository 已更名為 `chaohuang-TW/acsic-knowledge-hub`，visibility 維持 Public，預設分支維持 `main`。
- [x] Vite、Playwright 與 404 fallback 均使用 `/acsic-knowledge-hub/`，操作設定不再使用舊 Pages base。
- [x] 文件中的正式網站改為 `https://chaohuang-tw.github.io/acsic-knowledge-hub/`。
- [x] GitHub Pages 仍由 Actions 部署，未建立 CNAME，未部署至個人首頁根目錄。
