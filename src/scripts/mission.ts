import { LAYOUTS, buildLayout, mapAt, type Stage } from '../data/layouts';
import { MISSIONS, XP_RULES } from '../data/content';
import { createEditor, type Editor } from './editor';
import { $, $$, layoutDone, resultMap, save, say, startMap, state, status, workMap, xp } from './game';

const id = document.body.dataset.mission!;
const m = MISSIONS.find((x) => x.id === id)!;
const spec = LAYOUTS[m.layout];

const send = $<HTMLButtonElement>('[data-send]')!;
const approve = $<HTMLButtonElement>('[data-approve]')!;
const back = $<HTMLButtonElement>('[data-return]')!;
const hintBtn = $<HTMLButtonElement>('[data-hint]')!;
const hintTxt = $<HTMLElement>('[data-hint-text]')!;
const msg = $<HTMLElement>('[data-status]')!;
const lock = $<HTMLElement>('[data-lock]')!;
const reward = $<HTMLElement>('[data-reward]')!;
const caption = $<HTMLTextAreaElement>('textarea[data-caption]')!;
const specialMsg = $<HTMLElement>('[data-special-msg]')!;
const goals = $$<HTMLElement>('[data-goals] li');
const temp = $<HTMLElement>('[data-temp]')!;
const tempMark = $<HTMLElement>('.temp-track i', temp)!;
const tempLabel = $<HTMLElement>('[data-temp-label]', temp)!;

let ed: Editor;
let results = [false, false, false];
let scores = [0, 0, 0];
let saveTimer: number | undefined;

const mini = (host: HTMLElement, map = startMap(m), stage = m.stage - 1) => {
  host.replaceChildren(buildLayout(spec, map, stage as Stage, ''));
};

const WORDS: [number, string][] = [
  [1, 'Pronto!'],
  [0.8, 'Fervendo'],
  [0.6, 'Quente'],
  [0.4, 'Morno'],
  [0.2, 'Frio'],
  [0, 'Gelado'],
];
/** Quente/frio: só diz o quanto está perto, não onde mexer. */
function paintTemp(scores: number[], done = false) {
  const t = done ? 1 : 0.6 * (scores.reduce((n, x) => n + x, 0) / scores.length) + 0.4 * Math.min(...scores);
  const shown = Math.round(t * 100) / 100;
  tempMark.style.setProperty('--t', String(shown));
  temp.dataset.hot = t >= 0.8 ? '1' : '';
  const word = t >= 0.999 ? 'Pronto!' : WORDS.find(([min]) => t >= min && min < 1)![1];
  tempLabel.textContent = word;
  goals.forEach((li, i) => $<HTMLElement>('.crit-bar i', li)!.style.setProperty('--t', String(done ? 1 : Math.round(scores[i] * 100) / 100)));
}

function paintGoals(res: boolean[], done = false) {
  goals.forEach((li, i) => {
    const ok = done || res[i];
    li.toggleAttribute('data-ok', ok);
    $('[data-goal-state]', li)!.textContent = ok ? 'ok' : 'pendente';
  });
}

function render() {
  const st = status(m);
  const editable = st === 'open';
  ed.setReadOnly(!editable);
  const all = results.every(Boolean);
  paintGoals(results, st === 'done');
  paintTemp(scores, st === 'done');

  send.hidden = st === 'review' || st === 'done';
  send.disabled = !(editable && all);
  approve.hidden = back.hidden = st !== 'review';
  hintBtn.disabled = st === 'locked' || st === 'done';
  hintTxt.hidden = !state.hint[id];
  $<HTMLElement>('[data-example]')!.hidden = !state.hint[id];

  let text = '';
  let cls = '';
  if (st === 'review') text = 'Em revisão. Simule a resposta do colega.';
  else if (editable && state.returned[id]) {
    text = 'Devolvida. Ajuste e envie de novo, sem perder XP.';
    cls = 'warn';
  } else if (editable && !all) text = 'Cumpra os 3 critérios para enviar.';
  msg.hidden = !text;
  msg.textContent = text;
  msg.className = `status ${cls}`.trim();

  if (st === 'locked') {
    const prev = MISSIONS.find((x) => x.layout === m.layout && x.stage === m.stage - 1)!;
    lock.hidden = false;
    lock.innerHTML = `Travada. Valide a <a href="/missoes/${prev.id.replace('.', '-')}">missão ${prev.id}</a> primeiro: o seu resultado nela é o “antes” desta.`;
  } else lock.hidden = true;

  reward.hidden = st !== 'done';
  if (st === 'done') {
    const gain = XP_RULES.mission + (state.hint[id] ? 0 : XP_RULES.noHint);
    $('[data-reward-text]')!.textContent = `+${gain} XP · total ${xp()} XP`;
    caption.value = state.captions[id] ?? '';
    $('[data-stk-before]')!.querySelector('.lay')?.remove();
    $('[data-stk-after]')!.querySelector('.lay')?.remove();
    $('[data-stk-before]')!.prepend(buildLayout(spec, startMap(m), (m.stage - 1) as Stage));
    $('[data-stk-after]')!.prepend(buildLayout(spec, resultMap(m), m.stage as Stage));
    const full = layoutDone(m.layout);
    specialMsg.hidden = !full;
    if (full) specialMsg.innerHTML = `Layout completo: +${XP_RULES.layout} XP e figurinha especial no <a href="/album">álbum</a>.`;
  }
}

const st0 = status(m);
ed = createEditor({
  host: $<HTMLElement>('[data-canvas]')!,
  bar: $<HTMLElement>('[data-bar]')!,
  view: $<HTMLElement>('[data-view]')!,
  mission: m,
  map: st0 === 'done' ? resultMap(m) : workMap(m),
  onLive(live) {
    paintTemp(live);
  },
  onChange(map, res, sc) {
    results = res;
    scores = sc;
    if (status(m) === 'open') {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        state.draft[id] = map;
        save();
      }, 250);
    }
    render();
  },
});

mini($<HTMLElement>('[data-before]')!);
mini($<HTMLElement>('[data-example-sheet]')!, mapAt(spec, m.stage as Stage), m.stage);

hintBtn.addEventListener('click', () => {
  state.hint[id] = true;
  save();
  render();
});
send.addEventListener('click', () => {
  state.draft[id] = ed.getMap();
  state.review[id] = 'pending';
  delete state.returned[id];
  save();
  render();
});
back.addEventListener('click', () => {
  delete state.review[id];
  state.returned[id] = true;
  save();
  render();
});
approve.addEventListener('click', () => {
  const before = xp();
  state.snap[id] = state.draft[id] ?? ed.getMap();
  delete state.draft[id];
  delete state.review[id];
  state.done[id] = true;
  save();
  render();
  say(`Missão ${id} validada: +${xp() - before} XP.`);
  reward.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
caption.addEventListener('input', () => {
  state.captions[id] = caption.value;
  save();
});

render();
if (location.search.includes('debug')) (window as unknown as { __ed: Editor }).__ed = ed;
