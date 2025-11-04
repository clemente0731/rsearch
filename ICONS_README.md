# Icons Guide for RSearch

## Required Icon Sizes for Chrome Web Store

You need to create PNG icons in the following sizes:

### Extension Icons (Required)
- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

### Store Listing Images (Required for Chrome Web Store)
- **Small tile**: 440x280 pixels
- **Large tile** (promotional): 920x680 pixels (optional but recommended)
- **Marquee** (promotional): 1400x560 pixels (optional)
- **Screenshots**: 1280x800 or 640x400 pixels (at least 1 required, up to 5)

## Design Guidelines

### Icon Design Concept
The current `icon.svg` design features:
- blue circular background (#4285f4)
- white magnifying glass
- `.*` regex pattern inside

### Design Tips
1. **Keep it simple**: Icons should be recognizable at small sizes
2. **Use consistent colors**: Stick to the blue theme
3. **High contrast**: White elements on blue background
4. **Professional look**: Clean lines, no gradients at small sizes

## How to Create Icons

### Option 1: Using Online Tools (Easiest)

1. **Use Figma** (Free):
   - Go to https://www.figma.com/
   - Create a new file
   - Design your 128x128 icon
   - Export as PNG at different sizes

2. **Use Canva** (Free):
   - Go to https://www.canva.com/
   - Create custom dimensions (128x128)
   - Design your icon
   - Download as PNG
   - Resize for other dimensions

### Option 2: Convert SVG to PNG

Using the provided `icon.svg`:

**Online converters**:
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

Steps:
1. Upload `icon.svg`
2. Set size to 128x128
3. Download as `icon128.png`
4. Repeat for 48x48 (icon48.png) and 16x16 (icon16.png)

**Using command line** (if available):
```bash
# Install ImageMagick first
sudo apt-get install imagemagick  # Ubuntu/Debian
brew install imagemagick          # macOS

# Convert SVG to PNG
convert -background none icon.svg -resize 128x128 icon128.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 16x16 icon16.png
```

### Option 3: Design from Scratch

Use any image editor:
- **Photoshop** (paid)
- **GIMP** (free)
- **Inkscape** (free, vector)
- **Adobe Illustrator** (paid)

## Current Setup

The `icon.svg` file is included in the project. You need to:

1. Convert it to PNG files
2. Name them: `icon16.png`, `icon48.png`, `icon128.png`
3. Update `manifest.json` to reference these files

## Updating manifest.json

Once you have the PNG icons, update `manifest.json`:

```json
{
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

## Chrome Web Store Screenshots

### Recommended Screenshots
1. **Main interface** - Show the popup with both modes
2. **Regex mode** - Example of regex search in action
3. **Keywords mode** - Show multi-color highlighting
4. **AND mode** - Demonstrate intersection search
5. **Options** - Show all available options

### Screenshot Guidelines
- Size: 1280x800 or 640x400 pixels
- Format: PNG or JPEG
- Show actual usage on real websites
- Highlight key features
- Clean, uncluttered background
- Professional appearance

## Quick Start (No Icons Yet)

If you want to test without icons:
1. Remove icon references from `manifest.json`
2. Chrome will use a default icon
3. Add proper icons before publishing to Web Store

---

**Need help?** Open an issue on GitHub: https://github.com/clemente0731/rsearch/issues
