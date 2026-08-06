import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';

export interface RadarAxis {
  id: string;
  label: string;
  values: number[];
}

export interface RadarChartData {
  axes: RadarAxis[];
  labels: string[];
}

function normalizeHigherBetter(values: (number | null)[], invert = false): number[] {
  const nums = values.filter((v): v is number => v != null);
  if (!nums.length) return values.map(() => 0);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  return values.map((v) => {
    if (v == null) return 0;
    const t = (v - min) / span;
    const score = invert ? 1 - t : t;
    return Math.round(score * 100);
  });
}

export function buildCompareRadarData(hospitals: DirectoryHospital[]): RadarChartData | null {
  if (hospitals.length < 2 || hospitals.length > 3) return null;

  const labels = hospitals.map((h) => h.name.slice(0, 24));

  const axes: RadarAxis[] = [
    {
      id: 'stars',
      label: 'CMS ★',
      values: normalizeHigherBetter(hospitals.map((h) => h.overallRating)),
    },
    {
      id: 'hcahps',
      label: 'HCAHPS',
      values: normalizeHigherBetter(hospitals.map((h) => h.hcahpsStar)),
    },
    {
      id: 'hvbp',
      label: 'HVBP',
      values: normalizeHigherBetter(hospitals.map((h) => h.hvbpTps)),
    },
    {
      id: 'mspb',
      label: 'MSPB',
      values: normalizeHigherBetter(hospitals.map((h) => h.mspbScore), true),
    },
    {
      id: 'hrrp',
      label: 'HRRP',
      values: normalizeHigherBetter(hospitals.map((h) => h.hrrpAvgExcess), true),
    },
    {
      id: 'cjr',
      label: 'CJR',
      values: hospitals.map((h) => {
        const r = h.teamRankByCjr;
        if (r == null) return 0;
        return Math.round(((TEAM_MANDATED_HOSPITAL_COUNT - r + 1) / TEAM_MANDATED_HOSPITAL_COUNT) * 100);
      }),
    },
  ];

  return { axes, labels };
}

const RADAR_COLORS = ['#1e5a8a', '#2d7ab8', '#7ec8e8'];

/** Client-safe SVG for compare page (2–3 hospitals). */
export function renderCompareRadarSvg(data: RadarChartData): string {
  const { axes, labels } = data;
  const n = axes.length;
  const cx = 120;
  const cy = 120;
  const maxR = 88;

  const point = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
  };

  const polygon = (hi: number) =>
    axes
      .map((axis, i) => {
        const angle = (360 / n) * i;
        const r = ((axis.values[hi] ?? 0) / 100) * maxR;
        return point(angle, r);
      })
      .join(' ');

  const grids = [25, 50, 75, 100]
    .map((level) => {
      const r = (level / 100) * maxR;
      const pts = Array.from({ length: n }, (_, i) => point((360 / n) * i, r)).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`;
    })
    .join('');

  const spokes = axes
    .map((_, i) => {
      const [x2, y2] = point((360 / n) * i, maxR).split(',');
      return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#e2e8f0" stroke-width="1"/>`;
    })
    .join('');

  const polys = labels
    .map(
      (_, hi) =>
        `<polygon points="${polygon(hi)}" fill="${RADAR_COLORS[hi % 3]}" fill-opacity="0.15" stroke="${RADAR_COLORS[hi % 3]}" stroke-width="2"/>`,
    )
    .join('');

  const axisLabels = axes
    .map((axis, i) => {
      const [x, y] = point((360 / n) * i, maxR + 14).split(',');
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-size="8" font-weight="600">${axis.label}</text>`;
    })
    .join('');

  const legend = labels
    .map(
      (label, i) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin:0 8px;font-size:12px;font-weight:600"><span style="width:10px;height:10px;background:${RADAR_COLORS[i % 3]};border-radius:2px"></span>${label.slice(0, 28)}</span>`,
    )
    .join('');

  return `<svg viewBox="0 0 240 240" class="mx-auto h-auto max-w-md w-full" role="img" aria-label="Radar comparison">${grids}${spokes}${polys}${axisLabels}</svg><div style="text-align:center;margin-top:8px">${legend}</div>`;
}
