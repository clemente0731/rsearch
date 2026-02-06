# Privacy Policy for RSearch

**Last Updated: February 5, 2026**

## Overview

RSearch is committed to protecting your privacy. This privacy policy explains how RSearch handles information when you use our Chrome extension.

## Information Collection and Use

### What We DON'T Collect

RSearch does **NOT** collect, store, or transmit any of the following:

- Personal information
- Browsing history
- Search queries or patterns
- Page content
- Cookies or tracking data
- Usage statistics or analytics
- Any identifiable information

### How RSearch Works

RSearch operates entirely locally in your browser:

1. **Local Processing Only**: All search and highlighting operations happen directly in your browser
2. **No External Servers**: The extension does not communicate with any external servers
3. **Local Storage Only**: Settings and presets are stored locally in Chrome's storage API
4. **No Tracking**: We do not track your usage or behavior in any way

## Permissions Explained

RSearch requires the following Chrome permissions:

### `activeTab`
- **Why**: To access the current tab's content for search and highlighting
- **Usage**: Only activated when you click the extension icon or when auto-search is enabled
- **Scope**: Limited to the active tab only

### `scripting`
- **Why**: To inject search and highlighting functionality into web pages
- **Usage**: Dynamically loads content scripts when you perform a search
- **Scope**: Only affects the current tab

### `storage`
- **Why**: To save your preferences and custom presets locally
- **Usage**: Stores preset configurations and switch state
- **Scope**: Data stored locally in your browser only, never transmitted

### `tabs`
- **Why**: To enable auto-search feature when switching tabs or loading new pages
- **Usage**: Monitors tab changes to trigger auto-search when enabled
- **Scope**: Only reads tab URL to determine if search should run

## Data Storage

### What Is Stored Locally

- Preset configurations (keywords, names)
- Active preset selection
- Auto-search toggle state

### Where Data Is Stored

All data is stored using Chrome's `chrome.storage.local` API, which:
- Keeps data on your local device only
- Does not sync to Google servers
- Is cleared when you uninstall the extension

## Data Security

Since RSearch does not collect, store externally, or transmit any data:
- There is no data to be compromised
- Your search patterns remain private on your device
- No risk of data breaches or leaks

## Third-Party Services

RSearch does **NOT** use any third-party services, including:
- No analytics services (e.g., Google Analytics)
- No error tracking services
- No advertising networks
- No social media integrations
- No external APIs

## Changes to This Policy

If we update this privacy policy, we will:
1. Update the "Last Updated" date at the top
2. Notify users through the extension's update notes
3. Post the updated policy in the GitHub repository

## Open Source Transparency

RSearch is open source. You can:
- Review the complete source code at: https://github.com/clemente0731/rsearch
- Verify that no data collection occurs
- Audit the code for privacy concerns
- Contribute improvements

## Children's Privacy

RSearch does not knowingly collect any information from anyone, including children under 13. The extension does not collect any data from any users.

## Your Consent

By using RSearch, you consent to this privacy policy.

## Contact

If you have any questions or concerns about this privacy policy:

- Open an issue on GitHub: https://github.com/clemente0731/rsearch/issues
- View the source code: https://github.com/clemente0731/rsearch

## Summary

**RSearch is privacy-first:**
- ✅ Zero data collection
- ✅ No tracking
- ✅ No external communications
- ✅ Fully local operation
- ✅ Open source and auditable
- ✅ Local storage only

---

**Your privacy is important to us. RSearch keeps your searches completely private and local to your browser.**
