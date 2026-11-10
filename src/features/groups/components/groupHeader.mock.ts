// src/components/GroupHeader/groupHeader.mock.ts
import { GROUP_HEADER_ASSETS } from './groupHeaderAssets';
import type { GroupHeaderProps } from './GroupHeader.tsx';

export const GROUP_HEADER_MOCK_DATA: GroupHeaderProps = {
  title: 'اکیپ سفر شمال ۱۴۰۵',
  description: 'هماهنگی سفر، دنگ، چک‌لیست و خاطره‌ها',
  statusLabel: 'فعال',
  typeLabel: 'گروه عادی',
  groupPhotoSrc: GROUP_HEADER_ASSETS.groupPhotoSample,
  members: [
    {
      id: '1',
      name: 'کاربر ۱',
      avatarSrc: GROUP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '2',
      name: 'کاربر ۲',
      avatarSrc: GROUP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '3',
      name: 'کاربر ۳',
      avatarSrc: GROUP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '4',
      name: 'کاربر ۴',
      avatarSrc: GROUP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '5',
      name: 'کاربر ۵',
      avatarSrc: GROUP_HEADER_ASSETS.memberAvatarSample,
    },
  ],
  maxVisibleMembers: 3,
  storage: {
    usedGb: 1.2,
    totalGb: 5,
  },
  creator: {
    name: 'علی رضایی',
    avatarSrc: GROUP_HEADER_ASSETS.creatorAvatarSample,
  },
  dateRangeLabel: 'از ۲۵ تا ۲۹ خرداد ۱۴۰۵',
};

export const groupHeaderMobileMock: GroupHeaderProps = {
  ...GROUP_HEADER_MOCK_DATA,
  members: [
    {
      id: '1',
      name: 'کاربر ۱',
      avatarSrc: GROUP_HEADER_ASSETS.memberAvatarSample,
    },
    { id: '2', name: 'Ali' }, // نمایش با حرف اول 'A'
    { id: '3' }, // نمایش با آواتار پیش‌فرض
    { id: '4', name: 'کاربر ۴' },
    { id: '5', name: 'کاربر ۵' },
  ],
};
