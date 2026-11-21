import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
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
}

export function InviteMemberDialog({
  groupId,
  existingMembers,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { data: friends = [] } = useFriendsList();
  const inviteMutation = useInviteGroupMembers(groupId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Scroll state for the selected friends strip
  const stripRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Track previous count to auto-scroll when new items are added
  const prevSelectedCountRef = useRef(0);

  // Friends who are not already members
  const availableFriends = useMemo(() => {
    return friends.filter(
      (friend) =>
        !existingMembers.some(
          (member) => member.id === friend.id || member.name === friend.name,
        ),
    );
  }, [friends, existingMembers]);

  // Filtered by search query (handle or name)
  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    if (!q) return availableFriends;
    return availableFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.handle.toLowerCase().includes(q),
    );
  }, [availableFriends, searchQuery]);

  const toggleSelection = (friendId: string) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const selectedFriends = useMemo(() => {
    return availableFriends.filter((f) => selectedIds.includes(f.id));
  }, [availableFriends, selectedIds]);

  // Update scroll arrows visibility based on scroll position in RTL
  const updateScrollArrows = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;

    const distance = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;

    // In RTL, distance from 0 (start) indicates right-scroll availability
    setCanScrollLeft(maxScroll - distance > 4);
    setCanScrollRight(distance > 4);
  }, []);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    updateScrollArrows();

    const resizeObserver = new ResizeObserver(() => updateScrollArrows());
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedFriends, updateScrollArrows]);

  // Auto-scroll on newly selected item
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    if (selectedFriends.length > prevSelectedCountRef.current) {
      // New friend added: scroll smoothly towards the end of the strip
      el.scrollTo({ left: -el.scrollWidth, behavior: 'smooth' });
    }
    prevSelectedCountRef.current = selectedFriends.length;
  }, [selectedFriends.length]);

  const handleScrollLeft = () => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.65, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.65, behavior: 'smooth' });
  };

  // Convert mouse wheel vertical scroll to horizontal scroll on the chip strip
  const handleWheel = (e: React.WheelEvent<HTMLUListElement>) => {
    const el = stripRef.current;
    if (!el) return;

    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
      updateScrollArrows();
    }
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) return;
    inviteMutation.mutate(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        setSearchQuery('');
        onOpenChange(false);
      },
    });
  };

  const selectedCount = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[492px] overflow-hidden rounded-2xl p-0 font-sans">
        {/* Header matching Dorato foundations */}
        <header className="relative flex items-center justify-between border-b border-neutral-20 bg-white p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-10 text-secondary-70"
            >
              <UserPlus className="size-6" />
            </span>
            <div>
              <DialogTitle className="text-heading-5 font-bold text-primary-80">
                دعوت عضو جدید
              </DialogTitle>
              <DialogDescription className="text-caption text-neutral-60">
                از فهرست دوستان، افراد موردنظر را انتخاب کنید.
              </DialogDescription>
            </div>
          </div>

          {selectedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-10 px-2.5 py-1 text-xs font-bold text-secondary-80 shadow-xs">
              <span className="grid size-4 place-items-center rounded-full bg-secondary-70 text-white">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              {formatNumber(selectedCount)} نفر انتخاب شده
            </span>
          )}
        </header>

        {/* Body */}
        <div className="flex flex-col gap-3 p-5">
          {/* Search Field */}
          <TextField
            label="جست‌وجو با شناسهٔ دوست"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search className="size-4.25 text-neutral-50" />}
          />

          {/* ============================================================
              Selected Friends Horizontal Strip (Positioned clean beside chips)
          ============================================================ */}
          {selectedFriends.length > 0 && (
            <section
              aria-labelledby="selected-friends-title"
              className="relative flex flex-col gap-1.5 rounded-2xl bg-secondary-10/70 p-3"
            >
              <h3
                id="selected-friends-title"
                className="flex items-center gap-1.5 text-xs font-bold text-secondary-80"
              >
                <Users className="size-4 text-secondary-70" />
                افراد انتخاب‌شده
              </h3>

              {/*
                Arrows stay mounted and just fade when they hit an edge, so the
                strip never shifts layout. Gradient fades hint at overflow.
              */}
              <div className="relative flex items-center gap-1">
                {/* Back arrow (RTL start edge) */}
                <button
                  type="button"
                  onClick={handleScrollRight}
                  aria-label="نمایش افراد قبلی"
                  disabled={!canScrollRight}
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white/90 text-secondary-80 shadow-xs ring-1 ring-secondary-20 transition-all duration-150 hover:bg-secondary-20/60 hover:ring-secondary-30 active:scale-95 disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none"
                >
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </button>

                {/* Horizontal chips strip with soft edge fades */}
                <div className="relative min-w-0 flex-1">
                  <ul
                    ref={stripRef}
                    onScroll={updateScrollArrows}
                    onWheel={handleWheel}
                    className="flex items-center gap-2 overflow-x-auto px-0.5 py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {selectedFriends.map((friend) => (
                      <li key={friend.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSelection(friend.id)}
                          aria-label={`لغو انتخاب ${friend.name}`}
                          className="group flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-secondary-30 bg-white pr-1 pl-2.5 text-caption font-bold text-secondary-80 shadow-2xs transition-all hover:border-secondary-50 hover:bg-secondary-10 active:scale-95"
                        >
                          <MemberAvatar
                            member={{ id: friend.id, name: friend.name }}
                            className="size-5.5 text-[11px]"
                          />
                          <span className="max-w-[120px] truncate">{friend.name}</span>
                          <X className="size-3.5 text-secondary-60 transition-colors group-hover:text-danger-50" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Overflow hints (fade in only while that edge has hidden chips) */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 left-0 w-7 bg-gradient-to-r from-secondary-10 to-transparent transition-opacity duration-150 ${
                      canScrollLeft ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 right-0 w-7 bg-gradient-to-l from-secondary-10 to-transparent transition-opacity duration-150 ${
                      canScrollRight ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                {/* Forward arrow (RTL end edge) */}
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  aria-label="نمایش افراد بعدی"
                  disabled={!canScrollLeft}
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white/90 text-secondary-80 shadow-xs ring-1 ring-secondary-20 transition-all duration-150 hover:bg-secondary-20/60 hover:ring-secondary-30 active:scale-95 disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none"
                >
                  <ChevronLeft className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </section>
          )}

          {/* Friends List */}
          <div
            role="group"
            aria-label="فهرست دوستان"
            className="flex max-h-60 flex-col gap-1.5 overflow-y-auto pr-0.5 pl-1 [scrollbar-width:thin]"
          >
            {filteredFriends.length === 0 ? (
              <p className="py-6 text-center text-paragraph-sm text-neutral-60">
                دوستی با این شناسه پیدا نشد.
              </p>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedIds.includes(friend.id);
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
                        member={{ id: friend.id, name: friend.name }}
                        className="size-9"
                      />
                      <div className="flex flex-col">
                        <span className="text-paragraph-sm font-bold text-primary-80">
                          {friend.name}
                        </span>
                        <span
                          dir="ltr"
                          className="text-right text-caption text-neutral-60"
                        >
                          @{friend.handle}
                        </span>
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

        {/* Footer: matching Prototype button styles & simplified text */}
        <footer className="flex items-center justify-end gap-3 border-t border-neutral-20 bg-neutral-10/50 p-4">
          <Button
            type="button"
            tone="secondary"
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="h-10 min-w-20 rounded-lg"
          >
            بستن
          </Button>
          <LoadingButton
            type="button"
            tone="secondary"
            size="lg"
            disabled={selectedCount === 0}
            isLoading={inviteMutation.isPending}
            loadingText="در حال افزودن…"
            onClick={handleAdd}
            className="h-10 rounded-lg "
          >
            افزودن
          </LoadingButton>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
