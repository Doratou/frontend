import { cn } from '@/lib/utils';
import type { WeatherCondition } from '../types';
import './weather-icon.css';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

const SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const PARTLY_SUN_RAY_ANGLES = [0, 60, 120, 180, 240, 300];
const RAIN_DROPS = [
  { x1: 11.5, x2: 10, delay: '0s' },
  { x1: 16, x2: 14.5, delay: '0.35s' },
  { x1: 20.5, x2: 19, delay: '0.7s' },
];

export function WeatherIcon({ condition, className }: WeatherIconProps) {
  if (condition === 'sunny') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className={cn('size-5', className)}
      >
        <g className="weather-sun-rays">
          {SUN_RAY_ANGLES.map((angle) => (
            <line
              key={angle}
              x1="16"
              y1="3.5"
              x2="16"
              y2="6.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              transform={`rotate(${angle} 16 16)`}
            />
          ))}
        </g>
        <circle
          cx="16"
          cy="16"
          r="5.5"
          fill="currentColor"
          fillOpacity="0.22"
          stroke="currentColor"
          strokeWidth="2"
          className="weather-sun-core"
        />
      </svg>
    );
  }

  if (condition === 'partly-cloudy') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className={cn('size-5', className)}
      >
        <g className="weather-sun-rays">
          {PARTLY_SUN_RAY_ANGLES.map((angle) => (
            <line
              key={angle}
              x1="21"
              y1="4.5"
              x2="21"
              y2="6.5"
              stroke="#f9b233"
              strokeWidth="1.8"
              strokeLinecap="round"
              transform={`rotate(${angle} 21 11)`}
            />
          ))}
        </g>
        <circle cx="21" cy="11" r="4" fill="#f9b233" />
        <path
          d="M9.5 24.5h12.2a4.3 4.3 0 0 0 .5-8.57 6 6 0 0 0-11.45-1.43A4.7 4.7 0 0 0 9.5 24.5Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
          className="weather-cloud-front"
        />
      </svg>
    );
  }

  if (condition === 'rainy') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className={cn('size-5', className)}
      >
        <path
          d="M9 19.5h13a4 4 0 0 0 .5-7.97 5.7 5.7 0 0 0-10.9-1.36A4.5 4.5 0 0 0 9 19.5Z"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
          className="weather-cloud-front"
        />
        {RAIN_DROPS.map((drop) => (
          <line
            key={drop.x1}
            x1={drop.x1}
            y1="22"
            x2={drop.x2}
            y2="25.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="weather-rain-drop"
            style={{ animationDelay: drop.delay }}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('size-5', className)}
    >
      <path
        d="M14 14.5h9a3.2 3.2 0 0 0 .3-6.38 4.4 4.4 0 0 0-8.4-1.05"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="weather-cloud-back"
      />
      <path
        d="M8.5 23.5h13a4.3 4.3 0 0 0 .5-8.57 6 6 0 0 0-11.45-1.43A4.7 4.7 0 0 0 8.5 23.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        className="weather-cloud-front"
      />
    </svg>
  );
}
