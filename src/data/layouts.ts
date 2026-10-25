/**
 * Os três layouts quebrados da oficina, descritos como dados.
 *
 * Cada elemento tem 5 estados (0 = quebrado, 1..4 = depois de P, A, R, C).
 * O estado 0 é completo; os seguintes só trazem o que mudou. O mesmo
 * `styleOf` roda no servidor (figurinhas estáticas) e no navegador
 * (layout vivo que se corrige missão a missão).
 *
 * Unidades numéricas = cqw (1% da largura do layout), então o layout
 * escala igual em qualquer tamanho de figurinha.
 */

export type Stage = 0 | 1 | 2 | 3 | 4;

export interface Props {
  x?: number;
  y?: number;
  w?: number;
  h?: number | 'auto';
  fs?: number;
  fw?: number;
  ta?: 'left' | 'center' | 'right';
  va?: 'start' | 'center';
  ff?: '1' | '2' | '3' | '4';
  st?: 'normal' | 'italic';
  tt?: 'none' | 'uppercase';
  ls?: string;
  lh?: number;
  c?: string;
  bg?: string;
  r?: number | string;
  bd?: string;
  pad?: string;
  o?: number;
}

export interface El {
  id: string;
  text?: string;
  s: [Props, Props?, Props?, Props?, Props?];
}

export interface LayoutSpec {
  id: 'flyer' | 'login' | 'product';
  w: number;
  h: number;
  bg: string;
  els: El[];
}

const BASE: Required<Props> = {
  x: 0, y: 0, w: 30, h: 'auto', fs: 4, fw: 400, ta: 'left', va: 'start',
  ff: '1', st: 'normal', tt: 'none', ls: '0', lh: 1.2, c: '#222',
  bg: 'transparent', r: 0, bd: '0 solid transparent', pad: '0', o: 1,
};

const E = (id: string, text: string | undefined, ...s: Props[]): El => ({
  id,
  text,
  s: s as El['s'],
});

export function resolve(el: El, stage: Stage): Required<Props> {
  let p: Required<Props> = { ...BASE };
  for (let i = 0; i <= stage; i++) p = { ...p, ...(el.s[i] ?? {}) };
  return p;
}

const u = (v: number | string) => (typeof v === 'number' ? `${v}cqw` : v);

export type Full = Required<Props>;
export type PropsMap = Record<string, Full>;

export function styleFromProps(p: Full): string {
  const jc = p.ta === 'center' ? 'center' : p.ta === 'right' ? 'flex-end' : 'flex-start';
  return [
    `left:${u(p.x)}`, `top:${u(p.y)}`, `width:${u(p.w)}`,
    `height:${p.h === 'auto' ? 'auto' : u(p.h)}`,
    `font-size:${u(p.fs)}`, `font-weight:${p.fw}`, `text-align:${p.ta}`,
    `font-family:var(--lf${p.ff})`, `font-style:${p.st}`, `text-transform:${p.tt}`,
    `letter-spacing:${p.ls}`, `line-height:${p.lh}`, `color:${p.c}`,
    `background-color:${p.bg}`, `border-radius:${u(p.r)}`, `border:${p.bd}`,
    `padding:${p.pad}`, `opacity:${p.o}`,
    `justify-content:${jc}`, `align-items:${p.va === 'center' ? 'center' : 'flex-start'}`,
  ].join(';');
}

export function styleOf(el: El, stage: Stage): string {
  return styleFromProps(resolve(el, stage));
}

/** Estado completo de um layout num estágio: ponto de partida de cada missão. */
export function mapAt(spec: LayoutSpec, stage: Stage): PropsMap {
  const out: PropsMap = {};
  for (const el of spec.els) out[el.id] = resolve(el, stage);
  return out;
}

/** Elementos que são só decoração: não se selecionam nem se movem. */
export const DECOR = new Set(['bar', 'd1', 'd2', 'd3', 'panel', 'mugHandle', 'mugBody']);

/** Cria o DOM de um layout a partir de um mapa de props (no navegador). */
export function buildLayout(spec: LayoutSpec, map: PropsMap, stage: Stage, label?: string): HTMLElement {
  const root = document.createElement('div');
  root.className = 'lay';
  root.dataset.layout = spec.id;
  root.dataset.stage = String(stage);
  root.style.aspectRatio = `${spec.w}/${spec.h}`;
  root.style.backgroundColor = spec.bg;
  if (label) {
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', label);
  } else root.setAttribute('aria-hidden', 'true');
  const inner = document.createElement('div');
  inner.className = 'lay-in';
  for (const el of spec.els) {
    const d = document.createElement('div');
    d.className = 'el';
    d.dataset.id = el.id;
    if (el.text) d.textContent = el.text;
    d.style.cssText = styleFromProps(map[el.id]);
    inner.appendChild(d);
  }
  root.appendChild(inner);
  return root;
}

/* ───────────────────────── Nível 1 · Flyer de evento ───────────────────────── */

const INK = '#1b1814';
const SOFT = '#4a453e';
const M = '#B8006A';

const flyer: LayoutSpec = {
  id: 'flyer',
  w: 100,
  h: 133.33,
  bg: '#F6F5F1',
  els: [
    E('bar', undefined,
      { x: 0, y: 0, w: 100, h: 3.5, bg: M, o: 0 }, {}, {}, { o: 1 }, {}),
    E('title', 'Feira de Troca de Plantas',
      { x: 8, y: 7, w: 62, fs: 4.4, ff: '3', ta: 'left', c: '#8a8a8a' },
      { y: 10, w: 70 },
      { x: 10, w: 80 },
      { x: 10, y: 12, ff: '2', fw: 700, fs: 5.4, c: '#858585' },
      { y: 9, w: 82, fs: 11.5, fw: 800, lh: 0.95, ls: '-0.02em', c: INK }),
    E('tag', 'Traga uma muda, leve outra',
      { x: 40, y: 112, w: 52, fs: 4.2, ff: '4', ta: 'right', c: '#9a9a9a' },
      { x: 14, y: 16.8, w: 70 },
      { x: 10, w: 80, ta: 'left' },
      { y: 20, ff: '1', st: 'italic', fs: 3.9, c: '#8f8f8f' },
      { y: 44.5, fs: 4.4, c: SOFT }),
    E('date', 'Sábado, 14 de novembro',
      { x: 12, y: 30, w: 42, fs: 4.2, ff: '2', ta: 'center', c: '#777' },
      { x: 10, y: 54, w: 60 },
      { w: 80, ta: 'left' },
      { x: 15, y: 50, w: 75, fw: 600, fs: 4.4, c: '#858585' },
      { x: 10, y: 60, w: 80, h: 12, fs: 5.4, fw: 800, c: '#fff', bg: M, pad: '0 2.5cqw', va: 'center' }),
    E('time', '10h às 16h',
      { x: 55, y: 78, w: 30, fs: 4.2, ff: '1', ta: 'left', c: '#888' },
      { x: 14, y: 59.5, w: 40 },
      { x: 10, w: 80 },
      { x: 15, y: 56.6, w: 75, ff: '2', fw: 600, fs: 4.4, c: '#858585' },
      { y: 75, fs: 4.8, c: INK }),
    E('place', 'Praça da Liberdade',
      { x: 6, y: 100, w: 45, fs: 4.2, ff: '3', ta: 'right', c: '#8a8a8a' },
      { x: 8, y: 65, w: 70 },
      { x: 10, w: 80, ta: 'left' },
      { x: 15, y: 63.2, w: 75, ff: '2', fw: 600, fs: 4.4, c: '#858585' },
      { y: 82, fs: 4.8, c: INK }),
    E('price', 'Entrada R$ 5',
      { x: 62, y: 18, w: 30, fs: 4.2, ff: '4', ta: 'center', c: '#999' },
      { x: 48, y: 92, w: 40 },
      { x: 10, w: 80, ta: 'left' },
      { y: 88, ff: '1', fs: 3.9, c: '#8f8f8f' },
      { y: 100, fs: 4.4, c: SOFT }),
    E('org', 'Organização: Coletivo Raiz',
      { x: 28, y: 55, w: 50, fs: 3.6, ff: '2', ta: 'left', c: '#aaa' },
      { x: 12, y: 118, w: 60 },
      { x: 10, w: 80 },
      { y: 120, ff: '1', fs: 3.2, c: '#8f8f8f' },
      { y: 122, fs: 3.4, c: SOFT }),
    E('d1', undefined,
      { x: 10, y: 51.5, w: 2.2, h: 2.2, bg: M, r: '50%', o: 0 }, {}, {}, { o: 1 }, { o: 0 }),
    E('d2', undefined,
      { x: 10, y: 58.1, w: 2.2, h: 2.2, bg: M, r: '50%', o: 0 }, {}, {}, { o: 1 }, { y: 76.6 }),
    E('d3', undefined,
      { x: 10, y: 64.7, w: 2.2, h: 2.2, bg: M, r: '50%', o: 0 }, {}, {}, { o: 1 }, { y: 83.6 }),
  ],
};

/* ───────────────────────── Nível 2 · Tela de login ───────────────────────── */

const BL = '#2D6CDF';
const DB = '#0B5FA5';
const FIELD = { fs: 3.4, ff: '2' as const, ta: 'left' as const, bg: '#fff', va: 'center' as const, pad: '0 2.4cqw' };

const login: LayoutSpec = {
  id: 'login',
  w: 100,
  h: 177.78,
  bg: '#F4F5F7',
  els: [
    E('title', 'Entrar',
      { x: 8, y: 16, w: 50, fs: 5.2, ff: '1', c: '#555' },
      { y: 20 },
      { w: 84 },
      { ff: '2', fw: 700, fs: 5.6, c: '#7a8089' },
      { fs: 9, fw: 800, lh: 1.05, c: '#10151c' }),
    E('sub', 'Acesse sua conta no Rota.',
      { x: 34, y: 26, w: 58, fs: 3.4, ff: '2', ta: 'right', c: '#9a9a9a' },
      { x: 30, y: 27.7, w: 62 },
      { x: 8, w: 84, ta: 'left' },
      { ff: '1', c: '#8d939b' },
      { y: 32, fs: 3.8, c: '#475060' }),
    E('lblEmail', 'E-mail',
      { x: 6, y: 44, w: 30, fs: 3.4, ff: '3', c: '#8a8a8a' },
      { y: 50 },
      { x: 8, w: 84 },
      { ff: '2', fw: 600, c: '#8d939b' },
      { fs: 3.6, c: '#1a1f26' }),
    E('inEmail', 'voce@exemplo.com',
      { x: 12, y: 76, w: 70, h: 9, ...FIELD, c: '#aaa', bd: '0.3cqw solid #aaa', r: 0.6 },
      { y: 55 },
      { x: 8, w: 84 },
      { r: 2.2, h: 10, bd: '0.3cqw solid #aab0b8', c: '#aab0b8' },
      { bd: '0.35cqw solid #5f6875', c: '#5b6470' }),
    E('lblPass', 'Senha',
      { x: 56, y: 52, w: 30, fs: 3.4, ff: '1', c: '#8a8a8a' },
      { x: 6, y: 72 },
      { x: 8, w: 84 },
      { ff: '2', fw: 600, c: '#8d939b' },
      { fs: 3.6, c: '#1a1f26' }),
    E('inPass', '•••••••••',
      { x: 5, y: 100, w: 88, h: 9, ...FIELD, c: '#aaa', bd: '0.3cqw solid #bbb', r: 2 },
      { y: 77 },
      { x: 8, w: 84 },
      { r: 2.2, h: 10, bd: '0.3cqw solid #aab0b8', c: '#aab0b8' },
      { bd: '0.35cqw solid #5f6875', c: '#5b6470' }),
    E('forgot', 'Esqueci minha senha',
      { x: 44, y: 114, w: 50, fs: 3, ff: '3', ta: 'right', c: '#6b88b8' },
      { y: 87.8 },
      { x: 8, w: 84, ta: 'left' },
      { ff: '2', fw: 600, fs: 3.2, c: '#6b88b8' },
      { y: 89.5, c: DB }),
    E('btn1', 'Entrar',
      { x: 10, y: 126, w: 60, h: 10, bg: BL, c: '#fff', r: 5, fs: 3.6, ff: '2', fw: 700, ta: 'center', va: 'center' },
      { y: 108 },
      { x: 8, w: 84 },
      { r: 2.2 },
      { h: 12, bg: DB, fs: 4, fw: 800 }),
    E('btn2', 'Criar conta',
      { x: 22, y: 140, w: 66, h: 10, bg: BL, c: '#fff', r: 0, fs: 3.4, ff: '3', ta: 'center', va: 'center' },
      { y: 120 },
      { x: 8, w: 84 },
      { ff: '2', fw: 700, fs: 3.6, r: 2.2 },
      { y: 122, bg: 'transparent', c: DB, bd: '0.5cqw solid ' + DB }),
    E('btn3', 'Continuar com Google',
      { x: 8, y: 155, w: 70, h: 9, bg: '#fff', c: BL, bd: '0.5cqw solid ' + BL, r: 2, fs: 3.2, ff: '1', st: 'italic', ta: 'center', va: 'center' },
      { y: 136 },
      { x: 8, w: 84 },
      { bg: BL, c: '#fff', ff: '2', st: 'normal', fw: 700, fs: 3.6, h: 10, r: 2.2 },
      { y: 138, bg: 'transparent', c: DB, bd: '0 solid transparent', fw: 600 }),
    E('terms', 'Ao entrar, você aceita os termos de uso.',
      { x: 14, y: 168, w: 74, fs: 2.6, ff: '3', ta: 'center', c: '#bbb' },
      { y: 162 },
      { x: 8, w: 84, ta: 'left' },
      { ff: '2', fs: 2.8, c: '#9aa0a8' },
      { c: '#475060' }),
  ],
};

/* ───────────────────────── Nível 3 · Página de produto ───────────────────────── */

const CL = '#C9743A';
const TINT = '#D9D3C6';

const product: LayoutSpec = {
  id: 'product',
  w: 100,
  h: 75,
  bg: '#FBFAF7',
  els: [
    E('panel', undefined, { x: 4, y: 4, w: 44, h: 50, bg: '#E9E5DB', r: 1 }),
    E('mugHandle', undefined,
      { x: 32.5, y: 23, w: 9, h: 11, bd: '2.2cqw solid ' + CL, r: '50%' }),
    E('mugBody', undefined,
      { x: 16, y: 19, w: 20, h: 23, bg: CL, r: '0.8cqw 0.8cqw 5cqw 5cqw' }),
    E('t1', undefined,
      { x: 4, y: 57, w: 10, h: 10, bg: TINT, r: 0 },
      {},
      { w: 12, h: 12, y: 57 },
      { r: 1.2 },
      { bd: '0.4cqw solid #17140f' }),
    E('t2', undefined,
      { x: 17, y: 59.5, w: 13, h: 8, bg: TINT, r: 2.5 },
      {},
      { x: 19, y: 57, w: 12, h: 12 },
      { r: 1.2 }),
    E('t3', undefined,
      { x: 33.5, y: 56, w: 9, h: 12, bg: TINT, r: '50%' },
      {},
      { x: 34, y: 57, w: 12, h: 12 },
      { r: 1.2 }),
    E('name', 'Caneca Cerâmica Aurora',
      { x: 54, y: 7, w: 40, fs: 3.4, ff: '1', c: '#777' },
      { y: 6, w: 42 },
      {},
      { ff: '2', fw: 700, fs: 4.4, c: '#8a8a8a' },
      { fs: 5.6, fw: 800, c: '#17140f' }),
    E('rev', '4,7 de 5 · 128 avaliações',
      { x: 64, y: 20, w: 32, fs: 3, ff: '3', ta: 'right', c: '#999' },
      { y: 11.5 },
      { x: 54, w: 42, ta: 'left' },
      { ff: '1', fs: 2.7, c: '#8f8f8f' },
      { y: 14, fs: 3, c: '#4a453e' }),
    E('desc', 'Cerâmica esmaltada, 300 ml. Vai ao micro-ondas e à lava-louças.',
      { x: 52, y: 34, w: 44, fs: 2.9, ff: '2', c: '#999' },
      { x: 54, y: 20, w: 42 },
      {},
      { ff: '1', fs: 2.7, c: '#8f8f8f' },
      { y: 21, c: '#4a453e' }),
    E('ship', 'Frete grátis acima de R$ 150. Chega em até 3 dias úteis.',
      { x: 58, y: 46, w: 38, fs: 2.9, ff: '1', st: 'italic', ta: 'right', c: '#aaa' },
      { x: 58, y: 29, w: 38 },
      { x: 54, w: 42, ta: 'left' },
      { st: 'normal', fs: 2.7, c: '#8f8f8f' },
      { y: 30, c: '#4a453e' }),
    E('price', 'R$ 89,90',
      { x: 56, y: 64, w: 24, fs: 3.4, ff: '3', ta: 'center', c: '#999' },
      { y: 41.5 },
      { x: 54, w: 20, ta: 'left' },
      { ff: '2', fw: 700, fs: 4.4, c: '#8a8a8a' },
      { y: 38, fs: 8, fw: 800, w: 42, c: '#17140f' }),
    E('buy', 'Comprar agora',
      { x: 78, y: 52, w: 19, h: 4.6, fs: 2.4, ff: '1', bg: '#BBB', c: '#fff', r: 0.4, ta: 'center', va: 'center' },
      { x: 80, y: 40, w: 16, h: 6 },
      { x: 74, w: 22 },
      { ff: '2', fw: 700, fs: 2.6, r: 1, bg: '#B5B2AB' },
      { x: 54, y: 48, w: 42, h: 9, bg: '#17140f', c: '#FFD500', fs: 3.4, fw: 800, r: 1.2 }),
    E('s1', 'Original',
      { x: 88, y: 6, w: 9, h: 9, r: '50%', bd: '0.4cqw solid ' + CL, fs: 2, ta: 'center', va: 'center', ff: '3', c: CL },
      { x: 55, y: 52, w: 9, h: 9 },
      { x: 54, y: 54, w: 13, h: 5 },
      { r: 2.5, bd: '0 solid transparent', bg: '#EDE7DA', c: '#3a352e', ff: '2', fw: 600, fs: 2.1 },
      { y: 62 }),
    E('s2', 'Entrega rápida',
      { x: 52, y: 56, w: 14, h: 4, bg: '#3b7a57', c: '#fff', r: 0.5, fs: 1.9, ff: '2', ta: 'center', va: 'center' },
      { x: 66, y: 55, w: 14, h: 4 },
      { x: 68, y: 54, w: 13, h: 5 },
      { r: 2.5, bg: '#EDE7DA', c: '#3a352e', fw: 600, fs: 2.1 },
      { y: 62 }),
    E('s3', 'Ecológico',
      { x: 70, y: 67, w: 15, h: 5, bd: '0.3cqw dashed #777', r: 2.5, fs: 2.2, ff: '1', st: 'italic', ta: 'center', va: 'center', c: '#777' },
      { x: 82, y: 54, w: 15, h: 5 },
      { x: 83, y: 54, w: 13, h: 5 },
      { bd: '0 solid transparent', bg: '#EDE7DA', c: '#3a352e', ff: '2', st: 'normal', fw: 600, fs: 2.1 },
      { y: 62 }),
  ],
};

export const LAYOUTS: Record<LayoutSpec['id'], LayoutSpec> = { flyer, login, product };

/** Tinta de cada estágio da misregistration: some conforme as placas entram no registro. */
export const GHOST = [0.7, 0.52, 0.34, 0.17, 0] as const;
