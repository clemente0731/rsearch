// store highlighted elements
let highlightedElements = [];

// listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'search') {
    let result;
    
    if (request.mode === 'regex') {
      result = performRegexSearch(request.pattern, request.flags);
    } else if (request.mode === 'keywords') {
      result = performKeywordsSearch(
        request.keywords, 
        request.caseInsensitive,
        request.intersectionMode
      );
    }
    
    sendResponse(result);
  } else if (request.action === 'clear') {
    clearHighlights();
    sendResponse({ success: true });
  }
  
  return true;
});

// color palette for multiple keywords
const HIGHLIGHT_COLORS = [
  { bg: '#ff4444', text: '#ffffff' },
  { bg: '#44ff44', text: '#000000' },
  { bg: '#4444ff', text: '#ffffff' },
  { bg: '#ffaa00', text: '#000000' },
  { bg: '#ff44ff', text: '#ffffff' },
  { bg: '#00ffff', text: '#000000' },
  { bg: '#ff8800', text: '#000000' },
  { bg: '#8844ff', text: '#ffffff' }
];

// perform keywords search and highlight matches
function performKeywordsSearch(keywords, caseInsensitive, intersectionMode) {
  try {
    // clear previous highlights
    clearHighlights();
    
    if (!keywords || keywords.length === 0) {
      return { success: false, error: 'No keywords provided' };
    }
    
    // in intersection mode, check if all keywords exist first
    if (intersectionMode) {
      const missingKeywords = [];
      
      keywords.forEach(keyword => {
        // escape special regex characters
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // build regex for keyword
        const flags = caseInsensitive ? 'gi' : 'g';
        const regex = new RegExp(escapedKeyword, flags);
        
        // check if keyword exists in page
        const pageText = document.body.textContent;
        const hasMatch = regex.test(pageText);
        
        if (!hasMatch) {
          missingKeywords.push(keyword);
        }
      });
      
      // if any keyword is missing, return failure
      if (missingKeywords.length > 0) {
        return {
          success: false,
          error: 'Not all keywords found',
          missingKeywords: missingKeywords
        };
      }
    }
    
    let totalMatches = 0;
    
    // search for each keyword with different color
    keywords.forEach((keyword, index) => {
      const colorIndex = index % HIGHLIGHT_COLORS.length;
      const colors = HIGHLIGHT_COLORS[colorIndex];
      
      // escape special regex characters
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // build regex for keyword
      const flags = caseInsensitive ? 'gi' : 'g';
      const regex = new RegExp(escapedKeyword, flags);
      
      // get fresh text nodes for each keyword since DOM changes after each highlight
      const textNodes = getTextNodes(document.body);
      
      // search and highlight in each text node
      textNodes.forEach(node => {
        const text = node.textContent;
        const matches = text.match(regex);
        
        if (matches && matches.length > 0) {
          highlightTextNodeWithColor(node, regex, colors);
          totalMatches += matches.length;
        }
      });
    });
    
    // scroll to first match if exists
    if (highlightedElements.length > 0) {
      highlightedElements[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    
    return {
      success: true,
      count: totalMatches
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// perform regex search and highlight matches
function performRegexSearch(patternStr, flags) {
  try {
    // clear previous highlights
    clearHighlights();
    
    // create regex pattern
    const regex = new RegExp(patternStr, flags);
    
    // get all text nodes in the document
    const textNodes = getTextNodes(document.body);
    
    let matchCount = 0;
    
    // search and highlight in each text node
    textNodes.forEach(node => {
      const text = node.textContent;
      const matches = text.match(regex);
      
      if (matches && matches.length > 0) {
        highlightTextNode(node, regex);
        matchCount += matches.length;
      }
    });
    
    // scroll to first match if exists
    if (highlightedElements.length > 0) {
      highlightedElements[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    
    return {
      success: true,
      count: matchCount
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// get all text nodes in element
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // skip script, style, and empty text nodes
        const parent = node.parentElement;
        if (!parent) {
          return NodeFilter.FILTER_REJECT;
        }
        
        const tagName = parent.tagName.toLowerCase();
        if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
          return NodeFilter.FILTER_REJECT;
        }
        
        if (node.textContent.trim().length === 0) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let currentNode = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }
  
  return textNodes;
}

// highlight matches in a text node
function highlightTextNode(node, regex) {
  const text = node.textContent;
  const parent = node.parentElement;
  
  if (!parent) {
    return;
  }
  
  // create document fragment to hold new nodes
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;
  
  // reset regex lastIndex for global flag
  regex.lastIndex = 0;
  
  // find all matches
  while ((match = regex.exec(text)) !== null) {
    // add text before match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      fragment.appendChild(document.createTextNode(beforeText));
    }
    
    // create highlight span for match
    const span = document.createElement('span');
    span.className = 'regex-search-highlight';
    span.textContent = match[0];
    fragment.appendChild(span);
    highlightedElements.push(span);
    
    lastIndex = match.index + match[0].length;
    
    // prevent infinite loop for zero-width matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
    
    // break if not global search
    if (!regex.global) {
      break;
    }
  }
  
  // add remaining text after last match
  if (lastIndex < text.length) {
    const afterText = text.substring(lastIndex);
    fragment.appendChild(document.createTextNode(afterText));
  }
  
  // replace original text node with fragment
  parent.replaceChild(fragment, node);
}

// highlight matches in a text node with custom color
function highlightTextNodeWithColor(node, regex, colors) {
  const text = node.textContent;
  const parent = node.parentElement;
  
  if (!parent) {
    return;
  }
  
  // check if this node has already been processed
  if (parent.classList && parent.classList.contains('regex-search-highlight')) {
    return;
  }
  
  // create document fragment to hold new nodes
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;
  
  // reset regex lastIndex for global flag
  regex.lastIndex = 0;
  
  let hasMatch = false;
  
  // find all matches
  while ((match = regex.exec(text)) !== null) {
    hasMatch = true;
    
    // add text before match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      fragment.appendChild(document.createTextNode(beforeText));
    }
    
    // create highlight span for match with custom color
    const span = document.createElement('span');
    span.className = 'regex-search-highlight';
    span.style.backgroundColor = colors.bg;
    span.style.color = colors.text;
    span.textContent = match[0];
    fragment.appendChild(span);
    highlightedElements.push(span);
    
    lastIndex = match.index + match[0].length;
    
    // prevent infinite loop for zero-width matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }
  
  // only replace if there were matches
  if (hasMatch) {
    // add remaining text after last match
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      fragment.appendChild(document.createTextNode(afterText));
    }
    
    // replace original text node with fragment
    parent.replaceChild(fragment, node);
  }
}

// clear all highlights
function clearHighlights() {
  highlightedElements.forEach(element => {
    if (element.parentNode) {
      const text = element.textContent;
      const textNode = document.createTextNode(text);
      element.parentNode.replaceChild(textNode, element);
    }
  });
  
  highlightedElements = [];
  
  // normalize text nodes to merge adjacent text nodes
  document.body.normalize();
}
