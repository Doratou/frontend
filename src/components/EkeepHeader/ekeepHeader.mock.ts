// src/components/EkeepHeader/ekeepHeader.mock.ts
import { EKEEP_HEADER_ASSETS } from './ekeepHeaderAssets';
import type { EkeepHeaderProps } from './EkeepHeader.tsx';

export const EKEEP_HEADER_MOCK_DATA: EkeepHeaderProps = {
  title: 'اکیپ سفر شمال ۱۴۰۵',
  description: 'هماهنگی سفر، دنگ، چک‌لیست و خاطره‌ها',
  statusLabel: 'فعال',
  typeLabel: 'گروه عادی',
  groupPhotoSrc: EKEEP_HEADER_ASSETS.groupPhotoSample,
  members: [
    {
      id: '1',
      name: 'کاربر ۱',
      avatarSrc: EKEEP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '2',
      name: 'کاربر ۲',
      avatarSrc: EKEEP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '3',
      name: 'کاربر ۳',
      avatarSrc: EKEEP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '4',
      name: 'کاربر ۴',
      avatarSrc: EKEEP_HEADER_ASSETS.memberAvatarSample,
    },
    {
      id: '5',
      name: 'کاربر ۵',
      avatarSrc: EKEEP_HEADER_ASSETS.memberAvatarSample,
    },
  ],
  maxVisibleMembers: 3,
  storage: {
    usedGb: 1.2,
    totalGb: 5,
  },
  creator: {
    name: 'علی رضایی',
    avatarSrc: EKEEP_HEADER_ASSETS.creatorAvatarSample,
  },
  dateRangeLabel: 'از ۲۵ تا ۲۹ خرداد ۱۴۰۵',
};
