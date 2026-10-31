import React, { ReactNode, useEffect, useRef } from 'react';
import { ApplicationStatus } from '../../types';
export { AarohanLogo } from './AarohanLogo';

// ==========================================
// BUTTON
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-[2px]',
    md: 'text-sm px-4 py-2 gap-2 rounded-[3px]',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-[3px]',
  };

  const variants = {
    primary: 'bg-[#111111] text-white hover:bg-neutral-800 active:bg-black',
    secondary:
      'bg-white text-[#111111] border border-[#E4E4E1] hover:bg-[#F5F5F3] active:bg-[#ECECE9]',
    outline:
      'bg-transparent text-[#111111] border border-[#222222] hover:bg-[#F5F5F3] active:bg-[#ECECE9]',
    ghost: 'bg-transparent text-[#111111] hover:bg-[#F5F5F3] active:bg-[#ECECE9]',
    danger:
      'bg-white text-[#111111] border border-[#222222] hover:bg-neutral-100 hover:border-black active:bg-neutral-200',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================
export function StatusBadge({ status }: { status: ApplicationStatus | string }) {
  let badgeStyle = 'border border-[#E4E4E1] bg-white text-[#111111]';

  if (status === 'Shortlisted') {
    badgeStyle = 'bg-[#F5F5F3] border border-[#D1D1CE] text-[#111111] font-medium';
  } else if (status === 'Interview Scheduled') {
    badgeStyle = 'bg-[#111111] text-white border border-[#111111] font-medium';
  } else if (status === 'Selected') {
    badgeStyle = 'border-2 border-[#111111] bg-white text-[#111111] font-bold tracking-tight';
  } else if (status === 'Rejected' || status === 'Withdrawn') {
    badgeStyle = 'border border-[#E4E4E1] bg-white text-[#858585] line-through decoration-neutral-400';
  } else if (status === 'Under Review') {
    badgeStyle = 'border border-[#222222] bg-white text-[#111111] font-medium';
  } else if (status === 'Active') {
    badgeStyle = 'bg-[#111111] text-white border border-[#111111] font-medium';
  } else if (status === 'Draft' || status === 'Closed' || status === 'Archived') {
    badgeStyle = 'border border-[#E4E4E1] text-[#666666] bg-[#FAFAF9]';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs uppercase tracking-wider rounded-[2px] font-mono select-none ${badgeStyle}`}
    >
      {status}
    </span>
  );
}

// ==========================================
// INPUT & FORM CONTROLS
// ==========================================
export function FormField({
  label,
  id,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  id?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          {label} {required && <span className="text-[#111111] font-bold">*</span>}
        </label>
        {hint && <span className="text-xs text-[#858585]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-[#111111] font-medium flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-white border border-[#E4E4E1] text-[#111111] px-3 py-2 text-sm rounded-[2px] placeholder:text-[#858585] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-colors disabled:bg-[#F5F5F3] disabled:text-[#858585] ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = '',
  rows = 3,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-white border border-[#E4E4E1] text-[#111111] px-3 py-2 text-sm rounded-[2px] placeholder:text-[#858585] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-colors disabled:bg-[#F5F5F3] ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full bg-white border border-[#E4E4E1] text-[#111111] px-3 py-2 text-sm rounded-[2px] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-colors disabled:bg-[#F5F5F3] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ==========================================
// MODAL / DIALOG
// ==========================================
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-xl',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`w-full ${maxWidth} bg-white border border-[#222222] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between border-b border-[#E4E4E1] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
              UNIVERSITY PLACEMENT OFFICE
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#111111]">{title}</h2>
            {description && <p className="text-xs text-[#666666] mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#666666] hover:text-[#111111] p-1 border border-transparent hover:border-[#E4E4E1] rounded-[2px]"
          >
            ✕
          </button>
        </div>

        <div className="text-sm text-[#111111] flex-1">{children}</div>

        {footer && (
          <div className="border-t border-[#E4E4E1] pt-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="border border-dashed border-[#E4E4E1] p-10 sm:p-12 text-center bg-[#FAFAF9]">
      <div className="max-w-md mx-auto space-y-3">
        <h3 className="text-base font-semibold text-[#111111]">{title}</h3>
        <p className="text-sm text-[#666666] leading-relaxed">{message}</p>
        {actionLabel && onAction && (
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// METRIC SUMMARY (TYPOGRAPHIC)
// ==========================================
export function MetricSummary({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-[#E4E4E1] pr-6 py-3 last:border-none">
      <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] mb-1">
        {label}
      </span>
      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
        {value}
      </span>
      {sublabel && <span className="text-xs text-[#666666] mt-1">{sublabel}</span>}
    </div>
  );
}
