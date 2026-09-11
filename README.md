# CityLife Santos Wiki (CLWiki)

**An interactive Progressive Web App for the CityLife Roleplay community.**

![CL Wiki](https://img.shields.io/badge/CLWiki-v1.0-8b5cf6?style=for-the-badge)

## Features

### ![](css/style.css){: .sidebar-label } Rules Viewer
- Browse all server and gang rules organized by category
- Expandable/collapsible sections for easy navigation
- Click any rule to add it to your favorites
- **Ctrl+K** quick search across all rules

### ![](css/style.css){: .sidebar-label } GTA V Interactive Map
- Leaflet-powered map with 3 tile layers (Roadmap, Satellite, Atlus)
- Click anywhere to drop color-coded pins for territories, spawns, and more
- Persistent storage — your pins survive browser refreshes
- Category system: Police, Military, Gang, Territory, Business, Escape

### ![](css/style.css){: .sidebar-label } Gang Calculators
- **Heat Damage Timer** — Calculate when your wanted level will clear
- **Frisk/Loot Timer** — Plan how long it takes to loot N bodies
- **Warrant Tracker** — Track player strikes with a 5-dot system
- **Capacity Planner** — Divide your gang into balanced teams

### ![](css/style.css){: .sidebar-label } Wiki Pages
- Create, edit, and delete custom wiki pages
- Markdown support for formatting (headers, bold, lists, code blocks)
- Pre-loaded with starter pages (spawn points, territories, getting started)

### ![](css/style.css){: .sidebar-label } Search
- Fuse.js-powered fuzzy search across rules, wiki, and map pins
- Smart synonym expansion (jail, heat, arrest, etc.)
- Category-aware results with grouped display
- Keyboard navigation (arrow keys + Enter to navigate)

## Installation

### Quick Start (Local)
1. Clone or download this repository
2. Open `index.html` in a browser
3. That's it! Everything runs client-side.

### PWA Install
- Chrome: Address bar will show install icon → click "Install"
- Firefox: Menu → "Install CityLife Wiki"
- Mobile: Share button → "Add to Home Screen"

### GitHub Pages Deployment
1. Push to a GitHub repository
2. Go to Settings > Pages > Source: main branch
3. Your wiki will be live at `https://yourusername.github.io/repo-name/`

### Shared Map Collaboration

The wiki supports private Supabase-backed access with username/password accounts, a member site key, persistent sessions, realtime map updates, and revision history. Follow [docs/supabase-map-setup.md](docs/supabase-map-setup.md) to connect a free Supabase project. Until configured, the map continues using this device's local browser storage.

## File Structure

```
CityLife Wiki/
├── index.html           # Main application shell
├── css/
│   └── style.css        # All styles (dark theme, glassmorphism)
├── js/
│   ├── data.js          # Rules data + default wiki pages
│   ├── search.js        # Fuse.js fuzzy search engine
│   ├── map.js           # Leaflet map integration
│   ├── calculators.js   # Heat timer, warrants, capacity planner
│   ├── wiki.js          # Wiki page management
│   └── app.js           # Main app controller
├── assets/
│   └── icons/           # App icons (SVG + PNG)
│       └── icon.svg
├── manifest.json        # PWA manifest
├── sw.js                # Service worker (offline support)
├── map/                 # Your custom map images go here
└── README.md
```

## Customization

### Adding Map Images
Place your 3 GTA V map images in the `map/` folder:
- `roadmap.png` — Standard roadmap view
- `satellite.png` — Satellite/aerial view
- `atlus.png` — Atlus-style top-down map

Then update the tile layer URLs in `js/map.js`:
```javascript
customLayers.roadmap = L.tileLayer('map/roadmap.png', { ... });
```

### Adding Rules
Edit `js/data.js` — the `RULES_DATA` object contains all rules organized by category. Follow the same structure.

### Wiki Pages
- Edit pages via the Wiki UI (in-browser editor)
- Or edit `js/data.js` → `DEFAULT_WIKI_PAGES` for defaults
- Markdown syntax supported: `#`, `##`, `###`, `**bold**`, `*italic*`, `- list`, `` `code` ``

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Focus search bar |
| `↑/↓` | Navigate search results |
| `Enter` | Open selected result |
| `Esc` | Close dropdown/modals |

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (zero dependencies at runtime)
- **Search**: Fuse.js 7.0 (fuzzy matching)
- **Map**: Leaflet 1.9 (interactive maps)
- **PWA**: Service Worker + Web App Manifest
- **Hosting**: GitHub Pages (free, no server required)
- **Shared map**: Supabase Auth, PostgreSQL, and Realtime (optional free backend)

## License

MIT — Use freely for your gang/community. Fork and customize as needed.
