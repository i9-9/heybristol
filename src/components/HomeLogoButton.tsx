'use client';

import LogoB from '@/components/LogoB';
import { scrollToHero } from '@/lib/scroll-to-hero';

interface HomeLogoButtonProps {
  className?: string;
  logoClassName?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export default function HomeLogoButton({
  className,
  logoClassName,
  ariaLabel = 'Volver al inicio',
  onClick,
}: HomeLogoButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (onClick) {
          onClick();
          return;
        }
        scrollToHero();
      }}
      className={className}
    >
      {logoClassName ? (
        <div className={logoClassName}>
          <LogoB />
        </div>
      ) : (
        <LogoB />
      )}
    </button>
  );
}
