import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/lib/api/error';
import { formatNumber } from '@/utils/format';
import {
  useFriendsList,
  useInviteGroupMembers,
} from '../hooks/use-group-settings';
import type { GroupMemberItem } from '../types';
import { MemberAvatar } from './MemberAvatar';

interface InviteMemberDialogProps {
  groupId: string;
  existingMembers: GroupMemberItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function InviteMemberDialog({
  groupId,
  existingMembers,
  open,
  onOpenChange,
  onBack,
}: InviteMemberDialogProps) {
  const {
    data: friends = [],
    isLoading: isLoadingFriends,
    isError: isFriendsError,
    error: friendsError,
    refetch: refetchFriends,
  } = useFriendsList(open);
  const inviteMutation = useInviteGroupMembers(groupId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const existingUserIds = useMemo(
    () => new Set(existingMembers.map((member) => member.userId)),
    [existingMembers],
  );

  const availableFriends = useMemo(
    () => friends.filter((friend) => !existingUserIds.has(friend.id)),
    [friends, existingUserIds],
  );

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableFriends;
    return availableFriends.filter((f) => f.name.toLowerCase().includes(q));
  }, [availableFriends, searchQuery]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedFriends = useMemo(
    () => availableFriends.filter((f) => selectedIdSet.has(f.id)),
    [availableFriends, selectedIdSet],
  );

  const toggleSelection = (friendId: string) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      onOpenChange(false);
    }
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) return;
    inviteMutation.mutate(selectedIds, {
      onSuccess: (result) => {
        if (result.succeededCount > 0) {
          setSelectedIds([]);
          setSearchQuery('');
          handleReturn();
        }
      },
    });
  };

  const selectedCount = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[86dvh] w-[calc(100%-1.5rem)] max-w-[492px] flex-col overflow-hidden rounded-2xl p-0 font-sans sm:w-[calc(100%-2.5rem)]">
        <header className="relative flex items-center justify-between gap-2 border-b border-neutral-20 bg-white px-4 py-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-10 text-secondary-70 sm:size-11"
            >
              <UserPlus className="size-5 sm:size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-heading-6 font-bold text-primary-80 sm:text-heading-5">
                دعوت عضو جدید
              </DialogTitle>
              <DialogDescription className="line-clamp-2 text-caption text-neutral-60">
                از فهرست دوستان، افراد موردنظر را برای ارسال دعوتنامه انتخاب
                کنید.
              </DialogDescription>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {selectedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-10 px-2.5 py-1 text-xs font-bold text-secondary-80 shadow-xs">
                <span className="grid size-4 place-items-center rounded-full bg-secondary-70 text-white">
                  <Check className="size-2.5 stroke-[3]" />
                </span>
                {formatNumber(selectedCount)}
              </span>
            )}
            {onBack && (
              <Button
                type="button"
                variant="outline"
                tone="secondary"
                size="icon-md"
                radius="md"
                onClick={handleReturn}
                aria-label="بازگشت به تنظیمات"
                title="بازگشت به تنظیمات"
                className="size-9 rounded-xl border-neutral-20 text-neutral-60 hover:border-secondary-30 hover:bg-secondary-10/60 hover:text-secondary-80"
              >
                <ArrowLeft className="size-4.5" />
              </Button>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
          <TextField
            label="جست‌وجو در فهرست دوستان"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search className="size-4.25 text-neutral-50" />}
          />

          {selectedFriends.length > 0 && (
            <section
              aria-labelledby="selected-friends-title"
              className="flex flex-col gap-2 rounded-2xl bg-secondary-10/70 p-3"
            >
              <h3
                id="selected-friends-title"
                className="flex items-center gap-1.5 text-xs font-bold text-secondary-80"
              >
                <Users className="size-4 text-secondary-70" />
                افراد انتخاب‌شده
              </h3>
              <ul className="flex max-h-24 [scrollbar-width:thin] flex-wrap gap-1.5 overflow-y-auto">
                {selectedFriends.map((friend) => (
                  <li key={friend.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelection(friend.id)}
                      aria-label={`لغو انتخاب ${friend.name}`}
                      className="group flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-secondary-30 bg-white pr-1 pl-2.5 text-caption font-bold text-secondary-80 shadow-2xs transition-all hover:border-secondary-50 hover:bg-secondary-10 active:scale-95"
                    >
                      <MemberAvatar
                        member={{
                          id: friend.id,
                          name: friend.name,
                          avatarSrc: friend.avatarSrc,
                        }}
                        className="size-5.5 text-[11px]"
                      />
                      <span className="max-w-[120px] truncate">
                        {friend.name}
                      </span>
                      <X className="size-3.5 text-secondary-60 transition-colors group-hover:text-danger-50" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div
            role="group"
            aria-label="فهرست دوستان"
            className="flex max-h-60 [scrollbar-width:thin] flex-col gap-1.5 overflow-y-auto pr-0.5 pl-1"
          >
            {isLoadingFriends ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-5 text-secondary-70" />
              </div>
            ) : isFriendsError ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-paragraph-sm text-danger-50">
                  {getApiErrorMessage(friendsError, {
                    fallback: 'دریافت فهرست دوستان انجام نشد.',
                  })}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  tone="secondary"
                  size="md"
                  onClick={() => void refetchFriends()}
                >
                  تلاش مجدد
                </Button>
              </div>
            ) : filteredFriends.length === 0 ? (
              <p className="py-6 text-center text-paragraph-sm text-neutral-60">
                {availableFriends.length === 0
                  ? 'دوست قابل دعوتی در فهرست شما نیست.'
                  : 'دوستی با این نام پیدا نشد.'}
              </p>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedIdSet.has(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleSelection(friend.id)}
                    className={`flex min-h-[52px] cursor-pointer items-center justify-between rounded-xl border p-2 text-start transition-colors ${
                      isSelected
                        ? 'border-secondary-50 bg-secondary-10/80 shadow-xs'
                        : 'border-transparent bg-neutral-10 hover:bg-secondary-10/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MemberAvatar
                        member={{
                          id: friend.id,
                          name: friend.name,
                          avatarSrc: friend.avatarSrc,
                        }}
                        className="size-9"
                      />
                      <div className="flex flex-col">
                        <span className="text-paragraph-sm font-bold text-primary-80">
                          {friend.name}
                        </span>
                        {friend.mutualGroupCount !== undefined &&
                          friend.mutualGroupCount > 0 && (
                            <span className="text-caption text-neutral-60">
                              {formatNumber(friend.mutualGroupCount)} اکیپ مشترک
                            </span>
                          )}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary-70">
                        انتخاب شد
                        <Check className="size-4 stroke-[2.5]" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <footer className="flex items-center justify-end border-t border-neutral-20/80 bg-neutral-10/40 px-4 py-3.5 sm:px-5">
          <LoadingButton
            type="button"
            tone="secondary"
            size="md"
            radius="md"
            disabled={selectedCount === 0}
            isLoading={inviteMutation.isPending}
            loadingText="در حال ارسال…"
            startIcon={<Send className="size-3.5 shrink-0" />}
            onClick={handleAdd}
            className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-2xs disabled:bg-neutral-20/80 disabled:text-neutral-50 disabled:shadow-none"
          >
            ارسال دعوتنامه
          </LoadingButton>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
