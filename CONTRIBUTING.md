# Contributing to RSearch

First off, thank you for considering contributing to RSearch!

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When you create a bug report, please include:
- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Chrome version** and OS
- **Extension version**

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- **Clear use case** for the feature
- **Detailed description** of the proposed functionality
- **Why this enhancement would be useful** to most users
- **Possible implementation approach** (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the coding standards below
3. **Test thoroughly** in Chrome
4. **Update documentation** if needed
5. **Commit with clear messages** following conventional commits
6. **Submit the pull request**

## Coding Standards

### JavaScript Style Guide

- Use **const** and **let**, avoid **var**
- Use **meaningful variable names** in English
- Add **comments in English** (lowercase start, no period at end)
- **No ternary operators** - use if/else for readability
- **Avoid multiple syntax sugars** in one line
- Add **safety checks** for risky operations

### Example

```javascript
// good: check if element exists
function highlightElement(element) {
  if (!element) {
    console.error('element is null or undefined');
    return;
  }
  
  element.style.backgroundColor = '#ff0000';
}

// bad: using ternary and no safety check
function highlightElement(element) {
  element.style.backgroundColor = element ? '#ff0000' : '#000000';
}
```

### Code Structure

- **One responsibility per function**
- **Keep functions short and focused**
- **Add error handling** for operations that might fail
- **Document complex logic** with comments

### Testing

Before submitting:
1. Test on **multiple websites**
2. Test **both search modes** (regex and keywords)
3. Test **auto-search feature** (new pages, tab switching)
4. Test **preset management** (edit, save, apply)
5. Test **Top 3 density areas** navigation
6. Check for **console errors**

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add dark mode support`
- `fix: resolve regex validation error`
- `docs: update README with examples`
- `style: improve popup layout`
- `refactor: simplify keyword parsing logic`
- `test: add unit tests for search function`
- `chore: update dependencies`

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/clemente0731/rsearch.git
   cd rsearch
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

3. Make changes and reload:
   - Click the reload button on the extension card
   - Test your changes

## Project Structure

```
rsearch/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic, presets, search
├── content.js          # Content script for highlighting
├── background.js       # Service worker for auto-search
├── styles.css          # CSS for highlighting
├── icon.svg            # SVG icon source
├── icon*.png           # PNG icons (16, 48, 128)
│
├── README.md           # Main documentation
├── LICENSE             # MIT License
├── PRIVACY.md          # Privacy policy
├── CHANGELOG.md        # Version history
├── CONTRIBUTING.md     # This file
├── QUICK_START.md      # Quick start guide
│
└── scripts/
    └── package-extension.mjs  # Packaging script
```

## Key Components

### popup.js
- UI event handlers
- Preset management (load, save, edit)
- Search mode switching
- Communication with content script

### content.js
- DOM traversal and text matching
- Highlight creation and removal
- Hotspot tracking and navigation
- Message handling from popup/background

### background.js
- Tab change monitoring
- Auto-search triggering
- Storage access for presets

## Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. You'll be added to contributors list!

## Questions?

Feel free to:
- Open an issue for discussion
- Ask questions in pull requests
- Check existing issues and discussions

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to RSearch!**
