import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Cloud, Minus, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatPersianDecimal,
  MOCK_CITIES,
  resolveLocationName,
} from '../mock';
import type { WeatherLocation } from '../types';

interface WeatherMapPickerProps {
  location: WeatherLocation | null;
  onSelectLocation: (location: WeatherLocation) => void;
}

const IRAN_CENTER: [number, number] = [32.65, 53.68];
const IRAN_DEFAULT_ZOOM = 5;

function createPinElement(label: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className =
    'flex flex-col items-center -translate-x-1/2 -translate-y-full pointer-events-none';

  const pill = document.createElement('span');
  pill.textContent = label;
  pill.className =
    'mb-1 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 font-sans text-[11px] font-bold text-[#393a4d] shadow-sm';

  const halo = document.createElement('div');
  halo.className =
    'grid size-14 place-items-center rounded-full bg-[#a1a3c1]/25';

  const pinCircle = document.createElement('div');
  pinCircle.className =
    'grid size-9 place-items-center rounded-full bg-white/95 shadow-md';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.setAttribute('fill', '#a61f23');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  );
  svg.appendChild(path);
  pinCircle.appendChild(svg);
  halo.appendChild(pinCircle);
  wrapper.appendChild(pill);
  wrapper.appendChild(halo);

  return wrapper;
}

export function WeatherMapPicker({
  location,
  onSelectLocation,
}: WeatherMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelectLocation);
  useEffect(() => {
    onSelectRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredCities = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return MOCK_CITIES.slice(0, 6);
    return MOCK_CITIES.filter((city) => city.name.includes(query));
  }, [searchQuery]);

  // Initialize Leaflet map once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: IRAN_CENTER,
      zoom: IRAN_DEFAULT_ZOOM,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      const latitude = Number(event.latlng.lat.toFixed(4));
      const longitude = Number(event.latlng.lng.toFixed(4));
      onSelectRef.current({
        name: resolveLocationName(latitude, longitude),
        latitude,
        longitude,
      });
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync marker with selected location
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!location) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const icon = L.divIcon({
      className: 'bg-transparent border-0',
      html: createPinElement(location.name),
      iconSize: [0, 0],
      iconAnchor: [0, -28],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([location.latitude, location.longitude]);
      markerRef.current.setIcon(icon);
    } else {
      markerRef.current = L.marker([location.latitude, location.longitude], {
        icon,
        interactive: false,
      }).addTo(map);
    }
  }, [location]);

  const handleCityPick = (city: WeatherLocation) => {
    onSelectLocation(city);
    setSearchQuery(city.name);
    setIsSearchOpen(false);
    mapRef.current?.flyTo([city.latitude, city.longitude], 11, {
      duration: 0.7,
    });
  };

  return (
    <section
      aria-label="انتخاب موقعیت روی نقشه"
      className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-white p-4 dark:border-border dark:bg-card"
    >
      {/* Card Header + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70 dark:bg-secondary-80/50 dark:text-secondary-30"
          >
            <Cloud className="size-4.5" />
          </span>
          <h2 className="text-heading-6 text-foreground">
            انتخاب موقعیت روی نقشه
          </h2>
        </div>

        {/* City / Address Search */}
        <div className="relative w-full sm:w-64">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-primary-60/70 bg-white px-3 transition-colors focus-within:border-primary-60 focus-within:ring-2 focus-within:ring-primary-20/50 dark:bg-card">
            <Search className="size-4 shrink-0 text-neutral-50" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchOpen(false), 150);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="جستجوی شهر یا آدرس..."
              className="w-full bg-transparent text-caption text-foreground outline-none placeholder:text-neutral-50"
            />
          </div>

          {isSearchOpen && filteredCities.length > 0 && (
            <ul
              role="listbox"
              aria-label="نتایج جستجوی شهر"
              className="absolute inset-x-0 top-10.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-neutral-20 bg-white p-1 shadow-lg dark:border-border dark:bg-card"
            >
              {filteredCities.map((city) => (
                <li key={city.name}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCityPick(city)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-caption text-foreground transition-colors hover:bg-secondary-10 dark:hover:bg-secondary-80/40"
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-label-md text-neutral-50" dir="ltr">
                      {formatPersianDecimal(city.latitude, 2)},{' '}
                      {formatPersianDecimal(city.longitude, 2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Interactive Leaflet Map of Iran */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-secondary-60/25 md:h-70">
        <div
          ref={containerRef}
          aria-label="نقشه ایران برای انتخاب موقعیت"
          className="z-0 size-full cursor-crosshair"
        />

        {/* Zoom Controls (+ / -) */}
        <div className="absolute top-3 left-3 z-20 flex flex-col overflow-hidden rounded-lg border border-secondary-60/30 bg-white/95 shadow-xs dark:bg-card">
          <button
            type="button"
            aria-label="بزرگ‌نمایی نقشه"
            onClick={() => mapRef.current?.zoomIn()}
            className="grid size-8 place-items-center text-foreground transition-colors hover:bg-secondary-10 dark:hover:bg-secondary-80/40"
          >
            <Plus className="size-4" />
          </button>
          <div className="h-px bg-secondary-60/20" />
          <button
            type="button"
            aria-label="کوچک‌نمایی نقشه"
            onClick={() => mapRef.current?.zoomOut()}
            className="grid size-8 place-items-center text-foreground transition-colors hover:bg-secondary-10 dark:hover:bg-secondary-80/40"
          >
            <Minus className="size-4" />
          </button>
        </div>

        {/* Empty prompt overlay */}
        {location === null ? (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-secondary-60/20 bg-white/95 px-4 py-2.5 shadow-sm dark:bg-card/95">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70">
                <Search className="size-4" />
              </span>
              <span className="text-caption font-medium text-neutral-70 dark:text-foreground">
                روی نقشه کلیک کنید تا موقعیت پیش‌بینی را انتخاب کنید
              </span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg border border-secondary-60/25 bg-white/95 px-3 py-1.5 text-label-md font-medium text-neutral-60 shadow-xs dark:bg-card dark:text-neutral-30',
            )}
          >
            عرض و طول جغرافیایی:{' '}
            <span dir="ltr" className="font-bold text-foreground">
              {formatPersianDecimal(location.latitude, 3)} ,{' '}
              {formatPersianDecimal(location.longitude, 3)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
