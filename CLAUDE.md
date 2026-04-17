# RSearch — Project Rules

## Design System

### Color Palette (Dark Terminal)

All UI and store assets MUST use this palette. No retro neon, no purple glow.

```
Background:      #0F172A   (slate-900)
Background Deep: #020617   (slate-950)
Card/Surface:    #1B2336
Surface Hover:   #273349
Muted:           #272F42
Muted Text:      #94A3B8   (slate-400)
Border:          #334155   (slate-700)
Border Light:    #475569   (slate-500)
Foreground:      #F8FAFC   (slate-50)
Foreground Soft: #CBD5E1   (slate-300)

Accent (success/active): #22C55E   (green-500)
Primary (error/brand):   #DC2626   (red-600)
Warning:                 #F59E0B   (amber-500)
Info:                    #3B82F6   (blue-500)
Pink (exceptions):       #EC4899   (pink-500)
Cyan (info-level):       #06B6D4   (cyan-500)

Severity gradient (8 steps, critical → info):
  #DC2626  #EF4444  #F97316  #F59E0B  #EAB308  #84CC16  #22C55E  #06B6D4
```

### Visual Style

- **Apple-style restrained aesthetics** — quiet, tasteful, no decorative effects
- Dark mode only, OLED-friendly deep blacks
- No neon glow, no text-shadow glow, no perspective grids
- Subtle grid background (slate-700 at 0.25 opacity, 40px spacing)
- Top-center radial glow in green at very low opacity (0.06)
- Rounded corners: 10px for cards/windows, 6px for buttons/inputs, 3px for highlight chips
- Window chrome: 3-dot traffic lights (red/amber/green), monospace title centered
- Highlight chips: keyword background at 0.2 opacity with 3px rounded rect

### Typography

- UI text: `-apple-system, BlinkMacSystemFont, sans-serif`
- Code/logs: `"SF Mono", Monaco, monospace`
- Headings: bold, system font
- No custom web fonts in store images (system stack only)

### Store Image Rules

- Screenshots: 1280x800, dark background, log window left, popup/panel right
- Small promo: 440x280, icon + title + 3 pill badges + severity bar
- Marquee: 1400x560, branding left + log window right
- Bottom tagline: "Open Source · Privacy First · Manifest V3 · For Developers"
- Feature badges as rounded pills with surface background and border
- Script: `node scripts/generate-store-images.mjs` → outputs to `releases/`

## Architecture

- Chrome Extension, Manifest V3
- No build step — files ship directly from project root
- Service worker: `background.js`
- Popup: `popup.html` + `popup.js` + `styles.css`
- Content script: `content.js` (injected via `chrome.scripting`)
- Packaging: `npm run package` → `dist/rsearch-{version}.zip`

## Permissions (minimal)

Only these 4 permissions. Do not add more without explicit approval:
- `activeTab` — access current tab DOM for search
- `scripting` — inject content script
- `storage` — save presets locally
- `tabs` — auto-search on tab switch

## Privacy

- Zero data collection, zero network requests
- All processing is local
- No analytics, no tracking, no external APIs
- Privacy policy: `PRIVACY.md`

## Release Process

1. Bump version in `manifest.json` + `package.json`
2. `npm run package` → creates zip in `dist/`
3. `node scripts/generate-store-images.mjs` → generates images in `releases/`
4. Copy zip + icon + privacy policy to `releases/`
5. Fill Dashboard fields from `releases/chrome_release_req.md`
6. Upload to Chrome Developer Dashboard
