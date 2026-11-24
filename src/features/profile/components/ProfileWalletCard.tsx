import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import walletChestIcon from '@/assets/profile/wallet-chest.webp';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/format';

export interface ProfileWalletCardProps {
  balance: number;
  walletHref?: string;
  onIncreaseTokens: () => void;
}

export function ProfileWalletCard({
  balance,
  walletHref = '/home/wallet',
  onIncreaseTokens,
}: ProfileWalletCardProps) {
  return (
    <section
      aria-label="کیف پول من"
      className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-[20px] px-5 pt-5 pb-4.5 text-white shadow-[0_14px_30px_rgba(34,24,108,0.28)]"
      style={{
        backgroundImage:
          'linear-gradient(165deg, #6c47d9 0%, #4d33b8 46%, #312192 78%, #22176e 100%)',
      }}
    >
      {/* Ambient violet-pink glow behind top-left chest */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-6 -top-6 size-40 rounded-full bg-[#b68cff]/35 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-6 top-10 size-24 rounded-full bg-[#fbd36b]/15 blur-xl"
      />

      {/* Top & Middle area: Right-aligned text & balance + Top-left 3D chest */}
      <div className="relative min-h-[116px] pe-24">
        <div className="flex flex-col items-start">
          <Link
            to={walletHref}
            className="text-heading-3 leading-snug font-bold text-white transition-opacity hover:opacity-90 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            کیف پول من
          </Link>
          <p className="mt-0.5 text-caption text-white/75">موجودی توکن شما</p>

          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="text-[32px] leading-none font-extrabold tracking-tight text-white tabular-nums sm:text-[34px]">
              {formatNumber(balance)}
            </span>
            <span className="text-sm font-bold text-[#f6c453]">توکن</span>
          </div>
        </div>

        {/* 3D Chest positioned in top-left (RTL end), facing inward toward the balance */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-1.5 -top-2 flex size-29 items-center justify-center sm:size-31"
        >
          {/* Soft floor shadow under chest */}
          <span className="absolute bottom-2 h-4 w-20 rounded-full bg-[#140c47]/55 blur-md" />
          <img
            src={walletChestIcon}
            alt=""
            width={124}
            height={124}
            className="relative size-full object-contain drop-shadow-[0_10px_18px_rgba(18,10,60,0.45)] rtl:-scale-x-100"
          />
        </div>
      </div>

      {/* Bottom full-pill golden button */}
      <Button
        type="button"
        tone="accent"
        size="lg"
        onClick={onIncreaseTokens}
        startIcon={<Plus className="size-4.5 stroke-[2.25]" />}
        className="relative h-10.5 w-full touch-manipulation rounded-full bg-gradient-to-b from-[#ffda6b] to-[#f4b738] text-button-md font-bold text-[#281e62] shadow-[0_6px_18px_rgba(244,183,56,0.32)] hover:brightness-105 active:brightness-95 dark:text-[#281e62]"
      >
        افزایش توکن
      </Button>
    </section>
  );
}
