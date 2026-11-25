import {
  Archive,
  ArrowLeft,
  BookHeart,
  Calendar,
  Crown,
  Ellipsis,
  Leaf,
  ReceiptText,
  User,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGroupCoverUrl } from '@/features/groups/api/get-group-cover-url';
import { toPersianDigits } from '@/features/groups/components/GroupHeader';
import { GROUP_HEADER_ASSETS } from '@/features/groups/components/groupHeaderAssets';
import { MemberAvatar } from '@/features/groups/components/MemberAvatar';
import type { GroupItem } from '@/features/groups/types';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

interface GroupCardProps {
  group: GroupItem;
  onEnterGroup: (group: GroupItem) => void;
  onPayDebts: (group: GroupItem) => void;
  onReviewMemories: (group: GroupItem) => void;
  onCreateSimilar: (group: GroupItem) => void;
}

const MAX_VISIBLE_AVATARS = 3;

export function GroupCard({
  group,
  onEnterGroup,
  onPayDebts,
  onReviewMemories,
  onCreateSimilar,
}: GroupCardProps) {
  const isArchived = group.status === 'ARCHIVED';
  const isSettling = group.status === 'SETTLING';
  const isPremium = group.plan === 'PREMIUM';

  const { data: resolvedCoverUrl } = useGroupCoverUrl(
    group.photoSrc ? undefined : group.coverAttachmentId,
  );
  const photoSrc = group.photoSrc ?? resolvedCoverUrl;

  const visibleMembers = group.members.slice(0, MAX_VISIBLE_AVATARS);
  const extraCount = Math.max(group.memberCount - visibleMembers.length, 0);

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-shadow hover:shadow-md',
        group.status === 'ACTIVE'
          ? 'border-secondary-30'
          : isSettling
            ? 'border-info-20'
            : 'border-primary-20',
      )}
    >
      {/* Top Banner */}
      <div className="relative h-30 w-full overflow-hidden bg-primary-10 sm:h-36">
        <img
          src={group.bannerSrc ?? GROUP_HEADER_ASSETS.banner}
          alt=""
          draggable={false}
          aria-hidden="true"
          className={cn(
            'size-full object-cover object-left select-none',
            isArchived && 'opacity-75 grayscale-45',
          )}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-transparent"
        />

        {/* Top Badges (Right in RTL) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {isPremium ? (
            <span className="inline-flex h-6.5 items-center gap-1 rounded-full border border-accent-40 bg-accent-10 px-2.5 text-caption font-medium text-accent-70">
              <Crown className="size-3.5 text-accent-50" aria-hidden="true" />
              پریمیوم
            </span>
          ) : (
            <span className="inline-flex h-6.5 items-center gap-1 rounded-full border border-primary-30 bg-white/95 px-2.5 text-caption font-medium text-primary-70">
              <Leaf className="size-3.5 text-secondary-60" aria-hidden="true" />
              گروه عادی
            </span>
          )}

          {group.status === 'ACTIVE' && (
            <span className="inline-flex h-6.5 items-center gap-1.5 rounded-full border border-secondary-60 bg-white/95 px-2.5 text-caption font-medium text-secondary-80">
              <span className="size-2 rounded-full bg-success-40" />
              فعال
            </span>
          )}

          {group.status === 'SETTLING' && (
            <span className="inline-flex h-6.5 items-center gap-1.5 rounded-full border border-info-40 bg-info-10/95 px-2.5 text-caption font-medium text-info-50">
              <Wallet className="size-3.5 text-info-50" aria-hidden="true" />
              در حال تسویه
            </span>
          )}

          {group.status === 'ARCHIVED' && (
            <span className="inline-flex h-6.5 items-center gap-1 rounded-full border border-primary-30 bg-white/95 px-2.5 text-caption font-medium text-primary-70">
              <Archive
                className="size-3.5 text-primary-60"
                aria-hidden="true"
              />
              آرشیو شده
            </span>
          )}
        </div>

        {/* More Menu Button (Left in RTL) */}
        <div className="absolute top-3 left-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`گزینه‌های بیشتر ${group.title}`}
              className={cn(
                'grid size-8 cursor-pointer place-items-center rounded-xl border bg-white/95 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60',
                group.status === 'ACTIVE'
                  ? 'border-secondary-60 text-secondary-70 hover:bg-secondary-10'
                  : isSettling
                    ? 'border-info-40 text-info-50 hover:bg-info-10'
                    : 'border-primary-30 text-primary-70 hover:bg-primary-10',
              )}
            >
              <Ellipsis className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEnterGroup(group)}>
                <ArrowLeft className="size-4 text-primary-60" />
                <span>ورود به اکیپ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">
        {/* Header Row: Overlapping Photo on Right + Title/Desc */}
        <div className="flex items-start gap-3">
          <div className="-mt-11 grid size-21 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-primary-30 bg-white p-0.5 shadow-sm">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={group.title}
                draggable={false}
                className={cn(
                  'size-full rounded-xl object-cover',
                  isArchived && 'grayscale-30',
                )}
              />
            ) : (
              <div className="grid size-full place-items-center rounded-xl bg-linear-to-br from-primary-10 to-secondary-10 text-primary-60">
                <Users className="size-8 stroke-[1.6]" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
            <h3 className="truncate text-heading-6 text-primary-80">
              {group.title}
            </h3>
            <p className="truncate text-caption text-neutral-60">
              {group.description}
            </p>
          </div>
        </div>

        {/* Members Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center">
            {visibleMembers.map((member, index) => (
              <MemberAvatar
                key={member.id}
                member={member}
                style={{ zIndex: index + 1 }}
                className={cn(
                  'size-6.5 border border-white text-[11px]',
                  index > 0 && '-mr-1.5',
                )}
              />
            ))}
            {extraCount > 0 && (
              <span
                style={{ zIndex: visibleMembers.length + 1 }}
                className="relative -mr-1.5 flex size-6.5 items-center justify-center rounded-full border border-primary-30 bg-primary-10 text-[11px] font-bold text-primary-70"
              >
                +{toPersianDigits(extraCount)}
              </span>
            )}
          </div>

          <span className="text-caption font-medium text-neutral-60">
            {toPersianDigits(group.memberCount)} عضو
          </span>
        </div>

        {/* Settlement Info Box (only for SETTLING) */}
        {isSettling && group.settlement && (
          <div className="flex items-center gap-3 rounded-2xl border border-info-20 bg-info-10/60 px-3.5 py-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-info-20/70 text-info-50">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-caption font-bold text-info-50">
                مانده‌ی سهم شما:{' '}
                {formatNumber(group.settlement.remainingAmountToman)} تومان
              </p>
              <p className="text-caption text-neutral-70">
                {toPersianDigits(group.settlement.settledCount)} از{' '}
                {toPersianDigits(group.settlement.totalCount)} نفر تسویه
                کرده‌اند
              </p>
              <p className="text-caption text-neutral-60">
                پس از تسویهٔ همه، اکیپ آرشیو می‌شود
              </p>
            </div>
          </div>
        )}

        {/* Action Button(s) */}
        <div className="mt-auto pt-1">
          {group.status === 'ACTIVE' && (
            <Button
              type="button"
              tone="secondary"
              size="lg"
              radius="lg"
              onClick={() => onEnterGroup(group)}
              endIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
              className="w-full justify-center bg-secondary-70 hover:bg-secondary-80"
            >
              ورود به اکیپ
            </Button>
          )}

          {group.status === 'SETTLING' && (
            <Button
              type="button"
              size="lg"
              radius="lg"
              onClick={() => onPayDebts(group)}
              startIcon={<ReceiptText className="size-4" aria-hidden="true" />}
              className="w-full justify-center bg-info-50 text-white hover:bg-info-60 active:bg-info-60"
            >
              پرداخت دنگ‌ها
            </Button>
          )}

          {group.status === 'ARCHIVED' && (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                tone="primary"
                size="md"
                radius="lg"
                onClick={() => onReviewMemories(group)}
                startIcon={<BookHeart className="size-4" aria-hidden="true" />}
                className="h-10.5 w-full justify-center gap-1.5 px-2.5 text-button-sm sm:gap-2.5 sm:px-3 sm:text-button-md"
              >
                مرور خاطرات
              </Button>
              <Button
                type="button"
                variant="outline"
                tone="secondary"
                size="md"
                radius="lg"
                onClick={() => onCreateSimilar(group)}
                startIcon={<UserPlus className="size-4" aria-hidden="true" />}
                className="h-10.5 w-full justify-center gap-1.5 border-secondary-60 px-2.5 text-button-sm text-secondary-70 hover:bg-secondary-10 sm:gap-2.5 sm:px-3 sm:text-button-md"
              >
                <span className="sm:hidden">اکیپ مشابه</span>
                <span className="hidden sm:inline">ساخت اکیپ مشابه</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta Strip */}
      <footer className="flex flex-col border-t border-neutral-20 bg-primary-10/70 text-caption text-primary-70 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-2">
          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate font-medium">{group.dateRangeLabel}</span>
        </div>

        <div className="h-px w-full shrink-0 bg-neutral-20 sm:h-8 sm:w-px" />

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-2">
          <User className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="shrink-0 text-neutral-60">ایجاد شده توسط</span>
          {group.creator.avatarSrc && (
            <img
              src={group.creator.avatarSrc}
              alt=""
              draggable={false}
              className="size-4 shrink-0 rounded-full object-cover"
            />
          )}
          <span className="truncate font-medium">{group.creator.name}</span>
        </div>
      </footer>
    </article>
  );
}
