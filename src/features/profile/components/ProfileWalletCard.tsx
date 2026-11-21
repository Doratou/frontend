import { Link } from 'react-router';
import { Coins, Plus, Wallet } from 'lucide-react';
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
      className="relative flex flex-col gap-3.5 overflow-hidden rounded-[20px] p-4.5 text-white md:gap-4 md:p-5"
      style={{
        backgroundImage:
          'linear-gradient(145deg, #4d45a8 0%, #3a3587 38%, #1f1b54 78%)',
      }}
    >
      {/* Decorative rings & faint coin watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -start-14 -top-20 size-48 rounded-full border border-white/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -start-22 -top-28 size-64 rounded-full border border-white/8"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-12 -bottom-12 size-32 rounded-full border border-white/8"
      />
      <Coins
        aria-hidden="true"
        strokeWidth={1.25}
        className="pointer-events-none absolute -end-6 bottom-6 size-36 text-white/[0.06]"
      />

      {/* Top header row */}
      <div className="relative flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#fcc754] to-[#f9b233] text-primary-80 shadow-[0_4px_12px_rgba(249,178,51,0.4)]"
          >
            <Coins className="size-5.5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-heading-6 text-white">کیف پول من</h2>
            <p className="truncate text-caption text-white/70">
              موجودی توکن شما
            </p>
          </div>
        </div>

        <Link
          to={walletHref}
          className="inline-flex shrink-0 touch-manipulation items-center gap-1.5 rounded-full border border-white/22 bg-white/14 px-2.5 py-1.5 text-caption text-white transition-colors hover:bg-white/22 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Wallet aria-hidden="true" className="size-3.5 shrink-0" />
          <span>رفتن به کیف پول</span>
        </Link>
      </div>

      {/* Balance amount */}
      <div className="relative flex items-baseline gap-2">
        <span className="text-[34px] leading-11 font-bold text-white tabular-nums md:text-[38px] md:leading-12">
          {formatNumber(balance)}
        </span>
        <span className="text-heading-6 text-accent-30">توکن</span>
      </div>

      {/* CTA Button */}
      <Button
        type="button"
        tone="accent"
        size="lg"
        onClick={onIncreaseTokens}
        startIcon={<Plus className="size-4.5" />}
        className="relative h-10 w-full touch-manipulation rounded-xl bg-accent-40 text-button-md text-primary-80 hover:bg-accent-30 active:bg-accent-50 dark:text-primary-80"
      >
        افزایش توکن
      </Button>
    </section>
  );
}
