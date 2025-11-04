# Chrome Web Store Publishing Guide

Complete guide for publishing RSearch to the Chrome Web Store.

## Pre-Publishing Checklist

### Required Files
- [x] `manifest.json` - properly configured
- [x] `README.md` - complete documentation
- [x] `LICENSE` - MIT License
- [x] `PRIVACY.md` - privacy policy
- [x] `CHANGELOG.md` - version history
- [ ] `icon16.png`, `icon48.png`, `icon128.png` - extension icons
- [ ] Store images (440x280, screenshots)

### Code Quality
- [x] No `console.log` in production
- [x] Error handling implemented
- [x] Code is well-commented
- [x] Follows Chrome extension best practices

### Testing
- [ ] Tested on multiple websites
- [ ] Tested both search modes
- [ ] Tested all options
- [ ] No console errors
- [ ] Works on HTTP and HTTPS sites

## Step-by-Step Publishing Process

### Step 1: Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee
4. Complete your developer profile

### Step 2: Prepare Your Package

1. **Remove development files**:
   ```bash
   # Files to remove before packaging:
   - USAGE.txt (keep README.md instead)
   - Any .log files
   - node_modules (if any)
   - .git directory (if packaging from git)
   ```

2. **Create icons** (see ICONS_README.md):
   - icon16.png
   - icon48.png
   - icon128.png

3. **Update manifest.json** with icons:
   ```json
   {
     "icons": {
       "16": "icon16.png",
       "48": "icon48.png",
       "128": "icon128.png"
     },
     "action": {
       "default_icon": {
         "16": "icon16.png",
         "48": "icon48.png",
         "128": "icon128.png"
       }
     }
   }
   ```

4. **Create ZIP package**:
   ```bash
   # From the chrome directory:
   zip -r rsearch-v1.0.0.zip . -x "*.git*" -x "USAGE.txt" -x "ICONS_README.md" -x "WEBSTORE_GUIDE.md"
   ```

### Step 3: Upload to Chrome Web Store

1. Go to [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload your ZIP file
4. Fill in the store listing (see below)
5. Submit for review

### Step 4: Complete Store Listing

#### Item Details

**Category**:
- Primary: Productivity
- Secondary: Developer Tools

**Language**: English (or your preferred language)

#### Store Listing Content

**Extension Name**:
```
RSearch - Advanced Page Search
```

**Summary** (132 characters max):
```
Powerful search tool with regex and multi-keyword support. Highlight text with custom colors. No data collection.
```

**Description** (detailed):
```
RSearch is a powerful and privacy-focused search extension for Chrome that goes beyond basic text search.

TWO POWERFUL SEARCH MODES

Regex Mode:
- Full regular expression support for advanced pattern matching
- Find emails, phone numbers, URLs, and complex patterns
- Case-sensitive and global search options
- Real-time regex validation

Keywords Mode:
- Search multiple keywords in one go
- Each keyword highlighted in a different color (8 vibrant colors)
- OR mode: Match any keyword
- AND mode: All keywords must exist on the page
- Space or comma-separated input

SMART HIGHLIGHTING

- Regex: Bold red highlighting
- Keywords: 8 distinct colors for easy identification
- Auto-scroll to first match
- Match count display
- One-click clear function

KEY FEATURES

- No data collection - 100% privacy-first
- Works on all websites
- Lightning fast performance
- Clean, intuitive interface
- Open source and transparent
- No external network requests

PRIVACY FIRST

- Zero data collection
- No tracking or analytics
- All processing happens locally in your browser
- No external server communication
- Open source: https://github.com/clemente0731/rsearch

Perfect for:
- Developers searching through code
- Researchers analyzing web content
- Content writers finding specific terms
- Anyone who needs advanced search capabilities

Try RSearch today and experience the most powerful search tool for Chrome!
```

**Privacy Policy**:
```
https://github.com/clemente0731/rsearch/blob/main/PRIVACY.md
```

**Homepage**:
```
https://github.com/clemente0731/rsearch
```

**Support URL**:
```
https://github.com/clemente0731/rsearch/issues
```

#### Store Assets

**Icons** (required):
- 128x128 icon (already in manifest)

**Screenshots** (required - at least 1, up to 5):
1. Main interface showing both modes
2. Regex search example with highlighting
3. Keywords mode with multi-color highlights
4. AND mode demonstration
5. Clear interface with options

**Promotional images** (optional but recommended):
- Small tile: 440x280
- Large tile: 920x680

### Step 5: Set Pricing and Distribution

**Pricing**: Free

**Distribution**:
- [x] All countries (or select specific regions)
- [ ] Unlisted (if you want to test first)

**Visibility**: Public

### Step 6: Privacy Practices

**Data Usage**:
- [x] Does NOT collect user data
- [x] Does NOT sell user data
- [x] Does NOT use data for purposes unrelated to the item's core functionality

**Permissions Justification**:

| Permission | Justification |
|------------|---------------|
| activeTab | Required to access the current tab's content for searching and highlighting |
| scripting | Required to inject search functionality into web pages dynamically |

### Step 7: Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Wait for review (typically 1-3 days, can be longer)

## After Submission

### What Happens Next?

1. **Automated checks** (immediate):
   - Malware scan
   - Policy violations check

2. **Manual review** (1-3 days):
   - Privacy compliance
   - Functionality verification
   - Content review

3. **Possible outcomes**:
   - **Approved**: Your extension goes live
   - **Rejected**: Review feedback and resubmit
   - **More information needed**: Respond to reviewer questions

### Common Rejection Reasons

1. Insufficient privacy policy: Make sure PRIVACY.md is accessible
2. Misleading description: Be accurate about features
3. Poor quality images: Use high-resolution screenshots
4. Permissions not justified: Explain why you need each permission
5. Trademark issues: Avoid using trademarked names

## Updating Your Extension

For future updates:

1. Update version in `manifest.json`:
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. Update `CHANGELOG.md`

3. Create new ZIP package

4. Go to Developer Dashboard > Your item > "Package"

5. Upload new ZIP

6. Update store listing if needed

7. Submit for review

## Best Practices

### After Launch

1. Monitor reviews and respond to user feedback
2. Track analytics using Chrome Web Store insights
3. Ship regular updates to fix bugs and add features
4. Engage with the community through GitHub issues
5. Keep README.md updated

### Marketing Tips

1. Share on social media
2. Post on developer communities (Reddit, Hacker News)
3. Write a blog post about the development process
4. Produce a demo video
5. Engage with users on GitHub

## Troubleshooting

### Extension Rejected?

1. Read the rejection email carefully
2. Fix the issues that were mentioned
3. Update CHANGELOG.md
4. Increment the version number (for example, 1.0.0 -> 1.0.1)
5. Resubmit

### Need to Appeal?

If you believe your extension was rejected incorrectly:
1. Reply to the rejection email
2. Provide a clear explanation
3. Reference the relevant policies
4. Be professional and patient

## Support Resources

- [Chrome Web Store Developer Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Developer Support](https://support.google.com/chrome_webstore/)

## Final Checklist Before Submission

- [ ] All icons created (16, 48, 128)
- [ ] Screenshots prepared (1-5 images)
- [ ] Privacy policy accessible online
- [ ] `manifest.json` validated
- [ ] Tested thoroughly
- [ ] README.md is complete
- [ ] LICENSE file included
- [ ] Store listing text prepared
- [ ] Permissions justified
- [ ] Version number is correct
- [ ] ZIP package created
- [ ] Developer account ready ($5 paid)

---

**Good luck with your submission!**

Questions? Open an issue: https://github.com/clemente0731/rsearch/issues
