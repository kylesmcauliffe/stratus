/** Client-side column sort for directory tables (`table[data-sortable]`). */

export type SortDirection = 'asc' | 'desc';
export type SortValueType = 'number' | 'text';

export const DIRECTORY_TABLE_REFRESH = 'directory-table:refresh';

export function sortableThHtml(
  label: string,
  key: string,
  opts?: { type?: SortValueType; class?: string },
): string {
  const type = opts?.type ?? 'number';
  const extra = opts?.class ?? '';
  return `<th class="dir-th-sort border-brand-gray-200 border px-1.5 py-1 font-semibold ${extra}" data-sort-key="${key}" data-sort-type="${type}" tabindex="0" role="columnheader" aria-sort="none">${label}<span class="dir-sort-indicator" aria-hidden="true"></span></th>`;
}

type SortCellValue = {
  missing: boolean;
  value: string | number;
};

function isMissingRaw(raw: string): boolean {
  const norm = raw.trim().toLowerCase();
  return norm === '' || norm === 'na' || norm === 'n/a' || norm === '—' || norm === '-';
}

function sortValue(row: HTMLTableRowElement, key: string, type: SortValueType): SortCellValue {
  const raw = row.getAttribute(`data-sort-${key}`) ?? '';
  if (isMissingRaw(raw)) {
    return { missing: true, value: type === 'number' ? Number.POSITIVE_INFINITY : '' };
  }
  if (type === 'number') {
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return { missing: true, value: Number.POSITIVE_INFINITY };
    }
    return { missing: false, value: n };
  }
  return { missing: false, value: raw.toLowerCase() };
}

function compareValues(
  a: SortCellValue,
  b: SortCellValue,
  dir: SortDirection,
): number {
  if (a.missing && !b.missing) return 1;
  if (!a.missing && b.missing) return -1;
  if (a.missing && b.missing) return 0;

  if (typeof a.value === 'number' && typeof b.value === 'number') {
    return dir === 'asc' ? a.value - b.value : b.value - a.value;
  }
  const sa = String(a.value);
  const sb = String(b.value);
  return dir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
}

function updateHeaderState(
  headers: HTMLTableCellElement[],
  key: string,
  dir: SortDirection,
): void {
  for (const th of headers) {
    const active = th.dataset.sortKey === key;
    th.setAttribute('aria-sort', active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none');
    th.classList.toggle('dir-th-sort--active', active);
    const ind = th.querySelector('.dir-sort-indicator');
    if (ind) ind.textContent = active ? (dir === 'asc' ? ' ↑' : ' ↓') : '';
  }
}

function sortTable(table: HTMLTableElement, key: string, dir: SortDirection): void {
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const th = table.querySelector(`thead th[data-sort-key="${key}"]`);
  const type = (th?.dataset.sortType) ?? 'number';
  const rows = [...tbody.querySelectorAll('tr')];
  rows.sort((ra, rb) => compareValues(sortValue(ra, key, type), sortValue(rb, key, type), dir));
  rows.forEach((row) => tbody.appendChild(row));
  const headers = [...table.querySelectorAll('thead th[data-sort-key]')];
  updateHeaderState(headers, key, dir);
  table.dataset.sortActiveKey = key;
  table.dataset.sortActiveDir = dir;
}

export function initSortableTables(root = document) {
  root.querySelectorAll('table[data-sortable]').forEach((table) => {
    if (table.dataset.sortableBound === '1') return;
    table.dataset.sortableBound = '1';

    const tbody = table.querySelector('tbody');
    const headers = [...table.querySelectorAll('thead th[data-sort-key]')];
    if (!tbody || headers.length === 0) return;

    const defaultKey = table.dataset.sortDefault ?? headers[0]?.dataset.sortKey;
    const defaultDir = table.dataset.sortDefaultDir ?? 'asc';

    for (const th of headers) {
      th.addEventListener('click', () => {
        const key = th.dataset.sortKey;
        const prevKey = table.dataset.sortActiveKey;
        const prevDir = table.dataset.sortActiveDir;
        const dir = prevKey === key && prevDir === 'asc' ? 'desc' : 'asc';
        sortTable(table, key, dir);
      });
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          th.click();
        }
      });
    }

    if (table.dataset.sortPreserveOrder !== '1' && defaultKey) {
      sortTable(table, defaultKey, defaultDir);
    }
  });
}

export function refreshSortableTables(root) {
  root.querySelectorAll('table[data-sortable]').forEach((table) => {
    delete table.dataset.sortableBound;
  });
  initSortableTables(root);
}
