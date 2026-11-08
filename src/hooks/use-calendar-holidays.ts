import {
  queryOptions,
  useQueries,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  holidayRefreshMs,
  holidayService,
  mergeHolidayItems,
  type HolidayResult,
} from '@/lib/holidays/holiday-service';
import { jalaliParts } from '@/lib/persian-date';

function combineHolidays(queries: UseQueryResult<HolidayResult>[]) {
  return {
    items: mergeHolidayItems(
      queries.flatMap((query) => query.data?.items ?? []),
    ),
    loading: queries.some(
      (query) => query.isPending && query.fetchStatus !== 'idle',
    ),
    stale: queries.some((query) => query.data?.stale),
    unavailable: queries.some((query) => query.isError),
    refreshing: queries.some((query) => query.isFetching),
  };
}

export function useCalendarHolidays(month: Date, enabled = true) {
  const { year, month: monthNumber } = jalaliParts(month);
  const client = useQueryClient();
  const years = [
    year,
    ...(monthNumber === 1 ? [year - 1] : []),
    ...(monthNumber >= 11 ? [year + 1] : []),
  ].filter((value) => value >= 1347);
  const result = useQueries({
    queries: [
      ...years.map((value) =>
        queryOptions({
          queryKey: ['calendar-holidays', value] as const,
          queryFn: () => holidayService.getYear(value),
          enabled,
          staleTime: holidayRefreshMs,
          gcTime: holidayRefreshMs,
          retry: false,
          refetchInterval: (query) =>
            query.state.data?.stale ? 5 * 60_000 : holidayRefreshMs,
        }),
      ),
      queryOptions({
        queryKey: ['calendar-events', year, monthNumber],
        queryFn: () => holidayService.getMonth(year, monthNumber),
        enabled: enabled && year >= 1347,
        staleTime: holidayRefreshMs,
        gcTime: holidayRefreshMs,
        retry: false,
        refetchInterval: (query) =>
          query.state.data?.stale ? 5 * 60_000 : holidayRefreshMs,
      }),
    ],
    combine: combineHolidays,
  });
  return {
    ...result,
    loading: enabled && result.loading,
    unavailable: enabled && (year < 1347 || result.unavailable),
    refresh: async () => {
      for (const value of years) holidayService.invalidate(value);
      await Promise.all([
        client.invalidateQueries({ queryKey: ['calendar-holidays'] }),
        client.invalidateQueries({ queryKey: ['calendar-events', year] }),
      ]);
    },
  };
}
