// prevent duplicate injection
if (window.rsearchInjected) {
  // already injected, do nothing
} else {
  window.rsearchInjected = true;

  // store highlighted elements
  let highlightedElements = [];
  let scrollbarContainer = null;

  // send progress update to popup
  function sendProgress(processed, total, matches, startTime) {
    const elapsed = Date.now() - startTime;
    const rate = processed / elapsed; // nodes per ms
    const remaining = total - processed;
    const estimatedMs = remaining / rate;
    
    const percent = Math.round((processed / total) * 100);
    
    chrome.runtime.sendMessage({
      action: 'searchProgress',
      processed: processed,
      total: total,
      percent: percent,
      matches: matches,
      estimatedSeconds: Math.ceil(estimatedMs / 1000)
    }).catch(() => {
      // popup might be closed, ignore error
    });
  }

  // listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'search') {
      // use async search to allow progress updates
      performSearchAsync(request).then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      
      return true; // keep channel open for async response
    } else if (request.action === 'clear') {
      clearHighlights();
      sendResponse({ success: true });
    } else if (request.action === 'scrollToHotspot') {
      const areaIndex = request.areaIndex !== undefined ? request.areaIndex : request.segmentIndex;
      const success = scrollToHotspot(areaIndex);
      sendResponse({ success: success });
    }
    
    return true;
  });

  // async wrapper for search with progress
  async function performSearchAsync(request) {
    if (request.mode === 'regex') {
      return await performRegexSearchAsync(request.pattern, request.flags);
    } else if (request.mode === 'keywords') {
      return await performKeywordsSearchAsync(
        request.keywords,
        request.caseInsensitive,
        request.intersectionMode
      );
    }
    return { success: false, error: 'Unknown search mode' };
  }

  // color palette by severity: magenta → red → orange → yellow → green
  const HIGHLIGHT_COLORS = [
    { bg: '#c026d3', text: '#ffffff' },  // 1. magenta (most severe)
    { bg: '#db2777', text: '#ffffff' },  // 2. pink-red
    { bg: '#dc2626', text: '#ffffff' },  // 3. red
    { bg: '#ea580c', text: '#ffffff' },  // 4. deep orange
    { bg: '#f97316', text: '#000000' },  // 5. orange
    { bg: '#eab308', text: '#000000' },  // 6. yellow
    { bg: '#84cc16', text: '#000000' },  // 7. lime
    { bg: '#22c55e', text: '#000000' }   // 8. green (least severe)
  ];

  // hotspot tracking: collect all match positions
  let matchPositions = []; // stores { element, offsetTop, text }
  let topDensityAreas = []; // stores TOP3 density areas
  const WINDOW_SIZE = 300; // sliding window height in pixels

  // Create or get scrollbar container
  function getScrollbarContainer() {
    if (!scrollbarContainer) {
      scrollbarContainer = document.createElement('div');
      scrollbarContainer.id = 'rsearch-scrollbar-container';
      document.body.appendChild(scrollbarContainer);
    }
    scrollbarContainer.innerHTML = '';
    
    // reset match positions
    matchPositions = [];
    topDensityAreas = [];
    
    return scrollbarContainer;
  }

  // Track element for hotspot calculation
  function trackForHotspot(element) {
    if (!element) return;
    
    // get absolute position in document
    const rect = element.getBoundingClientRect();
    const offsetTop = rect.top + window.scrollY;
    
    // get preview text
    const text = element.textContent || '';
    const preview = text.substring(0, 50).trim();
    
    // store element and position
    matchPositions.push({
      element: element,
      offsetTop: offsetTop,
      text: preview
    });
  }

  // Calculate density score for a window of matches
  function calculateWindowScore(windowMatches) {
    if (windowMatches.length <= 1) return windowMatches.length;
    
    let score = 0;
    for (let j = 1; j < windowMatches.length; j++) {
      const distance = windowMatches[j].offsetTop - windowMatches[j - 1].offsetTop;
      // closer matches = higher score
      score += distance > 0 ? 1 / distance : 10;
    }
    return score;
  }

  // Calculate median anchor for a window
  function calculateMedianAnchor(windowMatches) {
    if (windowMatches.length === 0) return null;
    
    const sorted = windowMatches.slice().sort((a, b) => a.offsetTop - b.offsetTop);
    const midIndex = Math.floor(sorted.length / 2);
    const medianItem = sorted[midIndex];
    
    return {
      medianElement: medianItem.element,
      medianOffset: medianItem.offsetTop,
      medianText: medianItem.text
    };
  }

  // Calculate TOP3 high density areas using sliding window
  function calculateTopDensityAreas() {
    if (matchPositions.length === 0) return [];
    
    // sort by position
    const sorted = matchPositions.slice().sort((a, b) => a.offsetTop - b.offsetTop);
    const areas = [];
    
    // sliding window over all matches
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      
      // find all matches within window
      const windowMatches = sorted.filter(item =>
        item.offsetTop >= current.offsetTop && 
        item.offsetTop <= current.offsetTop + WINDOW_SIZE
      );
      
      if (windowMatches.length < 2) continue;
      
      // calculate density score
      const score = calculateWindowScore(windowMatches);
      
      // calculate median anchor
      const medianData = calculateMedianAnchor(windowMatches);
      
      if (medianData) {
        areas.push({
          startTop: current.offsetTop,
          endTop: current.offsetTop + WINDOW_SIZE,
          matchCount: windowMatches.length,
          score: score,
          ...medianData
        });
      }
    }
    
    // deduplicate by startTop (use Map to keep unique)
    const uniqueAreas = [...new Map(
      areas.map(item => [Math.round(item.startTop / 50), item])
    ).values()];
    
    // sort by score descending, take TOP3
    return uniqueAreas.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  // Get TOP3 hotspots for display
  function getTopHotspots() {
    if (matchPositions.length === 0) {
      return [];
    }
    
    // calculate TOP3 density areas
    topDensityAreas = calculateTopDensityAreas();
    
    if (topDensityAreas.length === 0) {
      // fallback: if no density areas, return median position
      const sorted = matchPositions.slice().sort((a, b) => a.offsetTop - b.offsetTop);
      const midIndex = Math.floor(sorted.length / 2);
      const medianMatch = sorted[midIndex];
      
      topDensityAreas = [{
        startTop: medianMatch.offsetTop,
        matchCount: matchPositions.length,
        score: 0,
        medianElement: medianMatch.element,
        medianOffset: medianMatch.offsetTop,
        medianText: medianMatch.text
      }];
    }
    
    // format for display
    const docHeight = document.documentElement.scrollHeight;
    
    return topDensityAreas.map((area, index) => {
      const positionPercent = docHeight > 0 ? Math.round((area.medianOffset / docHeight) * 100) : 0;
      
      let preview = area.medianText || '';
      if (preview.length > 40) {
        preview = preview.substring(0, 40) + '...';
      }
      
      return {
        rank: index + 1,
        areaIndex: index,
        position: positionPercent + '%',
        count: area.matchCount,
        score: Math.round(area.score * 100) / 100,
        preview: preview
      };
    });
  }

  // Scroll to hotspot by area index
  function scrollToHotspot(areaIndex) {
    if (areaIndex < 0 || areaIndex >= topDensityAreas.length) {
      return false;
    }
    
    const area = topDensityAreas[areaIndex];
    
    if (area && area.medianElement) {
      // check if element is still in DOM
      if (document.body.contains(area.medianElement)) {
        // scroll to element
        area.medianElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // temporary highlight
        const originalOutline = area.medianElement.style.outline;
        const originalOutlineOffset = area.medianElement.style.outlineOffset;
        area.medianElement.style.outline = '3px solid #2563eb';
        area.medianElement.style.outlineOffset = '2px';
        
        // restore after 2 seconds
        setTimeout(() => {
          area.medianElement.style.outline = originalOutline;
          area.medianElement.style.outlineOffset = originalOutlineOffset;
        }, 2000);
        
        return true;
      }
    }
    
    // fallback: scroll to position
    if (area && area.medianOffset > 0) {
      window.scrollTo({
        top: area.medianOffset - window.innerHeight / 2,
        behavior: 'smooth'
      });
      return true;
    }
    
    return false;
  }

  // async keywords search with progress updates
  async function performKeywordsSearchAsync(keywords, caseInsensitive, intersectionMode) {
    try {
      // clear previous highlights
      clearHighlights();
      
      // Initialize scrollbar container
      getScrollbarContainer();
      
      if (!keywords) {
        return { success: false, error: 'No keywords provided' };
      }
      
      if (keywords.length === 0) {
        return { success: false, error: 'No keywords provided' };
      }
      
      // AND MODE (Intersection) - Highlight Rows + Keywords
      if (intersectionMode) {
        return await performIntersectionSearchAsync(keywords, caseInsensitive);
      }
      
      // OR MODE (Standard) - Highlight Keywords
      
      // prepare keywords for combined regex
      const keywordsWithIndex = keywords.map((k, i) => {
        return { keyword: k, originalIndex: i, rank: i + 1 };
      });

      // sort by rank descending (higher rank first)
      keywordsWithIndex.sort((a, b) => {
        if (b.rank !== a.rank) {
          return b.rank - a.rank;
        }
        return b.keyword.length - a.keyword.length;
      });

      // build combined regex pattern
      const escapedKeywords = keywordsWithIndex.map(item => {
        const escaped = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return '(' + escaped + ')';
      });
      
      const patternStr = escapedKeywords.join('|');
      let flags = 'g';
      if (caseInsensitive) {
        flags = 'gi';
      }
      
      const regex = new RegExp(patternStr, flags);
      
      // get all text nodes once
      const textNodes = getTextNodes(document.body);
      const totalNodes = textNodes.length;
      let totalMatches = 0;
      
      const startTime = Date.now();
      const BATCH_SIZE = 50; // process nodes in batches before yielding
      const PROGRESS_INTERVAL = 100; // ms between progress updates
      let lastProgressTime = startTime;
      
      // search and highlight in batches for better responsiveness
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const matchesCount = highlightTextNodeMulti(node, regex, keywordsWithIndex);
        totalMatches = totalMatches + matchesCount;
        
        // yield to UI thread every BATCH_SIZE nodes or PROGRESS_INTERVAL ms
        if ((i + 1) % BATCH_SIZE === 0) {
          const now = Date.now();
          if (now - lastProgressTime >= PROGRESS_INTERVAL) {
            sendProgress(i + 1, totalNodes, totalMatches, startTime);
            lastProgressTime = now;
          }
          // always yield after batch to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      return {
        success: true,
        count: totalMatches,
        hotspots: getTopHotspots()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Async intersection search (AND Mode) with progress
  async function performIntersectionSearchAsync(keywords, caseInsensitive) {
    const textNodes = getTextNodes(document.body);
    const candidateBlocks = new Set();
    
    // 1. Identify all candidate block elements
    textNodes.forEach(node => {
      const block = getClosestBlockParent(node);
      if (block) {
        candidateBlocks.add(block);
      }
    });
    
    const blocksArray = Array.from(candidateBlocks);
    const totalBlocks = blocksArray.length;
    let matchCount = 0;
    const matchedLines = [];
    
    const startTime = Date.now();
    const BATCH_SIZE = 20; // blocks per batch
    const PROGRESS_INTERVAL = 100;
    let lastProgressTime = startTime;
    
    // pre-compile keyword regexes for performance
    const keywordRegexes = keywords.map(keyword => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = caseInsensitive ? 'gi' : 'g';
      return new RegExp(escaped, flags);
    });
    
    // 2. Process each block to find matching lines with progress
    for (let b = 0; b < blocksArray.length; b++) {
      const block = blocksArray[b];
      const lines = scanLines(block);
      
      for (let l = 0; l < lines.length; l++) {
        const line = lines[l];
        let allMatch = true;
        const text = line.text;
        
        // check pre-compiled keywords against this line
        for (let i = 0; i < keywordRegexes.length; i++) {
          keywordRegexes[i].lastIndex = 0; // reset regex state
          if (!keywordRegexes[i].test(text)) {
            allMatch = false;
            break;
          }
        }
        
        if (allMatch) {
          matchCount++;
          matchedLines.push(line);
        }
      }
      
      // yield every BATCH_SIZE blocks
      if ((b + 1) % BATCH_SIZE === 0) {
        const now = Date.now();
        if (now - lastProgressTime >= PROGRESS_INTERVAL) {
          sendProgress(b + 1, totalBlocks, matchCount, startTime);
          lastProgressTime = now;
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // 3. Highlight matched lines
    matchedLines.forEach(line => {
      highlightLineWithKeywords(line, keywords, caseInsensitive);
    });
    
    // If no matches found, do a quick global check
    if (matchCount === 0) {
      const pageText = document.body.textContent;
      const missing = [];
      
      keywords.forEach(keyword => {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let flags = 'g';
        if (caseInsensitive) {
          flags = 'gi';
        }
        const regex = new RegExp(escapedKeyword, flags);
        if (!regex.test(pageText)) {
          missing.push(keyword);
        }
      });
      
      if (missing.length > 0) {
        return {
          success: false,
          error: 'Not all keywords found',
          missingKeywords: missing
        };
      } else {
        return {
          success: false,
          error: 'Keywords found on page, but not in the same line'
        };
      }
    }
    
    return {
      success: true,
      count: matchCount,
      hotspots: getTopHotspots()
    };
  }

  // Highlight a line with pink background AND colored keywords
  function highlightLineWithKeywords(line, keywords, caseInsensitive) {
      if (!line || !line.nodes || line.nodes.length === 0) return;
      
      // prepare keywords for combined regex
      // sort by rank descending to match specific keywords first
      const keywordsWithIndex = keywords.map((k, i) => {
        return { keyword: k, originalIndex: i, rank: i + 1 };
      });

      // sort by rank descending (higher rank first)
      keywordsWithIndex.sort((a, b) => {
        if (b.rank !== a.rank) {
          return b.rank - a.rank;
        }
        return b.keyword.length - a.keyword.length;
      });

      // build combined regex pattern
      // higher rank keywords placed first to prevent substring overlap
      const escapedKeywords = keywordsWithIndex.map(item => {
        const escaped = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return '(' + escaped + ')';
      });
      
      const patternStr = escapedKeywords.join('|');
      let flags = 'g';
      if (caseInsensitive) {
        flags = 'gi';
      }
      
      const regex = new RegExp(patternStr, flags);
      
      let isFirstNode = true;
      
      line.nodes.forEach(node => {
          // Safety check
          if (!node.parentNode) return;
          if (node.parentNode.classList && node.parentNode.classList.contains('rsearch-row-highlight-bg')) return;
          
          const text = node.textContent;
          const parent = node.parentElement;
          
          if (!parent) return;
          
          // Create fragment to hold processed content
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          let match;
          let hasKeywordMatch = false;
          
          regex.lastIndex = 0;
          
          while ((match = regex.exec(text)) !== null) {
              hasKeywordMatch = true;
              
              // Text before match -> Pink background only
              if (match.index > lastIndex) {
                  const beforeText = text.substring(lastIndex, match.index);
                  const bgSpan = document.createElement('span');
                  bgSpan.className = 'rsearch-row-highlight-bg';
                  if (isFirstNode && lastIndex === 0) {
                      bgSpan.classList.add('rsearch-row-highlight-start');
                      isFirstNode = false;
                  }
                  bgSpan.textContent = beforeText;
                  fragment.appendChild(bgSpan);
                  highlightedElements.push(bgSpan);
              }
              
              // Determine keyword color
              let foundIndex = -1;
              for (let i = 1; i < match.length; i++) {
                  if (match[i] !== undefined) {
                      foundIndex = i - 1;
                      break;
                  }
              }
              
              let colors = HIGHLIGHT_COLORS[0];
              if (foundIndex >= 0 && foundIndex < keywordsWithIndex.length) {
                  const originalIndex = keywordsWithIndex[foundIndex].originalIndex;
                  const colorIndex = originalIndex % HIGHLIGHT_COLORS.length;
                  colors = HIGHLIGHT_COLORS[colorIndex];
              }
              
              // Keyword match -> Colored highlight
              const keywordSpan = document.createElement('span');
              keywordSpan.className = 'regex-search-highlight';
              keywordSpan.style.backgroundColor = colors.bg;
              keywordSpan.style.color = colors.text;
              keywordSpan.textContent = match[0];
              fragment.appendChild(keywordSpan);
              highlightedElements.push(keywordSpan);
              
              // Add scrollbar marker for keyword
              trackForHotspot(keywordSpan);
              
              lastIndex = match.index + match[0].length;
              
              if (match[0].length === 0) {
                  regex.lastIndex++;
              }
          }
          
          // Remaining text after last match
          if (lastIndex < text.length) {
              const afterText = text.substring(lastIndex);
              const bgSpan = document.createElement('span');
              bgSpan.className = 'rsearch-row-highlight-bg';
              if (isFirstNode && lastIndex === 0) {
                  bgSpan.classList.add('rsearch-row-highlight-start');
                  isFirstNode = false;
              }
              bgSpan.textContent = afterText;
              fragment.appendChild(bgSpan);
              highlightedElements.push(bgSpan);
          }
          
          // If no keyword matches in this node, still wrap with pink bg
          if (!hasKeywordMatch) {
              const bgSpan = document.createElement('span');
              bgSpan.className = 'rsearch-row-highlight-bg';
              if (isFirstNode) {
                  bgSpan.classList.add('rsearch-row-highlight-start');
                  isFirstNode = false;
              }
              bgSpan.textContent = text;
              parent.replaceChild(bgSpan, node);
              highlightedElements.push(bgSpan);
          } else {
              // Replace node with fragment
              parent.replaceChild(fragment, node);
          }
      });
  }

  // Scan block for logical lines (split by BR or Block Boundaries)
  function scanLines(block) {
      const lines = [];
      let currentLineNodes = [];
      let currentLineText = "";
      
      const inlineTags = new Set([
          'SPAN', 'A', 'B', 'I', 'U', 'STRONG', 'EM', 'SMALL', 'BIG', 
          'FONT', 'LABEL', 'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 
          'KBD', 'SAMP', 'VAR', 'BDO', 'Q', 'SUB', 'SUP', 'TIME', 'TT',
          'MARK', 'INS', 'DEL', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'
      ]);
      
      function isBlock(node) {
          return node.nodeType === Node.ELEMENT_NODE && !inlineTags.has(node.tagName);
      }
      
      function traverse(element) {
          const children = Array.from(element.childNodes);
          
          for (const node of children) {
              if (node.nodeType === Node.TEXT_NODE) {
                   currentLineText += node.textContent;
                   currentLineNodes.push(node);
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                  if (node.tagName === 'BR') {
                      if (currentLineNodes.length > 0 || currentLineText.trim().length > 0) {
                          lines.push({nodes: [...currentLineNodes], text: currentLineText});
                      }
                      currentLineNodes = [];
                      currentLineText = "";
                  } else if (isBlock(node)) {
                       if (currentLineNodes.length > 0 || currentLineText.trim().length > 0) {
                          lines.push({nodes: [...currentLineNodes], text: currentLineText});
                      }
                      currentLineNodes = [];
                      currentLineText = "";
                  } else {
                      traverse(node);
                  }
              }
          }
      }
      
      traverse(block);
      
      if (currentLineNodes.length > 0 || currentLineText.trim().length > 0) {
          lines.push({nodes: [...currentLineNodes], text: currentLineText});
      }
      
      return lines;
  }

  // Find closest block parent
  function getClosestBlockParent(node) {
    let parent = node.parentElement;
    
    const inlineTags = new Set([
      'SPAN', 'A', 'B', 'I', 'U', 'STRONG', 'EM', 'SMALL', 'BIG', 
      'FONT', 'LABEL', 'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 
      'KBD', 'SAMP', 'VAR', 'BDO', 'Q', 'SUB', 'SUP', 'TIME', 'TT',
      'MARK', 'INS', 'DEL', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'
    ]);
    
    while (parent) {
      const tagName = parent.tagName;
      
      if (tagName === 'BODY') {
        return parent;
      }
      
      if (!inlineTags.has(tagName)) {
        return parent;
      }
      
      parent = parent.parentElement;
    }
    
    return document.body;
  }

  // async regex search with progress updates
  async function performRegexSearchAsync(patternStr, flags) {
    try {
      // clear previous highlights
      clearHighlights();
      
      // Initialize scrollbar container
      getScrollbarContainer();
      
      // check if pattern is multi-keyword format: (k1|k2|k3|...)
      const multiKeywordMatch = patternStr.match(/^\((.+)\)$/);
      let keywordsWithIndex = null;
      
      if (multiKeywordMatch) {
        const innerContent = multiKeywordMatch[1];
        const parts = innerContent.split(/(?<!\\)\|/);
        
        if (parts.length > 1) {
          keywordsWithIndex = parts.map((p, i) => {
            const keyword = p.replace(/\\([.*+?^${}()|[\]\\])/g, '$1');
            return { keyword: keyword, originalIndex: i, rank: i + 1 };
          });
        }
      }
      
      // create regex pattern
      const regex = new RegExp(patternStr, flags);
      const isGlobal = regex.global;
      
      // get all text nodes in the document
      const textNodes = getTextNodes(document.body);
      const totalNodes = textNodes.length;
      
      let matchCount = 0;
      
      const startTime = Date.now();
      const BATCH_SIZE = 50;
      const PROGRESS_INTERVAL = 100;
      let lastProgressTime = startTime;
      
      // search and highlight in batches for better responsiveness
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        let matches;
        
        if (keywordsWithIndex) {
          matches = highlightTextNodeMulti(node, regex, keywordsWithIndex);
        } else {
          matches = highlightTextNode(node, regex);
        }
        
        matchCount = matchCount + matches;
        
        // if not global search and we found a match, stop searching
        if (!isGlobal && matchCount > 0) {
          break;
        }
        
        // yield every BATCH_SIZE nodes
        if ((i + 1) % BATCH_SIZE === 0) {
          const now = Date.now();
          if (now - lastProgressTime >= PROGRESS_INTERVAL) {
            sendProgress(i + 1, totalNodes, matchCount, startTime);
            lastProgressTime = now;
          }
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      return {
        success: true,
        count: matchCount,
        hotspots: getTopHotspots()
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
          const parent = node.parentElement;
          if (!parent) {
            return NodeFilter.FILTER_REJECT;
          }
          
          if (parent.classList.contains('regex-search-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.classList.contains('rsearch-row-highlight-bg')) {
              return NodeFilter.FILTER_REJECT;
          }
          
          const tagName = parent.tagName.toLowerCase();
          if (tagName === 'script') {
             return NodeFilter.FILTER_REJECT;
          }
          if (tagName === 'style') {
             return NodeFilter.FILTER_REJECT;
          }
          if (tagName === 'noscript') {
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

  // highlight matches in a text node (for regex mode)
  function highlightTextNode(node, regex) {
    const text = node.textContent;
    const parent = node.parentElement;
    
    if (!parent) {
      return 0;
    }
    
    if (parent.classList.contains('regex-search-highlight')) {
      return 0;
    }
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let matchCount = 0;
    
    regex.lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      matchCount++;
      
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        fragment.appendChild(document.createTextNode(beforeText));
      }
      
      const span = document.createElement('span');
      span.className = 'regex-search-highlight';
      span.style.backgroundColor = '#c026d3';
      span.style.color = '#ffffff';
      span.textContent = match[0];
      fragment.appendChild(span);
      highlightedElements.push(span);
      
      trackForHotspot(span);
      
      lastIndex = match.index + match[0].length;
      
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
      
      if (!regex.global) {
        break;
      }
    }
    
    if (matchCount === 0) {
      return 0;
    }
    
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      fragment.appendChild(document.createTextNode(afterText));
    }
    
    parent.replaceChild(fragment, node);
    return matchCount;
  }

  // highlight matches for multiple keywords (OR mode)
  function highlightTextNodeMulti(node, regex, keywordsWithIndex) {
    const text = node.textContent;
    const parent = node.parentElement;
    
    if (!parent) {
      return 0;
    }
    
    if (parent.classList.contains('regex-search-highlight')) {
      return 0;
    }
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let matchCount = 0;
    
    regex.lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      matchCount++;
      
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        fragment.appendChild(document.createTextNode(beforeText));
      }
      
      let foundIndex = -1;
      for (let i = 1; i < match.length; i++) {
        if (match[i] !== undefined) {
          foundIndex = i - 1;
          break;
        }
      }
      
      let colors = HIGHLIGHT_COLORS[0];
      if (foundIndex >= 0 && foundIndex < keywordsWithIndex.length) {
        const originalIndex = keywordsWithIndex[foundIndex].originalIndex;
        const colorIndex = originalIndex % HIGHLIGHT_COLORS.length;
        colors = HIGHLIGHT_COLORS[colorIndex];
      }
      
      const span = document.createElement('span');
      span.className = 'regex-search-highlight';
      span.style.backgroundColor = colors.bg;
      span.style.color = colors.text;
      span.textContent = match[0];
      fragment.appendChild(span);
      highlightedElements.push(span);
      
      trackForHotspot(span);
      
      lastIndex = match.index + match[0].length;
      
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }
    
    if (matchCount === 0) {
      return 0;
    }
    
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      fragment.appendChild(document.createTextNode(afterText));
    }
    
    parent.replaceChild(fragment, node);
    return matchCount;
  }

  // clear all highlights
  function clearHighlights() {
    // 1. Clear keyword highlights
    const elements = Array.from(document.querySelectorAll('.regex-search-highlight'));
    elements.forEach(element => {
      if (element.parentNode) {
        const text = element.textContent;
        const textNode = document.createTextNode(text);
        element.parentNode.replaceChild(textNode, element);
      }
    });
    
    // 2. Clear row highlights
    const rowElements = Array.from(document.querySelectorAll('.rsearch-row-highlight-bg'));
    rowElements.forEach(element => {
      if (element.parentNode) {
        const text = element.textContent;
        const textNode = document.createTextNode(text);
        element.parentNode.replaceChild(textNode, element);
      }
    });
    
    // 3. Clear Scrollbar Markers
    if (scrollbarContainer) {
      scrollbarContainer.innerHTML = '';
    }
    
    highlightedElements = [];
    
    document.body.normalize();
  }

} // end of injection guard
