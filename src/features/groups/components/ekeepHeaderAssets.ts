// src/components/EkeepHeader/ekeepHeaderAssets.ts

// تصویر شفاف ۱×۱ پیکسل معتبر برای جلوگیری از خطای Build تا زمان قرارگیری فایل‌های واقعی
const TRANSPARENT_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/*
 * TODO: پس از افزودن فایل‌های واقعی به مسیر src/assets/ekeep-header/،
 * خطوط ایمپورت زیر را فعال و در آبجکت EKEEP_HEADER_ASSETS جایگزین کنید:
 *
 * import ekeepHeaderBanner from '@/assets/ekeep-header/ekeep-header-banner.png';
 * import groupPhotoSample from '@/assets/ekeep-header/group-photo-sample.png';
 * import memberAvatarSample from '@/assets/ekeep-header/member-avatar-sample.png';
 * import creatorAvatarSample from '@/assets/ekeep-header/creator-avatar-sample.png';
 * import iconHeaderSettings from '@/assets/ekeep-header/icon-header-settings.png';
 * import iconHeaderCrown from '@/assets/ekeep-header/icon-header-crown.png';
 * import iconHeaderMore from '@/assets/ekeep-header/icon-header-more.png';
 * import iconHeaderGroupType from '@/assets/ekeep-header/icon-header-group-type.png';
 * import iconHeaderDot from '@/assets/ekeep-header/icon-header-dot.png';
 * import iconHeaderLeaf from '@/assets/ekeep-header/icon-header-leaf.png';
 * import iconMetaCloud from '@/assets/ekeep-header/icon-meta-cloud.png';
 * import iconMetaUser from '@/assets/ekeep-header/icon-meta-user.png';
 */

import EkeepBanner from '../../../assets/group/dashboard-header.svg';

export const EKEEP_HEADER_ASSETS = {
  banner: EkeepBanner, // ekeep-header-banner.png (1238×218)
  groupPhotoSample: TRANSPARENT_PNG, // group-photo-sample.png (132×132)
  memberAvatarSample: TRANSPARENT_PNG, // member-avatar-sample.png (32×32)
  creatorAvatarSample: TRANSPARENT_PNG, // creator-avatar-sample.png (24×24)
  iconSettings: TRANSPARENT_PNG, // icon-header-settings.png (24×24)
  iconCrown: TRANSPARENT_PNG, // icon-header-crown.png (24×24)
  iconMore: TRANSPARENT_PNG, // icon-header-more.png (24×24)
  iconGroupType: TRANSPARENT_PNG, // icon-header-group-type.png (24×24)
  iconDot: TRANSPARENT_PNG, // icon-header-dot.png (24×24)
  iconLeaf: TRANSPARENT_PNG, // icon-header-leaf.png (24×24)
  iconMetaCloud: TRANSPARENT_PNG, // icon-meta-cloud.png (20×20)
  iconMetaUser: TRANSPARENT_PNG, // icon-meta-user.png (20×20)
  iconMetaCalendar: TRANSPARENT_PNG, // icon-meta-calendar.png (20×20)
  mobileBanner: EkeepBanner,          // ekeep-header-mobile-banner.png (1671×295)
  memberAvatarDefault: TRANSPARENT_PNG,   // member-avatar-default.png (32×32)
  memberAvatarInitialBg: TRANSPARENT_PNG, // member-avatar-initial-bg.png (32×32)
};
