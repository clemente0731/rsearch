# Changelog

All notable changes to RSearch will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-05

### Major Release - Error Log Analysis

#### Added
- **CSV Preset System**
  - 3 customizable preset slots
  - CSV format: rank,keyword
  - Up to 500 keywords per preset
  - Import/export via editor
  - Default preset with 363+ error keywords

- **Top 3 Density Areas**
  - Sliding window algorithm (300px window)
  - Detects high-density error regions
  - Click to navigate to hotspots
  - Temporary highlight on target

- **Auto-Search Feature**
  - Toggle switch in header (green=on, red=off)
  - Auto-search on new page loads
  - Auto-search when switching tabs
  - State persists across sessions

- **Background Service Worker**
  - Monitors tab changes
  - Triggers auto-search automatically
  - Works even when popup is closed

- **Severity-Based Color Coding**
  - 8 colors from magenta to green
  - Higher severity = warmer colors
  - Lower severity = cooler colors

- **UI Improvements**
  - Close button in header
  - Real-time search progress with ETA
  - Auto-expanding popup height
  - Keywords mode as default
  - Wider popup (340px)

#### Changed
- Keywords mode now default (was Regex)
- Removed AND mode option
- Removed auto-scroll to first match
- Updated color palette for better visibility

#### Technical
- Added `storage` permission for presets
- Added `tabs` permission for auto-search
- Added background.js service worker
- Manifest V3 compliant

---

## [1.0.0] - 2025-11-04

### Initial Release

#### Added
- **Regex Search Mode**
  - Full regular expression support
  - Case-sensitive and case-insensitive options
  - Global search option (find all matches)
  - Real-time regex validation
  - Red bold highlighting for matches
  
- **Keywords Search Mode**
  - Multi-keyword search in one line
  - Space or comma-separated keywords
  - 8 vibrant colors for different keywords
  - OR mode (default): Match any keyword
  - AND mode: All keywords must exist
  - Missing keywords error reporting
  
- **UI Features**
  - Clean and intuitive popup interface
  - Mode toggle between Regex and Keywords
  - Checkbox options for search behavior
  - Status messages with success/error feedback
  - Auto-hide success messages after 3 seconds
  - Enter key support for quick search
  
- **Core Features**
  - Auto-scroll to first match
  - Match count display
  - Clear function to remove all highlights
  - Dynamic script injection for better performance
  - Works on all websites (where permissions allow)
  
- **Privacy & Security**
  - No data collection
  - No external network requests
  - All processing happens locally
  - Open source code
  
- **Documentation**
  - Comprehensive README.md
  - Privacy policy (PRIVACY.md)
  - MIT License
  - Usage examples and guides

### Technical Details
- Manifest V3 compliant
- Minimal permissions (activeTab, scripting)
- Optimized for performance
- No external dependencies

---

## Future Plans

### Planned Features
- [ ] Search history (local only)
- [ ] Custom color themes
- [ ] Keyboard shortcuts
- [ ] Search results navigation (next/previous)
- [ ] Dark mode support
- [ ] Export search results

### Under Consideration
- Multi-language support
- Search within specific page sections
- Advanced regex helper/builder
- Preset sharing/import from URL

---

**Note**: We welcome feedback and contributions! Please open an issue on GitHub.
