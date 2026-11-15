export const LOTTERY_MIN_OPTIONS = 2;
// The wheel component renders between 2 and 24 sectors (the API allows 100).
export const LOTTERY_MAX_OPTIONS = 24;
export const LOTTERY_TITLE_MAX_LENGTH = 60;
export const LOTTERY_OPTION_MAX_LENGTH = 40;
// Weighted lotteries are entered as percentages that add up to this total.
export const LOTTERY_WEIGHT_TOTAL = 100;
// The history table shows the latest completed draws; there is no pagination UI.
export const LOTTERY_HISTORY_LIMIT = 20;

// SVG props need concrete values, so these hex codes mirror colors.css.
// Every color keeps enough contrast against the white sector text.
const WHEEL_PALETTE: readonly string[] = [
  '#5650b0', // primary-60
  '#018576', // secondary-70
  '#a7700d', // accent-60
  '#d93a3f', // danger-40
  '#0f51a9', // info-50
  '#7771d9', // primary-50
];

// The wheel repeats the palette around the circle, and the first and last
// sectors touch each other. They end up with the same color when
// `sectorCount % paletteLength === 1`, so pick a length that avoids it.
export function pickWheelColors(sectorCount: number): string[] {
  const length = [4, 5, 3, 6, 2].find((n) => sectorCount % n !== 1) ?? 2;
  return WHEEL_PALETTE.slice(0, length);
}

export const WHEEL_THEME = {
  frameColor: '#231f5e', // primary-80
  sticksColor: '#f9b233', // accent-40
  borderColor: '#fcfcff', // neutral-10
  borderWidth: 2,
  textColor: '#fcfcff', // neutral-10
  textFontSize: 22,
  middleColor: '#f9b233', // accent-40
  middleDotColor: '#7f5201', // accent-70
  winIndicatorColor: '#f9b233', // accent-40
  winIndicatorDotColor: '#7f5201', // accent-70
  wheelShadowOpacity: 0.25,
  middleShadowOpacity: 0.3,
  indicatorShadowOpacity: 0.35,
  duration: 5,
} as const;
