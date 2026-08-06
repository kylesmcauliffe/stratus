/** Canonical funnel order for Rainfall tracker pipeline + sales stage labels. */
export const PIPELINE_STAGE_ORDER = ['Prospecting', 'Demo', 'LOI/SOW Review'] as const;

export const SALES_STAGE_ORDER = ['Lead', 'Value Prop', 'Contract'] as const;

export function orderPipelineBreakdown(
  rows: { label: string; count: number }[],
): { label: string; count: number }[] {
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.count]));
  return PIPELINE_STAGE_ORDER.map((label) => ({
    label,
    count: byLabel[label] ?? 0,
  }));
}

export function orderSalesStageBreakdown(
  rows: { label: string; count: number }[],
): { label: string; count: number }[] {
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.count]));
  return SALES_STAGE_ORDER.map((label) => ({
    label,
    count: byLabel[label] ?? 0,
  }));
}
