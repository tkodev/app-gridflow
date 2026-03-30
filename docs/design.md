# Design Scope

> This file defines **app-wide visual principles** — design references and global style rules. For style related code conventions, see [tech.md](/docs/tech.md).

## Creative North Star: "The Curated Gallery"

A silent, sophisticated stage where the user's content is the sole protagonist. We move away from "app-like" density toward an editorial, high-end magazine feel.

## Typography

| Role | Family | Usage |
| --- | --- | --- |
| UI & Body | **Noto Sans** (`--font-sans`) | All functional text, labels, body copy |
| Display & Headlines | **Liberation Serif** (`--font-serif`) | Page titles, hero text, large numeric displays, editorial moments |

Use serif for moments of inspiration and sans for all functional data. Contrast between `--foreground` and `--muted-foreground` creates hierarchy without varying weight.

## Surface Hierarchy

Treat the UI as stacked sheets of fine paper. Depth comes from background-color shifts, not borders.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `surface` | `#f9f9f9` | `#121212` | Base layer (`--background`) |
| `surface-container-lowest` | `#ffffff` | `#0a0a0a` | Elevated white elements (`--card` for popovers) |
| `surface-container-low` | `#f3f3f3` | `#1a1a1a` | Secondary areas, cards (`--card`) |
| `surface-container-highest` | `#e2e2e2` | `#292929` | Recessed wells, focus states |

### The "No-Line" Rule

1px solid borders are prohibited for sectioning. Use background-color shifts between surface tones. When accessibility requires a container edge, use a **ghost border**: `--outline-variant` at 15% opacity.

## Elevation & Shadows

Use **ambient shadows** instead of traditional drop shadows:

- Color: `hsl(var(--foreground) / 0.04)`
- Blur: 16px
- Spread: -2px

This mimics natural light on a matte surface.

## Components

### Buttons
- **Primary:** `rounded-full`, gradient from `--primary` to `--primary-container` at 135deg. Press: `scale(0.96)`.
- **Secondary:** `rounded-md`, `surface-container-low` bg.
- **Ghost:** transparent, hover reveals muted bg.

### Cards
- No ring/border. Ambient shadow. `rounded-lg` (1rem).
- Content cards use "Polaroid" editorial frame (padded white container).

### Input Fields
- `surface-container-low` bg, no border. Focus: transitions to `surface-container-highest`.

### Navigation
- **App Header:** floating, rounded-2xl, glassmorphism (85% opacity + backdrop blur). Page title center, icon left, actions right.
- **Tab Bar (Footer):** floating, rounded-2xl, glassmorphism. 3 tabs: Collect, Plan, Settings.

## Layout

- Use `Container` as immediate child of `<section>` or `<main>` to control horizontal width.
- 12-column Tailwind grid. Three equal columns: `col-span-4` each.
- All colors in HSL format in CSS custom properties.
