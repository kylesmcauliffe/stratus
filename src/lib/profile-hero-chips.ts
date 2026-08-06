import type { TeamHospital } from '@/data/team-hospitals';
import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import {
  directoryFilterCjrTop50Url,
  directoryFilterMaxCjrUrl,
  directoryFilterOutreachUrl,
  directoryFilterPipelineUrl,
  directoryFilterStateUrl,
  regionProfilePathFromName,
  statesGeographySectionUrl,
  systemProfilePathFromName,
} from '@/lib/directory-links';

export interface ProfileHeroChip {
  label: string;
  href?: string;
}

function ownershipShort(ownership: string | undefined): string | null {
  if (!ownership) return null;
  if (ownership.includes('Government')) return 'Government';
  if (ownership.includes('Voluntary non-profit')) return 'Non-profit';
  if (ownership === 'Proprietary') return 'Proprietary';
  return ownership.length > 24 ? `${ownership.slice(0, 22)}…` : ownership;
}

export function buildProfileHeroChips(
  hospital: TeamHospital,
  record?: DirectoryHospital,
): ProfileHeroChip[] {
  const chips: ProfileHeroChip[] = [];
  const state = hospital.state;

  if (record?.ruralUrban === 'R') {
    chips.push({ label: 'Rural', href: statesGeographySectionUrl('rural-urban') });
  } else if (record?.ruralUrban === 'U') {
    chips.push({ label: 'Urban', href: statesGeographySectionUrl('rural-urban') });
  }

  const own = ownershipShort(record?.ownership);
  if (own && record?.ownership) {
    chips.push({
      label: own,
      href: statesGeographySectionUrl('ownership'),
    });
  }

  if (record?.discharges != null) {
    chips.push({
      label: `${record.discharges.toLocaleString('en-US')} disch.`,
      href: directoryFilterStateUrl(state),
    });
  }

  if (record?.teamRankByCjr != null) {
    chips.push({
      label: `CJR #${record.teamRankByCjr}`,
      href: directoryFilterMaxCjrUrl(record.teamRankByCjr, state),
    });
  }

  if (record?.cjrTop50) {
    chips.push({ label: 'Top 50', href: directoryFilterCjrTop50Url(state) });
  }

  if (record?.outreachStatus === 'Yes') {
    chips.push({
      label: 'Outreach',
      href: directoryFilterOutreachUrl('Yes', state),
    });
  }

  if (record?.region) {
    chips.push({ label: record.region, href: regionProfilePathFromName(record.region) });
  }

  if (record?.healthSystem) {
    chips.push({
      label:
        record.healthSystem.length > 22
          ? `${record.healthSystem.slice(0, 20)}…`
          : record.healthSystem,
      href: systemProfilePathFromName(record.healthSystem),
    });
  }

  if (record?.pipelineStatus) {
    chips.push({
      label: record.pipelineStatus,
      href: directoryFilterPipelineUrl(record.pipelineStatus, state),
    });
  }

  if (record?.salesStage) {
    chips.push({ label: record.salesStage });
  }

  return chips;
}
