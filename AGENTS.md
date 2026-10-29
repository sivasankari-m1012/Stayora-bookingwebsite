# Project guide (for AI coding agents)

Desktop-first, responsive booking app (Stayora) for a single property listing page (mobile: swipe galleries) (React 19 + Vite). Three views: **Listing**, **Photo tour**, **Lightbox** (single-photo viewer).

## Commands
- `npm run dev` – frontend (Vite proxies `/api` to :4000) · `cd backend && npm install && npm start` – optional API
- `npm run lint` and `npm run build` must pass before any change is "done"
- `cd backend && npm test`

## Structure
- `src/components/` one component per section; overlays: `PhotoTour.jsx`, `PhotoViewer.jsx`, `AmenitiesModal.jsx`
- `src/data/photos.js` is the SINGLE source of truth for photos (hero, tour, lightbox, filmstrip all derive from it)
- `src/hooks/useModalParams.js` – URL is the state (`?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<index>`)
- `src/hooks/useDialog.js` – focus trap / initial focus / focus restore for every overlay
- CSS: design tokens in `design-system.css`; feature stylesheets are prefixed (`pt-`, `bk-`, `am-`, `rv-`)

## Backend (`backend/`)
Layers: `src/http` (routes, zod, middleware) -> `src/services` -> `src/domain` (pure rules) + `src/repositories` (all SQL). Wiring in `src/container.js`. Schema changes = new file in `backend/migrations/`. Keep the JSON contract the frontend uses (`src/api.js`).

## Rules
1. Every modal overlay uses `useDialog`, `role="dialog"`, `aria-modal`, an accessible name, Esc to close. Popovers (navbar panels, date/guest pickers) close on outside click and Esc and do not trap focus.
2. Interactive things are real `<button>`/`<a>` – never `onClick` on `div`/`img` (modal backdrops that also close with Esc are the one exception); never nest interactives.
3. Motion respects `prefers-reduced-motion`.
4. Reference is the source of truth; never copy its source. Write original code, English comments only.
5. No new dependencies unless unavoidable.

## Sub-agents (`.claude/agents`)
`ui-fidelity-reviewer` · `a11y-auditor` · `code-quality-reviewer`. Skill: `.claude/skills/pixel-clone`.
