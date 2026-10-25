import { LAYOUTS, mapAt, styleOf, type PropsMap, type Stage } from '../data/layouts';
import {
  LAYOUT_INFO,
  LEVELS,
  MISSIONS,
  ORDER,
  XP_RULES,
  missionsOf,
  type LayoutId,
  type Mission,
  type P,
} from '../data/content';

/* Estado do jogador. Fica só no navegador (localStorage); sem conta nem servidor. */

export interface State {
  name: string;
  hint: Record<string, boolean>;
  draft: Record<string, PropsMap>;
  snap: Record<string, PropsMap>;
  review: Record<string, 'pending'>;
  returned: Record<string, boolean>;
  done: Record<string, boolean>;
  reviews: number;
  captions: Record<string, string>;
}

const KEY = 'missao-crap:v1';
const blank = (): State => ({
  name: '',
  hint: {},
  draft: {},
  snap: {},
  review: {},
  returned: {},
  done: {},
  reviews: 0,
  captions: {},
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch {
    /* sem armazenamento: segue em memória */
  }
  return blank();
}

export let state: State = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignora */
  }
  renderChip();
}

export function resetProgress() {
  const name = state.name;
  state = blank();
  state.name = name;
  save();
}

const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Ponto de partida da missão: o que a missão anterior deixou (o trabalho do aluno). */
export function startMap(m: Mission): PropsMap {
  const prev = MISSIONS.find((x) => x.layout === m.layout && x.stage === m.stage - 1);
  if (prev && state.snap[prev.id]) return copy(state.snap[prev.id]);
  return mapAt(LAYOUTS[m.layout], (m.stage - 1) as Stage);
}
export const workMap = (m: Mission): PropsMap => (state.draft[m.id] ? copy(state.draft[m.id]) : startMap(m));
/** Resultado validado: o layout do aluno (ou o exemplo, em progresso antigo sem registro). */
export const resultMap = (m: Mission): PropsMap => (state.snap[m.id] ? copy(state.snap[m.id]) : mapAt(LAYOUTS[m.layout], m.stage as Stage));

export const layoutIds = Object.keys(LAYOUT_INFO) as LayoutId[];
export const slugOf = (m: Mission) => m.id.replace('.', '-');
export const missionBySlug = (s: string) => MISSIONS.find((m) => slugOf(m) === s);
export const mission = (l: LayoutId, p: P) => MISSIONS.find((m) => m.layout === l && m.p === p)!;
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const layoutDone = (l: LayoutId) => missionsOf(l).every((m) => state.done[m.id]);
export const layoutNoHint = (l: LayoutId) => layoutDone(l) && missionsOf(l).every((m) => !state.hint[m.id]);
export const doneCount = () => MISSIONS.filter((m) => state.done[m.id]).length;
export const stickersCount = () => doneCount() * 2;

export function xp() {
  let t = 0;
  for (const m of MISSIONS) {
    if (!state.done[m.id]) continue;
    t += XP_RULES.mission + (state.hint[m.id] ? 0 : XP_RULES.noHint);
  }
  t += state.reviews * XP_RULES.review;
  t += layoutIds.filter(layoutDone).length * XP_RULES.layout;
  return t;
}

export function level(x: number) {
  let cur: (typeof LEVELS)[number] = LEVELS[0];
  for (const l of LEVELS) if (x >= l.min) cur = l;
  const next = LEVELS.find((l) => l.n === cur.n + 1);
  return { cur, next };
}

export type Status = 'locked' | 'open' | 'review' | 'done';
export function status(m: Mission): Status {
  if (state.done[m.id]) return 'done';
  const prev = MISSIONS.find((x) => x.layout === m.layout && x.stage === m.stage - 1);
  if (prev && !state.done[prev.id]) return 'locked';
  return state.review[m.id] ? 'review' : 'open';
}
export const STATUS_LABEL: Record<Status, string> = {
  locked: 'travada',
  open: 'aberta',
  review: 'em revisão',
  done: 'validada',
};

/** Próxima missão a jogar: a primeira não validada que não está travada. */
export function nextMission(): Mission | null {
  return MISSIONS.find((m) => !state.done[m.id] && status(m) !== 'locked') ?? null;
}

export const grades = (p: P) => layoutIds.filter((l) => state.done[`${LAYOUT_INFO[l].n}.${p}`]).length;

export const specials = {
  olho: () => layoutIds.some(layoutNoHint),
  mentor: () => state.reviews >= 5,
  album: () => MISSIONS.every((m) => state.done[m.id]),
};

/* ───────── utilitários de DOM ───────── */

export const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export function setStage(root: HTMLElement, stage: Stage) {
  const spec = LAYOUTS[root.dataset.layout as LayoutId];
  root.dataset.stage = String(stage);
  for (const el of spec.els) {
    const node = $<HTMLElement>(`.el[data-id="${el.id}"]`, root);
    if (node) node.style.cssText = styleOf(el, stage);
  }
}

let toastTimer: number | undefined;
export function say(html: string) {
  const toast = $<HTMLElement>('[data-toast]');
  if (!toast) return;
  toast.innerHTML = html;
  toast.classList.add('on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('on'), 6000);
}

export function renderChip() {
  const x = xp();
  const { cur } = level(x);
  $$('[data-chip-xp]').forEach((n) => (n.textContent = String(x)));
  $$('[data-chip-level]').forEach((n) => (n.textContent = `Nível ${cur.n}`));
}
