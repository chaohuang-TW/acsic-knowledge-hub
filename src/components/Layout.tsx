import type { ReactNode } from 'react';
import { DISCLAIMER } from '../utils/core';

const navigation = [
  ['/', '首頁'],
  ['/concept', '系統概念'],
  ['/institutions', '示範資料庫'],
  ['/compare', '跨機構比較'],
  ['/reports', '報告範本'],
  ['/governance', '資料治理'],
  ['/about', '關於本實驗'],
  ['/disclaimer', '免責聲明'],
] as const;

export function DemoBadge() {
  return <span className="demo-badge">DEMO 示範資料</span>;
}

export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="page-header">
      <DemoBadge />
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
        <strong>非官方公開展示版</strong>
        <span>{DISCLAIMER}</span>
      </div>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="ACGF Strategy OS 公開展示版首頁">
          <span className="brand-mark" aria-hidden="true">
            AC
          </span>
          <span>
            <strong>ACGF Strategy OS</strong>
            <small>國際信用保證知識工作台</small>
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
          <strong>ACGF Strategy OS｜公開展示版</strong>
          <p>{DISCLAIMER}</p>
        </div>
        <div>
          <p>所有展示機構、國家、制度與來源均為虛構 DEMO。</p>
          <p>正式研究應回到原始來源重新查證。</p>
        </div>
      </footer>
    </>
  );
}
