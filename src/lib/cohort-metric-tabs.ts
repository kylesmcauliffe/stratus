/** Tab switcher for home cohort metric distributions (CJR rank | CMS stars). */
export function initCohortMetricTabs(root: ParentNode): void {
  const panel = root.querySelector<HTMLElement>('[data-cohort-metric-panel]');
  if (!panel || panel.dataset.metricTabsBound === '1') return;
  panel.dataset.metricTabsBound = '1';

  const activate = (track: string) => {
    panel.querySelectorAll<HTMLButtonElement>('.cohort-metric-tab-btn').forEach((btn) => {
      const on = btn.dataset.metricTrack === track;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.classList.toggle('text-brand-blue', on);
      btn.classList.toggle('font-bold', on);
      btn.classList.toggle('border-brand-blue', on);
      btn.classList.toggle('text-brand-gray-600', !on);
      btn.classList.toggle('font-semibold', !on);
      btn.classList.toggle('border-transparent', !on);
    });
    panel.querySelectorAll<HTMLElement>('[data-metric-track-panel]').forEach((el) => {
      const show = el.dataset.metricTrackPanel === track;
      el.classList.toggle('hidden', !show);
    });
  };

  panel.querySelectorAll<HTMLButtonElement>('.cohort-metric-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = btn.dataset.metricTrack;
      if (track) activate(track);
    });
  });
}
