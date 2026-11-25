import { lazy, Suspense, useMemo, useState } from 'react';
import {
  Archive,
  Info,
  Link as LinkIcon,
  LogOut,
  Users,
  X,
} from 'lucide-react';
import settingsNavBg from '@/assets/group/settings-nav-bg.svg';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/lib/api/error';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import {
  useGroupCoverImage,
  useGroupSettings,
} from '../hooks/use-group-settings';
import type { GroupSettingsData } from '../types';
import { GroupAvatar, StatusChip } from './group-settings/GroupSettingsShared';
import { OverviewSection } from './group-settings/OverviewSection';

const MembersSection = lazy(() =>
  import('./group-settings/MembersSection').then((m) => ({
    default: m.MembersSection,
  })),
);
const InviteLinkSection = lazy(() =>
  import('./group-settings/InviteLinkSection').then((m) => ({
    default: m.InviteLinkSection,
  })),
);
const DangerZoneSection = lazy(() =>
  import('./group-settings/DangerZoneSection').then((m) => ({
    default: m.DangerZoneSection,
  })),
);
const InviteMemberDialog = lazy(() =>
  import('./InviteMemberDialog').then((m) => ({
    default: m.InviteMemberDialog,
  })),
);

export type SettingsSection = 'overview' | 'members' | 'link' | 'archive';

export interface GroupSettingsDialogProps {
  groupId: string;
  currentUserId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupExit?: () => void;
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  coverImage?: { src?: string; onError: () => void };
}

const STATIC_SECTIONS: ReadonlyArray<{
  id: Exclude<SettingsSection, 'archive'>;
  label: string;
  title: string;
  icon: typeof Users;
}> = [
  { id: 'overview', label: 'اطلاعات اکیپ', title: 'اطلاعات اکیپ', icon: Info },
  { id: 'members', label: 'اعضا', title: 'اعضای اکیپ', icon: Users },
  { id: 'link', label: 'لینک و رمز', title: 'لینک و رمز دعوت', icon: LinkIcon },
];

function SectionFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner className="size-6 text-secondary-70" />
    </div>
  );
}

function NavItem({
  label,
  icon: Icon,
  active,
  danger = false,
  count,
  onClick,
}: {
  label: string;
  icon: typeof Users;
  active: boolean;
  danger?: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active || undefined}
      className={cn(
        'group relative flex h-11 w-full cursor-pointer items-center overflow-hidden rounded-2xl border-[1.5px] transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60 motion-reduce:transition-none',
        danger
          ? active
            ? 'border-danger-50 bg-danger-20/75 shadow-xs'
            : 'border-danger-40 bg-danger-10 hover:border-danger-50 hover:bg-danger-20/55'
          : active
            ? 'border-transparent bg-secondary-20'
            : 'border-transparent bg-transparent hover:bg-secondary-20/50',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'w-0.9 absolute top-1/2 right-0.5 h-5.5 -translate-y-1/2 rounded-xs bg-secondary-60 transition-opacity duration-200 motion-reduce:transition-none',
          active && !danger ? 'opacity-100' : 'opacity-0',
        )}
      />

      <span className="flex h-full w-10.25 shrink-0 items-center justify-center">
        <Icon
          className={cn(
            'pointer-events-none h-4.5 w-4.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none',
            danger ? 'text-danger-50' : 'text-primary-80',
          )}
          strokeWidth={1.75}
        />
      </span>

      <span
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 pl-3 text-sm leading-5.5 font-medium',
          danger ? 'text-danger-50' : 'text-primary-80',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-right">{label}</span>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-white/75 px-2 py-0.5 text-caption font-bold text-secondary-80 shadow-2xs">
            {formatNumber(count)}
          </span>
        )}
      </span>
    </button>
  );
}

function GroupSettingsContent({
  group,
  isOwner,
  section,
  externalCover,
  onSectionChange,
  onOpenInvite,
  onClose,
  onGroupExit,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
  section: SettingsSection;
  externalCover?: { src?: string; onError: () => void };
  onSectionChange: (section: SettingsSection) => void;
  onOpenInvite: () => void;
  onClose: () => void;
  onGroupExit?: () => void;
}) {
  const internalCover = useGroupCoverImage(externalCover ? undefined : group);
  const cover = externalCover ?? internalCover;

  const memberCount = group.memberCount;
  const dangerLabel = isOwner ? 'آرشیو و حذف' : 'خروج از اکیپ';

  const sections = useMemo(
    () => [
      ...STATIC_SECTIONS.map((item) => ({ ...item, isDanger: false })),
      {
        id: 'archive' as const,
        label: dangerLabel,
        title: dangerLabel,
        icon: isOwner ? Archive : LogOut,
        isDanger: true,
      },
    ],
    [dangerLabel, isOwner],
  );

  const activeTitle = sections.find((item) => item.id === section)?.title ?? '';

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden font-sans md:grid-cols-[248px_1fr]">
      <DialogTitle className="sr-only">تنظیمات اکیپ {group.title}</DialogTitle>
      <DialogDescription className="sr-only">
        مدیریت اطلاعات اکیپ، اعضا، لینک دعوت و وضعیت اکیپ
      </DialogDescription>

      <nav
        aria-label="بخش‌های تنظیمات"
        className="relative hidden min-h-0 flex-col overflow-hidden border-l border-neutral-20 bg-secondary-10 p-3 md:flex"
      >
        <img
          src={settingsNavBg}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-bottom"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col items-center px-2 pt-5 pb-3 text-center">
            <GroupAvatar
              title={group.title}
              src={cover.src}
              onError={cover.onError}
              className="size-18 shrink-0 text-2xl"
            />
            <h3 className="mt-3 line-clamp-1 w-full text-heading-5 font-black text-primary-80">
              {group.title}
            </h3>
            <div className="mt-2.5">
              <StatusChip status={group.status} />
            </div>
          </div>

          <ul className="flex flex-col gap-1">
            {sections.map(({ id, label, icon, isDanger }) => (
              <li key={id}>
                <NavItem
                  label={label}
                  icon={icon}
                  active={section === id}
                  danger={isDanger}
                  count={id === 'members' ? memberCount : undefined}
                  onClick={() => onSectionChange(id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          onClick={onClose}
          aria-label="بستن تنظیمات"
          className="hover:text-neutral-90 absolute top-2.5 left-2.5 z-10 hidden text-neutral-60 md:grid"
        >
          <X className="size-5" />
        </Button>

        <div className="shrink-0 md:hidden">
          <div className="relative overflow-hidden border-b border-secondary-20/70 bg-secondary-10/75 px-4 py-3.5">
            <img
              src={settingsNavBg}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top opacity-85"
            />
            <div className="relative z-10 flex items-center gap-3">
              <GroupAvatar
                title={group.title}
                src={cover.src}
                onError={cover.onError}
                className="size-12 shrink-0 rounded-2xl text-base"
              />
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-heading-6 font-black text-primary-80">
                  {group.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StatusChip status={group.status} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2 py-0.5 text-caption font-bold text-primary-70 ring-1 ring-neutral-30/50">
                    <Users className="size-3 text-secondary-70" />
                    {formatNumber(memberCount)} نفر
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                onClick={onClose}
                aria-label="بستن تنظیمات"
                className="size-9 shrink-0 rounded-xl bg-white/75 text-neutral-70 shadow-2xs ring-1 ring-neutral-30/50 backdrop-blur-xs hover:bg-white"
              >
                <X className="size-4.5" />
              </Button>
            </div>
          </div>

          <div className="border-b border-neutral-20/80 bg-white px-3 py-2.5">
            <div
              role="tablist"
              aria-label="بخش‌های تنظیمات"
              className="flex [scrollbar-width:none] items-center gap-1 overflow-x-auto rounded-2xl bg-neutral-10/90 p-1 [&::-webkit-scrollbar]:hidden"
            >
              {sections.map(({ id, label, icon: Icon, isDanger }) => {
                const isActive = section === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSectionChange(id)}
                    className={cn(
                      'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                      isActive
                        ? isDanger
                          ? 'bg-danger-10 text-danger-50 shadow-2xs ring-1 ring-danger-20'
                          : 'bg-white text-secondary-80 shadow-2xs ring-1 ring-secondary-20/80'
                        : isDanger
                          ? 'text-danger-50/85 hover:bg-danger-10/50 hover:text-danger-50'
                          : 'text-neutral-60 hover:bg-white/60 hover:text-primary-80',
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={2} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <header className="hidden items-center border-b border-neutral-20 px-6 py-4 pl-12 md:flex">
          <h2 className="text-heading-5 font-black text-primary-80">
            {activeTitle}
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          {section === 'overview' ? (
            <OverviewSection
              group={group}
              isOwner={isOwner}
              coverSrc={cover.src}
              onCoverError={cover.onError}
            />
          ) : (
            <Suspense fallback={<SectionFallback />}>
              {section === 'members' && (
                <MembersSection
                  group={group}
                  isOwner={isOwner}
                  onInvite={onOpenInvite}
                />
              )}
              {section === 'link' && (
                <InviteLinkSection group={group} isOwner={isOwner} />
              )}
              {section === 'archive' && (
                <DangerZoneSection
                  group={group}
                  isOwner={isOwner}
                  onClose={onClose}
                  onGroupExit={onGroupExit}
                />
              )}
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

export function GroupSettingsDialog({
  groupId,
  currentUserId,
  open,
  onOpenChange,
  onGroupExit,
  section,
  onSectionChange,
  coverImage,
}: GroupSettingsDialogProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [hasOpenedInvite, setHasOpenedInvite] = useState(false);

  const openInvite = () => {
    setHasOpenedInvite(true);
    setIsInviteOpen(true);
  };

  const {
    data: group,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupSettings(groupId, open);

  const isOwner = useMemo(
    () =>
      Boolean(
        currentUserId &&
        group?.members.some(
          (member) =>
            member.userId === currentUserId && member.role === 'OWNER',
        ),
      ),
    [currentUserId, group?.members],
  );

  const handleSettingsOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsInviteOpen(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog
        open={open && !isInviteOpen}
        onOpenChange={handleSettingsOpenChange}
      >
        <DialogContent className="h-[min(86dvh,640px)] w-[calc(100%-1.5rem)] max-w-[860px] overflow-hidden rounded-2xl p-0 font-sans sm:w-[calc(100%-2.5rem)] md:h-[580px] md:max-h-[calc(100dvh-2rem)]">
          {isLoading ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-6">
              <DialogTitle className="sr-only">تنظیمات اکیپ</DialogTitle>
              <DialogDescription className="sr-only">
                در حال بارگذاری اطلاعات اکیپ
              </DialogDescription>
              <Spinner className="size-7 text-secondary-70" />
              <p className="text-paragraph-sm text-neutral-60">
                در حال دریافت اطلاعات اکیپ…
              </p>
            </div>
          ) : isError || !group ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
              <DialogTitle className="text-heading-5 font-bold text-primary-80">
                خطا در دریافت تنظیمات اکیپ
              </DialogTitle>
              <DialogDescription className="text-paragraph-sm text-danger-50">
                {getApiErrorMessage(error, {
                  fallback: 'اطلاعات اکیپ در دسترس نیست.',
                })}
              </DialogDescription>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  tone="secondary"
                  size="md"
                  onClick={() => void refetch()}
                >
                  تلاش مجدد
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  tone="secondary"
                  size="md"
                  onClick={() => handleSettingsOpenChange(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          ) : (
            <GroupSettingsContent
              key={groupId}
              group={group}
              isOwner={isOwner}
              section={section}
              externalCover={coverImage}
              onSectionChange={onSectionChange}
              onOpenInvite={openInvite}
              onClose={() => handleSettingsOpenChange(false)}
              onGroupExit={onGroupExit}
            />
          )}
        </DialogContent>
      </Dialog>

      {isOwner && group && hasOpenedInvite && (
        <Suspense fallback={null}>
          <InviteMemberDialog
            groupId={group.id}
            existingMembers={group.members}
            open={open && isInviteOpen}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setIsInviteOpen(false);
            }}
            onBack={() => setIsInviteOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
