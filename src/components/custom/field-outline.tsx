import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

type Geometry = {
  width: number;
  height: number;
  labelX: number;
  labelWidth: number;
};

export function FieldOutline({ label }: { label: string }) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [geometry, setGeometry] = useState<Geometry>({
    width: 0,
    height: 0,
    labelX: 0,
    labelWidth: 0,
  });

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const measure = measureRef.current;
    const root = svg?.parentElement;
    const text = measure?.firstElementChild;
    if (!root || !measure || !text) return;
    let width = 0;
    let height = 0;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.borderBoxSize[0];
        if (entry.target === root && box) {
          width = box.inlineSize;
          height = box.blockSize;
        }
      }
      if (!width || !height) return;
      const frame = root.getBoundingClientRect();
      const textFrame = text.getBoundingClientRect();
      const scale = frame.width / width;
      const next = {
        width,
        height,
        labelX: (textFrame.left - frame.left) / scale,
        labelWidth: textFrame.width / scale,
      };
      setGeometry((previous) =>
        previous.width === next.width &&
        previous.height === next.height &&
        previous.labelX === next.labelX &&
        previous.labelWidth === next.labelWidth
          ? previous
          : next,
      );
    });
    observer.observe(root);
    observer.observe(measure);
    observer.observe(text);
    return () => observer.disconnect();
  }, []);

  const { width, height, labelX, labelWidth } = geometry;
  const frame = { width, height, rx: 8 };
  const maskBounds = { x: -8, y: -16, width: width + 16, height: height + 32 };

  return (
    <>
      <span
        ref={measureRef}
        aria-hidden="true"
        className="dorato-label-measure pointer-events-none absolute start-0 flex w-max max-w-full overflow-hidden whitespace-nowrap"
      >
        <span className="min-w-0 overflow-hidden">{label}</span>
      </span>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="dorato-field-outline pointer-events-none absolute inset-0 size-full"
        viewBox={`0 0 ${width || 1} ${height || 1}`}
        style={
          {
            '--field-halo-mask-default': `url(#${id}-outside)`,
            '--field-border-clip-default': `url(#${id}-inside)`,
          } as CSSProperties
        }
      >
        <defs>
          <clipPath id={`${id}-inside`}>
            <rect {...frame} />
          </clipPath>
          <mask id={`${id}-outside`} maskUnits="userSpaceOnUse" {...maskBounds}>
            <rect {...maskBounds} fill="white" />
            <rect {...frame} fill="black" />
          </mask>
          <mask id={`${id}-notch`} maskUnits="userSpaceOnUse" {...maskBounds}>
            <rect {...maskBounds} fill="white" />
            <rect
              className="dorato-field-notch"
              x={labelX - 4}
              y={-11}
              width={labelWidth + 8}
              height={22}
              rx={4}
              fill="black"
            />
          </mask>
        </defs>
        <g mask={`url(#${id}-notch)`} fill="none">
          <rect {...frame} className="dorato-field-halo" />
          <rect {...frame} className="dorato-field-border" />
        </g>
      </svg>
    </>
  );
}
