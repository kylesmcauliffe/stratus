/** Canonical directory profile URL: /hospitals/[slug] */
export function hospitalProfilePath(slug: string): string {
  return `/hospitals/${slug}`;
}

/** Slugify one segment (facility name or state code). */
export function slugifyHospitalSegment(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Stable profile slug from CMS roster name + state.
 * Example: ABBEVILLE GENERAL HOSPITAL, LA → abbeville-general-hospital-la
 */
export function hospitalSlugFromNameState(name: string, state: string): string {
  const namePart = slugifyHospitalSegment(name);
  const statePart = slugifyHospitalSegment(state);
  return `${namePart}-${statePart}`;
}

export type HospitalSlugInput = {
  name: string;
  state: string;
};

export type WithHospitalSlug<T extends HospitalSlugInput> = T & { slug: string };

/**
 * Assign unique slugs to roster rows. On collision, suffix -2, -3, …
 */
export function assignHospitalSlugs<T extends HospitalSlugInput>(
  inputs: T[],
): WithHospitalSlug<T>[] {
  const baseCounts = new Map<string, number>();
  return inputs.map((input) => {
    const base = hospitalSlugFromNameState(input.name, input.state);
    const n = (baseCounts.get(base) ?? 0) + 1;
    baseCounts.set(base, n);
    const slug = n === 1 ? base : `${base}-${n}`;
    return { ...input, slug };
  });
}

/** Build-time index: slug → hospital. */
export function buildTeamHospitalsBySlug<T extends { slug: string; name: string }>(
  hospitals: T[],
): Map<string, T> {
  const map = new Map<string, T>();
  for (const hospital of hospitals) {
    if (map.has(hospital.slug)) {
      throw new Error(`Duplicate hospital slug: ${hospital.slug} (${hospital.name})`);
    }
    map.set(hospital.slug, hospital);
  }
  return map;
}

export function getTeamHospitalBySlug<T extends { slug: string }>(
  slug: string,
  bySlug: Map<string, T>,
): T | undefined {
  return bySlug.get(slug);
}
