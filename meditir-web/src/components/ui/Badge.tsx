import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
    {children}
  </span>
);

export const sessionStatusBadge = (status: string) => {
  const map: Record<string, BadgeProps['variant']> = {
    SCHEDULED: 'info',
    IN_PROGRESS: 'success',
    COMPLETED: 'default',
    CANCELLED: 'danger',
  };
  return map[status] || 'default';
};

export const noteStatusBadge = (status: string) => {
  const map: Record<string, BadgeProps['variant']> = {
    DRAFT: 'default',
    AI_GENERATED: 'info',
    DOCTOR_REVIEWED: 'warning',
    FINALIZED: 'success',
  };
  return map[status] || 'default';
};
