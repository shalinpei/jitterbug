# CLAUDE.md

## Project Overview
Jitterbug is a personal static web app that visualizes jitterbug
transformations (rigid polygon faces that twist and contract, e.g.
cuboctahedron → icosahedron → octahedron). Hosted on GitHub Pages
(Deploy from branch: `main`, root).

## Constraints
- Vanilla HTML/CSS/JS with ES modules. No frameworks, no build tools.
- Three.js loaded from a CDN via an import map, pinned to an exact version.
- Must work on desktop and mobile (touch rotate/zoom, responsive layout).
- No secrets or API keys; the repo is public.

## File Structure (planned)
- `index.html` — page shell, canvas, controls panel, import map
- `style.css` — layout and styles
- `main.js` — Three.js scene, camera, lights, orbit controls, render loop
- `jitterbug.js` — pure geometry math (no Three.js drawing code)
- `ui.js` — connects controls to the model

## Development
    python3 -m http.server
Work on a feature branch; merge to `main` when it works (main = live site).

## Roadmap
- Phase 1: classic 8-triangle jitterbug, slider, play/pause
- Phase 2: polygon picker (triangle/square/pentagon), strut thickness,
  face visibility, colors, speed
- Phase 3: mobile polish and performance
