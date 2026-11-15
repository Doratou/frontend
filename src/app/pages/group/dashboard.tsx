import {
  GroupHeader,
  GroupHeaderMobile,
  GROUP_HEADER_MOCK_DATA,
  groupHeaderMobileMock,
} from '@/features/groups/components';

export function Component() {
  return (
    <>
      <div className="hidden w-full shrink-0 md:block">
        <GroupHeader {...GROUP_HEADER_MOCK_DATA} />
      </div>
      <div className="block w-full shrink-0 md:hidden">
        <GroupHeaderMobile {...groupHeaderMobileMock} />
      </div>
    </>
  );
}
