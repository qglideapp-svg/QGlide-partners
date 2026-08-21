import {
  SkeletonCard,
  SkeletonFormCard,
  SkeletonFunnel,
  SkeletonGrid2,
  SkeletonMetricRows,
  SkeletonPageHeader,
  SkeletonStatGrid,
  SkeletonTable,
} from './SkeletonPrimitives'
import { normalizePartnerPath } from '../../lib/partnerLoadingLabels'

export function DashboardSkeleton() {
  return (
    <>
      <SkeletonPageHeader eyebrow />
      <SkeletonStatGrid count={7} />
      <SkeletonFunnel steps={6} />
      <SkeletonGrid2>
        <SkeletonCard>
          <SkeletonMetricRows count={4} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonMetricRows count={5} />
        </SkeletonCard>
      </SkeletonGrid2>
    </>
  )
}

export function CodesSkeleton() {
  return (
    <>
      <SkeletonPageHeader actions />
      <SkeletonGrid2>
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
      </SkeletonGrid2>
      <SkeletonCard lines={4} />
    </>
  )
}

export function DriversSkeleton() {
  return (
    <>
      <SkeletonPageHeader actions />
      <SkeletonStatGrid count={4} />
      <SkeletonTable rows={6} columns={5} />
    </>
  )
}

export function EarningsSkeleton() {
  return (
    <>
      <SkeletonPageHeader actions />
      <SkeletonStatGrid count={3} />
      <SkeletonGrid2>
        <SkeletonCard>
          <SkeletonMetricRows count={4} />
        </SkeletonCard>
        <SkeletonCard lines={3} />
      </SkeletonGrid2>
      <SkeletonTable rows={4} columns={4} />
    </>
  )
}

export function RedemptionSkeleton() {
  return (
    <>
      <SkeletonPageHeader />
      <SkeletonGrid2>
        <SkeletonFormCard fields={2} />
        <SkeletonCard lines={4} />
      </SkeletonGrid2>
    </>
  )
}

export function StatementsSkeleton() {
  return (
    <>
      <SkeletonPageHeader />
      <SkeletonTable rows={5} columns={5} />
    </>
  )
}

export function DocumentsSkeleton() {
  return (
    <>
      <SkeletonPageHeader />
      <SkeletonCard>
        <SkeletonMetricRows count={4} />
      </SkeletonCard>
      <div className="mt-24">
        <SkeletonTable rows={4} columns={5} />
      </div>
    </>
  )
}

export function SupportSkeleton() {
  return (
    <>
      <SkeletonPageHeader actions />
      <SkeletonGrid2>
        <SkeletonTable rows={4} columns={4} />
        <SkeletonFormCard fields={2} />
      </SkeletonGrid2>
    </>
  )
}

export function GenericPartnerSkeleton() {
  return (
    <>
      <SkeletonPageHeader />
      <SkeletonStatGrid count={4} />
      <SkeletonCard lines={4} />
    </>
  )
}

export function PartnerRouteSkeleton({ pathname }: { pathname: string }) {
  const path = normalizePartnerPath(pathname)

  switch (path) {
    case '/partner':
      return <DashboardSkeleton />
    case '/partner/codes':
      return <CodesSkeleton />
    case '/partner/drivers':
      return <DriversSkeleton />
    case '/partner/earnings':
      return <EarningsSkeleton />
    case '/partner/redemption':
      return <RedemptionSkeleton />
    case '/partner/statements':
      return <StatementsSkeleton />
    case '/partner/documents':
      return <DocumentsSkeleton />
    case '/partner/support':
      return <SupportSkeleton />
    default:
      return <GenericPartnerSkeleton />
  }
}
