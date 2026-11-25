import React from 'react';
import {
  GroupPageHeader as BaseGroupPageHeader,
  type GroupPageHeaderProps,
} from '@/components/custom/group-page-header';

export type { GroupPageHeaderProps };

export const GroupPageHeader: React.FC<GroupPageHeaderProps> = (props) => {
  return <BaseGroupPageHeader {...props} />;
};

export const GroupTabHeader: React.FC<GroupPageHeaderProps> = (props) => {
  return <BaseGroupPageHeader {...props} />;
};

export default GroupPageHeader;
