export const systemCards = [
  {
    id: 'taiwan',
    title: {
      en: 'Taiwan: lender-led guarantee pathways',
      'zh-TW': '臺灣：由金融機構主導的保證途徑',
    },
    institution: { en: 'TSMEG', 'zh-TW': '中小企業信用保證基金（TSMEG）' },
    items: [
      {
        title: { en: 'Indirect guarantee', 'zh-TW': '間接保證' },
        text: {
          en: 'An SME applies through a lending institution. The institution performs its review and submits the case to TSMEG for a guarantee letter.',
          'zh-TW':
            '中小企業向金融機構申請融資；金融機構完成審查後，將案件送交 TSMEG 辦理保證並取得保證書。',
        },
      },
      {
        title: { en: 'Batch guarantee', 'zh-TW': '批次保證' },
        text: {
          en: 'The official scheme page distinguishes this route from indirect guarantee: lending is granted before the guarantee referral is submitted.',
          'zh-TW': '官方制度頁面區分此途徑與間接保證：金融機構先核貸，再送交保證。',
        },
      },
      {
        title: { en: 'Direct guarantee', 'zh-TW': '直接保證' },
        text: {
          en: 'An enterprise applies directly to TSMEG. TSMEG reviews the application and issues a commitment letter; the enterprise then applies to a financial institution for financing.',
          'zh-TW':
            '企業直接向 TSMEG 申請信用保證。TSMEG 審查通過並核發承諾書後，企業再憑承諾書向金融機構申請融資。',
        },
      },
      {
        title: { en: 'Other documented models', 'zh-TW': '其他已記錄模式' },
        text: {
          en: 'Co-guarantee remains recorded in TSMEG’s governed institution profile; its detailed workflow is withheld pending source-specific verification.',
          'zh-TW':
            '共同保證仍保留於 TSMEG 的治理後機構檔案；個別流程細節待取得對應官方來源後才刊登。',
        },
      },
    ],
    sourceIds: ['tsmeg-indirect-guarantee', 'tsmeg-direct-guarantee'],
  },
  {
    id: 'japan',
    title: { en: 'Japan: differentiated institutional roles', 'zh-TW': '日本：分工明確的機構角色' },
    institution: { en: 'JFG and JFC', 'zh-TW': 'JFG 與 JFC' },
    items: [
      {
        title: { en: 'Local CGCs and JFG', 'zh-TW': '地方信用保證協會與 JFG' },
        text: {
          en: 'Local credit guarantee corporations provide guarantees for SME financing. JFG coordinates and supports Japan’s nationwide network of 51 credit guarantee corporations.',
          'zh-TW':
            '地方信用保證協會實際為中小企業融資提供保證；JFG 則協調並支援日本全國 51 家信用保證協會網絡。',
        },
      },
      {
        title: { en: 'CGC–JFC credit insurance flow', 'zh-TW': 'CGC–JFC 信用保險流程' },
        text: {
          en: 'After a borrower cannot repay, a CGC makes subrogation to the financial institution. JFC then pays credit insurance to the CGC; recovery proceeds are remitted according to the insurance-payment proportion.',
          'zh-TW':
            '借款人無法償還時，由信用保證協會向金融機構代位清償；JFC 再向信用保證協會給付信用保險金，回收款則依保險金給付比例繳納。',
        },
      },
      {
        title: { en: 'Credit insurance coverage', 'zh-TW': '信用保險填補比例' },
        text: {
          en: '70%, 80% or 90% of the subrogated amount, depending on the applicable insurance category. These percentages describe the credit-insurance relationship between JFC and CGCs and should not be compared directly with borrower-level guarantee coverage ratios in other systems.',
          'zh-TW':
            '依適用的信用保險種類，JFC 的保險填補比例可為代位清償額的 70%、80% 或 90%。此比例描述 JFC 與信用保證協會間的信用保險關係，不應與其他國家對企業融資的保證成數直接比較。',
        },
      },
    ],
    sourceIds: ['jfg-credit-guarantee-system-2025', 'jfc-credit-insurance-outline'],
  },
  {
    id: 'korea-kodit',
    title: {
      en: 'Republic of Korea: KODIT programme categories',
      'zh-TW': '韓國：KODIT 的方案類別',
    },
    institution: {
      en: 'Korea Credit Guarantee Fund (KODIT)',
      'zh-TW': '韓國信用保證基金（KODIT）',
    },
    items: [
      {
        title: { en: 'Direct application model', 'zh-TW': '直接申請模式' },
        text: {
          en: 'An enterprise can file a guarantee application in person at a KODIT branch or online. KODIT conducts credit review, guarantee evaluation and approval, and issues a Letter of Credit Guarantee before the financing agreement is completed.',
          'zh-TW':
            '企業可親至 KODIT 分行或透過線上管道提出保證申請。KODIT 進行信用審查、保證評估與核定，核發信用保證書後，再由金融機構完成融資協議。',
        },
      },
      {
        title: { en: 'Risk-sharing / coverage', 'zh-TW': '風險分擔／保證成數' },
        text: {
          en: 'General partial-guarantee ratios are typically 70%–85%. Certain special policy guarantees may use 90%–100%, subject to programme rules and eligibility. Actual coverage depends on the programme and applicable conditions.',
          'zh-TW':
            '一般部分保證成數通常為 70%–85%；特定政策性保證依方案規定可能採 90%–100%。實際成數取決於方案及適用條件。',
        },
      },
      {
        title: { en: 'Guarantee fee', 'zh-TW': '保證費' },
        text: {
          en: 'General guarantee fees are disclosed within a range of 0.5%–3.0% per year on the outstanding guarantee amount, subject to credit rating and applicable programme conditions.',
          'zh-TW': '一般保證費率依信用等級及適用方案條件，官方揭露範圍為保證餘額的年率 0.5%–3.0%。',
        },
      },
      {
        title: { en: 'P-CBO guarantee', 'zh-TW': 'P-CBO 保證' },
        text: {
          en: 'KODIT’s P-CBO guarantee supports fundraising through corporate bonds and a securitisation structure in the capital market rather than ordinary bank-loan financing. P-CBO activity must not be aggregated with ordinary bank-loan guarantees without an explicit common definition.',
          'zh-TW':
            'KODIT 的 P-CBO 保證主要支援企業透過公司債與證券化架構進入資本市場籌資，與一般銀行授信型信用保證不同。P-CBO 屬直接金融／資本市場工具，未建立一致定義前，不應與一般銀行授信型保證直接合併比較。',
        },
      },
    ],
    sourceIds: ['kodit-credit-guarantee-process', 'kodit-p-cbo-guarantee'],
  },
  {
    id: 'korea-kotec',
    title: {
      en: 'Republic of Korea: technology appraisal in guarantee review',
      'zh-TW': '韓國：保證審查中的技術評價',
    },
    institution: { en: 'KOTEC (Kibo)', 'zh-TW': 'KOTEC（Kibo）' },
    items: [
      {
        title: { en: 'Individual approach', 'zh-TW': '逐案審查' },
        text: {
          en: 'KOTEC describes a case-by-case guarantee review that assesses a technology project’s commercial viability and risks before a decision.',
          'zh-TW': 'KOTEC 說明其逐案保證審查：在決定前評估技術專案的商業可行性與風險。',
        },
      },
      {
        title: { en: 'AIRATE technology appraisal', 'zh-TW': 'AIRATE 技術評價' },
        text: {
          en: 'AIRATE combines structured expert appraisal with data-driven and AI-assisted techniques, while considering future potential and non-financial factors.',
          'zh-TW':
            'AIRATE 結合結構化專家評價、資料分析與 AI 輔助技術，並納入未來潛力與非財務因素。',
        },
      },
    ],
    sourceIds: ['kotec-guarantee-key-features', 'kotec-airate-main-features'],
  },
] as const;
