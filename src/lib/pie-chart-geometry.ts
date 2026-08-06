import type { DistributionBin } from '@/lib/metric-distribution';
import { pieColorForLabel } from '@/lib/pie-chart-colors';

/** Slices that use an outer ★ callout instead of a cramped in-slice name. */
const PIE_MARKER_LABELS = new Set(['Top 50']);

/** In-slice percent only — no segment name text on the wedge. */
const PIE_HIDE_IN_SLICE_NAME = new Set(['Unrated']);

export interface PieSliceGeom {
  label: string;
  count: number;
  pct: number;
  color: string;
  pathD: string;
  showLabel: boolean;
  /** In-slice segment name (off when a marker callout carries the name). */
  showInSliceName: boolean;
  labelX: number;
  labelY: number;
  showMarker: boolean;
  markerX: number;
  markerY: number;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  if (endDeg - startDeg >= 359.99) {
    return `M ${cx} ${cy} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
  }
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

export function buildPieSliceGeometry(
  bins: DistributionBin[],
  size: number,
): PieSliceGeom[] {
  const active = bins.filter((b) => b.count > 0);
  if (!active.length) return [];

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const total = active.reduce((s, b) => s + b.count, 0) || 1;
  let angle = -90;

  return active.map((bin, i) => {
    const sweep = (bin.count / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    const mid = start + sweep / 2;
    const labelR = r * 0.58;
    const pos = polar(cx, cy, labelR, mid);
    const useMarker = PIE_MARKER_LABELS.has(bin.label);
    const markerPos = polar(cx, cy, r * 0.78, mid);
    return {
      label: bin.label,
      count: bin.count,
      pct: bin.pct,
      color: pieColorForLabel(bin.label, i),
      pathD: slicePath(cx, cy, r, start, end),
      showLabel: sweep >= 14,
      showInSliceName:
        !useMarker && !PIE_HIDE_IN_SLICE_NAME.has(bin.label) && sweep >= 20,
      labelX: pos.x,
      labelY: pos.y,
      showMarker: useMarker,
      markerX: markerPos.x,
      markerY: markerPos.y,
    };
  });
}
