# همیار (`assistant`)

بخش همیار گروه (مسیر `/group/:groupId/assistant` در `src/app/pages/group/assistant.tsx`) که در حال حاضر تب **آب‌وهوا** را با انتخابگر نقشهٔ تعاملی (`leaflet`)، شهرهای پرتکرار و پیش‌بینی چندروزه (حداکثر ۱۴ روز) پیاده‌سازی می‌کند و تب **چک‌لیست هوشمند** آن به‌عنوان placeholder در دسترس است.

## ساختار فایل‌ها

- `types.ts` — تایپ‌های دامنه: `AssistantTab`، `WeatherCondition`، `WeatherLocation`، `WeatherQueryParams`، `CurrentWeather`، `DailyForecastItem` و `WeatherForecast`.
- `utils.ts` — بازهٔ پیش‌بینی (`MAX_FORECAST_DAYS = 14`، `getForecastBounds`)، فرمت فارسی اعداد اعشاری/تاریخ و `resolveLocationName`.
- `api/`
  - `paths.ts` — مسیرهای `hamyarCitiesPath` (`/groups/:groupId/hamyar/cities`) و `hamyarWeatherPath` (`/groups/:groupId/hamyar/weather`).
  - `contracts.ts` — schemaهای `hamyarCitySchema`، `hamyarCitiesResponseSchema`، `hamyarWeatherResponseSchema` و تابع `unwrapEnvelope`.
  - `get-cities.ts` — `getPopularCities` برای دریافت شهرهای پیشنهادی.
  - `get-weather.ts` — `getWeatherForecast` و `mapWmoCode` برای تبدیل کدهای WMO به وضعیت فارسی و وضعیت آیکون.
  - `query-keys.ts` — `assistantKeys` (`all`، `group`، `cities`، `weather`).
- `hooks/`
  - `use-assistant-group-id.ts` — خواندن شناسهٔ عددی `groupId` (یا پیشوند عددی `slug`) از پارامترهای مسیر.
  - `use-popular-cities.ts` — `usePopularCities`.
  - `use-weather-forecast.ts` — `useWeatherForecast`.
- `components/`
  - `assistant-view.tsx` — نمای اصلی با تعویض تب `weather` / `checklist`، اتصال نقشه، پارامترها و نتایج.
  - `weather-map-picker.tsx` — انتخاب موقعیت مکانی روی نقشهٔ `leaflet` یا انتخاب شهر.
  - `forecast-params-card.tsx` — فرم انتخاب بازهٔ تاریخ شمسی و ارسال درخواست پیش‌بینی.
  - `weather-results.tsx` — نمایش وضعیت فعلی و پیش‌بینی روزانه (همراه با حالت loading/error/retry).
  - `weather-icon.tsx` و `weather-icon.css` — آیکون‌ها و استایل وضعیت‌های آب‌وهوا.
