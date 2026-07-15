import { DemoBadge, PageHeader } from '../components/Layout';
import { DISCLAIMER } from '../utils/core';

export function HomePage() {
  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <DemoBadge />
          <h1>把制度資料變成可查證的知識工作流程</h1>
          <p>結構化整理來源、制度差異與報告素材，讓每一項事實都有回查路徑。</p>
          <div className="button-row">
            <a className="button primary" href="#/institutions">
              瀏覽示範資料
            </a>
            <a className="button secondary" href="#/concept">
              理解系統概念
            </a>
          </div>
        </div>
        <figure className="hero-visual">
          <img
            src={`${import.meta.env.BASE_URL}assets/knowledge-flow.png`}
            alt="抽象知識流程圖，呈現來源資料經過檢核、比較後形成報告"
            width="1536"
            height="1024"
          />
          <figcaption>抽象示意圖，不含任何真實機構或個人資料。</figcaption>
        </figure>
      </section>

      <section className="section-shell problem-section">
        <h2>這套系統處理的問題</h2>
        <div className="problem-grid">
          <article>
            <h3>資料分散</h3>
            <p>制度資訊常散落於網站、報告與會議素材，難以用一致欄位比較。</p>
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
        <h2>從同一套資料結構產生不同成果</h2>
        <div className="outcome-layout">
          <ol className="numbered-list">
            <li>
              <strong>制度資料庫</strong>
              <span>以一致欄位保存基本資料、措施與來源。</span>
            </li>
            <li>
              <strong>跨機構比較</strong>
              <span>選擇二至四筆資料，保留 DEMO 與免責聲明。</span>
            </li>
            <li>
              <strong>來源治理</strong>
              <span>分開已查證事實、推論、待查證事項與示範資料。</span>
            </li>
          </ol>
          <div className="outcome-callout">
            <h3>報告工作流程</h3>
            <p>高階摘要、制度報告、比較報告、拜會 Q&A 與簡報大綱均由規則式範本產生。</p>
            <a href="#/reports">查看五類範本</a>
          </div>
        </div>
      </section>

      <section className="section-shell boundary-section">
        <div>
          <h2>公開展示版不是私人工作版的副本</h2>
          <p>公開版只使用完全虛構的資料與示範來源，不讀取、不複製，也不自動同步任何私人系統。</p>
        </div>
        <dl>
          <div>
            <dt>DEMO 資料</dt>
            <dd>用於驗證欄位、流程與介面，不能作為正式制度依據。</dd>
          </div>
          <div>
            <dt>正式研究資料</dt>
            <dd>必須重新蒐集來源、人工查證，並依公開審查流程處理。</dd>
          </div>
        </dl>
      </section>
    </>
  );
}

export function ConceptPage() {
  const stages = ['資料蒐集', '來源登錄', '結構化整理', '資料驗證', '跨機構比較', '報告與簡報素材'];
  return (
    <section className="section-shell page-section">
      <PageHeader title="系統概念" intro="把資料蒐集、查證與成果產製串成可回溯的知識工作流程。" />
      <ol className="process-flow" aria-label="資料處理流程">
        {stages.map((stage) => (
          <li key={stage}>{stage}</li>
        ))}
      </ol>
      <div className="concept-matrix">
        <article>
          <h2>已查證事實</h2>
          <p>有可回查的來源、日期與明確欄位，不與推論混寫。</p>
        </article>
        <article>
          <h2>分析推論</h2>
          <p>說明分析者如何從已知內容形成判斷，保留推論標記。</p>
        </article>
        <article>
          <h2>待查證資訊</h2>
          <p>缺漏處明確顯示待查證，不由系統自動補造。</p>
        </article>
        <article className="accent-panel">
          <h2>示範資料</h2>
          <p>完全虛構並標示 DEMO，只驗證架構與互動流程。</p>
        </article>
      </div>
    </section>
  );
}

export function GovernancePage() {
  return (
    <section className="section-shell page-section">
      <PageHeader title="資料治理方法" intro="來源、查證狀態與公開審查，比資料數量更重要。" />
      <div className="governance-layout">
        <div className="governance-principles">
          <article>
            <h2>來源登錄</h2>
            <p>記錄標題、發布者、類型、網址、存取日期與說明。</p>
          </article>
          <article>
            <h2>一手與二手來源</h2>
            <p>一手來源呈現制度原文，二手來源用於理解脈絡，兩者不可混淆。</p>
          </article>
          <article>
            <h2>查證狀態</h2>
            <p>使用示範已檢核、示範待複核與待查證，避免過度確定。</p>
          </article>
          <article>
            <h2>可信度</h2>
            <p>依來源完整性、時效與交叉檢核結果標記高、中、低。</p>
          </article>
        </div>
        <aside className="review-panel">
          <h2>公開前人工審查</h2>
          <ol>
            <li>確認資料可公開且不含個人或內部資訊。</li>
            <li>確認示範名稱、數值與來源不會被誤認為真實制度。</li>
            <li>確認所有頁面保留 DEMO 與非官方聲明。</li>
            <li>執行測試、建置與秘密資訊掃描。</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <section className="section-shell page-section narrow-page">
      <PageHeader
        title="關於本實驗"
        intro="探索 AI 如何協助知識工作，但不把自動產生內容當成正式事實。"
      />
      <div className="prose-block">
        <h2>實驗焦點</h2>
        <p>
          本專案聚焦於 AI
          輔助知識工作、結構化資料管理、政策研究流程、國際制度比較，以及報告與簡報素材產生。
        </p>
        <h2>不代表官方授權</h2>
        <p>這是個人介面與資料架構實驗，不是任何政府機關、基金會、金融機構或國際組織的專案。</p>
        <h2>公開版的限制</h2>
        <p>所有機構、國家、制度、數值與來源均為虛構 DEMO。公開網站任何知道網址的人都可能存取。</p>
      </div>
    </section>
  );
}

export function DisclaimerPage() {
  return (
    <section className="section-shell page-section narrow-page">
      <PageHeader title="免責聲明" intro="閱讀或下載本網站內容前，請先理解展示資料的使用邊界。" />
      <div className="disclaimer-document">
        <p className="lead">{DISCLAIMER}</p>
        <ul>
          <li>展示資料均為虛構或示範用途，不對應真實制度。</li>
          <li>內容不構成金融、法律、政策、投資或授信建議。</li>
          <li>本網站不保證展示資料適用於任何實際決策。</li>
          <li>正式研究應回到原始來源，重新確認法源、日期與適用範圍。</li>
          <li>noindex 與 robots.txt 只是不鼓勵索引，不是安全或存取控制。</li>
        </ul>
      </div>
    </section>
  );
}
