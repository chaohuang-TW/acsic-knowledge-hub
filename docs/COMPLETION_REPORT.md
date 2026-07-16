# 完成報告

本版將網站重構為 ACSIC Knowledge Hub，定位為服務 ACSIC 會員機構的獨立雙語公開資料研究平台，保留既有互動、匯出、測試及 GitHub Pages 部署架構。

- 九筆真實機構集中於 `src/data/institutions.json`。
- 九筆機構均具英文與繁體中文名稱、摘要、類型及翻譯狀態；官方英文名稱原文保存。
- 所有來源紀錄均新增原始語言欄位。
- 首頁與未來資訊架構已雙語化；尚無官方資料的制度及活動頁使用明確空狀態。
- 比較與報告可獨立選擇英文或繁體中文輸出，下載檔名採 ACSIC Knowledge Hub 品牌。
- 每筆至少具有一個機構官方來源與 ACSIC 官方索引來源。
- 功能包含搜尋、篩選、排序、詳細頁、比較、三格式匯出、五類報告及資料來源頁。
- 不連接私人核心資料，不建立後端、追蹤、自訂網域或 CNAME。

正式網站：`https://chaohuang-tw.github.io/acsic-knowledge-hub/`

雙語路由：`/#/en/`、`/#/zh-TW/`。Repository 已於 2026-07-16 更名為 `chaohuang-TW/acsic-knowledge-hub`；遷移證據與舊網址處理記錄於 `docs/REPOSITORY_MIGRATION_REPORT.md`。
