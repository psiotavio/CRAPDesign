# CRAP Design

Oficina gamificada de design (Proximidade, Alinhamento, Repetição, Contraste), em Astro.

```bash
npm install
npm run dev      # http://127.0.0.1:4321
npm run build    # gera dist/
```

## Páginas

| Rota | O que é |
| --- | --- |
| `/` | Início: o que é, como usar |
| `/missoes` | Mapa das 12 missões e o status de cada uma |
| `/missoes/1-P` … `/missoes/3-C` | Uma página por missão: o aluno conserta o layout no próprio site (editor), critérios conferidos sozinhos, revisão simulada |
| `/album` | Álbum de figurinhas (antes/depois) e Hall da Fama |
| `/progresso` | XP, níveis, badges, barra da turma |
| `/proposta`, `/proposta/atividade`, `/proposta/entrega` | O texto completo da proposta, em 3 páginas |

O progresso fica no `localStorage` do navegador (sem conta nem servidor).

## Onde mexer

- `src/data/content.ts`: missões, critérios, XP, níveis.
- `src/data/layouts.ts`: os 3 layouts quebrados e como cada um se corrige por estágio.
- `src/scripts/editor.ts`: o editor (Mover, Alinhar, Estilo, Destaque).
- `src/scripts/checks.ts`: a checagem automática dos 12 conjuntos de critérios.
- `src/scripts/game.ts`: estado do jogador e regras de XP/badges.
- `PRODUCT.md` e `DESIGN.md`: contexto de produto e sistema visual.
# CRAPDesign
