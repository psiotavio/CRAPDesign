/**
 * Editor de layout dentro do site.
 * Arrastar (com guias que imantam), alças para redimensionar, zoom, e ferramentas
 * agrupadas. A missão abre o grupo do seu foco; o resto fica à mão, fechado.
 * O resultado é conferido ao vivo (checks.ts).
 */
import { DECOR, LAYOUTS, buildLayout, styleFromProps, type Full, type PropsMap, type Stage } from '../data/layouts';
import { TOOLS, type Mission, type P } from '../data/content';
import { passes, scoreChecks, textContrast, type Box, type Ctx } from './checks';

export interface Editor {
  getMap(): PropsMap;
  results(): boolean[];
  scores(): number[];
  undo(): void;
  reset(): void;
  setReadOnly(on: boolean): void;
  boxes(): Record<string, Box>;
}

interface Options {
  host: HTMLElement;
  bar: HTMLElement;
  view: HTMLElement;
  mission: Mission;
  map: PropsMap;
  onChange: (map: PropsMap, results: boolean[], scores: number[]) => void;
  onLive?: (scores: number[]) => void;
}

const ACCENT = { flyer: '#B8006A', login: '#0B5FA5', product: '#C9743A' } as const;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const round = (v: number, step = 0.25) => Math.round(v / step) * step;
const right = (b: Box) => b.x + b.w;
const bottom = (b: Box) => b.y + b.h;
const isBox = (p: Full) => p.h !== 'auto' || p.bg !== 'transparent' || !/^0/.test(p.bd);

/** Quais grupos de ferramentas abrem por padrão em cada princípio. */
const FOCUS: Record<P, string[]> = {
  P: ['mover'],
  A: ['alinhar', 'medidas'],
  R: ['estilo', 'texto', 'marca'],
  C: ['texto', 'cores'],
};

export function createEditor(o: Options): Editor {
  const m = o.mission;
  const spec = LAYOUTS[m.layout];
  const accent = ACCENT[m.layout];

  let map: PropsMap = clone(o.map);
  const initial: PropsMap = clone(o.map);
  const hist: string[] = [];
  const sel = new Set<string>();
  let readOnly = false;
  let res: boolean[] = [false, false, false];
  let scores: number[] = [0, 0, 0];
  let clip: Full | null = null;
  let zoom = 1;

  const root = buildLayout(spec, map, (m.stage - 1) as Stage, `Layout ${m.layout} em edição`);
  root.classList.add('edit');
  o.host.replaceChildren(root);
  const els = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('.el').forEach((e) => els.set(e.dataset.id!, e));

  const layer = document.createElement('div');
  layer.className = 'sel-layer';
  const hW = document.createElement('div');
  hW.className = 'handle hw';
  hW.title = 'Arraste para mudar a largura';
  const hS = document.createElement('div');
  hS.className = 'handle hs';
  hS.title = 'Arraste para mudar o tamanho';
  layer.append(hW, hS);
  root.appendChild(layer);

  const selectable = (id: string) => !DECOR.has(id);

  /* ───────── medição ───────── */

  const unit = () => root.getBoundingClientRect().width / 100;

  function elBox(id: string): Box {
    const rr = root.getBoundingClientRect();
    const s = rr.width / 100;
    const r = els.get(id)!.getBoundingClientRect();
    return { x: (r.left - rr.left) / s, y: (r.top - rr.top) / s, w: r.width / s, h: r.height / s };
  }

  /** Texto solto é medido pela tinta; caixas (botão, campo, selo) pela borda. */
  function boxOf(id: string): Box {
    const el = els.get(id)!;
    const p = map[id];
    if (el.textContent && !isBox(p)) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rs = [...range.getClientRects()].filter((q) => q.width > 0);
      if (rs.length) {
        const rr = root.getBoundingClientRect();
        const s = rr.width / 100;
        const l = Math.min(...rs.map((q) => q.left));
        const t = Math.min(...rs.map((q) => q.top));
        const rg = Math.max(...rs.map((q) => q.right));
        const b = Math.max(...rs.map((q) => q.bottom));
        return { x: (l - rr.left) / s, y: (t - rr.top) / s, w: (rg - l) / s, h: (b - t) / s };
      }
    }
    return elBox(id);
  }

  const ctx = (): Ctx => ({ p: map, box: boxOf, bg: spec.bg });

  /* ───────── render ───────── */

  const note = document.createElement('p');
  note.className = 'tb-note';
  note.setAttribute('aria-live', 'polite');
  const selInfo = document.createElement('span');
  selInfo.className = 'tb-sel';
  const contrastInfo = document.createElement('p');
  contrastInfo.className = 'tb-contrast';

  function placeHandles() {
    const one = !readOnly && sel.size === 1 ? [...sel][0] : null;
    layer.dataset.on = one ? '1' : '';
    if (!one) return;
    const b = elBox(one);
    hW.style.left = `${b.x + b.w}cqw`;
    hW.style.top = `${b.y + b.h / 2}cqw`;
    hS.style.left = `${b.x + b.w}cqw`;
    hS.style.top = `${b.y + b.h}cqw`;
  }

  function paint() {
    for (const [id, el] of els) {
      el.style.cssText = styleFromProps(map[id]);
      el.classList.toggle('sel', sel.has(id));
      if (selectable(id)) el.setAttribute('aria-pressed', String(sel.has(id)));
    }
    selInfo.textContent = sel.size === 0 ? 'Clique em um bloco' : sel.size === 1 ? '1 bloco selecionado' : `${sel.size} blocos selecionados`;
    const texts = [...sel].filter((i) => map[i].o > 0 && els.get(i)?.textContent);
    if (texts.length) {
      const c = Math.min(...texts.map((i) => textContrast(ctx(), i)));
      contrastInfo.textContent = `Contraste do texto: ${c.toFixed(1)}:1 ${c >= 4.5 ? '✓' : '✗ (mínimo 4,5)'}`;
      contrastInfo.dataset.ok = String(c >= 4.5);
    } else contrastInfo.textContent = '';
    placeHandles();
  }

  function evaluate() {
    scores = scoreChecks(m.id, ctx());
    res = passes(scores);
    root.dataset.stage = String(res.every(Boolean) ? m.stage : m.stage - 1);
    o.onChange(clone(map), res, scores);
  }

  /* quente/frio ao vivo, enquanto arrasta ou redimensiona */
  let liveQueued = false;
  function live() {
    if (liveQueued || !o.onLive) return;
    liveQueued = true;
    requestAnimationFrame(() => {
      liveQueued = false;
      o.onLive!(scoreChecks(m.id, ctx()));
    });
  }

  function commit(fn: () => void, pre?: string) {
    hist.push(pre ?? JSON.stringify(map));
    if (hist.length > 40) hist.shift();
    note.textContent = '';
    fn();
    paint();
    evaluate();
  }

  /* ───────── seleção, arrasto e guias ───────── */

  const ids = () => [...sel].filter((i) => map[i]);

  const clearGuides = () => layer.querySelectorAll('.guide').forEach((g) => g.remove());
  function guide(axis: 'x' | 'y', pos: number) {
    const g = document.createElement('div');
    g.className = `guide ${axis}`;
    if (axis === 'x') g.style.left = `${pos}cqw`;
    else g.style.top = `${pos}cqw`;
    layer.appendChild(g);
  }

  const SNAP = 0.9;
  function snapTo(vals: number[], lines: number[]) {
    let best: { d: number; line: number } | null = null;
    for (const v of vals)
      for (const l of lines) {
        const d = l - v;
        if (Math.abs(d) <= SNAP && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, line: l };
      }
    return best;
  }

  type Drag = {
    sx: number;
    sy: number;
    orig: Record<string, { x: number; y: number }>;
    gb: Box;
    lines: { x: number[]; y: number[] };
    pre: string;
    moved: boolean;
    toggle?: string;
  };
  let drag: Drag | null = null;

  els.forEach((el, id) => {
    if (!selectable(id)) {
      el.style.pointerEvents = 'none';
      return;
    }
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', el.textContent || `Bloco ${id}`);
    el.setAttribute('aria-pressed', 'false');

    el.addEventListener('pointerdown', (e) => {
      if (readOnly) return;
      e.stopPropagation();
      let toggle: string | undefined;
      if (!sel.has(id)) {
        if (!e.shiftKey) sel.clear();
        sel.add(id);
      } else if (e.shiftKey) toggle = id;
      paint();
      el.setPointerCapture(e.pointerId);
      const s = ids();
      const bx = s.map(boxOf);
      const x0 = Math.min(...bx.map((b) => b.x));
      const y0 = Math.min(...bx.map((b) => b.y));
      const gb = { x: x0, y: y0, w: Math.max(...bx.map(right)) - x0, h: Math.max(...bx.map(bottom)) - y0 };
      const others = [...els.keys()].filter((i) => selectable(i) && !sel.has(i) && map[i].o > 0).map(boxOf);
      const orig: Drag['orig'] = {};
      s.forEach((i) => (orig[i] = { x: map[i].x, y: map[i].y }));
      drag = {
        sx: e.clientX,
        sy: e.clientY,
        orig,
        gb,
        lines: {
          x: [50, ...others.flatMap((b) => [b.x, b.x + b.w / 2, right(b)])],
          y: [...others.flatMap((b) => [b.y, b.y + b.h / 2, bottom(b)])],
        },
        pre: JSON.stringify(map),
        moved: false,
        toggle,
      };
      e.preventDefault();
    });

    el.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const u = unit();
      let dx = (e.clientX - drag.sx) / u;
      let dy = (e.clientY - drag.sy) / u;
      if (!drag.moved && Math.hypot(dx, dy) < 0.4) return;
      drag.moved = true;
      clearGuides();
      if (!e.altKey) {
        const { gb, lines } = drag;
        const sx = snapTo([gb.x + dx, gb.x + dx + gb.w / 2, gb.x + dx + gb.w], lines.x);
        const sy = snapTo([gb.y + dy, gb.y + dy + gb.h / 2, gb.y + dy + gb.h], lines.y);
        if (sx) {
          dx += sx.d;
          guide('x', sx.line);
        }
        if (sy) {
          dy += sy.d;
          guide('y', sy.line);
        }
      }
      for (const i of Object.keys(drag.orig)) {
        map[i].x = round(drag.orig[i].x + dx);
        map[i].y = round(drag.orig[i].y + dy);
      }
      paint();
      live();
    });

    const end = () => {
      if (!drag) return;
      const d = drag;
      drag = null;
      clearGuides();
      if (d.moved) {
        hist.push(d.pre);
        evaluate();
      } else if (d.toggle) {
        sel.delete(d.toggle);
        paint();
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    el.addEventListener('keydown', (e) => {
      if (readOnly) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (sel.has(id)) sel.delete(id);
        else sel.add(id);
        paint();
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        if (!sel.has(id)) sel.add(id);
        const step = e.shiftKey ? 2 : 0.5;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        commit(() => ids().forEach((i) => ((map[i].x = round(map[i].x + dx)), (map[i].y = round(map[i].y + dy)))));
      } else if (e.key === 'Escape') {
        sel.clear();
        paint();
      }
    });
  });

  root.addEventListener('pointerdown', (e) => {
    if (readOnly || (e.target as HTMLElement).closest('.el[role="button"], .handle')) return;
    sel.clear();
    paint();
  });

  /* ───────── alças: largura e tamanho ───────── */

  function handleDrag(kind: 'w' | 's') {
    return (e: PointerEvent) => {
      if (readOnly || sel.size !== 1) return;
      e.stopPropagation();
      e.preventDefault();
      const handle = e.currentTarget as HTMLElement;
      handle.setPointerCapture(e.pointerId);
      const id = [...sel][0];
      const pre = JSON.stringify(map);
      const o0 = { w: map[id].w, h: map[id].h, fs: map[id].fs };
      const box = isBox(map[id]);
      const sx = e.clientX;
      const sy = e.clientY;
      let moved = false;
      const move = (ev: PointerEvent) => {
        const dx = (ev.clientX - sx) / unit();
        const dy = (ev.clientY - sy) / unit();
        moved = true;
        const p = map[id];
        if (kind === 'w') p.w = Math.max(6, round(o0.w + dx, 0.5));
        else if (box) {
          p.w = Math.max(6, round(o0.w + dx, 0.5));
          if (typeof o0.h === 'number') p.h = Math.max(3, round(o0.h + dy, 0.5));
        } else p.fs = Math.min(24, Math.max(1.5, Math.round(o0.fs * Math.max(0.3, 1 + (dx + dy) / 2 / 14) * 10) / 10));
        paint();
        live();
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        if (moved) {
          hist.push(pre);
          evaluate();
        }
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    };
  }
  hW.addEventListener('pointerdown', handleDrag('w'));
  hS.addEventListener('pointerdown', handleDrag('s'));

  /* ───────── operações ───────── */

  const need = (n: number) => {
    if (ids().length >= n) return true;
    note.textContent = n === 1 ? 'Clique em um bloco primeiro.' : `Selecione ${n} ou mais blocos (Shift + clique, ou "Todos").`;
    return false;
  };
  const each = (fn: (p: Full, id: string) => void) => commit(() => ids().forEach((i) => fn(map[i], i)));

  function join() {
    if (!need(2)) return;
    commit(() => {
      const s = ids().sort((a, b) => boxOf(a).y - boxOf(b).y);
      const orig = s.map(boxOf);
      const first = orig[0];
      let gx0 = first.x;
      let gx1 = right(first);
      let gb = first.y + first.h;
      const next: { dx: number; y: number }[] = [{ dx: 0, y: first.y }];
      for (const b of orig.slice(1)) {
        let dx = 0;
        if (b.x > gx1) dx = gx1 - 1 - b.x;
        else if (right(b) < gx0) dx = gx0 + 1 - right(b);
        next.push({ dx, y: gb + 1 });
        gx0 = Math.min(gx0, b.x + dx);
        gx1 = Math.max(gx1, b.x + dx + b.w);
        gb = gb + 1 + b.h;
      }
      /* o bloco junto fica onde estava o centro do grupo, em vez de subir tudo para o primeiro */
      const mid = (ys: number[]) => ys.reduce((n, y, i) => n + y + orig[i].h / 2, 0) / ys.length;
      const shift = mid(orig.map((b) => b.y)) - mid(next.map((n) => n.y));
      s.forEach((i, k) => {
        map[i].x = round(map[i].x + next[k].dx);
        map[i].y = round(map[i].y + (next[k].y + shift - orig[k].y));
      });
    });
  }

  function center() {
    if (!need(1)) return;
    commit(() => {
      const s = ids();
      for (const i of s) if (!isBox(map[i])) map[i].ta = 'center';
      paint();
      const bx = s.map(boxOf);
      const lo = Math.min(...bx.map((b) => b.x));
      const hi = Math.max(...bx.map(right));
      const shift = 50 - (lo + hi) / 2;
      s.forEach((i) => (map[i].x = round(map[i].x + shift)));
    });
  }

  function align(kind: 'l' | 'c' | 'r') {
    if (!need(2)) return;
    commit(() => {
      const s = ids();
      for (const i of s) if (!isBox(map[i])) map[i].ta = kind === 'l' ? 'left' : kind === 'c' ? 'center' : 'right';
      paint();
      const bx = s.map(boxOf);
      const lo = Math.min(...bx.map((b) => b.x));
      const hi = Math.max(...bx.map(right));
      const target = kind === 'l' ? lo : kind === 'r' ? hi : (lo + hi) / 2;
      s.forEach((i, k) => {
        const b = bx[k];
        const cur = kind === 'l' ? b.x : kind === 'r' ? right(b) : b.x + b.w / 2;
        map[i].x = round(map[i].x + target - cur);
      });
    });
  }

  function alignV(kind: 't' | 'm' | 'b') {
    if (!need(2)) return;
    commit(() => {
      const s = ids();
      const bx = s.map(boxOf);
      const lo = Math.min(...bx.map((b) => b.y));
      const hi = Math.max(...bx.map(bottom));
      const target = kind === 't' ? lo : kind === 'b' ? hi : (lo + hi) / 2;
      s.forEach((i, k) => {
        const b = bx[k];
        const cur = kind === 't' ? b.y : kind === 'b' ? bottom(b) : b.y + b.h / 2;
        map[i].y = round(map[i].y + target - cur);
      });
    });
  }

  function sameW() {
    if (!need(2)) return;
    const W = Math.max(...ids().map((i) => map[i].w));
    commit(() => ids().forEach((i) => (map[i].w = W)));
  }

  function sameSize() {
    if (!need(2)) return;
    commit(() => {
      const s = ids();
      const W = Math.max(...s.map((i) => map[i].w));
      const hs = s.map((i) => map[i].h).filter((h): h is number => typeof h === 'number');
      const H = hs.length ? Math.max(...hs) : null;
      s.forEach((i) => {
        map[i].w = W;
        if (H !== null && typeof map[i].h === 'number') map[i].h = H;
      });
    });
  }

  function distribute(axis: 'x' | 'y') {
    if (!need(3)) return;
    commit(() => {
      const s = ids().sort((a, b) => (axis === 'x' ? boxOf(a).x - boxOf(b).x : boxOf(a).y - boxOf(b).y));
      const bx = s.map(boxOf);
      const size = (b: Box) => (axis === 'x' ? b.w : b.h);
      const start = (b: Box) => (axis === 'x' ? b.x : b.y);
      const end = (b: Box) => start(b) + size(b);
      const span = end(bx[bx.length - 1]) - start(bx[0]);
      const gap = Math.max(1.5, (span - bx.reduce((n, b) => n + size(b), 0)) / (s.length - 1));
      let pos = start(bx[0]);
      s.forEach((i, k) => {
        const d = pos - start(bx[k]);
        if (axis === 'x') map[i].x = round(map[i].x + d);
        else map[i].y = round(map[i].y + d);
        pos += size(bx[k]) + gap;
      });
    });
  }

  const font = (ff: Full['ff']) => need(1) && each((p) => (p.ff = ff));
  const bold = () => need(1) && each((p, _i) => (p.fw = p.fw >= 700 ? 400 : 700));
  const size = (f: number) => need(1) && each((p) => (p.fs = Math.round(p.fs * f * 10) / 10));
  const color = (hex: string) => need(1) && each((p) => (p.c = hex));
  const fill = (hex: string) =>
    need(1) &&
    each((p) => {
      p.bg = hex;
      if (hex !== 'transparent' && p.pad === '0' && p.h === 'auto') p.pad = '0.6cqw 1.6cqw';
    });
  const brand = (hex: string) => need(1) && each((p) => (isBox(p) && p.bg !== 'transparent' ? (p.bg = hex) : (p.c = hex)));

  function copyStyle() {
    if (!need(1)) return;
    clip = clone(map[ids()[0]]);
    note.textContent = 'Estilo copiado. Selecione outros blocos e cole.';
  }
  function pasteStyle() {
    if (!clip) {
      note.textContent = 'Copie o estilo de um bloco primeiro.';
      return;
    }
    if (!need(1)) return;
    const src = clip;
    each((p) => {
      p.ff = src.ff;
      p.fs = src.fs;
      p.fw = src.fw;
      p.st = src.st;
      p.tt = src.tt;
      p.ls = src.ls;
      p.lh = src.lh;
      p.c = src.c;
      if (isBox(src) && isBox(p)) {
        p.bg = src.bg;
        p.r = src.r;
        p.bd = src.bd;
        p.pad = src.pad;
        if (typeof src.h === 'number' && typeof p.h === 'number') p.h = src.h;
        p.va = src.va;
        p.ta = src.ta;
      }
    });
  }
  function pasteShape() {
    if (!clip) {
      note.textContent = 'Copie o estilo de um bloco primeiro.';
      return;
    }
    if (!need(1)) return;
    const src = clip;
    each((p) => {
      if (!isBox(src) || !isBox(p)) return;
      p.r = src.r;
      if (typeof src.h === 'number' && typeof p.h === 'number') p.h = src.h;
    });
  }
  function toggleBar() {
    if (!map.bar) return;
    commit(() => (map.bar.o = map.bar.o ? 0 : 1));
  }

  /* ───────── zoom ───────── */

  const wrap = o.host.closest<HTMLElement>('.canvas-wrap');
  const zoomLabel = document.createElement('span');
  zoomLabel.className = 'zoom-label';
  function setZoom(z: number) {
    zoom = Math.min(2.4, Math.max(0.5, Math.round(z * 10) / 10));
    wrap?.style.setProperty('--zoom', String(zoom));
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    requestAnimationFrame(placeHandles);
  }
  root.addEventListener(
    'wheel',
    (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      setZoom(zoom + (e.deltaY < 0 ? 0.1 : -0.1));
    },
    { passive: false },
  );

  /* ───────── barra de ferramentas ───────── */

  const btn = (label: string, fn: () => void, cls = '', style?: string) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `tb-btn ${cls}`.trim();
    b.textContent = label;
    if (style) b.setAttribute('style', style);
    b.addEventListener('click', () => !readOnly && fn());
    return b;
  };
  const swatch = (hex: string, label: string, fn: (h: string) => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tb-sw';
    b.title = label;
    b.setAttribute('aria-label', label);
    b.style.setProperty('--sw', hex === 'transparent' ? 'repeating-linear-gradient(135deg,#14120f 0 2px,#fff 2px 6px)' : hex);
    b.addEventListener('click', () => !readOnly && fn(hex));
    return b;
  };
  const group = (label: string, ...kids: HTMLElement[]) => {
    const g = document.createElement('div');
    g.className = 'tb-group';
    const l = document.createElement('span');
    l.className = 'tb-label slug';
    l.textContent = label;
    const row = document.createElement('div');
    row.className = 'tb-items';
    row.append(...kids);
    g.append(l, row);
    return g;
  };
  const section = (key: string, title: string, ...groups: HTMLElement[]) => {
    const d = document.createElement('details');
    d.className = 'tb-sec';
    d.open = FOCUS[m.p].includes(key);
    if (d.open) d.dataset.focus = '1';
    const s = document.createElement('summary');
    s.textContent = title;
    d.append(s, ...groups);
    return d;
  };

  const TEXT_SW: [string, string][] = [
    ['#1b1814', 'Tinta'],
    ['#4a453e', 'Cinza escuro'],
    ['#8f8f8f', 'Cinza claro'],
    ['#ffffff', 'Branco'],
    [accent, 'Cor de marca'],
    ['#FFD500', 'Amarelo'],
  ];
  const FILL_SW: [string, string][] = [
    ['transparent', 'Sem fundo'],
    [accent, 'Cor de marca'],
    ['#17140f', 'Tinta'],
    ['#FFD500', 'Amarelo'],
    ['#EDE7DA', 'Papel'],
  ];

  const tb = document.createElement('div');
  tb.className = 'tb';

  const focus = document.createElement('div');
  focus.className = 'tb-focus';
  const fTitle = document.createElement('strong');
  fTitle.textContent = TOOLS[m.p].name;
  const fHelp = document.createElement('span');
  fHelp.textContent = TOOLS[m.p].help;
  focus.append(fTitle, fHelp);

  const quick = document.createElement('div');
  quick.className = 'tb-quick';
  quick.append(
    btn('Todos', () => {
      for (const id of els.keys()) if (selectable(id)) sel.add(id);
      paint();
    }),
    btn('Limpar', () => {
      sel.clear();
      paint();
    }),
    btn('Desfazer', () => api.undo()),
    btn('Recomeçar', () => api.reset(), 'ghost'),
  );

  const sections = [
    section('mover', 'Mover e agrupar', group('Agrupar', btn('Juntar selecionados', join), btn('Centralizar', center))),
    section(
      'alinhar',
      'Alinhar',
      group('Horizontal', btn('Esquerda', () => align('l')), btn('Centro', () => align('c')), btn('Direita', () => align('r'))),
      group('Vertical', btn('Topo', () => alignV('t')), btn('Meio', () => alignV('m')), btn('Base', () => alignV('b'))),
    ),
    section(
      'medidas',
      'Medidas',
      group('Igualar', btn('Mesma largura', sameW), btn('Mesmo tamanho', sameSize)),
      group('Distribuir', btn('Na horizontal', () => distribute('x')), btn('Na vertical', () => distribute('y'))),
    ),
    section(
      'texto',
      'Texto',
      group(
        'Fonte',
        btn('Aa Grotesca', () => font('2'), 'f2', 'font-family:var(--lf2)'),
        btn('Aa Serifada', () => font('1'), 'f1', 'font-family:var(--lf1)'),
        btn('Aa Mono', () => font('3'), 'f3', 'font-family:var(--lf3)'),
      ),
      group('Tamanho', btn('A−', () => size(0.87)), btn('A+', () => size(1.15)), btn('Negrito', bold)),
    ),
    section(
      'cores',
      'Cores',
      group('Texto', ...TEXT_SW.map(([h, l]) => swatch(h, l, color))),
      group('Fundo', ...FILL_SW.map(([h, l]) => swatch(h, l, fill))),
      contrastInfo,
    ),
    section('estilo', 'Copiar estilo', group('Estilo', btn('Copiar', copyStyle), btn('Colar', pasteStyle), btn('Só a forma', pasteShape))),
    section(
      'marca',
      'Marca',
      group('Cor de marca', ...[accent, '#1b1814', '#FFD500'].map((h) => swatch(h, h === accent ? 'Cor de marca' : h === '#FFD500' ? 'Amarelo' : 'Tinta', brand))),
      ...(m.layout === 'flyer' ? [group('Barra', btn('Barra no topo', toggleBar))] : []),
    ),
  ];

  tb.append(focus, quick, selInfo, ...sections, note);
  o.bar.replaceChildren(tb);

  const view = document.createElement('div');
  view.className = 'view-ctl';
  view.append(
    btn('−', () => setZoom(zoom - 0.1), 'zoom'),
    zoomLabel,
    btn('+', () => setZoom(zoom + 0.1), 'zoom'),
    btn('Ajustar', () => setZoom(1), 'zoom fit'),
  );
  o.view.replaceChildren(view);
  view.querySelectorAll('button').forEach((b) => b.setAttribute('aria-label', b.textContent === '−' ? 'Diminuir zoom' : b.textContent === '+' ? 'Aumentar zoom' : 'Zoom: ajustar'));
  setZoom(1);

  /* ───────── API ───────── */

  const api: Editor = {
    getMap: () => clone(map),
    boxes: () => Object.fromEntries([...els.keys()].map((i) => [i, boxOf(i)])),
    results: () => res,
    scores: () => scores,
    undo() {
      const prev = hist.pop();
      if (!prev) {
        note.textContent = 'Nada para desfazer.';
        return;
      }
      map = JSON.parse(prev);
      paint();
      evaluate();
    },
    reset() {
      hist.push(JSON.stringify(map));
      map = clone(initial);
      sel.clear();
      paint();
      evaluate();
    },
    setReadOnly(on) {
      readOnly = on;
      root.classList.toggle('readonly', on);
      tb.classList.toggle('disabled', on);
      tb.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = on));
      els.forEach((el, id) => selectable(id) && (el.tabIndex = on ? -1 : 0));
      placeHandles();
    },
  };

  paint();
  requestAnimationFrame(evaluate);
  return api;
}
