import { MISSIONS, ORDER } from '../data/content';
import { $, $$, doneCount, level, nextMission, setStage, slugOf, xp } from './game';
import type { Stage } from '../data/layouts';
import { missionsOf } from '../data/content';

const heroLay = $<HTMLElement>('.hero-lay')!;
const heroBtns = $$<HTMLButtonElement>('[data-hero-stage]');
const heroCap = $('[data-hero-cap]')!;
const heroSlug = $('[data-hero-slug]')!;
const flyer = missionsOf('flyer');
let timer: number | undefined;

function set(s: number) {
  setStage(heroLay, s as Stage);
  heroBtns.forEach((b, i) => {
    b.setAttribute('aria-pressed', String(i === s));
    b.classList.toggle('done', i > 0 && i <= s);
  });
  heroSlug.textContent = `${s}/4 placas em registro`;
  if (s === 0) {
    heroCap.innerHTML = '<strong>Flyer quebrado.</strong> Toque nas placas: cada missão corrige um princípio.';
  } else {
    const m = flyer[s - 1];
    heroCap.innerHTML = `<strong>${m.id} · ${m.name}.</strong> ${m.short.join(' · ')}.`;
  }
}
const stop = () => {
  if (timer) window.clearInterval(timer);
  timer = undefined;
};
heroBtns.forEach((b, i) =>
  b.addEventListener('click', () => {
    stop();
    set(i);
  }),
);
set(0);
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let s = 0;
  window.setTimeout(() => {
    if (timer !== undefined) return;
    timer = window.setInterval(() => {
      s += 1;
      set(s);
      if (s >= 4) stop();
    }, 2300);
  }, 1400);
}

/* Botão principal vira "Continuar" quando já há progresso. */
const next = nextMission();
const done = doneCount();
$$<HTMLAnchorElement>('[data-continue]').forEach((a) => {
  if (!next) {
    a.textContent = 'Ver seu álbum completo';
    a.href = '/album';
  } else if (done > 0) {
    a.textContent = `Continuar: missão ${next.id}`;
    a.href = `/missoes/${slugOf(next)}`;
  }
});
if (done > 0) {
  const { cur } = level(xp());
  $$('[data-home-summary]').forEach(
    (n) => (n.innerHTML = `Você: nível ${cur.n} · ${xp()} XP<br />${done} de ${MISSIONS.length} missões validadas`),
  );
}
void ORDER;
