import { Check, User, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/features/groups/components/GroupHeader';
import type { GroupInvitation } from '@/features/groups/types';

interface GroupInvitationCardProps {
  invitation: GroupInvitation;
  onAccept: (invitation: GroupInvitation) => void;
  onReject: (invitation: GroupInvitation) => void;
}

export function GroupInvitationCard({
  invitation,
  onAccept,
  onReject,
}: GroupInvitationCardProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-accent-30 bg-accent-10/70 p-3.5 transition-shadow hover:shadow-xs">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-accent-30 bg-white text-accent-60">
          {invitation.photoSrc ? (
            <img
              src={invitation.photoSrc}
              alt={invitation.groupName}
              draggable={false}
              className="size-full object-cover"
            />
          ) : (
            <Users className="size-7 stroke-[1.75]" aria-hidden="true" />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-heading-6 text-primary-80">
            {invitation.groupName}
          </h3>

          <div className="flex items-center gap-1.5 text-caption text-primary-70">
            {invitation.inviterAvatarSrc ? (
              <img
                src={invitation.inviterAvatarSrc}
                alt={invitation.inviterName}
                draggable={false}
                className="size-4 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-accent-20 text-accent-70">
                <User className="size-2.5" aria-hidden="true" />
              </span>
            )}
            <span className="truncate">
              <strong className="font-medium">{invitation.inviterName}</strong>{' '}
              شما را دعوت کرده
            </span>
          </div>

          <p className="truncate text-caption text-neutral-60">
            {toPersianDigits(invitation.memberCount)} عضو ·{' '}
            {invitation.startDateLabel} · {invitation.invitedAtLabel}
          </p>
        </div>
      </div>

      <div className="flex w-24 shrink-0 flex-col gap-1.5">
        <Button
          type="button"
          size="md"
          radius="lg"
          onClick={() => onAccept(invitation)}
          endIcon={<Check className="size-3.5" aria-hidden="true" />}
          className="h-8.5 w-full justify-center bg-success-50 text-caption font-medium text-white hover:bg-success-60 active:bg-success-60"
        >
          تایید
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          radius="lg"
          onClick={() => onReject(invitation)}
          endIcon={<X className="size-3.5" aria-hidden="true" />}
          className="h-8.5 w-full justify-center border-danger-30 bg-white text-caption font-medium text-danger-50 hover:bg-danger-10 active:bg-danger-10"
        >
          رد
        </Button>
      </div>
    </article>
  );
}
