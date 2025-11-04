# Changelog

All notable changes to RSearch will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- [ ] Export/import search patterns
- [ ] Search history (local only)
- [ ] Custom color themes
- [ ] Keyboard shortcuts
- [ ] Search results navigation (next/previous)
- [ ] Save favorite patterns
- [ ] Dark mode support

### Under Consideration
- Multi-language support
- Search within specific page sections
- Advanced regex helper/builder
- Search statistics (local only)

---

**Note**: This is the first public release of RSearch. We welcome feedback and contributions!
