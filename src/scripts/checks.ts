/**
 * Checagem automática dos critérios de cada missão.
 * Cada função devolve 3 notas de 0 a 1, na ordem de `Mission.short`:
 * 1 = critério cumprido; abaixo disso é o "quente/frio" (nunca chega a 1 sem cumprir).
 * As distâncias vêm do DOM medido e estão em cqw (1% da largura do layout);
 * texto solto é medido pela tinta, caixas (botão, campo, selo) pela borda.
 */
import type { Full, PropsMap } from '../data/layouts';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Ctx {
  p: PropsMap;
  box: (id: string) => Box;
  bg: string;
}

/* ───────── geometria ───────── */

const right = (b: Box) => b.x + b.w;
const bottom = (b: Box) => b.y + b.h;

function gap(a: Box, b: Box) {
  const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(right(a), right(b)));
  const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(bottom(a), bottom(b)));
  return Math.hypot(dx, dy);
}

/** Agrupa por proximidade (ligação simples). */
function clusters(ctx: Ctx, ids: string[], thr: number) {
  const parent = ids.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const pairs: [number, number, number][] = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) pairs.push([i, j, gap(ctx.box(ids[i]), ctx.box(ids[j]))]);
  let intra = 0;
  for (const [i, j, d] of pairs.sort((a, b) => a[2] - b[2])) {
    if (d > thr) break;
    if (find(i) !== find(j)) {
      parent[find(i)] = find(j);
      intra = Math.max(intra, d);
    }
  }
  let inter = Infinity;
  for (const [i, j, d] of pairs) if (find(i) !== find(j)) inter = Math.min(inter, d);
  const groups = new Map<number, string[]>();
  ids.forEach((id, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), id]));
  return { groups: [...groups.values()], intra, inter };
}

const sameCluster = (ctx: Ctx, ids: string[], all: string[], thr: number) => {
  const { groups } = clusters(ctx, all, thr);
  return groups.some((g) => ids.every((i) => g.includes(i)));
};

const near = (vals: number[], tol: number) => Math.max(...vals) - Math.min(...vals) <= tol;
const all = <T,>(xs: T[], f: (x: T) => boolean) => xs.every(f);

/* ───────── cor ───────── */

function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function lum(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const filled = (p: Full) => p.bg !== 'transparent';
const bgOf = (ctx: Ctx, id: string) => (filled(ctx.p[id]) ? ctx.p[id].bg : ctx.bg);
export const textContrast = (ctx: Ctx, id: string) => contrast(ctx.p[id].c, bgOf(ctx, id));
const legible = (ctx: Ctx, ids: string[]) => all(ids, (i) => textContrast(ctx, i) >= 4.5);

/* ───────── âncoras e estilo ───────── */

function anchor(ctx: Ctx, id: string) {
  const b = ctx.box(id);
  const ta = ctx.p[id].ta;
  return ta === 'center' ? b.x + b.w / 2 : ta === 'right' ? right(b) : b.x;
}
const maxFs = (ctx: Ctx, ids: string[]) => Math.max(...ids.map((i) => ctx.p[i].fs));
const families = (ctx: Ctx, ids: string[]) => new Set(ids.map((i) => ctx.p[i].ff)).size;
const sameType = (ctx: Ctx, ids: string[], extra: (keyof Full)[] = []) =>
  (['ff', 'fs', 'fw', 'st', ...extra] as (keyof Full)[]).every(
    (k) => new Set(ids.map((i) => (typeof ctx.p[i][k] === 'number' ? Math.round((ctx.p[i][k] as number) * 5) : ctx.p[i][k]))).size === 1,
  );
const num = (v: number | string) => (typeof v === 'number' ? v : parseFloat(String(v)) || 0);

/* ───────── notas (quente/frio) ───────── */

const clamp = (x: number) => Math.max(0, Math.min(1, x));
/** 1 se cumpriu; senão uma nota parcial, sempre abaixo de 1. */
const T = (ok: boolean, partial: number) => (ok ? 1 : Math.min(0.92, clamp(partial)));
/** Quanto maior o excesso sobre o limite, mais frio. */
const over = (v: number, max: number, scale: number) => 1 - (v - max) / scale;
const spread = (vals: number[]) => Math.max(...vals) - Math.min(...vals);
const mean = (xs: number[]) => xs.reduce((n, x) => n + x, 0) / xs.length;

/** Fração de elementos que repetem o estilo mais comum. */
function uniformity(ctx: Ctx, ids: string[], keys: (keyof Full)[]) {
  const sig = (i: string) => keys.map((k) => (typeof ctx.p[i][k] === 'number' ? Math.round((ctx.p[i][k] as number) * 5) : String(ctx.p[i][k]))).join('|');
  const count = new Map<string, number>();
  ids.forEach((i) => count.set(sig(i), (count.get(sig(i)) ?? 0) + 1));
  return Math.max(...count.values()) / ids.length;
}
const contrastMean = (ctx: Ctx, ids: string[]) => mean(ids.map((i) => Math.min(1, textContrast(ctx, i) / 4.5)));

/* ───────── missões ───────── */

const FLYER_TEXT = ['title', 'tag', 'date', 'time', 'place', 'price', 'org'];
const LOGIN_TEXT = ['title', 'sub', 'lblEmail', 'lblPass', 'forgot', 'btn1', 'btn2', 'btn3', 'terms', 'inEmail', 'inPass'];
const LOGIN_BOX = ['inEmail', 'inPass', 'btn1', 'btn2', 'btn3'];
const PROD_TEXT = ['name', 'rev', 'desc', 'ship', 'price', 'buy', 's1', 's2', 's3'];
const THUMBS = ['t1', 't2', 't3'];
const SELOS = ['s1', 's2', 's3'];
const STYLE: (keyof Full)[] = ['ff', 'fs', 'fw', 'st'];

/** Maior elo da árvore geradora mínima: o quão longe está o grupo de ficar junto. */
function linkSpan(ctx: Ctx, ids: string[]) {
  const d: number[] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) d.push(gap(ctx.box(ids[i]), ctx.box(ids[j])));
  d.sort((a, b) => a - b);
  return d[ids.length - 2] ?? 0;
}

const checks: Record<string, (c: Ctx) => number[]> = {
  /* 1 · Flyer */
  '1.P': (c) => {
    const { groups, intra, inter } = clusters(c, FLYER_TEXT, 4);
    const span = linkSpan(c, ['date', 'time', 'place']);
    return [
      T(sameCluster(c, ['date', 'time', 'place'], FLYER_TEXT, 4), over(span, 4, 40)),
      T(groups.length >= 2 && groups.some((g) => g.length > 1) && inter >= 5 && inter >= 1.8 * intra, groups.length < 2 || groups.every((g) => g.length === 1) ? 0.1 : Math.min(inter / 5, inter / (1.8 * Math.max(intra, 0.5)))),
      T(groups.length >= 3 && groups.length <= 5, groups.length < 3 ? groups.length / 3 : 1 - (groups.length - 5) / 3),
    ];
  },
  '1.A': (c) => {
    const a = FLYER_TEXT.map((i) => anchor(c, i));
    const tas = FLYER_TEXT.map((i) => c.p[i].ta);
    const sameTa = new Set(tas).size === 1;
    const best = Math.max(...a.map((x) => a.filter((y) => Math.abs(x - y) <= 1.2).length));
    const modeTa = Math.max(...['left', 'center', 'right'].map((t) => tas.filter((x) => x === t).length));
    return [T(best >= 5, best / 5), T(sameTa, modeTa / FLYER_TEXT.length), T(near(a, 1.2), over(spread(a), 1.2, 40))];
  },
  '1.R': (c) => {
    const accent = (id: string) => {
      const p = c.p[id];
      const [r, g, b] = rgb(filled(p) ? p.bg : p.c);
      return Math.max(r, g, b) - Math.min(r, g, b) > 60;
    };
    const accents = [...FLYER_TEXT, 'bar'].filter((i) => c.p[i].o > 0 && accent(i));
    const okAccent = accents.length >= 3 && new Set(accents.map((i) => (filled(c.p[i]) ? c.p[i].bg : c.p[i].c))).size === 1;
    const fam = families(c, FLYER_TEXT);
    const lv = mean([uniformity(c, ['date', 'time', 'place'], STYLE), uniformity(c, ['tag', 'price', 'org'], STYLE)]);
    return [
      T(fam <= 2, 2 / fam - 0.05),
      T(sameType(c, ['date', 'time', 'place']) && sameType(c, ['tag', 'price', 'org']), lv),
      T(okAccent, accents.length / 3),
    ];
  },
  '1.C': (c) => {
    const others = FLYER_TEXT.filter((i) => i !== 'title');
    const d = c.p.date;
    const t = ['time', 'place'];
    const hi = filled(d) || (d.fs >= 1.25 * maxFs(c, t) && d.fw >= 700);
    return [
      T(c.p.title.fs >= 2 * maxFs(c, others), c.p.title.fs / (2 * maxFs(c, others))),
      T(hi, 0.5 * Math.min(1, d.fs / (1.25 * maxFs(c, t))) + (d.fw >= 700 ? 0.3 : 0)),
      T(legible(c, FLYER_TEXT), contrastMean(c, FLYER_TEXT)),
    ];
  },

  /* 2 · Login */
  '2.P': (c) => {
    const pairs = [
      ['lblEmail', 'inEmail'],
      ['lblPass', 'inPass'],
    ];
    const gaps = pairs.map(([l, f]) => {
      const a = c.box(l);
      const b = c.box(f);
      const overlap = Math.min(right(a), right(b)) - Math.max(a.x, b.x) > 0;
      return overlap ? b.y - bottom(a) : 99;
    });
    const okPairs = gaps.every((g) => g >= -0.5 && g <= 2.2);
    const tops = pairs.map(([l, f]) => ({ t: Math.min(c.box(l).y, c.box(f).y), b: Math.max(bottom(c.box(l)), bottom(c.box(f))) })).sort((a, b) => a.t - b.t);
    const inter = tops[1].t - tops[0].b;
    const maxIntra = Math.max(...gaps.map((g) => Math.max(g, 0.5)));
    const btnGroup = clusters(c, ['btn1', 'btn2', 'btn3'], 4);
    const others = ['inEmail', 'inPass', 'forgot'];
    const away = Math.min(...['btn1', 'btn2', 'btn3'].flatMap((b) => others.map((o) => gap(c.box(b), c.box(o)))));
    return [
      T(okPairs, mean(gaps.map((g) => (g < -0.5 ? 0.6 : over(g, 2.2, 30))))),
      T(inter >= 4 && inter >= 2 * maxIntra, Math.min(inter / 4, inter / (2 * maxIntra))),
      T(btnGroup.groups.length === 1 && away >= 5, 0.5 / btnGroup.groups.length + 0.5 * Math.min(1, away / 5)),
    ];
  },
  '2.A': (c) => {
    const w = LOGIN_BOX.map((i) => c.box(i).w);
    const x = LOGIN_BOX.map((i) => c.box(i).x);
    const labels = ['lblEmail', 'lblPass'];
    const dev = Math.max(...labels.map((i) => Math.abs(anchor(c, i) - c.box('inEmail').x)));
    const sameTa = new Set(labels.map((i) => c.p[i].ta)).size === 1;
    return [
      T(near(w, 0.6), over(spread(w), 0.6, 40)),
      T(near(x, 0.6), over(spread(x), 0.6, 40)),
      T(sameTa && dev <= 1.5, 0.4 * (sameTa ? 1 : 0.4) + 0.6 * clamp(over(dev, 1.5, 30))),
    ];
  },
  '2.R': (c) => {
    const r = LOGIN_BOX.map((i) => num(c.p[i].r));
    const h = LOGIN_BOX.map((i) => c.box(i).h);
    const fam = families(c, LOGIN_TEXT);
    return [
      T(near(r, 0.3) && near(h, 0.4), Math.min(over(spread(r), 0.3, 6), over(spread(h), 0.4, 6))),
      T(fam <= 2, 2 / fam - 0.05),
      T(sameType(c, ['btn1', 'btn2', 'btn3']) && sameType(c, ['lblEmail', 'lblPass']), mean([uniformity(c, ['btn1', 'btn2', 'btn3'], STYLE), uniformity(c, ['lblEmail', 'lblPass'], STYLE)])),
    ];
  },
  '2.C': (c) => {
    const [b1, b2] = [c.p.btn1, c.p.btn2];
    const others = LOGIN_TEXT.filter((i) => i !== 'title');
    const distinct = filled(b1) && (!filled(b2) || contrast(b1.bg, b2.bg) >= 3);
    const dPartial = !filled(b1) ? 0.1 : !filled(b2) ? 1 : contrast(b1.bg, b2.bg) / 3;
    return [
      T(distinct, dPartial),
      T(legible(c, LOGIN_TEXT), contrastMean(c, LOGIN_TEXT)),
      T(c.p.title.fs >= 1.6 * maxFs(c, others), c.p.title.fs / (1.6 * maxFs(c, others))),
    ];
  },

  /* 3 · Produto */
  '3.P': (c) => {
    const ids = ['name', 'rev', 'desc', 'ship', 'price', 'buy', ...SELOS];
    const { groups } = clusters(c, ids, 4);
    const gPB = gap(c.box('price'), c.box('buy'));
    const lim = Math.max(c.box('buy').h, 4);
    const worst = Math.max(gap(c.box('name'), c.box('rev')), gap(c.box('desc'), c.box('ship')));
    return [
      T(gPB <= lim, over(gPB, lim, 40)),
      T(worst <= 3.5, over(worst, 3.5, 40)),
      T(groups.length >= 3 && groups.length <= 5, groups.length < 3 ? groups.length / 3 : 1 - (groups.length - 5) / 3),
    ];
  },
  '3.A': (c) => {
    const bs = THUMBS.map((i) => c.box(i)).sort((a, b) => a.x - b.x);
    const gaps = [bs[1].x - right(bs[0]), bs[2].x - right(bs[1])];
    const col = ['name', 'rev', 'desc', 'ship', 'price', 'buy'].map((i) => (i === 'buy' ? c.box(i).x : anchor(c, i)));
    const okT = near(bs.map((b) => b.w), 0.4) && near(bs.map((b) => b.h), 0.4) && near(bs.map((b) => b.y), 0.6) && Math.abs(gaps[0] - gaps[1]) <= 0.6;
    return [
      T(okT, Math.min(over(spread(bs.map((b) => b.w)), 0.4, 20), over(spread(bs.map((b) => b.h)), 0.4, 20), over(spread(bs.map((b) => b.y)), 0.6, 20), over(Math.abs(gaps[0] - gaps[1]), 0.6, 20))),
      T(near(col, 1.2), over(spread(col), 1.2, 40)),
      T(near(SELOS.map((i) => c.box(i).y), 0.6), over(spread(SELOS.map((i) => c.box(i).y)), 0.6, 40)),
    ];
  },
  '3.R': (c) => {
    const same = (k: keyof Full) => new Set(SELOS.map((i) => (typeof c.p[i][k] === 'number' ? Math.round((c.p[i][k] as number) * 5) : String(c.p[i][k])))).size === 1;
    const keys: (keyof Full)[] = ['ff', 'fs', 'fw', 'st', 'c', 'bg', 'r', 'bd'];
    const boxes = SELOS.map((i) => c.box(i));
    const okS = keys.every(same) && near(boxes.map((b) => b.w), 0.4) && near(boxes.map((b) => b.h), 0.4);
    const eq = keys.filter(same).length + (near(boxes.map((b) => b.w), 0.4) ? 1 : 0) + (near(boxes.map((b) => b.h), 0.4) ? 1 : 0);
    const fam = families(c, PROD_TEXT);
    return [
      T(okS, eq / (keys.length + 2)),
      T(fam <= 2, 2 / fam - 0.05),
      T(sameType(c, ['rev', 'desc', 'ship'], ['c']), uniformity(c, ['rev', 'desc', 'ship'], [...STYLE, 'c'])),
    ];
  },
  '3.C': (c) => {
    const buyContrast = filled(c.p.buy) ? contrast(c.p.buy.bg, c.bg) : 1;
    const others = Math.max(1, ...SELOS.filter((i) => filled(c.p[i])).map((i) => contrast(c.p[i].bg, c.bg)));
    const ids = ['name', 'rev', 'desc', 'ship', 'price', 'buy', ...SELOS];
    return [
      T(buyContrast >= 3 && buyContrast > others, filled(c.p.buy) ? Math.min(buyContrast / 3, buyContrast / (others + 0.01)) : 0.08),
      T(c.p.price.fs >= 1.8 * maxFs(c, ['rev', 'desc', 'ship']), c.p.price.fs / (1.8 * maxFs(c, ['rev', 'desc', 'ship']))),
      T(legible(c, ids), contrastMean(c, ids)),
    ];
  },
};

/** Notas de 0 a 1 dos 3 critérios da missão. */
export function scoreChecks(id: string, ctx: Ctx): number[] {
  return checks[id](ctx);
}
export const passes = (scores: number[]) => scores.map((s) => s >= 1);
