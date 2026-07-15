# 真實公開資料替換介面

本版只保留四筆集中式虛構資料，數量足以測試二至四筆比較，不以內容量作為成果。

## 可直接沿用

- `Institution` 與 `DemoSource` 型別契約。
- 搜尋、複合篩選、排序、空資料與錯誤狀態。
- 詳細資料、來源欄位與事實／推論／待查證分流。
- 二至四筆比較及 Markdown、CSV、JSON 匯出。
- 五種規則式 Markdown 報告範本。
- 響應式 Layout、Hash 路由、子路徑設定、測試、CI 與 Pages 部署。

## 下一輪替換方式

1. 將經公開審查的資料轉成 `src/types/index.ts` 定義的 `Institution` 結構。
2. 以新 JSON 取代 `src/data/institutions.json`，或在 `src/data/institutions.ts` 接入建置前轉換結果。
3. 把 `demo` 與展示文字改為正式公開資料所需的狀態契約，並同步更新內容規則與測試。
4. 為來源日期、發布者、網址、查證狀態及可信度加入資料驗證程序。
5. 經人工公開審查後才合併；不得從私人 repository 自動同步。

介面元件不得直接內嵌研究資料。所有正式資料都應經由 `src/data/institutions.ts` 這個單一入口提供。
