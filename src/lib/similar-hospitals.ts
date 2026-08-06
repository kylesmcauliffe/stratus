import type { TeamHospital } from '@/data/team-hospitals';

export function hospitalsInState(state: string, all: TeamHospital[]): number {
  return all.filter((h) => h.state === state).length;
}
