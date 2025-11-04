# Quick Start Guide for RSearch

## ?? For Users

### Installation (Local Testing)

1. Download or clone the repository
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `chrome` directory
6. Done! Click the RSearch icon to start

### Basic Usage

1. **Choose mode**: Regex or Keywords
2. **Enter search**: Pattern or keywords
3. **Set options**: Case sensitivity, AND/OR mode
4. **Click Search**: Results highlighted on page
5. **Click Clear**: Remove all highlights

## ?? For Developers/Publishers

### Before Publishing to Chrome Web Store

#### ? Checklist

1. **Create PNG icons** (see ICONS_README.md):
   - [ ] icon16.png
   - [ ] icon48.png  
   - [ ] icon128.png

2. **Create screenshots** (1280x800 or 640x400):
   - [ ] Main interface
   - [ ] Regex mode example
   - [ ] Keywords mode example
   - [ ] Options demonstration

3. **Test thoroughly**:
   - [ ] Test on multiple websites
   - [ ] Test both modes
   - [ ] Test all options
   - [ ] Check for errors

4. **Review documentation**:
   - [x] README.md
   - [x] PRIVACY.md
   - [x] LICENSE
   - [x] CHANGELOG.md

#### ?? Publishing Steps

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time registration fee
3. Create ZIP package:
   ```bash
   zip -r rsearch-v1.0.0.zip . -x "*.git*" -x "*README*.md" -x "WEBSTORE_GUIDE.md"
   ```
4. Upload ZIP file
5. Fill in store listing (see WEBSTORE_GUIDE.md)
6. Submit for review

See **WEBSTORE_GUIDE.md** for detailed instructions.

## ?? Project Structure

```
chrome/
??? manifest.json          # Extension config ??
??? popup.html            # UI interface ??
??? popup.js              # UI logic ??
??? content.js            # Page manipulation ??
??? styles.css            # Highlighting styles ??
??? icon.svg              # SVG icon source ??
??? icon*.png             # PNG icons (need to create) ???
?
??? README.md             # Main documentation ??
??? LICENSE               # MIT License ??
??? PRIVACY.md            # Privacy policy ??
??? CHANGELOG.md          # Version history ??
??? CONTRIBUTING.md       # Contribution guide ??
??? .gitignore           # Git ignore rules ??
?
??? Guides/
    ??? ICONS_README.md       # How to create icons
    ??? WEBSTORE_GUIDE.md     # Publishing guide
    ??? QUICK_START.md        # This file
```

## ?? Key Features

### Regex Mode
- Full regex support
- Case sensitive/insensitive
- Global search option
- Real-time validation
- Red bold highlighting

### Keywords Mode
- Multi-keyword search
- 8 color highlighting
- OR mode (any keyword)
- AND mode (all keywords required)
- Missing keywords alert

## ?? Next Steps

### For Local Development
1. Make your changes
2. Test in Chrome
3. Reload extension to see changes
4. Submit PR to GitHub

### For Publishing
1. ? Create icons (ICONS_README.md)
2. ? Take screenshots
3. ? Create ZIP package
4. ? Submit to Web Store (WEBSTORE_GUIDE.md)

## ?? Get Help

- ?? Read [README.md](README.md) for full documentation
- ?? Visit [GitHub repo](https://github.com/clemente0731/rsearch)
- ?? [Report issues](https://github.com/clemente0731/rsearch/issues)
- ?? [Discussions](https://github.com/clemente0731/rsearch/discussions)

## ?? Learn More

- **Chrome Extensions**: https://developer.chrome.com/docs/extensions/
- **Manifest V3**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **Web Store Policies**: https://developer.chrome.com/docs/webstore/program-policies/

---

**Ready to publish? Follow WEBSTORE_GUIDE.md! ??**
