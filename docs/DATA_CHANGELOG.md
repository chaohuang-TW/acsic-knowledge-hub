# 資料變更紀錄

## 2026-07-16 - 資料品質校正與完整雙語化

- 以單一版本化共通／角色別標準重新計算 Level 2；結果由 15 完整、6 部分調整為 1 完整、19 部分、1 證據不足。
- 分離 33 個唯一官方來源、52 個機構—來源關聯及 203 個欄位證據，不再混用統計。
- ASKRINDO 因關鍵簡介暫時無法存取改列證據不足，母語名稱改為待確認。
- 補充 JFC、JFG、KODIT、KOTEC 與 DCGF 的母語官方來源或完整法人名稱。
- 所有可見資料值、證據摘要與可信度理由完成英文／繁體中文治理，生產資料檢查為 100%。
- 比較、報告與資料來源頁改用可讀標籤與來源標題；內部 ID 僅保留於結構化 JSON。

## 2026-07-16 - ACSIC Knowledge Hub 雙語基礎

- 品牌由 ACGF 中心展示改為服務 ACSIC 會員機構的獨立雙語知識平台。
- 既有九筆真實機構保留，ACGF 只作為 Observer 機構之一。
- 加入 `name.en`、`name.zh-TW`、雙語摘要、雙語類型、名稱翻譯狀態與來源原始語言。
- 本輪不大量新增制度細節，也不為新資訊架構捏造占位資料。

## 2026-07-16

- 建立九筆真實機構官方公開資料：ACGF、Taiwan SMEG、CGCC、CGTMSE、JFC、JFG、KODIT、CGC Malaysia 及 PHILGUARANTEE。
- ACSIC 身分以 Taiwan SMEG 官方 Member Institutions 頁查證：ACGF 為 Observer，其餘八個機構為 Member。
- 每筆至少保存一個機構官方來源及一個 ACSIC 官方索引來源。
- 不納入未同時具備資料日期、來源及最後查證日期的動態數字。
- 所有資料最後查證日期為 2026-07-16；未揭露欄位維持 `null` 或待查證。

# 2026-07-16 — Complete ACSIC membership master roster

- Replaced the nine-record research subset with the authoritative 20-member plus one-observer roster.
- Added role-aware institution categories, multilingual names, aliases, source access metadata, field-level evidence and type-aware completeness.
- Corrected PHILGUARANTEE and ACGF official URLs independently from known errors in the Taiwan SMEG roster.
- Marked the old SMEG `node=31` page as historical reconciliation only in methodology documentation.
- Added 21-record coverage, membership, type and implementation documentation.
