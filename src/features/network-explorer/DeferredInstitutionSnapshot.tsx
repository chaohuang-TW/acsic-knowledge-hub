import { lazy, Suspense, type ComponentProps } from 'react';
import type { InstitutionSnapshotCard } from '../institutions/InstitutionSnapshot';

const Snapshot = lazy(() =>
  import('../institutions/InstitutionSnapshot').then((module) => ({
    default: module.InstitutionSnapshotCard,
  })),
);

/** Load governed metrics only when an economy has actually been selected. */
export function DeferredInstitutionSnapshot(props: ComponentProps<typeof InstitutionSnapshotCard>) {
  return (
    <Suspense
      fallback={
        <p className="network-snapshot-loading" role="status">
          {props.locale === 'en' ? 'Loading institution evidence…' : '正在載入機構資料…'}
        </p>
      }
    >
      <Snapshot {...props} />
    </Suspense>
  );
}
