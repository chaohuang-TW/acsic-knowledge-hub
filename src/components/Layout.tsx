import type { ReactNode } from 'react';
import { DISCLAIMER, RESEARCH_LABEL } from '../utils/core';

const navigation = [
  ['/', '首頁'],
  ['/concept', '系統概念'],
  ['/institutions', '公開資料研究庫'],
  ['/compare', '跨機構比較'],
  ['/reports', '報告範本'],
  ['/sources', '資料來源'],
  ['/governance', '資料治理'],
  ['/about', '關於本研究'],
  ['/disclaimer', '免責聲明'],
] as const;

export function ResearchBadge() {
  return <span className="demo-badge">{RESEARCH_LABEL}</span>;
}

export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="page-header">
      <ResearchBadge />
      <h1>{title}</h1>
      <p>{intro}</p>
    </header>
  );
}

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        跳至主要內容
      </a>
      <div className="disclaimer-strip" role="note">
        <strong>非官方研究網站</strong>
        <span>{DISCLAIMER}</span>
      </div>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="ACGF Strategy OS 國際信用保證公開資料研究版首頁">
          <span className="brand-mark" aria-hidden="true">
            AC
          </span>
          <span>
            <strong>ACGF Strategy OS</strong>
            <small>國際信用保證公開資料研究版</small>
          </span>
        </a>
        <nav aria-label="主要導覽">
          {navigation.map(([path, label]) => (
            <a key={path} href={`#${path}`} aria-current={route === path ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div>
          <strong>ACGF Strategy OS｜國際信用保證公開資料研究版</strong>
          <p>{DISCLAIMER}</p>
        </div>
        <div>
          <p>資料僅取自可公開查閱的官方來源。</p>
          <p>缺漏欄位維持待查證，不由系統推測補填。</p>
        </div>
      </footer>
    </>
  );
}
