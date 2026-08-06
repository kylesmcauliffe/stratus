import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { cjrRankDistribution, starsDistribution } from '@/lib/metric-distribution';
import { orderPipelineBreakdown, orderSalesStageBreakdown } from '@/data/pipeline-stage-order';
import { regionBreakdownFromHospitals } from '@/lib/region-breakdown';
import { rollupHospitals } from '@/lib/system-rollups';
import { renderCohortPanelHtml } from '@/lib/cohort-chart-html';

export function buildCohortCharts(hospitals: DirectoryHospital[]) {
  const rollup = rollupHospitals(hospitals);
  return renderCohortPanelHtml({
    cjrDist: cjrRankDistribution(hospitals),
    starsDist: starsDistribution(hospitals),
    pipelineRows: orderPipelineBreakdown(rollup.pipelineBreakdown),
    stageRows: orderSalesStageBreakdown(rollup.salesStageBreakdown),
    regionRows: regionBreakdownFromHospitals(hospitals),
  });
}
