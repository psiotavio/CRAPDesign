import { LAYOUTS, buildLayout, mapAt, type PropsMap, type Stage } from '../data/layouts';
import { MISSIONS, missionsOf, type LayoutId } from '../data/content';
import { $, $$, layoutDone, layoutIds, level, resultMap, save, startMap, state, stickersCount, xp, grades, specials } from './game';
import { GRADES, ORDER, PRINCIPLES } from '../data/content';

/** Vazia, a moldura mostra a silhueta cinza; validada, a figurinha com o trabalho do aluno. */
function paintSlot(slot: HTMLElement, before: PropsMap, after: PropsMap, layout: LayoutId, stages: [Stage, Stage], filled: boolean) {
  if (slot.dataset.painted === (filled ? '1' : '0')) return;
  const spec = LAYOUTS[layout];
  const pairs: ['before' | 'after', PropsMap, Stage][] = [
    ['before', before, stages[0]],
    ['after', after, stages[1]],
  ];
  for (const [side, map, stage] of pairs) {
    const holder = $<HTMLElement>(`.stk[data-side="${side}"]`, slot)!;
    $$('.lay', holder).forEach((n) => n.remove());
    holder.prepend(buildLayout(spec, map, stage));
  }
  slot.dataset.painted = filled ? '1' : '0';
  slot.toggleAttribute('data-filled', filled);
}

function render() {
  for (const m of MISSIONS) {
    const slot = $<HTMLElement>(`[data-slot="${m.id}"]`)!;
    const ta = $<HTMLTextAreaElement>('textarea', slot)!;
    const done = !!state.done[m.id];
    const sp = LAYOUTS[m.layout];
    paintSlot(
      slot,
      startMap(m),
      done ? resultMap(m) : mapAt(sp, m.stage as Stage),
      m.layout,
      [(m.stage - 1) as Stage, m.stage as Stage],
      done,
    );
    ta.disabled = !done;
    ta.value = done ? (state.captions[m.id] ?? '') : '';
  }
  for (const l of layoutIds) {
    const last = missionsOf(l)[3];
    const sp = LAYOUTS[l];
    paintSlot(
      $<HTMLElement>(`[data-slot="special-${l}"]`)!,
      mapAt(sp, 0),
      layoutDone(l) ? resultMap(last) : mapAt(sp, 4),
      l,
      [0, 4],
      layoutDone(l),
    );
  }

  const x = xp();
  const { cur } = level(x);
  $$('[data-cover-title]').forEach((n) => (n.textContent = cur.title));
  $$('[data-cover-level]').forEach((n) => (n.textContent = String(cur.n)));
  $$('[data-cover-xp]').forEach((n) => (n.textContent = String(x)));
  $$('[data-cover-count]').forEach((n) => (n.textContent = String(stickersCount())));
  $$<HTMLElement>('[data-cover-bar] i').forEach((seg, k) =>
    seg.style.setProperty('--f', String(Math.max(0, Math.min(1, (stickersCount() - 6 * k) / 6)))),
  );

  const hall: string[] = [];
  for (const p of ORDER) {
    const g = grades(p);
    if (g > 0) hall.push(`${PRINCIPLES[p].name} ${GRADES[g - 1]}`);
  }
  const names = { olho: 'Olho Clínico', mentor: 'Mentor', album: 'Álbum Completo' } as const;
  (Object.keys(specials) as (keyof typeof specials)[]).forEach((k) => {
    if (specials[k]()) hall.push(names[k]);
  });
  $('[data-hall]')!.innerHTML = hall
    .map((h) => `<div class="special-badge" data-on><b>${h}</b><span class="slug">Conquistado</span></div>`)
    .join('');
  $<HTMLElement>('[data-hall-empty]')!.hidden = hall.length > 0;
}

$$<HTMLTextAreaElement>('textarea[data-caption]').forEach((ta) =>
  ta.addEventListener('input', () => {
    state.captions[ta.dataset.caption!] = ta.value;
    save();
  }),
);
const nameInput = $<HTMLInputElement>('[data-name]')!;
nameInput.value = state.name;
nameInput.addEventListener('input', () => {
  state.name = nameInput.value;
  save();
});

const tabs = $$<HTMLButtonElement>('[data-album-tab]');
tabs.forEach((t) =>
  t.addEventListener('click', () => {
    tabs.forEach((o) => o.setAttribute('aria-selected', String(o === t)));
    $$<HTMLElement>('[data-album-page]').forEach((pg) =>
      pg.toggleAttribute('data-on', pg.dataset.albumPage === t.dataset.albumTab),
    );
  }),
);


render();
