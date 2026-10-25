import { GRADES, ORDER } from '../data/content';
import { $, $$, grades, level, resetProgress, save, say, specials, state, xp } from './game';

function render() {
  const x = xp();
  const { cur, next } = level(x);
  $$('[data-xp]').forEach((n) => (n.textContent = String(x)));
  $$('[data-lvl-title]').forEach((n) => (n.textContent = cur.title));
  $$('[data-lvl-n]').forEach((n) => (n.textContent = String(cur.n)));
  $$('[data-peer-count]').forEach((n) => (n.textContent = String(state.reviews)));

  const pct = next ? Math.min(100, Math.round(((x - cur.min) / (next.min - cur.min)) * 100)) : 100;
  const bar = $<HTMLElement>('[data-lvl-bar]')!;
  bar.setAttribute('aria-valuenow', String(pct));
  $<HTMLElement>('i', bar)!.style.setProperty('--s', String(pct / 100));
  $('[data-lvl-next]')!.textContent = next ? `${next.min - x} XP para ${next.title}` : 'Nível máximo';

  $$<HTMLElement>('[data-level-row]').forEach((r) =>
    r.toggleAttribute('data-on', Number(r.dataset.levelRow) === cur.n),
  );

  for (const p of ORDER) {
    const g = grades(p);
    GRADES.forEach((_, gi) => $<HTMLElement>(`[data-badge="${p}-${gi}"]`)!.toggleAttribute('data-on', g > gi));
  }
  (Object.keys(specials) as (keyof typeof specials)[]).forEach((k) => {
    const el = $<HTMLElement>(`[data-special="${k}"]`)!;
    const on = specials[k]();
    el.toggleAttribute('data-on', on);
    $('.slug', el)!.textContent = on ? 'Conquistado' : 'Bloqueado';
  });
}

$('[data-review-peer]')!.addEventListener('click', () => {
  state.reviews += 1;
  save();
  render();
  say(`Revisão simulada: +30 XP. ${state.reviews >= 5 ? 'Badge Mentor conquistado.' : `${state.reviews}/5 para o badge Mentor.`}`);
});

let armed = false;
const reset = $<HTMLButtonElement>('[data-reset]')!;
reset.addEventListener('click', () => {
  if (!armed) {
    armed = true;
    reset.textContent = 'Apagar tudo? Clique de novo';
    window.setTimeout(() => {
      armed = false;
      reset.textContent = 'Recomeçar do zero';
    }, 4000);
    return;
  }
  resetProgress();
  armed = false;
  reset.textContent = 'Recomeçar do zero';
  render();
});

render();
