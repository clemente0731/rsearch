# RSearch

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chrome.google.com/webstore)

A powerful and lightweight Chrome extension for advanced text searching on web pages with regex and multi-keyword support.

## ?? Features

### ?? Two Search Modes

**1. Regex Mode**
- Full regular expression support
- Advanced pattern matching
- Case-sensitive/insensitive options
- Global search support

**2. Keywords Mode**
- Multiple keywords in one line
- Space or comma-separated
- Each keyword highlighted in different color
- OR mode (default): Match any keyword
- AND mode: All keywords must exist

### ?? Smart Highlighting

- **Regex Mode**: Bold red highlighting
- **Keywords Mode**: 8 vibrant colors for multiple keywords
  - ?? Red
  - ?? Green
  - ?? Blue
  - ?? Orange
  - ?? Purple
  - ?? Cyan
  - ?? Deep Orange
  - ?? Deep Purple

### ? Additional Features

- Auto-scroll to first match
- Match count display
- Real-time regex validation
- Case-insensitive search option
- Clean and intuitive interface
- No data collection
- Works on all websites

## ?? Installation

### From Chrome Web Store (Recommended)
1. Visit [RSearch on Chrome Web Store](#) (Coming soon)
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

## ?? Usage

### Basic Usage

1. Click the RSearch icon in your Chrome toolbar
2. Choose your search mode:
   - **Regex Mode**: For pattern matching
   - **Keywords Mode**: For multiple keywords
3. Enter your search pattern or keywords
4. Configure options:
   - **Ignore Case**: Case-insensitive matching
   - **Find All** (Regex only): Find all matches
   - **AND Mode** (Keywords only): All keywords required
5. Click "Search"
6. Click "Clear" to remove highlights

### Examples

#### Regex Mode
```
Email addresses: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
Phone numbers: \d{3}-\d{3}-\d{4}
URLs: https?://[^\s]+
IP addresses: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}
```

#### Keywords Mode (OR)
```
Input: error warning success
Result: Highlights any of these words with different colors
```

#### Keywords Mode (AND)
```
Input: user login success
AND Mode: ? (checked)
Result: Only highlights if ALL three words exist on the page
        Shows "Missing keywords: xxx" if any are absent
```

## ?? Privacy

RSearch respects your privacy:
- ? No data collection
- ? No external network requests
- ? No tracking or analytics
- ? All processing happens locally
- ? Open source and transparent

See [PRIVACY.md](PRIVACY.md) for details.

## ??? Development

### Prerequisites
- Google Chrome or Chromium-based browser
- Basic knowledge of JavaScript and Chrome Extensions API

### Project Structure
```
rsearch/
??? manifest.json       # Extension configuration
??? popup.html          # Extension popup UI
??? popup.js           # Popup logic
??? content.js         # Page content manipulation
??? styles.css         # Highlight styles
??? README.md          # This file
??? LICENSE            # MIT License
??? PRIVACY.md         # Privacy policy
??? CHANGELOG.md       # Version history
```

### Building from Source
No build process required. The extension runs directly from source files.

## ?? Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## ?? Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ?? License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ?? Author

**clemente0731**

- GitHub: [@clemente0731](https://github.com/clemente0731)

## ?? Acknowledgments

- Inspired by browser's native search functionality
- Built with ?? for developers and power users

## ?? Support

If you encounter any issues or have questions:
- ?? [Report a bug](https://github.com/clemente0731/rsearch/issues)
- ?? [Request a feature](https://github.com/clemente0731/rsearch/issues)
- ?? [Read the documentation](https://github.com/clemente0731/rsearch)

---

**Enjoy searching! ???**
