import Image from 'next/image';
import { clsx } from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  wordmarkColor?: 'light' | 'dark';
  className?: string;
}

const sizeMap: Record<NonNullable<LogoProps['size']>, { px: number; text: string; gap: string }> = {
  sm: { px: 24, text: 'text-base', gap: 'gap-2' },
  md: { px: 32, text: 'text-lg', gap: 'gap-2.5' },
  lg: { px: 44, text: 'text-2xl', gap: 'gap-3' },
  xl: { px: 64, text: 'text-3xl', gap: 'gap-4' },
};

export const Logo = ({
  size = 'md',
  showWordmark = true,
  wordmarkColor = 'dark',
  className,
}: LogoProps) => {
  const s = sizeMap[size];
  return (
    <div className={clsx('flex items-center', s.gap, className)}>
      <Image
        src="/meditir-logo.png"
        alt="Meditir"
        width={s.px}
        height={s.px}
        priority
        className="shrink-0"
      />
      {showWordmark && (
        <span
          className={clsx(
            'font-bold tracking-tight',
            s.text,
            wordmarkColor === 'light' ? 'text-white' : 'text-gray-900'
          )}
        >
          Meditir
        </span>
      )}
    </div>
  );
};
