---
name: CRAP Design
description: A printer's proof sheet. The four CRAP principles are the four process inks (cyan, magenta, yellow, black); a broken layout is a misregistered print and each mission registers one more plate.
colors:
  cyan-ink: "#00a3e0"
  magenta-ink: "#ee2a8e"
  yellow-ink: "#ffd400"
  black-ink: "#14120f"
  ink-soft: "#47443f"
  uncoated-white: "#f3f3ef"
  uncoated-white-shade: "#e9e9e3"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8.4vw, 6rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.2rem, 2vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 100"
  body:
    fontFamily: "Source Serif 4 Variable, Source Serif 4, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Spline Sans Mono Variable, Spline Sans Mono, ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.06em"
    fontFeature: "'tnum'"
rounded:
  none: "0px"
  full: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(64px, 10vw, 140px)"
  stack: "clamp(32px, 4vw, 56px)"
  crop-offset: "20px"
  nav-height: "56px"
  max-width: "1320px"
components:
  nav:
    backgroundColor: "{colors.uncoated-white}"
    textColor: "{colors.black-ink}"
    height: "56px"
    rounded: "{rounded.none}"
  button-primary:
    backgroundColor: "{colors.black-ink}"
    textColor: "{colors.uncoated-white}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.uncoated-white}"
    textColor: "{colors.black-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  button-ghost-hover:
    backgroundColor: "{colors.black-ink}"
    textColor: "{colors.uncoated-white}"
  xp-chip:
    backgroundColor: "{colors.yellow-ink}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
  plate-button:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 6px 9px"
  plate-button-active:
    backgroundColor: "{colors.black-ink}"
    textColor: "{colors.uncoated-white}"
  spec-table-head:
    textColor: "{colors.black-ink}"
    typography: "{typography.label}"
    padding: "0 16px 8px 0"
  ticket:
    backgroundColor: "{colors.uncoated-white}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.none}"
    padding: "22px 24px 26px"
  status-info:
    backgroundColor: "{colors.yellow-ink}"
    textColor: "{colors.black-ink}"
    padding: "12px 14px"
  status-ok:
    backgroundColor: "{colors.cyan-ink}"
    textColor: "{colors.black-ink}"
    padding: "12px 14px"
  status-warn:
    backgroundColor: "{colors.magenta-ink}"
    textColor: "{colors.black-ink}"
    padding: "12px 14px"
  sticker:
    backgroundColor: "{colors.uncoated-white}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.none}"
    padding: "3px"
  sticker-empty:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.none}"
    padding: "2px"
  callout-numeral:
    backgroundColor: "{colors.cyan-ink}"
    textColor: "{colors.black-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.full}"
    size: "22px"
  color-bar:
    backgroundColor: "{colors.cyan-ink}"
    height: "12px"
    width: "100%"
---

# Design System: CRAP Design

## Overview

**Creative North Star: "The Proof Sheet"**

The page is a pre-press proof sheet and job ticket. Neutral uncoated white stock carries black ink for all reading, and four flat ink fields at page scale (cyan, magenta, yellow, black) are the sections, one per CRAP principle in spirit: P is cyan, A is magenta, R is yellow, C is black. A broken layout is a misregistered print: its cyan and magenta ghosts sit offset from the black image and collapse into register as each mission is completed. The print shop is the native vocabulary of the audience (design students), so every device is borrowed from it and used for what it does there: crop marks frame a thing that will be trimmed, a registration target marks the brand and the end of a loop, a color-bar measures progress, mono slug lines label a job.

Density is editorial and calm. Sections are long, wide-margined and flat; reading sections pair a sticky title column with a measured text column, and the interface recedes around the layouts being repaired. Depth is the paper itself. The system refuses the gamified-landing-page default: no card grids of icon plus heading, no gradients, no glow, no rounded friendly surfaces. Gamification here is real design work reported in print terms (plates, proofs, tickets, stickers).

The build has no raster assets. Every mark, target, bar, sticker, badge and layout artwork is CSS, inline SVG, or live text; the three broken layouts are authored synthetic illustration generated from data (`src/data/layouts.ts`), not participant work.

**Key Characteristics:**
- Four process inks as the only chromatic colors, always flat, always carrying black text.
- Square corners everywhere; the only curves are circles (numerals, badges, registration target).
- Black rules, 1px for structure and 2px for emphasis, instead of shadows or fills, to separate things.
- Crop marks, registration target, color-bar and mono slug lines as recurring furniture.
- Misregistration ghosts (cyan and magenta offsets) as the single motion-and-state device on artwork.
- Archivo variable expanded for display, Source Serif 4 for reading, Spline Sans Mono for slugs and measurements only.

## Colors

A strict four-ink palette on uncoated stock: three saturated process inks plus K black, with a warm near-black text ink and two off-whites. The inks appear only as flat fields, patches, bars and status backgrounds, never as gradients or tints.

### Primary
- **Process Cyan** (#00a3e0): Principle P (Proximidade). Full-bleed section field (`jornada`), P plate patch, ghost offset on misregistered artwork (rgb 0 163 224 at 0.6 down to 0.3 alpha), "ok" status background.
- **Process Magenta** (#ee2a8e): Principle A (Alinhamento). Full-bleed section field (`abertas`, open decisions), A plate patch, opposite ghost offset (0.55 down to 0.25 alpha), "warn" status background, text caret color.
- **Process Yellow** (#ffd400): Principle R (Repetição). Section field (`album`), XP chip, highlighted table row and hot callout row, default status background, toast, selected album tab label.
- **K Black** (#14120f): Principle C (Contraste). Section field (`missoes`, `referencias`), all text, all rules, primary button and the K patch. Same value as `--ink`; on K fields the K patch flips to paper so it stays visible.

### Neutral
- **Uncoated White** (#f3f3ef): The sheet. Body background, nav, ticket, sticker stock, text on black fields.
- **Uncoated White Shade** (#e9e9e3): Hover fill on plate buttons and the empty track of the collective color-bar.
- **Soft Ink** (#47443f): Secondary text and slug lines on paper (8.7:1 on white). Never used on an ink field.
- **Rule** (K black at 28% via color-mix): Hairline row dividers in tables and lists, `1px`.

### Named Rules
**The Flat Ink Rule.** Every ink is applied as a solid field at 100%: no gradients, no tints, no opacity blends of an ink to make a new color. The only partial inks are the ghost offsets and the unlit state of an unfinished plate (opacity 0.28).

**The Black On Ink Rule.** Text on cyan, magenta and yellow fields is K black, never white. On the K field text is Uncoated White. The same pair logic applies to numerals and status boxes.

**The Four Plates Rule.** Cyan is always P, magenta A, yellow R, black C. A principle never borrows another's ink; a new element that needs a color takes the ink of the principle it belongs to.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, sans-serif), width axis used expanded (`wdth` 100 to 125)
**Body Font:** Source Serif 4 Variable (with Source Serif 4, Georgia, serif), optical sizing auto
**Label/Mono Font:** Spline Sans Mono Variable (with ui-monospace), slugs and measurements only

**Character:** A wide, heavy grotesque poster face for headlines against a calm, readable text serif, with the monospace reserved for the machine voice of the press (job numbers, plate states, table headers). Expansion, not size alone, makes the display voice.

### Hierarchy
- **Display** (850, clamp 3rem to 6rem, line-height 0.92, letter-spacing -0.03em, `wdth` 125): the H1 "CRAP DESIGN", one word per line, black on paper at poster scale. One use per page.
- **Headline** (800, clamp 2rem to 3.6rem, line-height 1.02, -0.02em, `wdth` 112, balanced wrap): section H2. Inside the reading layout the sticky title column steps down to clamp 1.9rem to 2.8rem.
- **Title** (700, clamp 1.2rem to 1.5rem, line-height 1.15, -0.01em, `wdth` 100): H3, card and column headings, buttons (0.95rem / 700), tab labels, brand lockup (1.05rem / 800 / `wdth` 120).
- **Body** (Source Serif 4 400, 1.0625rem, line-height 1.6, `text-wrap: pretty`): reading text, capped at 68ch. Brief lines in the ticket are italic at 1.1rem. Secondary body (tables, lists) runs 0.95 to 0.98rem.
- **Label / Slug** (Spline Sans Mono 400, 0.72rem, line-height 1.4, letter-spacing 0.06em, uppercase, tabular numerals): job lines, plate names, table column heads (0.7rem, 500), tags on stickers (0.56rem). Smaller slug sizes (0.62 to 0.68rem) appear only on controls with a larger label beside them.
- **Numeral** (Archivo 800, `wdth` 120 to 125, 1.15 to 2.6rem, tabular): step and goal counters from CSS counters, XP readout (2.6rem).

### Named Rules
**The Slug Only Rule.** The monospace appears only as the press speaking: job numbers, plate states, table headers, measurements and tags. It never sets a sentence of reading text and never sits above a heading as a decorative label; slugs sit under, beside or inside the thing they describe.

**The Expanded Voice Rule.** Display and headings use the expanded width axis and heavy weights with tight tracking. Narrow or default-width Archivo is for small UI (nav links 0.86rem / 600, tabs), not for headings.

## Layout

A single-page, section-per-ink composition. Content sits in a centered wrap of `min(100% - 2 x gutter, 1320px)` with a fluid gutter (clamp 16px to 48px). Sections are flat color fields with vertical padding clamp(64px, 10vw, 140px); consecutive paper sections reuse the same field and drop the top padding to read as one sheet. Vertical rhythm between blocks is clamp(32px, 4vw, 56px).

The hero is a two-column grid (5.4fr / 6.6fr): poster title, one sentence and the primary action on the left; the proof sheet inside crop marks on the right, sized from the viewport height so the whole first view fits, with the five plate buttons and the active criterion beneath. Reading sections use a 4.4fr / 7.6fr grid with a sticky title column (below the 56px sticky nav). The mission bench is a 250px progress rail plus a fluid column holding a before/after pair and the ticket (1.2fr / 1fr). The album is an auto-fill grid of slots (minimum 290px, gap 28px by 24px). Three-up text columns are `cols3` with a 2px black top rule.

Responsive behavior: grids collapse to a single column at 900px (hero, reading), 960px (three-up), 1100px (bench), 860px (before/after, bench grid); the section nav list hides below 1040px leaving brand and XP chip; tables become labelled blocks below 700px (headers visually hidden, cells carry `data-label`); the album becomes three tabs below 700px; plate names hide below 520px. Layout artwork scales by container query units so the same layout is legible at any sticker size.

Spacing is fluid and largely clamp-based rather than a fixed scale; recurring fixed steps are 8, 12, 16, 24 and 28px inside components.

## Elevation & Depth

Flat by default. Depth is conveyed by stacking paper on paper and by black rules, not by shadows: sections are flat inks, the ticket is paper on a black field, tables are separated by hairline rules. Shadows exist only where the object is physically a loose piece of paper lifted from the sheet.

### Shadow Vocabulary
- **Proof sheet** (`box-shadow: 0 1px 0 var(--rule), 0 10px 24px -12px color-mix(in oklab, var(--ink) 45%, transparent)`): the hero artwork sheet resting on the page.
- **Sticker** (`box-shadow: 0 2px 0 rgb(20 18 15 / 0.35), 0 8px 16px -8px rgb(20 18 15 / 0.45)`): a glued sticker on the album page, with a rotation of -1.2deg and 1deg on the before and after.
- **Toast** (`box-shadow: 0 10px 24px -8px color-mix(in oklab, var(--ink) 40%, transparent)`): the single fixed overlay, yellow with a 2px black border.
- **Misregistration ghosts** (`filter: drop-shadow(Ncqw 0 0 cyan) drop-shadow(-Ncqw 0 0 magenta)`): not elevation but state. N steps 0.7, 0.52, 0.34, 0.17, 0 across stages 0 to 4 with ink alpha falling in parallel (cyan 0.6 to 0.3, magenta 0.55 to 0.25). Stage 4 is clean registration.
- **Ticket perforation** (radial-gradient scallops, 16px by 8px, painted in paper): the torn edge of the job ticket, top and bottom.

### Named Rules
**The Loose Paper Rule.** A shadow is allowed only on an object that is a separate sheet or sticker sitting on the page (proof sheet, sticker, toast). Sections, buttons, tables, plates and cards never cast one.

**The Registration Rule.** Misregistration is the only decorative effect on artwork and it always means "not yet corrected". It never appears as ornament once a layout is at stage 4, and it is removed entirely under reduced motion transitions (the offset still shows, only its animation stops).

## Shapes

Square and ruled. Corners are 0 on every surface, button, table, ticket, sticker, input and textarea; borders are 1px black for structure and 2px black for controls and emphasis. The recurring curves are circles only: the 22px callout numerals, the 40px bronze/silver/gold badges, the dashed open-decision marker and the registration target (a ring, a dot and a cross). Arrows are clip-path triangles, not icons. Crop marks are eight 12px by 1px hairlines inset 20px from the object's corners, drawn with gradients. Unearned or empty things are dashed: empty sticker slots, locked badges and special-badge outlines turn solid when earned.

## Components

### Nav
A paper bar, 56px tall, sticky, closed with a 1px black rule. Left: the registration target and the wordmark "CRAP Design" (Archivo 800, `wdth` 120). Center: section links in Archivo 600 at 0.86rem with a 2px black underline on hover. Right: the XP chip. Below 1040px the link list hides; the wordmark and chip remain.

### Buttons
- **Shape:** square, 46px minimum height, 2px black border, horizontal padding 20px, Archivo 700 at 0.95rem (0px radius).
- **Primary:** black fill, paper text. On hover it inverts to paper fill and black text; on press it moves 1px down. On the black field the pair flips (paper fill, black text).
- **Ghost:** transparent with a currentColor 2px border; hover fills with black and paper text.
- **Disabled:** 40% opacity (dashed border and 70% opacity inside the ticket). Focus is a 3px currentColor outline offset 3px, global.
- **Link button:** underlined Archivo 600 text for low-weight actions (hint, reset).

### Plate buttons
The hero control that steps the artwork through stages: a five-cell segmented bar (Antes, P, A, R, C) in a 1px black frame, cells separated by 1px black rules. Each cell has an 8px ink patch (cyan, magenta, yellow, black; hatched for "Antes") at 28% opacity, a letter, and a mono slug name. The selected plate fills black with paper text, its patch at full opacity; done plates keep their patch lit. The mission tab strip on the bench is the same pattern on the black field with inverted colors.

### Specification tables (`.spec`)
Hairline-ruled tables with no fills and no zebra. Header cells are mono 0.7rem uppercase with a 1px black bottom rule; first-column row headers are Archivo 700; cell dividers are the 28% rule; numerals are tabular. A highlighted row (`data-on`) takes the full yellow ink, bleeding 10px past each cell edge with an inset shadow. On narrow screens each row becomes a block and each cell prints its `data-label` as a mono caption.

### Mission ticket
The job ticket for the active mission: a paper panel on the black field with scalloped top and bottom edges. Contains the mission name (H3 1.5rem), an italic brief, a mono "critérios" label, a checklist with square 22px black-bordered checkboxes (the tick is a clip-path check that scales in), an optional hint link, a reward line, actions (primary plus ghost buttons) and a status box. A draft mission carries a small black-outlined mono "rascunho" flag. Status uses the inks: yellow default, cyan ok, magenta warn, all black text.

### Album slot and sticker
Each of the 12 mission slots is a before/after pair of stickers plus a one-line caption textarea. A filled sticker is a paper rectangle with a 3px paper border, the sticker shadow and a slight rotation (-1.2deg, 1deg); a corner tag in mono 0.56rem on black names it (Antes, Depois). An unfilled slot is a dashed 2px black outline, the artwork greyed to 38% opacity, and the tag turns to an outline; the caption field is disabled and dashed. Gluing plays a 0.7s drop-in (translateY -30px, rotate -6deg, scale 1.15 resolving to rest). Special stickers add a slow paper shine sweep. The album's progress is a color-bar of four patches that fill left to right.

### Badges and callout numerals
Principle badges are a 3-column grid (Bronze, Prata, Ouro) by four principles; a badge is a 40px circle, dashed and at 50% opacity until earned, then solid with an inner ring. Special badges are bordered boxes that turn solid yellow when earned. Callout numerals are 22px circles filled with the ink of their principle (K numerals reverse to paper text), with a 1.5px black ring and tabular Archivo 800 digits; on the artwork they are pinned at their location and scale 1.45 when their list row is hovered, while the matching row highlights yellow.

### Color-bar
The four process inks as four equal patches, 12px tall, full width, used as the footer strip and as the collective progress bar. As progress it is an 18px bar with a 1px black frame on the shade ground where each ink fills to its percentage width; on the album cover it is a 4-patch bar filling left to right per principle. Inline 0.78em ink patches mark principles in running text.

### Misregistered layout (signature)
The three broken artworks (flyer, mobile login, product page) are live DOM, not images: absolutely positioned text boxes in container-query units, driven from data by stage 0 to 4. Moving a stage animates position, size, type size, color and spacing over 0.8s on `cubic-bezier(0.16, 1, 0.3, 1)` while the ghost offsets collapse over 0.9s. Reduced motion removes the transitions. Each sits inside crop marks (20px offset).

## Do's and Don'ts

### Do:
- **Do** apply the four inks as flat full-saturation fields and patches: cyan #00a3e0 for P, magenta #ee2a8e for A, yellow #ffd400 for R, K #14120f for C.
- **Do** set text on cyan, magenta and yellow in K black and text on the K field in uncoated white (#f3f3ef).
- **Do** keep every corner square (0px); reserve circles for numerals, badges, markers and the registration target.
- **Do** separate content with black rules: 1px for structure, 28% hairlines for rows, 2px for controls and emphasis.
- **Do** frame an artwork or sheet with crop marks (20px offset, 12px by 1px) and let slug lines in Spline Sans Mono, uppercase, 0.06em tracked, name the job, plate or measurement.
- **Do** use Archivo at `wdth` 112 to 125 and weight 800 to 850 for headings and Source Serif 4 at 1.0625rem and 1.6 for reading, capped near 68ch.
- **Do** show unfinished things dashed and earned things solid, and show not-yet-corrected artwork through cyan and magenta ghost offsets.
- **Do** move with `cubic-bezier(0.16, 1, 0.3, 1)` (about 0.18s for controls, 0.8s for layout correction) and honor `prefers-reduced-motion` by dropping transitions and the shine animation.
- **Do** keep controls at 44 to 46px minimum height with a 3px currentColor focus outline.
- **Do** verify new ink-on-text pairs against 4.5:1 for body copy before shipping.

### Don't:
- **Don't** round surfaces, add soft shadows to sections, buttons or tables, or use gradients to make depth; shadows are reserved for loose paper (proof sheet, sticker, toast).
- **Don't** build card grids of icon plus heading; use ruled lists, tables, tickets and fields.
- **Don't** tint or blend the inks (no pastel, no lighter cyan for a background); partial states are the 28% unlit plate patch and the ghost alphas only.
- **Don't** set white text on a process ink, or put Soft Ink (#47443f) on a colored field.
- **Don't** set sentences in the monospace or use it as a decorative label above headings; it is for slugs, headers and measurements.
- **Don't** use narrow or default-width Archivo for headings, or a system or script face outside the broken-layout artwork (the script and mono faces inside the artwork are deliberate planted errors).
- **Don't** invent a fifth chromatic color or give a principle another principle's ink.
- **Don't** punish retries visually: no red failure states, no loss animations; a returned review is a magenta status line saying no XP was lost, nothing more.
- **Don't** ship raster imagery; marks, targets, bars, stickers and artwork stay CSS, SVG or live text.

## Known drift (not part of the system)

These exist in the build and are deliberately not canonized as rules.
- Black text on the magenta field measures 4.77:1 after the magenta was lightened from #e4007c (4.09:1, which failed). It clears the 4.5:1 floor, so it is safe on the open-decisions section and the "warn" status box.
- `--c-text` (#00698f) and `--m-text` (#b0005c) are declared in `global.css` but not used; they are the intended darker inks for text on paper and are not recorded as tokens here.
- The special-sticker shine uses off-palette values (#fff, #ffe9a8) and an infinite gradient sweep, and the bronze (#c98a5a) and silver (#d4d6d8) badge grades are one-offs outside the four-ink palette.
- A late "revisão: ajustes" block at the end of `global.css` re-declares rules from earlier sections (`.spec` highlighted row, `.loop`, `.special-badge`, `.pull`, `.open-list`); the later value wins and is what this document records.
