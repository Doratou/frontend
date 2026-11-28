import { useMemo, useState } from 'react';
import { CheckSquare, Sparkles } from 'lucide-react';
import { ErrorState } from '@/components/custom/error-state';
import { GroupPageHeader } from '@/components/custom/group-page-header';
import { cn } from '@/lib/utils';
import { useAssistantGroupId } from '../hooks/use-assistant-group-id';
import { usePopularCities } from '../hooks/use-popular-cities';
import { useWeatherForecast } from '../hooks/use-weather-forecast';
import { getForecastBounds } from '../utils';
import type {
  AssistantTab,
  WeatherLocation,
  WeatherQueryParams,
} from '../types';
import { ForecastParamsCard } from './forecast-params-card';
import { WeatherMapPicker } from './weather-map-picker';
import { WeatherResults } from './weather-results';

const ASSISTANT_TABS: { value: AssistantTab; label: string }[] = [
  { value: 'weather', label: 'آب و هوا' },
  { value: 'checklist', label: 'چک لیست' },
];

export function AssistantView() {
  const groupId = useAssistantGroupId();
  const [activeTab, setActiveTab] = useState<AssistantTab>('weather');
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<WeatherQueryParams | null>(
    null,
  );

  const { minDateApi, maxDateApi } = useMemo(() => getForecastBounds(), []);
  const { cities } = usePopularCities(groupId);
  const weatherQuery = useWeatherForecast(groupId, queryParams);

  const handleStartDateChange = (nextStart: string | null) => {
    setStartDate(nextStart);
    if (nextStart && endDate && endDate < nextStart) {
      setEndDate(nextStart);
    }
  };

  const handleFetchForecast = () => {
    if (!location || !startDate || !endDate) return;
    setQueryParams({
      lat: location.latitude,
      lng: location.longitude,
      startDate,
      endDate,
    });
  };

  if (groupId === null) {
    return (
      <ErrorState error={new Error('Missing group id')} title="اکیپ پیدا نشد" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <GroupPageHeader title="همیار" logo={<Sparkles className="size-6" />} />

      <div className="flex flex-col gap-4 rounded-2xl border border-secondary-60/30 bg-white p-4 md:p-5 dark:border-border dark:bg-card">
        {/* Segmented Tab Switcher */}
        <div className="flex items-center">
          <div
            role="tablist"
            aria-label="بخش‌های همیار"
            className="grid w-full grid-cols-2 items-center gap-1 rounded-xl border border-secondary-20/70 bg-secondary-10/60 p-1 sm:inline-flex sm:w-auto dark:border-secondary-80/50 dark:bg-secondary-80/25"
          >
            {ASSISTANT_TABS.map((tab) => {
              const isSelected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-center text-button-sm transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60 sm:py-1.5',
                    isSelected
                      ? 'bg-secondary-70 text-white shadow-xs'
                      : 'text-secondary-70 hover:bg-secondary-20/50 dark:text-secondary-30',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'weather' ? (
          <div className="flex flex-col gap-4">
            {/* Upper Row: Map Picker (Right/Start) + Forecast Params (Left/End) */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <WeatherMapPicker
                  cities={cities}
                  location={location}
                  onSelectLocation={setLocation}
                />
              </div>
              <div className="lg:col-span-5">
                <ForecastParamsCard
                  location={location}
                  startDate={startDate}
                  endDate={endDate}
                  minDateApi={minDateApi}
                  maxDateApi={maxDateApi}
                  isLoading={weatherQuery.isFetching}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={setEndDate}
                  onSubmit={handleFetchForecast}
                />
              </div>
            </div>

            {/* Lower Row: Empty / Loading / Error / Forecast Results */}
            <WeatherResults
              forecast={weatherQuery.data ?? null}
              isLoading={weatherQuery.isFetching}
              isError={weatherQuery.isError}
              error={weatherQuery.error}
              onRetry={() => void weatherQuery.refetch()}
            />
          </div>
        ) : (
          <section
            aria-label="چک لیست هوشمند"
            className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-neutral-20 bg-neutral-10/60 px-6 py-16 text-center dark:border-border dark:bg-card/50"
          >
            <span
              aria-hidden="true"
              className="mb-3 grid size-12 place-items-center rounded-xl bg-secondary-20/70 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-30"
            >
              <CheckSquare className="size-6" />
            </span>
            <h2 className="text-heading-6 text-foreground">
              بخش چک‌لیست به‌زودی اضافه می‌شود
            </h2>
            <p className="mt-1.5 max-w-md text-caption leading-relaxed text-neutral-50">
              در این بخش می‌توانید چک‌لیست هوشمند سفر و وسایل موردنیاز اکیپ را
              بر اساس مقصد و وضعیت آب‌وهوا بسازید.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
