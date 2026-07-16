# 資料替換介面

研究資料集中於 `src/data/institutions.json`，並受 `src/types/index.ts` 契約約束。新增或更新機構時，只需維護資料與來源，搜尋、篩選、比較、匯出及報告功能不必改寫。

每次更新須同步維護 `lastVerifiedDate`、`sourceReferences`、查證狀態及 `docs/DATA_CHANGELOG.md`。
