// get DOM elements
const patternInput = document.getElementById('pattern');
const caseInsensitiveCheckbox = document.getElementById('caseInsensitive');
const globalSearchCheckbox = document.getElementById('globalSearch');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const statusDiv = document.getElementById('status');
const regexModeRadio = document.getElementById('regexMode');
const keywordModeRadio = document.getElementById('keywordMode');
const patternLabel = document.getElementById('patternLabel');
const globalLabel = document.getElementById('globalLabel');
const intersectionLabel = document.getElementById('intersectionLabel');
const intersectionModeCheckbox = document.getElementById('intersectionMode');

// track injected tabs to avoid re-injection
const injectedTabs = new Set();

// update UI based on search mode
function updateSearchModeUI() {
  const isRegexMode = regexModeRadio.checked;
  
  if (isRegexMode) {
    patternLabel.textContent = 'Regular Expression Pattern:';
    patternInput.placeholder = 'e.g., \\d{3}-\\d{4}';
    globalLabel.style.display = 'flex';
    intersectionLabel.style.display = 'none';
  } else {
    patternLabel.textContent = 'Keywords (space or comma separated):';
    patternInput.placeholder = 'e.g., hello world, test';
    globalLabel.style.display = 'none';
    intersectionLabel.style.display = 'flex';
  }
}

// mode change listeners
regexModeRadio.addEventListener('change', updateSearchModeUI);
keywordModeRadio.addEventListener('change', updateSearchModeUI);

// inject content script and CSS into tab
async function injectScripts(tabId) {
  // check if already injected
  if (injectedTabs.has(tabId)) {
    return;
  }
  
  try {
    // inject CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles.css']
    });
    
    // inject JavaScript
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    // mark as injected
    injectedTabs.add(tabId);
  } catch (error) {
    // if injection fails, it might already be injected or page doesn't allow it
    // try to continue anyway
    console.error('Injection error:', error);
  }
}

// search button click handler
searchBtn.addEventListener('click', async () => {
  const pattern = patternInput.value.trim();
  
  if (!pattern) {
    showStatus('Please enter a search pattern or keywords', 'error');
    return;
  }
  
  const isRegexMode = regexModeRadio.checked;
  
  // validate regex pattern in regex mode
  if (isRegexMode) {
    try {
      const flags = buildRegexFlags();
      new RegExp(pattern, flags);
    } catch (e) {
      showStatus('Invalid regular expression: ' + e.message, 'error');
      return;
    }
  }
  
  // get active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tabs || tabs.length === 0) {
    showStatus('No active tab found', 'error');
    return;
  }
  
  const tabId = tabs[0].id;
  
  try {
    // inject content script and CSS if not already injected
    await injectScripts(tabId);
    
    // prepare search parameters based on mode
    let searchParams;
    
    if (isRegexMode) {
      searchParams = {
        action: 'search',
        mode: 'regex',
        pattern: pattern,
        flags: buildRegexFlags()
      };
    } else {
      searchParams = {
        action: 'search',
        mode: 'keywords',
        keywords: parseKeywords(pattern),
        caseInsensitive: caseInsensitiveCheckbox.checked,
        intersectionMode: intersectionModeCheckbox.checked
      };
    }
    
    // send message to content script
    const response = await chrome.tabs.sendMessage(tabId, searchParams);
    
    if (response && response.success) {
      const count = response.count || 0;
      showStatus('Found ' + count + ' match(es)', 'success');
    } else {
      const errorMsg = response.error || 'Search failed';
      const missingKeywords = response.missingKeywords || [];
      
      if (missingKeywords.length > 0) {
        showStatus('Missing keywords: ' + missingKeywords.join(', '), 'error');
      } else {
        showStatus(errorMsg, 'error');
      }
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

// clear button click handler
clearBtn.addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tabs || tabs.length === 0) {
    showStatus('No active tab found', 'error');
    return;
  }
  
  const tabId = tabs[0].id;
  
  try {
    // inject content script if not already injected
    await injectScripts(tabId);
    
    // send clear message
    const response = await chrome.tabs.sendMessage(tabId, { action: 'clear' });
    
    if (response && response.success) {
      showStatus('Highlights cleared', 'success');
      patternInput.value = '';
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

// parse keywords from input string
function parseKeywords(input) {
  // split by comma or whitespace
  const keywords = input
    .split(/[,\s]+/)
    .map(k => k.trim())
    .filter(k => k.length > 0);
  
  return keywords;
}

// build regex flags from checkboxes
function buildRegexFlags() {
  let flags = '';
  
  if (caseInsensitiveCheckbox.checked) {
    flags += 'i';
  }
  
  if (globalSearchCheckbox.checked) {
    flags += 'g';
  }
  
  return flags;
}

// show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  
  // auto hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

// press Enter to search
patternInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// initialize UI on load
updateSearchModeUI();
