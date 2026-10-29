---
name: pixel-clone
description: Workflow for reproducing a reference UI precisely without copying its source. Use when matching layout, spacing, typography, motion or interaction to a reference page.
---
# Pixel-clone workflow
1. **Measure, don't guess** – open the reference at 1440px; record widths, gaps, font sizes, radii, colours as design tokens in `src/design-system.css`.
2. **Structure first, then style** – semantic HTML (buttons, headings, landmarks), then CSS using tokens.
3. **Behaviour** – list every hover/focus/scroll/transition and keyboard path; implement each; respect reduced motion.
4. **URL as state** – overlays are driven by query params so Back/Forward/refresh work.
5. **Verify** – run `ui-fidelity-reviewer` and `a11y-auditor`, then `code-quality-reviewer`.
6. **Originality** – write your own markup/CSS; never paste or fetch the reference's source or bundles.
