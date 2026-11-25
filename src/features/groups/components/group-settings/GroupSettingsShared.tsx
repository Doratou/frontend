import { useState } from 'react';
import { X } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { cn } from '@/lib/utils';
import { GROUP_STATUS_LABELS } from '../../constants';
import type { GroupStatus } from '../../types';

export function StatusChip({ status }: { status: GroupStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-bold shadow-2xs ring-1',
        !isActive
          ? 'bg-white/70 text-neutral-60 ring-neutral-30/60'
          : 'bg-white/70 text-secondary-80 ring-secondary-30/60',
      )}
    >
      <span className="relative flex size-2">
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-60 opacity-60 motion-reduce:hidden"
          />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            isActive ? 'bg-secondary-60' : 'bg-neutral-40',
          )}
        />
      </span>
      {GROUP_STATUS_LABELS[status]}
    </span>
  );
}

export function GroupAvatar({
  title,
  src,
  onError,
  className,
}: {
  title: string;
  src?: string;
  onError?: () => void;
  className?: string;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = Boolean(src && loadedSrc === src);

  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-[18px] border border-neutral-30/80 bg-white text-secondary-70 shadow-xs',
        className,
      )}
    >
      <span aria-hidden="true" className="font-black">
        {title.charAt(0)}
      </span>
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoadedSrc(src)}
          onError={onError}
          draggable={false}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}

interface InlineConfirmProps {
  prompt: string;
  confirmLabel: string;
  loadingLabel: string;
  cancelAriaLabel: string;
  isLoading: boolean;
  tone?: 'danger' | 'accent';
  size?: 'default' | 'compact';
  onConfirm: () => void;
  onCancel: () => void;
}

export function InlineConfirm({
  prompt,
  confirmLabel,
  loadingLabel,
  cancelAriaLabel,
  isLoading,
  tone = 'danger',
  size = 'default',
  onConfirm,
  onCancel,
}: InlineConfirmProps) {
  const isAccent = tone === 'accent';
  const isCompact = size === 'compact';
  return (
    <div
      className={cn(
        'flex animate-in items-center gap-2 text-xs font-bold duration-150 fade-in slide-in-from-right-2',
        isAccent ? 'text-accent-80' : 'text-danger-50',
        !isCompact && 'rounded-xl bg-white p-2 shadow-xs',
      )}
    >
      <span>{prompt}</span>
      <LoadingButton
        type="button"
        size="md"
        radius="lg"
        isLoading={isLoading}
        loadingText={loadingLabel}
        onClick={onConfirm}
        className={cn(
          'text-white',
          isCompact && 'h-7 px-2.5 text-xs',
          isAccent
            ? 'bg-accent-60 hover:bg-accent-70 active:bg-accent-80'
            : 'bg-danger-40 hover:bg-danger-50 active:bg-danger-60',
        )}
      >
        {confirmLabel}
      </LoadingButton>
      <button
        type="button"
        onClick={onCancel}
        aria-label={cancelAriaLabel}
        className="hover:text-neutral-90 grid size-7 cursor-pointer place-items-center rounded-md text-neutral-60 hover:bg-neutral-20/70"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
