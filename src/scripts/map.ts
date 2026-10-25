import { LAYOUTS, buildLayout, type Stage } from '../data/layouts';
import { MISSIONS, missionsOf } from '../data/content';
import { $, $$, STATUS_LABEL, doneCount, layoutIds, nextMission, resultMap, slugOf, startMap, status } from './game';

for (const m of MISSIONS) {
  const tile = $<HTMLElement>(`[data-tile="${m.id}"]`);
  if (!tile) continue;
  const s = status(m);
  tile.dataset.status = s;
  $('[data-tile-status]', tile)!.textContent = STATUS_LABEL[s];
  const thumb = $<HTMLElement>('.thumb', tile)!;
  const done = s === 'done';
  thumb.replaceChildren(
    buildLayout(LAYOUTS[m.layout], done ? resultMap(m) : startMap(m), (done ? m.stage : m.stage - 1) as Stage),
  );
}
for (const l of layoutIds) {
  const row = $<HTMLElement>(`[data-map-layout="${l}"]`)!;
  const n = missionsOf(l).filter((m) => status(m) === 'done').length;
  $('[data-layout-count]', row)!.textContent = `${n}/4`;
}

const done = doneCount();
$('[data-map-summary]')!.textContent = `${done} de ${MISSIONS.length} missões validadas`;
const bar = $<HTMLElement>('[data-map-bar]')!;
bar.setAttribute('aria-valuenow', String(done));
$<HTMLElement>('i', bar)!.style.setProperty('--s', String(done / MISSIONS.length));

const next = nextMission();
$$<HTMLAnchorElement>('[data-next]').forEach((a) => {
  if (!next) {
    a.textContent = 'Tudo validado: ver o álbum';
    a.href = '/album';
  } else if (done > 0) {
    a.textContent = `Continuar: missão ${next.id}`;
    a.href = `/missoes/${slugOf(next)}`;
  }
});
