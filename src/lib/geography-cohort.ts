import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import type { MetricDistribution } from '@/lib/metric-distribution';
import {
  cjrRankDistribution,
  ownershipDistribution,
  ruralUrbanDistribution,
  starsDistribution,
} from '@/lib/metric-distribution';
import {
  directoryFilterCjrBinUrl,
  directoryFilterOwnershipBucketUrl,
  directoryFilterRuralUrl,
  directoryFilterStarsMinUrl,
} from '@/lib/directory-links';

function ownershipBinLink(label: string): string | undefined {
  if (label === 'Non-profit' || label === 'Proprietary' || label === 'Gov' || label === 'Other' || label === 'Unknown') {
    return directoryFilterOwnershipBucketUrl(label);
  }
  return undefined;
}

function starsBinLink(label: string): string | undefined {
  if (label === '5★') return directoryFilterStarsMinUrl(5);
  if (label === '4★') return directoryFilterStarsMinUrl(4);
  if (label === '3★') return directoryFilterStarsMinUrl(3);
  if (label === '1–2★') return directoryFilterStarsMinUrl(1);
  return undefined;
}

export interface GeographyPieChart {
  distribution: MetricDistribution;
  binLinks: Record<string, string>;
}

export interface GeographyCohortChartSet {
  rural: GeographyPieChart;
  ownership: GeographyPieChart;
  cjr: GeographyPieChart;
  stars: GeographyPieChart;
}

export function buildGeographyCohortChartSet(
  hospitals: DirectoryHospital[],
): GeographyCohortChartSet {
  const ruralDist = ruralUrbanDistribution(hospitals);
  const ownDist = ownershipDistribution(hospitals);
  const cjrDist = cjrRankDistribution(hospitals);
  const starsDist = starsDistribution(hospitals);

  const ruralLinks: Record<string, string> = {};
  if (ruralDist.bins.some((b) => b.label === 'Urban')) {
    ruralLinks.Urban = directoryFilterRuralUrl('U');
  }
  if (ruralDist.bins.some((b) => b.label === 'Rural')) {
    ruralLinks.Rural = directoryFilterRuralUrl('R');
  }

  const ownLinks: Record<string, string> = {};
  for (const bin of ownDist.bins) {
    const href = ownershipBinLink(bin.label);
    if (href) ownLinks[bin.label] = href;
  }

  const cjrLinks: Record<string, string> = {};
  for (const bin of cjrDist.bins) {
    const href = directoryFilterCjrBinUrl(bin.label);
    if (href) cjrLinks[bin.label] = href;
  }

  const starsLinks: Record<string, string> = {};
  for (const bin of starsDist.bins) {
    const href = starsBinLink(bin.label);
    if (href) starsLinks[bin.label] = href;
  }

  return {
    rural: { distribution: ruralDist, binLinks: ruralLinks },
    ownership: { distribution: ownDist, binLinks: ownLinks },
    cjr: { distribution: cjrDist, binLinks: cjrLinks },
    stars: { distribution: starsDist, binLinks: starsLinks },
  };
}
