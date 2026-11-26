import { useState } from 'react';
import { Crown, Trash2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useRemoveGroupMember,
  useTransferGroupOwnership,
} from '../../hooks/use-group-settings';
import { MemberAvatar } from '../MemberAvatar';
import { useGroupSettingsContext } from './group-settings-context';
import { InlineConfirm } from './GroupSettingsShared';

export function MembersSection() {
  const { group, isOwner, openInvite: onInvite } = useGroupSettingsContext();
  const removeMemberMutation = useRemoveGroupMember(group.id);
  const transferOwnershipMutation = useTransferGroupOwnership(group.id);
  const [pendingAction, setPendingAction] = useState<{
    memberId: string;
    type: 'remove' | 'transfer';
  } | null>(null);

  const isClosed = group.status === 'CLOSED';
  const canInvite = isOwner && group.status === 'ACTIVE';
  const canManageMembers = isOwner && !isClosed;

  return (
    <div className="flex flex-col gap-3">
      {isOwner && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onInvite}
            disabled={!canInvite}
            aria-label="افزودن اعضا"
            className="group flex h-9 shrink-0 cursor-pointer items-center rounded-full border border-secondary-60 bg-white text-secondary-70 shadow-2xs transition-colors duration-200 hover:border-secondary-50 hover:bg-secondary-10 hover:text-secondary-80 focus-visible:ring-2 focus-visible:ring-secondary-30 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="grid size-9 shrink-0 place-items-center">
              <UserPlus className="size-4" />
            </span>
            <span className="max-w-36 overflow-hidden ps-1 pe-3.5 text-xs font-bold whitespace-nowrap opacity-100 transition-[max-width,padding,opacity] duration-300 ease-out motion-reduce:transition-none md:max-w-0 md:ps-0 md:pe-0 md:opacity-0 md:group-hover:max-w-36 md:group-hover:ps-1 md:group-hover:pe-3.5 md:group-hover:opacity-100 md:group-focus-visible:max-w-36 md:group-focus-visible:ps-1 md:group-focus-visible:pe-3.5 md:group-focus-visible:opacity-100">
              افزودن اعضا
            </span>
          </button>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-neutral-20 overflow-hidden rounded-2xl border border-neutral-20 bg-white">
        {group.members.map((member) => {
          const isMemberOwner = member.role === 'OWNER';
          const isConfirmingRemove =
            pendingAction?.memberId === member.memberId &&
            pendingAction.type === 'remove';
          const isConfirmingTransfer =
            pendingAction?.memberId === member.memberId &&
            pendingAction.type === 'transfer';

          return (
            <li
              key={member.memberId}
              className={cn(
                'flex min-h-13 items-center justify-between gap-3 px-3 py-1.5 transition-colors',
                isMemberOwner ? 'bg-secondary-10/70' : 'hover:bg-neutral-10/60',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar
                  member={{
                    id: member.memberId,
                    name: member.name,
                    avatarAttachmentId: member.avatarAttachmentId,
                    avatarSrc: member.avatarSrc,
                  }}
                  className="size-9"
                />
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-paragraph-sm text-primary-80">
                    {member.name}
                  </span>
                  {isMemberOwner && (
                    <span className="shrink-0 rounded-full bg-secondary-20 px-2.5 py-0.5 text-caption font-bold text-secondary-80">
                      مالک
                    </span>
                  )}
                </div>
              </div>

              {!isMemberOwner && canManageMembers && (
                <div className="flex shrink-0 items-center gap-1">
                  {isConfirmingTransfer ? (
                    <InlineConfirm
                      prompt="انتقال مالکیت؟"
                      confirmLabel="تأیید"
                      loadingLabel="در حال انتقال…"
                      cancelAriaLabel="لغو انتقال مالکیت"
                      isLoading={transferOwnershipMutation.isPending}
                      tone="accent"
                      size="compact"
                      onConfirm={() =>
                        transferOwnershipMutation.mutate(member.userId, {
                          onSuccess: () => setPendingAction(null),
                        })
                      }
                      onCancel={() => setPendingAction(null)}
                    />
                  ) : isConfirmingRemove ? (
                    <InlineConfirm
                      prompt="مطمئنی؟"
                      confirmLabel="حذف"
                      loadingLabel="در حال حذف…"
                      cancelAriaLabel="لغو حذف"
                      isLoading={removeMemberMutation.isPending}
                      tone="danger"
                      size="compact"
                      onConfirm={() =>
                        removeMemberMutation.mutate(member.memberId, {
                          onSuccess: () => setPendingAction(null),
                        })
                      }
                      onCancel={() => setPendingAction(null)}
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({
                            memberId: member.memberId,
                            type: 'transfer',
                          })
                        }
                        aria-label={`انتقال مالکیت به ${member.name}`}
                        title="انتقال مالکیت"
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-50 transition-colors hover:bg-accent-10 hover:text-accent-70"
                      >
                        <Crown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({
                            memberId: member.memberId,
                            type: 'remove',
                          })
                        }
                        aria-label={`حذف ${member.name}`}
                        title="حذف عضو"
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-50 transition-colors hover:bg-danger-10 hover:text-danger-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
