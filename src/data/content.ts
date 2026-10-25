export type P = 'P' | 'A' | 'R' | 'C';
export type LayoutId = 'flyer' | 'login' | 'product';

export const PRINCIPLES: Record<P, { name: string; ink: string; inkName: string; hint: string }> = {
  P: { name: 'Proximidade', ink: 'c', inkName: 'ciano', hint: 'Aperte os olhos: quantas manchas você vê?' },
  A: { name: 'Alinhamento', ink: 'm', inkName: 'magenta', hint: 'Passe uma régua imaginária pela borda: quantos elementos ficam de fora?' },
  R: { name: 'Repetição', ink: 'y', inkName: 'amarelo', hint: 'Conte as fontes e os estilos de botão: o que dá para repetir?' },
  C: { name: 'Contraste', ink: 'k', inkName: 'preto', hint: 'Se for diferente, que seja muito diferente.' },
};
export const ORDER: P[] = ['P', 'A', 'R', 'C'];

export interface Mission {
  id: string; // 1.P
  layout: LayoutId;
  n: number; // layout number
  p: P;
  stage: 1 | 2 | 3 | 4;
  name: string;
  briefing: string;
  criteria: string[];
  short: string[]; // versão curta, usada no jogo
  draft: boolean; // criterios derivados, nao vindos da proposta
}

export const LAYOUT_INFO: Record<LayoutId, { n: number; name: string; level: string; special: string }> = {
  flyer: { n: 1, name: 'Flyer de evento', level: 'Nível 1', special: 'Flyer, do caos ao redesign' },
  login: { n: 2, name: 'Tela de login (mobile)', level: 'Nível 2', special: 'Login, do caos ao redesign' },
  product: { n: 3, name: 'Página de produto (e-commerce)', level: 'Nível 3', special: 'Produto, do caos ao redesign' },
};

const m = (
  layout: LayoutId, p: P, name: string, briefing: string, criteria: string[], draft = true,
): Mission => ({
  id: `${LAYOUT_INFO[layout].n}.${p}`, layout, n: LAYOUT_INFO[layout].n, p,
  stage: (ORDER.indexOf(p) + 1) as Mission['stage'], name, briefing, criteria, short: [], draft,
});

export const MISSIONS: Mission[] = [
  m('flyer', 'P', 'Juntando as peças', 'Ninguém acha o horário do evento.', [
    'Data, hora e local formam um só bloco',
    'O espaço entre grupos é maior que o espaço dentro de cada grupo',
    'Há de 3 a 5 grupos visuais no total',
  ], false),
  m('flyer', 'A', 'Linha invisível', 'Parece que foi montado às pressas.', [
    'Todo elemento está alinhado a uma borda ou eixo comum',
    'Há um só tipo de alinhamento',
    'Nenhum elemento está solto',
  ], false),
  m('flyer', 'R', 'Mesma família', 'Parece que cada parte foi feita por uma pessoa.', [
    'No máximo 2 famílias tipográficas',
    'Um estilo fixo por nível de informação',
    'Um elemento visual (cor, forma ou ícone) se repete como identidade',
  ], false),
  m('flyer', 'C', 'Quem manda aqui', 'Nada chama atenção primeiro.', [
    'O título é claramente dominante (diferença grande, não sutil)',
    'A informação principal está em destaque',
    'Contraste texto/fundo de pelo menos 4,5:1 (WCAG AA)',
  ], false),

  m('login', 'P', 'Rótulo colado no campo', 'Dona Marta não sabe qual campo é qual e erra a senha toda vez.', [
    'Cada rótulo está a no máximo 8 px do seu campo',
    'O espaço entre pares rótulo + campo é maior que o espaço dentro de cada par',
    'Os botões formam um grupo à parte, separado dos campos',
  ]),
  m('login', 'A', 'Tudo na mesma régua', 'Os campos parecem ter sido colocados por pessoas diferentes.', [
    'Campos e botões têm a mesma largura',
    'As margens esquerda e direita são iguais em todos os elementos',
    'Os rótulos têm um só alinhamento de texto',
  ]),
  m('login', 'R', 'Um botão, um estilo', 'Cada botão parece de um app diferente.', [
    'Um só raio de borda e uma só altura em campos e botões',
    'No máximo 2 famílias tipográficas',
    'Um estilo fixo por nível: título, rótulo e texto do botão',
  ]),
  m('login', 'C', 'Qual botão eu aperto?', 'Com dois botões iguais, a pessoa fica em dúvida.', [
    'O botão primário é claramente diferente do secundário (preenchido contra contorno ou texto)',
    'Todo texto tem contraste de pelo menos 4,5:1 com o fundo, placeholder incluído',
    'O título é dominante',
  ]),

  m('product', 'P', 'Preço perto do botão', 'O cliente acha o produto, mas não acha onde pagar.', [
    'Preço e botão de compra estão no mesmo bloco, a no máximo uma altura de botão de distância',
    'Avaliações ficam junto do nome; frete e descrição formam um bloco de informação',
    'Há de 3 a 5 grupos visuais no total',
  ]),
  m('product', 'A', 'Grade em ordem', 'A galeria parece torta.', [
    'As miniaturas têm o mesmo tamanho e o mesmo espaçamento',
    'A coluna de texto tem uma borda esquerda comum',
    'Os selos ficam alinhados em uma linha',
  ]),
  m('product', 'R', 'Selos da mesma família', 'Os selos parecem vir de três lojas diferentes.', [
    'Todos os selos têm o mesmo formato, tamanho e tratamento',
    'No máximo 2 famílias tipográficas',
    'Um estilo fixo por nível de informação',
  ]),
  m('product', 'C', 'O botão que vende', 'Ninguém vê o botão de comprar.', [
    'O botão de compra é o elemento de maior contraste da tela',
    'O preço é maior que o resto das informações',
    'Contraste texto/fundo de pelo menos 4,5:1; o secundário fica visivelmente mais quieto',
  ]),
];

const SHORT: Record<string, string[]> = {
  '1.P': ['Data, hora e local juntos', 'Mais espaço entre grupos que dentro deles', '3 a 5 grupos'],
  '1.A': ['Tudo numa borda ou eixo comum', 'Um só tipo de alinhamento', 'Nada solto'],
  '1.R': ['No máximo 2 fontes', 'Mesmo estilo por nível', 'Uma cor de marca em 3 lugares'],
  '1.C': ['Título bem maior que o resto', 'Data em destaque', 'Texto legível (4,5:1)'],
  '2.P': ['Rótulo a até 8 px do campo', 'Mais espaço entre pares que dentro', 'Botões num grupo à parte'],
  '2.A': ['Campos e botões da mesma largura', 'Mesma margem esquerda', 'Rótulos alinhados ao campo'],
  '2.R': ['Mesmo raio e altura', 'No máximo 2 fontes', 'Mesmo estilo por nível'],
  '2.C': ['Botão principal ≠ secundário', 'Texto legível (4,5:1)', 'Título dominante'],
  '3.P': ['Preço colado ao botão', 'Nome + nota, frete + descrição juntos', '3 a 5 grupos'],
  '3.A': ['Miniaturas iguais, espaço igual', 'Coluna de texto na mesma borda', 'Selos numa linha'],
  '3.R': ['Selos todos iguais', 'No máximo 2 fontes', 'Mesmo estilo por nível'],
  '3.C': ['Botão de compra é o que mais salta', 'Preço bem maior que o resto', 'Texto legível (4,5:1)'],
};
for (const x of MISSIONS) x.short = SHORT[x.id];

export const TOOLS: Record<P, { name: string; help: string }> = {
  P: { name: 'Mover', help: 'Arraste os blocos. Shift seleciona vários.' },
  A: { name: 'Alinhar', help: 'Selecione blocos e use os botões.' },
  R: { name: 'Estilo', help: 'Copie o estilo de um e cole nos outros.' },
  C: { name: 'Destaque', help: 'Mude tamanho, peso e cor.' },
};

export const missionsOf = (l: LayoutId) => MISSIONS.filter((x) => x.layout === l);

/** Problemas plantados (nível 0), com a posição de cada chamada no layout, em cqw. */
export const PLANTED: Record<LayoutId, { n: number; p: P; x: number; y: number; text: string }[]> = {
  flyer: [
    { n: 1, p: 'P', x: 3, y: 28, text: 'Data, hora, local e preço espalhados' },
    { n: 2, p: 'C', x: 3, y: 4, text: 'Título do mesmo tamanho do corpo' },
    { n: 3, p: 'R', x: 60, y: 6, text: '4 fontes diferentes' },
    { n: 4, p: 'A', x: 3, y: 98, text: 'Centralizado e à esquerda misturados' },
  ],
  login: [
    { n: 1, p: 'P', x: 1, y: 43, text: 'Rótulos longe dos campos' },
    { n: 2, p: 'C', x: 3, y: 125, text: 'Botões primário e secundário idênticos' },
    { n: 3, p: 'A', x: 1, y: 98, text: 'Campos com larguras e margens diferentes' },
    { n: 4, p: 'R', x: 3, y: 153, text: 'Três estilos de botão' },
  ],
  product: [
    { n: 1, p: 'P', x: 51, y: 63, text: 'Preço longe do botão de compra' },
    { n: 2, p: 'P', x: 49, y: 31, text: 'Avaliações, frete e descrição sem agrupamento' },
    { n: 3, p: 'A', x: 1, y: 58, text: 'Grade quebrada' },
    { n: 4, p: 'R', x: 85, y: 62, text: 'Selos e ícones de estilos diferentes' },
    { n: 5, p: 'C', x: 75, y: 50, text: 'Botão de compra sem destaque' },
  ],
};

export const XP_RULES = {
  mission: 100,
  noHint: 25,
  review: 30,
  layout: 100,
};

export const LEVELS = [
  { n: 1, min: 0, title: 'Estagiário' },
  { n: 2, min: 300, title: 'Designer Júnior' },
  { n: 3, min: 700, title: 'Designer Pleno' },
  { n: 4, min: 1200, title: 'Designer Sênior' },
  { n: 5, min: 1700, title: 'Diretor de Arte' },
] as const;

export const GRADES = ['Bronze', 'Prata', 'Ouro'] as const;
