import { directoryHospitals, stateSummariesByState } from '@/lib/directory-index';

export function buildStateMapEntries() {
  const states = [...new Set(directoryHospitals.map((h) => h.state))].sort();
  return states.map((state) => {
    const summary = stateSummariesByState[state];
    return {
      state,
      slug: state.toLowerCase().replace(/\s+/g, '-'),
      count: summary?.count ?? 0,
      medianStars: summary?.medianStars ?? null,
      pctRural: summary?.pctRural ?? 0,
      medianTeamRankCjr: summary?.medianTeamRankCjr ?? null,
      pctOutreachYes: summary?.pctOutreachYes ?? 0,
      medianMspb: summary?.medianMspb ?? null,
      hospitals: directoryHospitals.filter((h) => h.state === state).map((h) => h.name).sort(),
    };
  });
}
