import React, { ReactNode } from 'react';
import { AarohanLogo } from './AarohanLogo';
import { RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './index';

// ==========================================
// 1. INLINE LOADER
// ==========================================
export function InlineLoader({
  message = 'Refreshing data...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 text-xs font-mono text-[#858585] select-none ${className}`}
    >
      <RefreshCw size={13} className="animate-spin text-[#111111]" />
      <span>{message}</span>
    </div>
  );
}

// ==========================================
// 2. PAGE LOADER
// ==========================================
export function PageLoader({
  message = 'Retrieving institutional records...',
  subtext = 'Synchronizing with campus placement directory',
}: {
  message?: string;
  subtext?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative mb-5 flex items-center justify-center">
        <AarohanLogo size={44} />
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#111111] animate-ping"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-sm font-semibold text-[#111111] tracking-tight">{message}</h3>
      <p className="text-xs text-[#858585] font-mono mt-1">{subtext}</p>
    </div>
  );
}

// ==========================================
// 3. ROUTE LOADING BOUNDARY
// ==========================================
export function RouteLoadingBoundary({
  isReady,
  children,
  fallback,
}: {
  isReady: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  if (!isReady) {
    return <>{fallback || <PageLoader />}</>;
  }
  return <>{children}</>;
}

// ==========================================
// 4. LOADING BUTTON
// ==========================================
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function LoadingButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  children,
  icon,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      aria-busy={loading}
      className={className}
      icon={
        loading ? (
          <RefreshCw size={size === 'sm' ? 12 : 14} className="animate-spin text-current" />
        ) : (
          icon
        )
      }
      {...props}
    >
      {loading ? loadingText || children : children}
    </Button>
  );
}

// ==========================================
// 5. PROGRESS INDICATOR
// ==========================================
export function ProgressIndicator({
  progress,
  label,
  sublabel,
  className = '',
}: {
  progress: number; // 0 to 100
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`space-y-1.5 ${className}`} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-[#111111] font-medium">{label}</span>}
          {sublabel ? (
            <span className="text-[#858585]">{sublabel}</span>
          ) : (
            <span className="text-[#858585]">{clamped}%</span>
          )}
        </div>
      )}
      <div className="w-full h-1.5 bg-[#E4E4E1] overflow-hidden rounded-[1px]">
        <div
          className="h-full bg-[#111111] transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

// ==========================================
// 6. DASHBOARD SKELETON
// ==========================================
export function DashboardSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse" aria-hidden="true">
      {/* Header Skeleton */}
      <div className="border-b border-[#E4E4E1] pb-6 space-y-2">
        <div className="h-3 w-32 bg-[#E4E4E1] rounded-[2px]" />
        <div className="h-8 w-64 bg-[#E4E4E1] rounded-[2px]" />
        <div className="h-4 w-96 bg-[#F5F5F3] rounded-[2px]" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-[#E4E4E1] bg-white p-5 rounded-[2px] space-y-3">
            <div className="h-2.5 w-24 bg-[#E4E4E1] rounded-[2px]" />
            <div className="h-8 w-16 bg-[#111111]/20 rounded-[2px]" />
            <div className="h-3 w-32 bg-[#F5F5F3] rounded-[2px]" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-[#E4E4E1] bg-white p-6 rounded-[2px] space-y-4">
          <div className="h-4 w-40 bg-[#E4E4E1] rounded-[2px]" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className="flex items-center justify-between border-b border-[#F5F5F3] pb-3">
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-[#E4E4E1] rounded-[2px]" />
                  <div className="h-3 w-32 bg-[#F5F5F3] rounded-[2px]" />
                </div>
                <div className="h-6 w-20 bg-[#E4E4E1] rounded-[2px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#E4E4E1] bg-white p-6 rounded-[2px] space-y-4">
          <div className="h-4 w-32 bg-[#E4E4E1] rounded-[2px]" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((r) => (
              <div key={r} className="p-3 bg-[#FAFAF9] border border-[#E4E4E1] space-y-2 rounded-[2px]">
                <div className="h-3 w-28 bg-[#E4E4E1] rounded-[2px]" />
                <div className="h-4 w-44 bg-[#111111]/20 rounded-[2px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. TABLE SKELETON
// ==========================================
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="border border-[#E4E4E1] bg-white rounded-[2px] overflow-hidden animate-pulse" aria-hidden="true">
      {/* Table Header */}
      <div className="bg-[#FAFAF9] border-b border-[#E4E4E1] px-5 py-3.5 flex items-center justify-between">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-[#E4E4E1] rounded-[2px]" style={{ width: `${80 / columns}%` }} />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[#F5F5F3]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-5 py-4 flex items-center justify-between">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3.5 bg-[#F5F5F3] rounded-[2px]"
                style={{ width: c === 0 ? '30%' : `${60 / (columns - 1)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 8. CARD SKELETON (OPPORTUNITY / CANDIDATE)
// ==========================================
export function CardSkeleton() {
  return (
    <div className="border border-[#E4E4E1] bg-white p-6 rounded-[2px] space-y-4 animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-24 bg-[#E4E4E1] rounded-[2px]" />
          <div className="h-5 w-56 bg-[#111111]/20 rounded-[2px]" />
        </div>
        <div className="h-6 w-16 bg-[#E4E4E1] rounded-[2px]" />
      </div>

      <div className="h-10 w-full bg-[#F5F5F3] rounded-[2px]" />

      <div className="flex items-center gap-2 pt-1">
        <div className="h-4 w-16 bg-[#E4E4E1] rounded-[2px]" />
        <div className="h-4 w-20 bg-[#E4E4E1] rounded-[2px]" />
        <div className="h-4 w-24 bg-[#E4E4E1] rounded-[2px]" />
      </div>

      <div className="border-t border-[#F5F5F3] pt-3 flex items-center justify-between">
        <div className="h-3 w-28 bg-[#F5F5F3] rounded-[2px]" />
        <div className="h-7 w-24 bg-[#111111]/20 rounded-[2px]" />
      </div>
    </div>
  );
}

// ==========================================
// 9. PROFILE SKELETON
// ==========================================
export function ProfileSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse" aria-hidden="true">
      <div className="border-b border-[#E4E4E1] pb-6 flex items-center gap-6">
        <div className="w-16 h-16 bg-[#E4E4E1] rounded-[2px]" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 bg-[#111111]/20 rounded-[2px]" />
          <div className="h-3 w-64 bg-[#F5F5F3] rounded-[2px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-[#E4E4E1] p-6 bg-white space-y-4">
          <div className="h-4 w-36 bg-[#E4E4E1] rounded-[2px]" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-[#FAFAF9] border border-[#E4E4E1] space-y-1.5">
                <div className="h-2.5 w-20 bg-[#E4E4E1] rounded-[2px]" />
                <div className="h-4 w-28 bg-[#111111]/20 rounded-[2px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#E4E4E1] p-6 bg-white space-y-4">
          <div className="h-4 w-32 bg-[#E4E4E1] rounded-[2px]" />
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-6 w-16 bg-[#E4E4E1] rounded-[2px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. CHART SKELETON
// ==========================================
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="border border-[#E4E4E1] bg-white p-6 rounded-[2px] flex flex-col justify-between animate-pulse"
      style={{ height }}
      aria-hidden="true"
    >
      <div className="h-4 w-36 bg-[#E4E4E1] rounded-[2px]" />
      <div className="flex items-end justify-between gap-3 h-36 pt-4">
        {[40, 75, 55, 90, 65, 80, 45, 95].map((h, idx) => (
          <div
            key={idx}
            className="flex-1 bg-[#E4E4E1] rounded-t-[1px]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="border-t border-[#F5F5F3] pt-2 flex justify-between">
        <div className="h-2.5 w-12 bg-[#F5F5F3] rounded-[2px]" />
        <div className="h-2.5 w-12 bg-[#F5F5F3] rounded-[2px]" />
        <div className="h-2.5 w-12 bg-[#F5F5F3] rounded-[2px]" />
      </div>
    </div>
  );
}

// ==========================================
// 11. ERROR STATE
// ==========================================
export function ErrorState({
  title = 'Failed to load records',
  message = 'An unexpected error occurred while communicating with the campus service.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`border border-[#E4E4E1] bg-white p-8 rounded-[2px] text-center max-w-lg mx-auto space-y-4 my-8 ${className}`}
    >
      <div className="w-10 h-10 border border-[#222222] bg-[#FAFAF9] rounded-[2px] mx-auto flex items-center justify-center text-[#111111]">
        <AlertCircle size={20} />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#111111] tracking-tight">{title}</h3>
        <p className="text-xs text-[#666666] mt-1.5 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw size={13} />}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

