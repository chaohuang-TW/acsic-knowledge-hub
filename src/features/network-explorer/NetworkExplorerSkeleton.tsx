import type { Locale } from '../../types';

export function NetworkExplorerSkeleton({ locale }: { locale: Locale }) {
  return (
    <section className="network-explorer network-explorer-skeleton" aria-busy="true">
      <p className="network-skeleton-status" role="status">
        {locale === 'en' ? 'Loading network explorer' : '正在載入網絡探索器'}
      </p>
      <div className="network-skeleton-controls" aria-hidden="true" />
      <div className="network-canvas-frame network-skeleton-canvas" aria-hidden="true" />
      <div className="network-skeleton-footer" aria-hidden="true" />
    </section>
  );
}
