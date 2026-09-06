---
tags: [architecture, Mishal]
---

## 1. Stack
- Static HTML5 + vanilla JS (no manifest found: no package.json/go.mod/pyproject.toml/Cargo.toml at repo root)
- CSS: single stylesheet `assets/css/style.css`, Google Fonts (Inter, Playfair Display, Dancing Script)
- GSAP 3.12.5 + ScrollTrigger, loaded via cdnjs `<script>` tags
- Firebase 11.6.0 compat SDKs (App, Auth, Firestore, Storage) via gstatic `<script>` tags

## 2. Directory map
| path | what lives there |
|---|---|
| `index.html` | site entry point / full page markup |
| `README.md` | minimal readme (title only) |
| `assets/css/style.css` | all styling |
| `assets/js/firebase-config.js` | Firebase SDK init |
| `assets/js/auth.js` | admin login/logout (login modal, admin FAB) |
| `assets/js/drag-drop.js` | drag-and-drop reordering (admin mode) |
| `assets/js/editor.js` | inline content editing (admin mode) |
| `assets/js/app.js` | main app logic (project/skill cards, theme toggle, filters) |
| `assets/images/` | profile.jpg/.png/.webp, default-avatar.svg |
| `image/IMG_9513.HEIC` | raw source image, not referenced by index.html |
| `.claude/` | Claude Code local config (launch.json, settings.local.json) |
| `.github/` | GitHub repo config |

## 3. Diagram
```mermaid
flowchart TD
    index.html --> style.css
    index.html --> GSAP
    index.html --> firebase-config.js
    index.html --> auth.js
    index.html --> drag-drop.js
    index.html --> editor.js
    index.html --> app.js
    index.html --> images
    firebase-config.js --> Firebase
    auth.js --> Firebase
    editor.js --> Firebase
    app.js --> Firebase
```

## 4. Component index
- [[index.html]]
- [[style.css]]
- [[app.js]]
- [[auth.js]]
- [[editor.js]]
- [[drag-drop.js]]
- [[firebase-config.js]]
- [[Firebase]]
- [[GSAP]]
- [[images]]

## 5. Entry points
- Dev: open `REPO_ROOT/index.html` directly in a browser — no build step or dev server found in scope
- Prod: same static `REPO_ROOT/index.html` served as-is — no deploy/build config found in scope

## 6. Conventions (observed)
- Lowercase, hyphenated filenames under `assets/` (`drag-drop.js`, `firebase-config.js`)
- Inline `onclick="fnName(...)"` handlers in `index.html` call functions expected to live in the app scripts (e.g. `handleLoginSubmit`, `closeLoginModal`, `toggleTheme`, `filterWork`, `addProjectCard`, `addSkillCard`, `toggleService`, `triggerPicUpload`, `handleFabClick`)
- Editable content is marked `class="editable" data-field="<name>"` (e.g. `data-field="name"`, `data-field="about"`, `data-field="exp-company-1"`)
- Admin-only UI is marked `class="admin-only"` (photo change overlay, add-project/add-skill buttons)
- Scroll-reveal elements are marked `class="reveal"` / `class="reveal-child"` (paired with the loaded GSAP/ScrollTrigger scripts)
- `<script>` load order in `index.html`: GSAP libs → Firebase compat SDKs → `firebase-config.js` → `auth.js` → `drag-drop.js` → `editor.js` → `app.js`
- Image fallback pattern: `onerror="this.src='assets/images/profile.png'"` on the webp profile image

## 7. Where things go
- New page section: add `<section>` to `index.html`, style in `assets/css/style.css`, render/init logic in `assets/js/app.js`
- New editable field: add `class="editable" data-field="X"` in `index.html`, wire persistence in `assets/js/editor.js`
- Admin auth changes: `assets/js/auth.js` + `assets/js/firebase-config.js`
- New drag-reorderable list: `assets/js/drag-drop.js` + matching container element in `index.html`
- Change Firebase project/credentials: `assets/js/firebase-config.js`
