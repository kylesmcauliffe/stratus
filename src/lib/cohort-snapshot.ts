import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import type { StateSummary } from '@/lib/directory-index';
import { researchBenchmarks } from '@/lib/research-benchmarks';
import { stateProfilePath } from '@/lib/directory-links';

export interface NationalSnapshotMetrics {
  rosterCount: number;
  medianStars: number | null;
  pctRural: number;
  medianBeds: number | null;
  medianTeamRankCjr: number | null;
  pctOutreachYes: number;
  medianMspb: number | null;
}

export function buildNationalSnapshotMetrics(
  hospitals: DirectoryHospital[],
  rosterCount: number,
): NationalSnapshotMetrics {
  const rural = hospitals.filter((h) => h.ruralUrban === 'R').length;
  const pctRural =
    hospitals.length > 0 ? Math.round((rural / hospitals.length) * 100) : 0;
  const nat = researchBenchmarks;
  return {
    rosterCount,
    medianStars: nat.medianStars,
    pctRural,
    medianBeds: nat.medianBeds,
    medianTeamRankCjr: nat.medianTeamRankCjr,
    pctOutreachYes: nat.pctOutreachYes ?? 0,
    medianMspb: nat.medianMspb,
  };
}

export interface SnapshotBarElements {
  bar: HTMLElement;
  title: HTMLElement | null;
  profileLink: HTMLAnchorElement | null;
  matchEl: HTMLElement | null;
  rosterEl: HTMLElement | null;
  starsEl: HTMLElement | null;
  ruralEl: HTMLElement | null;
  bedsEl: HTMLElement | null;
  cjrEl: HTMLElement | null;
  outreachEl: HTMLElement | null;
  mspbEl: HTMLElement | null;
}

export function applyNationalSnapshotBar(
  els: SnapshotBarElements,
  metrics: NationalSnapshotMetrics,
  inFilterCount: number,
): void {
  els.bar.hidden = false;
  if (els.title) els.title.textContent = 'National snapshot';
  if (els.profileLink) els.profileLink.hidden = true;
  if (els.matchEl) els.matchEl.textContent = String(inFilterCount);
  if (els.rosterEl) els.rosterEl.textContent = String(metrics.rosterCount);
  if (els.starsEl) {
    els.starsEl.textContent =
      metrics.medianStars != null ? String(metrics.medianStars) : '—';
  }
  if (els.ruralEl) els.ruralEl.textContent = `${metrics.pctRural}%`;
  if (els.bedsEl) {
    els.bedsEl.textContent =
      metrics.medianBeds != null ? metrics.medianBeds.toLocaleString('en-US') : '—';
  }
  if (els.cjrEl) {
    els.cjrEl.textContent =
      metrics.medianTeamRankCjr != null
        ? `#${Math.round(metrics.medianTeamRankCjr)}`
        : '—';
  }
  if (els.outreachEl) els.outreachEl.textContent = `${metrics.pctOutreachYes}%`;
  if (els.mspbEl) {
    els.mspbEl.textContent =
      metrics.medianMspb != null ? metrics.medianMspb.toFixed(2) : '—';
  }
}

export function applyStateSnapshotBar(
  els: SnapshotBarElements,
  state: string,
  summary: StateSummary,
  inFilterCount: number,
): void {
  els.bar.hidden = false;
  if (els.title) els.title.textContent = `${state} snapshot`;
  if (els.profileLink) {
    els.profileLink.href = stateProfilePath(state);
    els.profileLink.textContent = `${state} profile →`;
    els.profileLink.hidden = false;
  }
  if (els.matchEl) els.matchEl.textContent = String(inFilterCount);
  if (els.rosterEl) els.rosterEl.textContent = String(summary.count);
  if (els.starsEl) {
    els.starsEl.textContent =
      summary.medianStars != null ? String(summary.medianStars) : '—';
  }
  if (els.ruralEl) els.ruralEl.textContent = `${summary.pctRural}%`;
  if (els.bedsEl) {
    els.bedsEl.textContent =
      summary.medianBeds != null ? summary.medianBeds.toLocaleString('en-US') : '—';
  }
  if (els.cjrEl) {
    els.cjrEl.textContent =
      summary.medianTeamRankCjr != null
        ? `#${Math.round(summary.medianTeamRankCjr)}`
        : '—';
  }
  if (els.outreachEl) els.outreachEl.textContent = `${summary.pctOutreachYes ?? 0}%`;
  if (els.mspbEl) {
    els.mspbEl.textContent =
      summary.medianMspb != null ? summary.medianMspb.toFixed(2) : '—';
  }
}
