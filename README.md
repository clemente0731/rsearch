# RSearch

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chromewebstore.google.com/)

A powerful Chrome extension for advanced text searching with regex, multi-keyword support, and error log analysis on web pages.

## Features

### Two Search Modes

**1. Keywords Mode** (Default)
- Pre-configured error keywords (363+ common error patterns)
- CSV-based preset system with customizable keywords
- 3 preset slots for different use cases
- Severity-based color coding (magenta → red → orange → yellow → green)
- Case-insensitive matching

**2. Regex Mode**
- Full regular expression support
- Advanced pattern matching
- Case-sensitive/insensitive options
- Global search support

### Smart Highlighting

Color palette by severity level:
| Level | Color | Usage |
|-------|-------|-------|
| 1 | Magenta | Most severe errors |
| 2 | Pink-Red | Critical errors |
| 3 | Red | Errors |
| 4 | Deep Orange | Warnings |
| 5 | Orange | Alerts |
| 6 | Yellow | Notices |
| 7 | Lime | Info |
| 8 | Green | Least severe |

### Top 3 Density Areas

- Sliding window algorithm detects high-density error regions
- Shows Top 3 areas with most keyword matches
- Click to navigate directly to error hotspots
- Temporary highlight on target element

### Auto-Search Feature

- Toggle switch for automatic searching
- Auto-executes search on new page loads
- Auto-executes when switching browser tabs
- Remembers switch state across sessions

### Preset Management

- 3 customizable preset slots
- CSV format: `rank,keyword`
- Up to 500 keywords per preset
- Import/export via CSV editor
- Default preset with 363+ error keywords

### Additional Features

- Real-time search progress with ETA
- Match count display
- Clean and intuitive interface
- No data collection
- Works on all websites

## Installation

### From Chrome Web Store (Recommended)
1. Visit [RSearch on Chrome Web Store](https://chromewebstore.google.com/)
2. Click "Add to Chrome"
3. Confirm installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/clemente0731/rsearch.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `rsearch` directory

## Usage

### Basic Usage

1. Click the RSearch icon in your Chrome toolbar
2. Toggle the switch ON (green) to enable auto-search
3. Or manually click "Search" to find matches
4. View Top 3 density areas and click to navigate
5. Click "Clear" to remove highlights

### Preset Management

1. Select a preset from the dropdown
2. Click "Edit" to modify keywords
3. Edit in CSV format: `rank,keyword`
4. Click "Save Changes"
5. Click "Apply" to use the preset

### Auto-Search Mode

1. Turn ON the switch (green)
2. New pages and tab switches will auto-search
3. Turn OFF (red) to disable and clear highlights

## Default Error Keywords

The default preset includes 363+ error keywords covering:
- System signals (SIGSEGV, SIGABRT, etc.)
- Common errors (error, fail, exception, etc.)
- CUDA/GPU errors
- Python/PyTorch errors
- ONNX/ONNXRuntime errors
- Compiler errors (gcc, clang, nvcc)
- Memory errors
- And more...

## Privacy

RSearch respects your privacy:
- No data collection
- No external network requests
- No tracking or analytics
- All processing happens locally
- Open source and transparent

See [PRIVACY.md](PRIVACY.md) for details.

## Development

### Project Structure
```
rsearch/
├── manifest.json       # extension configuration
├── popup.html          # extension popup UI
├── popup.js            # popup logic
├── content.js          # page content manipulation
├── background.js       # auto-search service worker
├── styles.css          # highlight styles
├── icon.svg            # SVG icon source
├── icon*.png           # PNG icons
├── README.md           # this file
├── LICENSE             # MIT License
├── PRIVACY.md          # privacy policy
├── CHANGELOG.md        # version history
└── CONTRIBUTING.md     # contribution guide
```

### Building from Source
No build process required. The extension runs directly from source files.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**clemente0731**

- GitHub: [@clemente0731](https://github.com/clemente0731)

## Support

If you encounter any issues or have questions:
- [Report a bug](https://github.com/clemente0731/rsearch/issues)
- [Request a feature](https://github.com/clemente0731/rsearch/issues)
- [Read the documentation](https://github.com/clemente0731/rsearch)

---

**Enjoy searching!**
