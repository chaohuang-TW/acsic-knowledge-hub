import { useMemo, useState } from 'react';
import { PageHeader, ResearchBadge } from '../components/Layout';
import { institutions } from '../data/institutions';
import { DISCLAIMER } from '../utils/core';

export function HomePage() {
  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <ResearchBadge />
          <h1>把公開制度資料變成可查證的知識工作流程</h1>
          <p>
            本網站彙整信用保證機構公開資料，透過結構化欄位、來源追溯、查證狀態與跨機構比較，展示 AI
            輔助政策研究及知識管理的實作方式。
          </p>
          <div className="button-row">
            <a className="button primary" href="#/institutions">
              瀏覽公開資料
            </a>
            <a className="button secondary" href="#/concept">
              理解系統概念
            </a>
          </div>
        </div>
        <figure className="hero-visual">
          <img
            src={`${import.meta.env.BASE_URL}assets/knowledge-flow.png`}
            alt="抽象知識流程圖，呈現官方來源經過檢核、比較後形成研究報告"
            width="1536"
            height="1024"
          />
          <figcaption>公開來源經結構化、查證與比較後形成可回查的研究素材。</figcaption>
        </figure>
      </section>
      <section className="section-shell problem-section">
        <h2>這套系統處理的問題</h2>
        <div className="problem-grid">
          <article>
            <h3>資料分散</h3>
            <p>制度資訊散落在官方網站、年度報告與制度文件，難以一致比較。</p>
          </article>
          <article className="accent-panel">
            <h3>來源失去脈絡</h3>
            <p>只有結論而沒有來源、日期與查證狀態，無法支援正式研究。</p>
          </article>
          <article>
            <h3>成果難以重用</h3>
            <p>同一批資料若缺乏結構，報告、簡報與拜會準備都要重新整理。</p>
          </article>
        </div>
      </section>
      <section className="section-shell outcomes-section">
        <h2>從同一套資料產生不同成果</h2>
        <div className="outcome-layout">
          <ol className="numbered-list">
            <li>
              <strong>公開資料研究庫</strong>
              <span>以一致欄位保存機構、制度與官方來源。</span>
            </li>
            <li>
              <strong>跨機構比較</strong>
              <span>選擇二至四個機構，並保留查證日期與比較限制。</span>
            </li>
            <li>
              <strong>來源治理</strong>
              <span>分開已查證事實、分析推論與待查證事項。</span>
            </li>
          </ol>
          <div className="outcome-callout">
            <h3>報告工作流程</h3>
            <p>機構摘要、國別制度、跨機構比較、拜會 Q&A 與簡報大綱均由規則式範本產生。</p>
            <a href="#/reports">查看五類範本</a>
          </div>
        </div>
      </section>
      <section className="section-shell boundary-section">
        <div>
          <h2>公開資料不等於已完成查證</h2>
          <p>本研究只使用公開官方來源；每個欄位仍依來源完整度標示已查證、部分查證或待查證。</p>
        </div>
        <dl>
          <div>
            <dt>可引用內容</dt>
            <dd>具有官方來源、日期與清楚脈絡的已查證事實。</dd>
          </div>
          <div>
            <dt>研究缺口</dt>
            <dd>以「官方資料未揭露」或「待查證」保留，不由 AI 推測補填。</dd>
          </div>
        </dl>
      </section>
    </>
  );
}

export function ConceptPage() {
  const stages = [
    '官方資料蒐集',
    '來源登錄',
    '結構化整理',
    '資料驗證',
    '跨機構比較',
    '報告與簡報素材',
  ];
  return (
    <section className="section-shell page-section">
      <PageHeader
        title="系統概念"
        intro="把官方資料蒐集、查證與成果產製串成可回溯的知識工作流程。"
      />
      <ol className="process-flow" aria-label="資料處理流程">
        {stages.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="concept-matrix">
        <article>
          <h2>已查證事實</h2>
          <p>有可回查的官方來源、日期與明確欄位，不與推論混寫。</p>
        </article>
        <article>
          <h2>分析／推論</h2>
          <p>說明分析者如何從已知內容形成判斷，保留推論標記。</p>
        </article>
        <article>
          <h2>待查證資訊</h2>
          <p>缺漏處明確顯示待查證，不由系統自動補造。</p>
        </article>
        <article className="accent-panel">
          <h2>官方公開來源</h2>
          <p>保留發布者、文件類型、章節、網址與查閱日期。</p>
        </article>
      </div>
    </section>
  );
}

export function GovernancePage() {
  return (
    <section className="section-shell page-section">
      <PageHeader title="資料治理方法" intro="來源、日期、查證狀態與比較限制，比資料數量更重要。" />
      <div className="governance-layout">
        <div className="governance-principles">
          <article>
            <h2>來源登錄</h2>
            <p>記錄標題、發布者、文件類型、章節、網址、文件日期及查閱日期。</p>
          </article>
          <article>
            <h2>官方一手資料優先</h2>
            <p>機構資料回到該機構官方網站；ACSIC 身分以官方會員索引交叉核對。</p>
          </article>
          <article>
            <h2>查證狀態</h2>
            <p>使用已查證、部分查證與待查證，避免過度確定。</p>
          </article>
          <article>
            <h2>可信度</h2>
            <p>依官方法規、制度文件、年度報告或官方網頁的完整度標記高、中、低。</p>
          </article>
        </div>
        <aside className="review-panel">
          <h2>公開前人工審查</h2>
          <ol>
            <li>確認資料來自可公開查閱的官方來源。</li>
            <li>確認動態數字具有資料日期與來源；否則不納入。</li>
            <li>確認已查證事實與分析推論分開。</li>
            <li>執行測試、建置、敏感資訊與虛構名稱掃描。</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

export function SourcesPage() {
  const [country, setCountry] = useState('全部');
  const [institution, setInstitution] = useState('全部');
  const [type, setType] = useState('全部');
  const [year, setYear] = useState('全部');
  const all = institutions.flatMap((record) =>
    record.sourceReferences.map((source) => ({ record, source })),
  );
  const countries = [...new Set(institutions.map((r) => r.countryNameZhTw))];
  const types = [...new Set(all.map(({ source }) => source.documentType))];
  const years = [
    ...new Set(all.map(({ source }) => source.year).filter((v): v is number => v !== null)),
  ];
  const filtered = useMemo(
    () =>
      all.filter(
        ({ record, source }) =>
          (country === '全部' || record.countryNameZhTw === country) &&
          (institution === '全部' || record.id === institution) &&
          (type === '全部' || source.documentType === type) &&
          (year === '全部' || source.year === Number(year)),
      ),
    [all, country, institution, type, year],
  );
  return (
    <section className="section-shell page-section">
      <PageHeader
        title="資料來源"
        intro="集中檢視每個機構使用的官方網頁、制度文件與 ACSIC 會員索引。"
      />
      <form className="filter-panel" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>國家</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option>全部</option>
            {countries.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          <span>機構</span>
          <select value={institution} onChange={(e) => setInstitution(e.target.value)}>
            <option value="全部">全部</option>
            {institutions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.institutionAbbreviation}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>文件類型</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>全部</option>
            {types.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          <span>年份</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option>全部</option>
            {years.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </form>
      <div className="result-summary" aria-live="polite">
        顯示 {filtered.length} 筆官方來源
      </div>
      <div className="institution-list">
        {filtered.map(({ record, source }) => (
          <article key={`${record.id}-${source.id}`}>
            <div className="record-title">
              <div>
                <ResearchBadge />
                <h2>{source.title}</h2>
              </div>
              <span className="status status-high">官方</span>
            </div>
            <p>
              {record.countryNameZhTw}｜{record.institutionNameZhTw}｜{source.documentType}
            </p>
            <dl className="record-summary">
              <div>
                <dt>發布者</dt>
                <dd>{source.publisher}</dd>
              </div>
              <div>
                <dt>章節</dt>
                <dd>{source.section}</dd>
              </div>
              <div>
                <dt>文件日期</dt>
                <dd>{source.documentDate ?? '官方資料未揭露'}</dd>
              </div>
              <div>
                <dt>查閱日期</dt>
                <dd>{source.accessedDate}</dd>
              </div>
            </dl>
            <div className="record-footer">
              <a className="button secondary" href={source.url} target="_blank" rel="noreferrer">
                開啟官方來源
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <section className="section-shell page-section narrow-page">
      <PageHeader
        title="關於本研究"
        intro="探索 AI 如何協助公開資料研究與知識管理，但不把自動產生內容當成正式事實。"
      />
      <div className="prose-block">
        <h2>研究焦點</h2>
        <p>本專案聚焦結構化資料管理、政策研究流程、國際制度比較，以及報告與簡報素材產生。</p>
        <h2>不代表官方授權</h2>
        <p>
          這是個人研究與資料架構實驗，不是任何政府機關、基金會、金融機構、ACSIC 或國際組織的專案。
        </p>
        <h2>資料範圍</h2>
        <p>
          只使用公開可查閱的官方資料；不讀取私人 repository、內部文件、個案資料或未公開營運資訊。
        </p>
      </div>
    </section>
  );
}

export function DisclaimerPage() {
  return (
    <section className="section-shell page-section narrow-page">
      <PageHeader
        title="免責聲明"
        intro="閱讀或下載本網站內容前，請先理解公開資料研究的使用邊界。"
      />
      <div className="disclaimer-document">
        <p className="lead">{DISCLAIMER}</p>
        <ul>
          <li>內容不構成金融、法律、政策、投資或授信建議。</li>
          <li>官方網頁、方案與制度可能更新，引用前應再次查證。</li>
          <li>「部分查證」與「待查證」內容不可視為確定結論。</li>
          <li>跨機構比較未消除法定任務、統計口徑及資料時點差異。</li>
          <li>noindex 與 robots.txt 只是不鼓勵索引，不是安全或存取控制。</li>
        </ul>
      </div>
    </section>
  );
}
