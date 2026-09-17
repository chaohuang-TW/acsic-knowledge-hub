import type { Locale } from '../../types';

export function NetworkExplorerSkeleton({ locale }: { locale: Locale }) {
  return (
    <section className="network-explorer network-explorer-skeleton" aria-busy="true">
      <div className="network-skeleton-canvas" />
      <div className="network-skeleton-copy">
        <span>{locale === 'en' ? 'Loading network explorer' : '正在載入網絡探索器'}</span>
        <div className="network-skeleton-lines" />
      </div>
    </section>
  );
}
