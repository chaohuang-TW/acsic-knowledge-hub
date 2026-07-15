# ACGF Strategy OS｜公開展示版

國際信用保證知識工作台的獨立公開展示網站，示範結構化資料、來源治理、跨機構比較與報告範本工作流程。

> 本網站為個人 AI 知識管理與介面設計實驗，並非任何政府機關、基金會或國際組織的官方網站。展示資料不構成政策、金融或法律建議。

## 公開版與私人版差異

- 公開版只使用完全虛構的國家、機構、制度、數字與 `.invalid` 示範來源。
- 公開版不讀取、複製、連接或同步任何私人核心系統。
- 公開版沒有後端、登入、資料庫、追蹤、廣告或需要 API Key 的功能。
- 缺漏資料維持待查證，不自動補造正式制度內容。

## 安裝與開發

需要 Node.js 22 與 pnpm 11。

```bash
pnpm install
pnpm dev
```

本機開發網址由 Vite 顯示。正式建置的 base 固定為 `/acgf-strategy-os-demo/`。

## 測試與建置

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm secret:scan
```

## GitHub Pages 部署

1. CI 在 `main` 與 Pull Request 執行格式、lint、型別、單元、建置、E2E 與秘密資訊掃描。
2. `deploy-pages.yml` 只在 CI 成功且來源分支為 `main` 時執行。
3. 部署使用 GitHub 官方 Pages Actions，不使用自訂網域，不建立 CNAME。
4. Repository 的 Pages Source 必須設定為 GitHub Actions。

預定網址：`https://chaohuang-tw.github.io/acgf-strategy-os-demo/`

## DEMO 資料規則

- 每筆紀錄都有 `demo: true` 與畫面 DEMO 標籤。
- 不使用真實國家、真實機構或官方 Logo。
- 不把虛構數字套用於真實制度。
- 示範來源使用 `.invalid` 保留網域。
- 事實、推論與待查證內容分開呈現。

## 安全提醒

GitHub Pages 是公開資訊，任何知道網址的人都可能存取。`noindex` 與 robots.txt 只是不鼓勵一般搜尋引擎索引，不是安全措施、權限控制或保密機制。

詳細規則請閱讀 [SECURITY.md](SECURITY.md)、[內容規則](docs/CONTENT_RULES.md)與[發布檢查表](docs/PUBLICATION_CHECKLIST.md)。
