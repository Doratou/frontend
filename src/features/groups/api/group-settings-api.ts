import { dateToApi, inIran } from '@/lib/persian-date';
import type { FriendItem, GroupSettingsData } from '../types';

// v2: previous previews stored an invalid jalali-formatted expiry; a fresh
// storage namespace keeps the initial data authoritative.
const STORAGE_KEY_PREFIX = 'dorato_group_settings_v2_';

const initialGroupData: GroupSettingsData = {
  id: 'shomal1405',
  title: 'اکیپ سفر شمال ۱۴۰۵',
  description: 'هماهنگی سفر، دنگ، چک‌لیست و خاطره‌ها',
  status: 'ACTIVE',
  plan: 'NORMAL',
  groupPhotoSrc: '',
  creator: {
    id: '1',
    name: 'امیر رضایی',
  },
  createdDateLabel: '۲۵ خرداد ۱۴۰۵',
  dateRangeLabel: 'از ۲۵ تا ۲۹ خرداد ۱۴۰۵',
  storage: {
    usedGb: 1.2,
    totalGb: 5,
  },
  members: [
    { id: '1', name: 'امیر رضایی', role: 'OWNER' },
    { id: '2', name: 'سارا محمدی', role: 'MEMBER' },
    { id: '3', name: 'نیما کاظمی', role: 'MEMBER' },
    { id: '4', name: 'مینا احمدی', role: 'MEMBER' },
    { id: '5', name: 'رضا نادری', role: 'MEMBER' },
    { id: '6', name: 'نگار حسینی', role: 'MEMBER' },
  ],
  linkSettings: {
    inviteUrl: 'https://dorato.app/join/shomal1405?key=8829',
    password: '88291405',
    maxUses: 50,
    // The picker expects a gregorian ISO date (YYYY-MM-DD) and renders it jalali.
    expiryDate: dateToApi(inIran()),
  },
};

const initialFriends: FriendItem[] = [
  { id: 'arman.k', name: 'آرمان کریمی', handle: 'arman.k' },
  { id: 'hasti.m', name: 'هستی مرادی', handle: 'hasti.m' },
  { id: 'parsa.y', name: 'پارسا یوسفی', handle: 'parsa.y' },
  { id: 'reyhaneh.s', name: 'ریحانه صالحی', handle: 'reyhaneh.s' },
  { id: 'sepehr.n', name: 'سپهر نوری', handle: 'sepehr.n' },
];

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadState(groupId: string): GroupSettingsData {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${groupId}`);
    if (raw) {
      return JSON.parse(raw) as GroupSettingsData;
    }
  } catch {
    // Local storage unavailable or corrupt; use default
  }
  return { ...initialGroupData, id: groupId };
}

function saveState(groupId: string, data: GroupSettingsData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${groupId}`, JSON.stringify(data));
  } catch {
    // Non-fatal
  }
}

export async function getGroupSettings(groupId: string): Promise<GroupSettingsData> {
  await delay();
  return loadState(groupId);
}

export async function updateGroupInfo(
  groupId: string,
  data: { title: string; description: string },
): Promise<GroupSettingsData> {
  await delay();
  const current = loadState(groupId);
  const updated: GroupSettingsData = {
    ...current,
    title: data.title.trim() || current.title,
    description: data.description.trim(),
  };
  saveState(groupId, updated);
  return updated;
}

export async function removeGroupMember(
  groupId: string,
  memberId: string,
): Promise<GroupSettingsData> {
  await delay();
  const current = loadState(groupId);
  const updated: GroupSettingsData = {
    ...current,
    members: current.members.filter((m) => m.id !== memberId),
  };
  saveState(groupId, updated);
  return updated;
}

export async function inviteGroupMembers(
  groupId: string,
  friendIds: string[],
): Promise<GroupSettingsData> {
  await delay();
  const current = loadState(groupId);
  const newMembers = initialFriends
    .filter((f) => friendIds.includes(f.id))
    .filter((f) => !current.members.some((m) => m.name === f.name || m.id === f.id))
    .map((f) => ({
      id: f.id,
      name: f.name,
      handle: f.handle,
      role: 'MEMBER' as const,
    }));

  const updated: GroupSettingsData = {
    ...current,
    members: [...current.members, ...newMembers],
  };
  saveState(groupId, updated);
  return updated;
}

export async function updateGroupPhoto(
  groupId: string,
  photoSrc: string,
): Promise<GroupSettingsData> {
  await delay();
  const current = loadState(groupId);
  // An empty src clears the photo and falls back to the letter avatar.
  const updated: GroupSettingsData = { ...current, groupPhotoSrc: photoSrc || undefined };
  saveState(groupId, updated);
  return updated;
}

export async function updateGroupLink(
  groupId: string,
  data: { password?: string; maxUses?: number | null; expiryDate?: string | null },
): Promise<GroupSettingsData> {
  await delay();
  const current = loadState(groupId);
  const updated: GroupSettingsData = {
    ...current,
    linkSettings: {
      ...current.linkSettings,
      ...(data.password !== undefined && { password: data.password }),
      ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
      ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
    },
  };
  saveState(groupId, updated);
  return updated;
}

export async function archiveGroup(
  groupId: string,
  archive: boolean,
): Promise<GroupSettingsData> {
  await delay();
  const current = loadState(groupId);
  const updated: GroupSettingsData = {
    ...current,
    status: archive ? 'ARCHIVED' : 'ACTIVE',
  };
  saveState(groupId, updated);
  return updated;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await delay();
  const current = loadState(groupId);
  const updated: GroupSettingsData = {
    ...current,
    members: [],
  };
  saveState(groupId, updated);
}

export async function getFriendsList(): Promise<FriendItem[]> {
  await delay();
  return initialFriends;
}
