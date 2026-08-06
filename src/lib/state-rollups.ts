import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import {
  directoryHospitals,
  getStateSummary,
  stateSummariesByState,
  type StateSummary,
} from '@/lib/directory-index';
import { normalizeStateCode } from '@/lib/directory-links';
import { rollupHospitals, type SystemRollup } from '@/lib/system-rollups';

export function directoryStates(): { state: string; count: number }[] {
  return Object.entries(stateSummariesByState)
    .map(([state, summary]) => ({ state, count: summary.count }))
    .sort((a, b) => b.count - a.count);
}

export function getStateByCode(
  code: string,
): { state: string; summary: StateSummary; hospitals: DirectoryHospital[]; rollup: SystemRollup } | undefined {
  const state = normalizeStateCode(code);
  const summary = getStateSummary(state);
  if (!summary) return undefined;
  const hospitals = directoryHospitals.filter((h) => h.state === state);
  return {
    state,
    summary,
    hospitals,
    rollup: rollupHospitals(hospitals),
  };
}
