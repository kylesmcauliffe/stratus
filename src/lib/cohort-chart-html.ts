import type { MetricDistribution } from '@/lib/metric-distribution';
import { medianLabelForDistribution } from '@/lib/metric-distribution';
import type { PipelineBreakdown } from '@/lib/system-rollups';
import type { RegionBreakdownRow } from '@/lib/region-breakdown';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

import { pieColorForLabel } from '@/lib/pie-chart-colors';

/** Pie + color legend (clickable rows when binLinks provided). */
export function renderMetricDistributionPieHtml(
  distribution: MetricDistribution,
  options?: {
    bare?: boolean;
    binLinks?: Record<string, string>;
  },
): string {
  const activeBins = distribution.bins.filter((b) => b.count > 0);
  if (activeBins.length === 0) {
    return `<p class="text-brand-gray-500 text-[0.65rem]">No data in cohort.</p>`;
  }

  const total = activeBins.reduce((s, b) => s + b.count, 0) || 1;
  let acc = 0;
  const stops: string[] = [];
  activeBins.forEach((bin, i) => {
    const color = pieColorForLabel(bin.label, i);
    const slicePct = (bin.count / total) * 100;
    const start = acc;
    acc += slicePct;
    stops.push(`${color} ${start}% ${acc}%`);
  });

  const chart = `<div
    class="metric-pie-chart size-[4.75rem] shrink-0 rounded-full ring-1 ring-brand-gray-200/80"
    style="background: conic-gradient(from -90deg, ${stops.join(', ')})"
    role="img"
    aria-label="${escapeHtml(distribution.title)} distribution"
  ></div>`;

  const legend = activeBins
    .map((bin, i) => {
      const color = pieColorForLabel(bin.label, i);
      const href = options?.binLinks?.[bin.label];
      const inner = `<span class="metric-pie-legend__swatch size-2.5 shrink-0 rounded-sm" style="background-color:${color}" aria-hidden="true"></span>
        <span class="text-brand-gray-800 min-w-0 flex-1 font-medium">${escapeHtml(bin.label)}</span>
        <span class="text-brand-gray-900 shrink-0 tabular-nums font-bold">${bin.count}<span class="text-brand-gray-500 font-normal"> (${bin.pct}%)</span></span>`;
      const content = href
        ? `<a href="${escapeHtml(href)}" class="dir-entity-link metric-pie-legend__link hover:bg-brand-sky/40 flex w-full items-center gap-1.5 rounded-sm px-0.5 py-0.5">${inner}</a>`
        : `<div class="flex w-full items-center gap-1.5 px-0.5 py-0.5">${inner}</div>`;
      return `<li>${content}</li>`;
    })
    .join('');

  const body = `<div class="metric-distribution-pie__body flex items-center gap-3">
    ${chart}
    <ul class="metric-pie-legend min-w-0 flex-1 space-y-0.5 text-[0.6rem]" role="list">${legend}</ul>
  </div>`;

  if (options?.bare) {
    return `<div class="metric-distribution-pie min-w-0">
      <h3 class="text-brand-blue mb-1.5 text-[0.65rem] font-bold">${escapeHtml(distribution.title)}</h3>
      ${body}
    </div>`;
  }

  return `<div class="metric-distribution-pie border-brand-gray-200 min-w-0 rounded-md border bg-white px-2 py-1.5">
    <h3 class="text-brand-blue mb-1.5 text-[0.65rem] font-bold">${escapeHtml(distribution.title)}</h3>
    ${body}
  </div>`;
}

export function renderMetricDistributionHtml(
  distribution: MetricDistribution,
  options?: {
    highlightBin?: string;
    markerNote?: string;
    bare?: boolean;
    /** Label → href; rows become links (e.g. roster filters on home). */
    binLinks?: Record<string, string>;
  },
): string {
  const med =
    distribution.median != null ? medianLabelForDistribution(distribution) : null;
  const marker = options?.markerNote
    ? `<p class="text-brand-blue mb-1 text-[0.6rem] font-semibold">${escapeHtml(options.markerNote)}</p>`
    : '';
  const bins = distribution.bins
    .map((bin) => {
      const width = bin.pct;
      const highlight =
        options?.highlightBin && bin.label === options.highlightBin
          ? ' metric-distribution__bin--highlight'
          : '';
      const badge =
        highlight && options?.markerNote
          ? '<span class="text-brand-blue ml-1 text-[0.55rem] font-bold">◆</span>'
          : '';
      const href = options?.binLinks?.[bin.label];
      const rowInner = `<div class="flex items-center justify-between gap-2 text-[0.6rem]">
          <span class="text-brand-gray-700 w-12 shrink-0 font-medium">${escapeHtml(bin.label)}${badge}</span>
          <span class="text-brand-gray-900 shrink-0 tabular-nums font-bold">
            ${bin.count}<span class="text-brand-gray-500 font-normal"> (${bin.pct}%)</span>
          </span>
        </div>
        <div class="ind-bar-track mt-0.5 h-1.5" aria-hidden="true">
          <div class="ind-bar-fill ind-bar-fill--mix h-full" style="width: ${width}%"></div>
        </div>`;
      const row = href
        ? `<a href="${escapeHtml(href)}" class="dir-entity-link block rounded-sm px-0.5 py-0.5 hover:bg-brand-sky/30">${rowInner}</a>`
        : rowInner;
      return `<li class="${highlight.trim()}">${row}</li>`;
    })
    .join('');
  const medianHtml = med
    ? `<span class="text-brand-gray-600 text-[0.6rem]">Median: <span class="font-semibold tabular-nums">${escapeHtml(med)}</span></span>`
    : '';
  const body = `${marker}<ul class="space-y-0.5" role="list">${bins}</ul>`;
  if (options?.bare) {
    return `<div class="metric-distribution__pane min-w-0">
      ${medianHtml ? `<div class="mb-1 flex flex-wrap items-baseline justify-end gap-1">${medianHtml}</div>` : ''}
      ${body}
    </div>`;
  }
  return `<div class="metric-distribution border-brand-gray-200 min-w-0 rounded-md border bg-white px-2 py-1.5">
    <div class="mb-1 flex flex-wrap items-baseline justify-between gap-1">
      <h3 class="text-brand-blue text-[0.65rem] font-bold">${escapeHtml(distribution.title)}</h3>
      ${medianHtml}
    </div>
    ${body}
  </div>`;
}

export function renderPipelineFunnelHtml(title: string, rows: PipelineBreakdown[]): string {
  if (!rows.length) {
    return `<p class="text-brand-gray-500 text-[0.65rem]">No pipeline data in cohort.</p>`;
  }
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  const items = rows
    .map((row, i) => {
      const pctOfTotal = Math.round((row.count / total) * 100);
      const prev = i > 0 ? rows[i - 1]!.count : null;
      const conv = prev != null && prev > 0 ? Math.round((row.count / prev) * 100) : null;
      const convHtml =
        conv != null
          ? `<span class="text-brand-gray-500 font-normal"> · ${conv}% of prior</span>`
          : '';
      return `<li>
        <div class="flex items-center justify-between gap-2 text-[0.65rem]">
          <span class="text-brand-gray-700 font-medium">${escapeHtml(row.label)}</span>
          <span class="text-brand-gray-900 tabular-nums font-bold">
            ${row.count}<span class="text-brand-gray-500 font-normal"> (${pctOfTotal}%)</span>${convHtml}
          </span>
        </div>
        <div class="bg-brand-blue/80 mt-0.5 h-3 rounded-sm" style="width: ${pctOfTotal}%" aria-hidden="true"></div>
      </li>`;
    })
    .join('');
  return `<div class="pipeline-funnel min-w-0">
    <h3 class="text-brand-gray-800 mb-1 text-xs font-bold">${escapeHtml(title)}</h3>
    <ul class="space-y-1">${items}</ul>
  </div>`;
}

function barGroup(
  title: string,
  subtitle: string,
  rows: RegionBreakdownRow[],
  valueKey: 'count' | 'medianCjr' | 'pctOutreach',
  format: (r: RegionBreakdownRow) => string,
  invert = false,
): string {
  if (!rows.length) return '';
  const values = rows.map((r) => r[valueKey]).filter((n): n is number => n != null);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const items = rows
    .map((row) => {
      const v = row[valueKey];
      if (v == null) return '';
      const width =
        valueKey === 'pctOutreach'
          ? v
          : (() => {
              const span = max - min || 1;
              const t = invert ? (max - v) / span : (v - min) / span;
              return Math.max(4, Math.round(t * 100));
            })();
      return `<li>
        <div class="flex items-center justify-between gap-2 text-[0.6rem]">
          <span class="text-brand-gray-700 truncate font-medium">${escapeHtml(row.region)}</span>
          <span class="text-brand-gray-900 shrink-0 tabular-nums font-bold">${escapeHtml(format(row))}</span>
        </div>
        <div class="ind-bar-track mt-0.5 h-1.5" aria-hidden="true">
          <div class="ind-bar-fill ind-bar-fill--mix h-full" style="width: ${width}%"></div>
        </div>
      </li>`;
    })
    .join('');
  return `<div class="min-w-0">
    <h4 class="text-brand-gray-800 text-[0.65rem] font-bold">${escapeHtml(title)}</h4>
    <p class="text-brand-gray-500 mb-1 text-[0.55rem]">${escapeHtml(subtitle)}</p>
    <ul class="space-y-0.5">${items}</ul>
  </div>`;
}

export function renderRegionBreakdownHtml(rows: RegionBreakdownRow[]): string {
  if (!rows.length) {
    return `<p class="text-brand-gray-500 text-[0.65rem]">No region assignments in cohort.</p>`;
  }
  return `<div class="region-breakdown grid gap-2 sm:grid-cols-3">
    ${barGroup('Hospitals', 'Count per Master Tracker region', rows, 'count', (r) => String(r.count))}
    ${barGroup(
      'Median CJR',
      'Lower rank = better (bar shows relative)',
      rows.filter((r) => r.medianCjr != null),
      'medianCjr',
      (r) => (r.medianCjr != null ? `#${Math.round(r.medianCjr)}` : '—'),
      true,
    )}
    ${barGroup('% outreach yes', 'Share with outreach = Yes', rows, 'pctOutreach', (r) => `${r.pctOutreach}%`)}
  </div>`;
}

export function renderCohortFunnelStackHtml(
  pipelineRows: PipelineBreakdown[],
  stageRows: PipelineBreakdown[],
): string {
  return `<div class="cohort-funnel-stack flex min-w-0 flex-col gap-1.5">
    ${renderPipelineFunnelHtml('Pipeline', pipelineRows)}
    <div class="border-brand-gray-200 border-t pt-1.5">
      ${renderPipelineFunnelHtml('Sales stage', stageRows)}
    </div>
  </div>`;
}

export function renderCohortPanelHtml(input: {
  cjrDist: MetricDistribution;
  starsDist: MetricDistribution;
  pipelineRows: PipelineBreakdown[];
  stageRows: PipelineBreakdown[];
  regionRows: RegionBreakdownRow[];
}): {
  cjr: string;
  stars: string;
  region: string;
  funnel: string;
} {
  return {
    cjr: renderMetricDistributionHtml(input.cjrDist, { bare: true }),
    stars: renderMetricDistributionHtml(input.starsDist, { bare: true }),
    region: renderRegionBreakdownHtml(input.regionRows),
    funnel: renderCohortFunnelStackHtml(input.pipelineRows, input.stageRows),
  };
}
