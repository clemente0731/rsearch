# Quick Start Guide for RSearch

## For Users

### Installation

**From Chrome Web Store:**
1. Visit [Chrome Web Store](https://chromewebstore.google.com/)
2. Search for "RSearch"
3. Click "Add to Chrome"
4. Done!

**From Source (Developer Mode):**
1. Download or clone the repository
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the project directory
6. Done! Click the RSearch icon to start

### Basic Usage

1. **Click RSearch icon** in toolbar
2. **Toggle switch ON** (green) for auto-search
3. **Or click "Search"** for manual search
4. **Click hotspot items** to navigate to error areas
5. **Click "Clear"** to remove highlights

### Auto-Search Mode

When the switch is ON (green):
- New pages auto-search on load
- Switching tabs auto-searches
- Highlights error keywords automatically

When the switch is OFF (red):
- No auto-search
- Highlights cleared

### Managing Presets

1. Select preset from dropdown
2. Click "Edit" to open CSV editor
3. Format: `rank,keyword` (one per line)
4. Click "Save Changes"
5. Click "Apply" to use

### Top 3 Density Areas

After searching:
- Shows top 3 areas with most matches
- Click item to jump to that area
- Target element highlighted temporarily

---

## For Publishers

### Chrome Web Store Checklist

#### Required Assets

- [ ] **Icons** (PNG format):
  - icon16.png (16x16)
  - icon48.png (48x48)
  - icon128.png (128x128)

- [ ] **Screenshots** (1280x800 or 640x400):
  - Main interface
  - Keywords mode with highlights
  - Top 3 density areas
  - Auto-search toggle

- [ ] **Promotional images** (optional):
  - Small tile: 440x280
  - Large tile: 920x680
  - Marquee: 1400x560

#### Required Information

- [ ] Extension name: RSearch
- [ ] Short description (132 chars max)
- [ ] Detailed description
- [ ] Category: Developer Tools / Productivity
- [ ] Language: English
- [ ] Privacy policy URL

### Publishing Steps

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time registration fee
3. Create ZIP package:
   ```bash
   npm run package
   # or manually:
   zip -r rsearch.zip manifest.json popup.html popup.js content.js background.js styles.css icon*.png
   ```
4. Click "New Item" → Upload ZIP
5. Fill in store listing details
6. Add screenshots and icons
7. Submit for review (1-3 days)

### Store Listing Content

**Short Description (132 chars):**
```
Advanced search tool with regex, multi-keyword support, and error log analysis. Auto-highlights errors on any webpage.
```

**Detailed Description:**
```
RSearch - Advanced Text Search & Error Analysis

Features:
• Keywords Mode with 363+ pre-configured error patterns
• Regex Mode for advanced pattern matching  
• Severity-based color coding (8 colors)
• Top 3 density areas for error hotspots
• Auto-search on new pages and tab switches
• CSV-based preset system (3 slots, 500 keywords each)
• Real-time search progress with ETA

Perfect for:
• Developers debugging logs
• QA engineers analyzing error reports
• Anyone searching for specific text patterns

Privacy:
• No data collection
• No external requests
• Fully local processing
• Open source
```

### Post-Publishing

- [ ] Monitor reviews and respond
- [ ] Track download statistics
- [ ] Update for bug fixes
- [ ] Add new features based on feedback

---

## Project Structure

```
rsearch/
├── manifest.json          # Extension configuration
├── popup.html             # UI interface
├── popup.js               # UI logic & presets
├── content.js             # Page highlighting
├── background.js          # Auto-search worker
├── styles.css             # Highlight styles
├── icon.svg               # SVG source
├── icon*.png              # PNG icons
│
├── README.md              # Main documentation
├── LICENSE                # MIT License
├── PRIVACY.md             # Privacy policy
├── CHANGELOG.md           # Version history
├── CONTRIBUTING.md        # Contribution guide
├── QUICK_START.md         # This file
└── scripts/
    └── package-extension.mjs  # Packaging script
```

---

## Get Help

- Read [README.md](README.md) for full documentation
- Visit [GitHub repo](https://github.com/clemente0731/rsearch)
- Report issues: https://github.com/clemente0731/rsearch/issues

## Learn More

- **Chrome Extensions**: https://developer.chrome.com/docs/extensions/
- **Manifest V3**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **Web Store Policies**: https://developer.chrome.com/docs/webstore/program-policies/

---

**Ready to publish? Follow the checklist above!**
