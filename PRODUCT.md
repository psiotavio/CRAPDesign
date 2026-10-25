# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (user created the project as Astro; static output, small vanilla TypeScript islands, no UI framework).

## Users

Inferred from the brief, not interviewed (the user said to proceed on my own judgment):

- Primary reader: Milene, who receives and evaluates the work, and the mestrado class that would sit the workshop.
- Workshop participants: beginners in UI/UX (design or computing undergrads, or the mestrado class), 6 to 30 people, solo or in pairs, one ~90 minute session.
- Facilitator/professor, who acts as "Diretor de Criação" and validates the special stickers.

## Product Purpose

CRAP Design is a gamified workshop (gamification in the sense of Deterding et al., 2011, not a game). Each participant repairs broken layouts by completing one mission per CRAP principle (Proximidade, Alinhamento, Repetição, Contraste). Each validated mission awards XP, badge progress and a pair of stickers, the before and the after, glued side by side in an album with a one-line "o que mudou e por quê".

This web project presents the whole proposal as a coursework deliverable and demonstrates the mechanics as a working web prototype (one of the implementation versions the proposal lists). Success: the reader understands the proposal end to end, sees the mission, validation, reward and album loop working, and can judge it against the learning objectives.

## Positioning

The sticker is the participant's own design work, so reward and learning are the same thing. The album reads left to right as a layout improving principle by principle, and ends as a portfolio piece.

## Operating Context

- Session of ~90 min: 10 briefing, 60 missions, 20 album and debate.
- 3 broken layouts (flyer, mobile login, e-commerce product page), 4 missions each, fixed order P, A, R, C. The "before" of a mission is the state left by the previous one.
- 12 mission cards, 12 before/after pairs, 3 special shiny stickers (24 common + 3 special stickers total in the album's accounting of pairs: 24 common stickers, i.e. 12 pairs).
- Validation: self-check, then peer review (+30 XP to reviewer), special sticker optionally validated by the professor. Failing costs no XP.
- XP: mission 100, no-hint bonus +25, peer review +30, layout bonus +100. Levels at 0, 300, 700, 1200, 1700 (Estagiário, Designer Júnior, Pleno, Sênior, Diretor de Arte). Max about 2,160 XP.
- Badges: 12 principle badges (4 principles x Bronze/Prata/Ouro by layouts completed 1/2/3) plus specials Olho Clínico, Mentor, Álbum Completo.
- Collective progress bar instead of a mandatory individual leaderboard.

## Capabilities and Constraints

- Language: Brazilian Portuguese throughout.
- The source document gives the full mission card (nome, briefing, critérios, recompensa, dica) only for the 4 flyer missions. Missions for the login screen and the product page are derived from the planted problems listed for those layouts, and must be labelled as a draft to calibrate in the pilot.
- Open decisions in the source, to stay visible as open and never be resolved silently: delivery format, implementation version, individual leaderboard or collective only, fixed or free mission order, final activity name.
- Numbers (duration, XP, thresholds) are a starting point to calibrate in a pilot.
- The prototype keeps progress in the browser only; no accounts, no backend.

## Brand Commitments

- The name "CRAP Design" and the Portuguese vocabulary of the source (missão, figurinha, álbum, antes e depois, Hall da Fama).
- CRAP follows Robin Williams, The Non-Designer's Design Book.

## Evidence on Hand

- The proposal text itself (mission tables, XP and level tables, album rules, validation, theory table, implementation versions, measurement plan, references).
- Absent, and not to be fabricated: pilot results, participant data, testimonials, measured learning gains, IMI scores. Any layout artwork on the page is authored illustration of the planted problems, not real participant work.
- References were cited from memory in the source and carry that caveat.

## Product Principles

1. Errar não tira pontos: redoing is part of design, so nothing in the interface punishes a retry.
2. Criteria are objective and checkable by a colleague (counts, ratios, distances), never taste.
3. The before/after pair is the unit of reward and of evidence.
4. Collective progress over individual ranking.
5. It is gamification of real design work, never a fictional game world.

## Accessibility & Inclusion

Contrast for the page itself should meet WCAG AA (the workshop teaches 4.5:1, so the page must practice it). Respect prefers-reduced-motion. Keyboard-operable controls.
