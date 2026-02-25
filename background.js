// background service worker for auto-search functionality

const STORAGE_KEY = 'rsearch_presets_v2';

// get keywords from storage
async function getKeywordsFromStorage() {
  const result = await chrome.storage.local.get([STORAGE_KEY, 'autoSearchEnabled', 'activePresetIndex']);
  
  if (!result.autoSearchEnabled) return null;
  
  const presets = result[STORAGE_KEY] || [];
  const activeIndex = result.activePresetIndex || 0;
  
  if (presets.length === 0 || !presets[activeIndex]) return null;
  
  const preset = presets[activeIndex];
  const keywords = preset.keywords || [];
  
  if (keywords.length === 0) return null;
  
  return keywords;
}

// execute search on a tab
async function executeSearch(tabId) {
  try {
    const keywords = await getKeywordsFromStorage();
    if (!keywords) return;
    
    // inject styles and content script
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles.css']
    });
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    // small delay to ensure script is ready
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // send search request
    await chrome.tabs.sendMessage(tabId, {
      action: 'search',
      mode: 'keywords',
      keywords: keywords,
      caseInsensitive: true,
      intersectionMode: false
    });
  } catch (error) {
    // ignore errors (e.g., restricted pages)
  }
}

// check if url is searchable
function isSearchableUrl(url) {
  if (!url) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  // chrome web store and google internal pages block extensions
  if (url.startsWith('https://chromewebstore.google.com')) return false;
  if (url.startsWith('https://chrome.google.com/webstore')) return false;
  return true;
}

// listen for tab updates (page load complete)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!isSearchableUrl(tab.url)) return;
  
  await executeSearch(tabId);
});

// listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!isSearchableUrl(tab.url)) return;
    
    await executeSearch(activeInfo.tabId);
  } catch (error) {
    // ignore errors
  }
});
