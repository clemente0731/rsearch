// get dom elements
const patternInput = document.getElementById('pattern');
const caseInsensitiveCheckbox = document.getElementById('caseInsensitive');
const globalSearchCheckbox = document.getElementById('globalSearch');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const closeBtn = document.getElementById('closeBtn');
const toggleSwitch = document.getElementById('toggleSwitch');
const statusDiv = document.getElementById('status');
const regexModeRadio = document.getElementById('regexMode');
const keywordModeRadio = document.getElementById('keywordMode');
const patternLabel = document.getElementById('patternLabel');
const globalLabel = document.getElementById('globalLabel');

// preset elements
const presetSelect = document.getElementById('presetSelect');
const presetNameInput = document.getElementById('presetNameInput');
const presetInfoSpan = document.getElementById('presetInfo');
const applyPresetBtn = document.getElementById('applyPresetBtn');
const editCsvBtn = document.getElementById('editCsvBtn');
const csvEditorContainer = document.getElementById('csvEditorContainer');
const csvTextarea = document.getElementById('csvTextarea');
const saveCsvBtn = document.getElementById('saveCsvBtn');
const resetCsvBtn = document.getElementById('resetCsvBtn');

// hotspots elements
const hotspotsContainer = document.getElementById('hotspotsContainer');
const hotspotsList = document.getElementById('hotspotsList');

// track injected tabs to avoid re-injection
const injectedTabs = new Set();

// listen for progress updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'searchProgress') {
    const percent = message.percent;
    const matches = message.matches;
    const eta = message.estimatedSeconds;
    
    let statusText = 'Searching... ' + percent + '%';
    statusText += ' | ' + matches + ' match(es)';
    
    if (eta > 0 && eta < 999) {
      statusText += ' | ~' + eta + 's left';
    }
    
    statusDiv.textContent = statusText;
    statusDiv.className = 'progress';
  }
  return false;
});

// ============================================================
// CONSTANTS
// ============================================================

const MAX_KEYWORDS = 500;
const STORAGE_KEY = 'rsearch_presets_v2';

// ============================================================
// DEFAULT PRESET 1 - ERROR KEYWORDS
// ============================================================
// rank | keyword                              | category
// higher rank = more specific, matched first to avoid substring overlap
// add new keywords at the end, rank auto-increments

const DEFAULT_PRESET_1_KEYWORDS = [
  // --- basic error terms (1-29) ---
  /*   1 */ 'error',
  /*   2 */ 'fail',
  /*   3 */ 'failed',
  /*   4 */ 'failure',
  /*   5 */ 'fatal',
  /*   6 */ 'exception',
  /*   7 */ 'crash',
  /*   8 */ 'abort',
  /*   9 */ 'aborted',
  /*  10 */ 'panic',
  /*  11 */ 'warning',
  /*  12 */ 'critical',
  /*  13 */ 'severe',
  /*  14 */ 'timeout',
  /*  15 */ 'invalid',
  /*  16 */ 'denied',
  /*  17 */ 'refused',
  /*  18 */ 'rejected',
  /*  19 */ 'missing',
  /*  20 */ 'corrupt',
  /*  21 */ 'corrupted',
  /*  22 */ 'overflow',
  /*  23 */ 'terminated',
  /*  24 */ 'unhandled',
  /*  25 */ 'unexpected',
  /*  26 */ 'illegal',
  /*  27 */ 'unreachable',

  // --- unix signals (28-42) ---
  /*  28 */ 'sigsegv',
  /*  29 */ 'sigabrt',
  /*  30 */ 'sigfpe',
  /*  31 */ 'sigbus',
  /*  32 */ 'sigill',
  /*  33 */ 'sigtrap',
  /*  34 */ 'sigkill',
  /*  35 */ 'sigsys',
  /*  36 */ 'sigterm',
  /*  37 */ 'sigpipe',
  /*  38 */ 'sigxcpu',
  /*  39 */ 'sigxfsz',

  // --- process states (40-44) ---
  /*  40 */ 'killed',
  /*  41 */ 'traceback',
  /*  42 */ 'segfault',
  /*  43 */ 'coredump',
  /*  44 */ 'backtrace',

  // --- errno codes (45-62) ---
  /*  45 */ 'enomem',
  /*  46 */ 'einval',
  /*  47 */ 'bad address',
  /*  48 */ 'eacces',
  /*  49 */ 'enoent',
  /*  50 */ 'eperm',
  /*  51 */ 'ebadf',
  /*  52 */ 'enospc',
  /*  53 */ 'emfile',
  /*  54 */ 'enfile',
  /*  55 */ 'ebusy',
  /*  56 */ 'eexist',
  /*  57 */ 'epipe',
  /*  58 */ 'eagain',
  /*  59 */ 'etimedout',
  /*  60 */ 'econnreset',
  /*  61 */ 'econnrefused',
  /*  62 */ 'enotconn',

  // --- python exceptions (63-101) ---
  /*  63 */ 'typeerror',
  /*  64 */ 'valueerror',
  /*  65 */ 'keyerror',
  /*  66 */ 'indexerror',
  /*  67 */ 'nameerror',
  /*  68 */ 'syntaxerror',
  /*  69 */ 'runtimeerror',
  /*  70 */ 'memoryerror',
  /*  71 */ 'oserror',
  /*  72 */ 'ioerror',
  /*  73 */ 'assertionerror',
  /*  74 */ 'importerror',
  /*  75 */ 'attributeerror',
  /*  76 */ 'overflowerror',
  /*  77 */ 'recursionerror',
  /*  78 */ 'permissionerror',
  /*  79 */ 'timeouterror',
  /*  80 */ 'indentationerror',
  /*  81 */ 'taberror',
  /*  82 */ 'systemerror',
  /*  83 */ 'zerodivisionerror',
  /*  84 */ 'filenotfounderror',
  /*  85 */ 'modulenotfounderror',
  /*  86 */ 'notimplementederror',
  /*  87 */ 'unboundlocalerror',
  /*  88 */ 'unicodedecodeerror',
  /*  89 */ 'unicodeencodeerror',
  /*  90 */ 'brokenpipeerror',
  /*  91 */ 'connectionerror',
  /*  92 */ 'connectionrefusederror',
  /*  93 */ 'connectionabortederror',
  /*  94 */ 'blockingioerror',
  /*  95 */ 'childprocesserror',
  /*  96 */ 'interruptederror',
  /*  97 */ 'floatingpointerror',
  /*  98 */ 'stopiteration',
  /*  99 */ 'generatorexit',
  /* 100 */ 'systemexit',
  /* 101 */ 'keyboardinterrupt',

  // --- cuda errors (102-120) ---
  /* 102 */ 'cudaerror',
  /* 103 */ 'cuda_error',
  /* 104 */ 'bad_alloc',
  /* 105 */ 'oom-killer',
  /* 106 */ 'cudaerrormemoryallocation',
  /* 107 */ 'cudaerrorinvaliddevice',
  /* 108 */ 'cudaerrorinvalidvalue',
  /* 109 */ 'cudaerrorlaunchfailure',
  /* 110 */ 'cudaerrorlaunchtimeout',
  /* 111 */ 'cudaerrornodevice',
  /* 112 */ 'cudaerrorassert',
  /* 113 */ 'cudaerrorunknown',
  /* 114 */ 'cudaerrorinvalidptx',
  /* 115 */ 'cudaerrorillegaladdress',
  /* 116 */ 'cudaerrorinsufficientdriver',
  /* 117 */ 'cudaerrorinvalidconfiguration',
  /* 118 */ 'cudaerrorlaunchoutofresources',
  /* 119 */ 'cudaerrorinvaliddevicefunction',

  // --- cublas/cudnn status (120-126) ---
  /* 120 */ 'cublas_status_execution_failed',
  /* 121 */ 'cublas_status_alloc_failed',
  /* 122 */ 'cublas_status_invalid_value',
  /* 123 */ 'cudnn_status_bad_param',
  /* 124 */ 'cudnn_status_execution_failed',
  /* 125 */ 'cudnn_status_internal_error',
  /* 126 */ 'cudnn_status_not_supported',

  // --- tensorrt severity (127-129) ---
  /* 127 */ 'severity::kerror',
  /* 128 */ 'severity::kinternal_error',
  /* 129 */ 'kinvalid',

  // --- nvidia driver (130-131) ---
  /* 130 */ 'xid',
  /* 131 */ 'nvrm',

  // --- sanitizers (132-141) ---
  /* 132 */ 'asan',
  /* 133 */ 'lsan',
  /* 134 */ 'tsan',
  /* 135 */ 'ubsan',
  /* 136 */ 'msan',
  /* 137 */ 'addresssanitizer',
  /* 138 */ 'leaksanitizer',
  /* 139 */ 'threadsanitizer',
  /* 140 */ 'memorysanitizer',
  /* 141 */ 'undefinedbehaviorsanitizer',

  // --- c++ exceptions (142-148) ---
  /* 142 */ 'std::runtime_error',
  /* 143 */ 'std::logic_error',
  /* 144 */ 'std::out_of_range',
  /* 145 */ 'std::invalid_argument',
  /* 146 */ 'std::bad_cast',
  /* 147 */ 'std::bad_typeid',
  /* 148 */ 'thrust::system_error',

  // --- linker errors (149-151) ---
  /* 149 */ 'lnk2001',
  /* 150 */ 'lnk2019',
  /* 151 */ 'lnk1120',

  // --- general error states (152-185) ---
  /* 152 */ 'oops',
  /* 153 */ 'leaked',
  /* 154 */ 'leaking',
  /* 155 */ 'crashing',
  /* 156 */ 'crashed',
  /* 157 */ 'failing',
  /* 158 */ 'aborting',
  /* 159 */ 'dead',
  /* 160 */ 'hung',
  /* 161 */ 'stuck',
  /* 162 */ 'frozen',
  /* 163 */ 'blocked',
  /* 164 */ 'unresponsive',
  /* 165 */ 'halted',
  /* 166 */ 'broken',
  /* 167 */ 'segv',
  /* 168 */ 'abrt',
  /* 169 */ 'assertion',
  /* 170 */ 'thrown',
  /* 171 */ 'raised',
  /* 172 */ 'leak',
  /* 173 */ 'faults',
  /* 174 */ 'errors',
  /* 175 */ 'failures',
  /* 176 */ 'exceptions',
  /* 177 */ 'crashes',
  /* 178 */ 'aborts',
  /* 179 */ 'panics',
  /* 180 */ 'underflow',
  /* 181 */ 'misaligned',
  /* 182 */ 'deadlock',
  /* 183 */ 'deadlocked',
  /* 184 */ 'violation',
  /* 185 */ 'starvation',
  /* 186 */ 'contention',
  /* 187 */ 'unavailable',

  // --- additional python exceptions (188-199) ---
  /* 188 */ 'syntaxwarning',
  /* 189 */ 'buffererror',
  /* 190 */ 'fileexistserror',
  /* 191 */ 'isadirectoryerror',
  /* 192 */ 'notadirectoryerror',
  /* 193 */ 'arithmeticerror',
  /* 194 */ 'stopasynciteration',
  /* 195 */ 'unicodetranslateerror',
  /* 196 */ 'unicodeerror',
  /* 197 */ 'connectionreseterror',
  /* 198 */ 'lookuperror',
  /* 199 */ 'referenceerror',

  // --- c/c++ syntax & parse errors (200-206) ---
  /* 200 */ 'syntax error',
  /* 201 */ 'parse error',
  /* 202 */ 'stray',
  /* 203 */ 'lvalue required',
  /* 204 */ 'incompatible',
  /* 205 */ 'type mismatch',
  /* 206 */ 'invalid conversion',

  // --- c/c++ identifier errors (207-214) ---
  /* 207 */ 'undeclared',
  /* 208 */ 'implicit declaration',
  /* 209 */ 'redefinition',
  /* 210 */ 'multiple definition',
  /* 211 */ 'unused variable',
  /* 212 */ 'unused parameter',
  /* 213 */ 'uninitialized',
  /* 214 */ 'unresolved',

  // --- c/c++ preprocessor errors (215-218) ---
  /* 215 */ 'unterminated',
  /* 216 */ '#error',
  /* 217 */ '#warning',

  // --- c/c++ linker errors (218-227) ---
  /* 218 */ 'no such file',
  /* 219 */ 'fatal error',
  /* 220 */ 'undefined reference',
  /* 221 */ 'undefined symbol',
  /* 222 */ 'library not found',
  /* 223 */ 'linker command failed',
  /* 224 */ 'relocation',
  /* 225 */ 'ld returned',
  /* 226 */ 'collect2',
  /* 227 */ 'cannot find',

  // --- c/c++ memory & pointer errors (228-239) ---
  /* 228 */ 'dereferencing',
  /* 229 */ 'null pointer',
  /* 230 */ 'dangling pointer',
  /* 231 */ 'double free',
  /* 232 */ 'use after free',
  /* 233 */ 'heap-buffer-overflow',
  /* 234 */ 'stack-buffer-overflow',
  /* 235 */ 'memory leak',
  /* 236 */ 'out of bounds',
  /* 237 */ 'array subscript',
  /* 238 */ 'buffer overflow',
  /* 239 */ 'stack smashing',

  // --- c/c++ class & template errors (240-249) ---
  /* 240 */ 'no member named',
  /* 241 */ 'vtable',
  /* 242 */ 'abstract class',
  /* 243 */ 'pure virtual',
  /* 244 */ 'template argument',
  /* 245 */ 'No module named',
  /* 246 */ 'no viable',
  /* 247 */ 'private member',
  /* 248 */ 'protected member',
  /* 249 */ 'incomplete type',

  // --- c/c++ constant & expression errors (250-253) ---
  /* 250 */ 'non-constant',
  /* 251 */ 'narrowing conversion',

  // --- c/c++ compiler warnings (252-257) ---
  /* 252 */ 'fall-through',
  /* 253 */ 'stack protector',
  /* 254 */ 'deprecated',
  /* 255 */ 'discards qualifiers',
  /* 256 */ 'Wformat',
  /* 257 */ 'Werror',

  // --- runtime crash signals (258-263) ---
  /* 258 */ 'Segmentation fault',
  /* 259 */ 'Bus error',
  /* 260 */ 'Floating point exception',
  /* 261 */ 'Illegal instruction',
  /* 262 */ 'core dumped',
  /* 263 */ 'Aborted',

  // --- pytorch onnx export errors (264-270) ---
  /* 264 */ 'ONNXCheckerError',
  /* 265 */ 'TorchONNXOperatorSupportError',
  /* 266 */ 'UnsupportedOperatorError',
  /* 267 */ 'TorchScriptSyntaxError',
  /* 268 */ 'GraphConstructionError',
  /* 269 */ 'export failed',

  // --- onnx model errors (270-277) ---
  /* 270 */ 'InvalidProtobufError',
  /* 271 */ 'MissingAttributeError',
  /* 272 */ 'InvalidGraphError',
  /* 273 */ 'TypeInferenceError',
  /* 274 */ 'InvalidModelError',
  /* 275 */ 'onnx.checker',
  /* 276 */ 'ValidationError',
  /* 277 */ 'shape inference',

  // --- onnxruntime errors (278-286) ---
  /* 278 */ 'OrtException',
  /* 279 */ 'ExecutionProviderError',
  /* 280 */ 'NoRegisteredKernelForOperator',
  /* 281 */ 'SessionCreationError',
  /* 282 */ 'InvalidInputShapeError',
  /* 283 */ 'EPInitializationFailure',
  /* 284 */ 'RuntimeShapeInferenceError',

  // --- vllm errors (285-292) ---
  /* 285 */ 'PagedAttentionError',
  /* 286 */ 'BlockAllocatorError',
  /* 287 */ 'WorkerError',
  /* 288 */ 'ModelLoaderError',
  /* 289 */ 'ParallelConfigError',
  /* 290 */ 'SchedulerError',
  /* 291 */ 'KVCacheLimitError',
  /* 292 */ 'UnsupportedModelArchitectureError',

  // --- sglang errors (293-298) ---
  /* 293 */ 'RadixAttentionError',
  /* 294 */ 'EngineInitializationError',
  /* 295 */ 'RadixTreeError',
  /* 296 */ 'BackendNotSupportedError',
  /* 297 */ 'PrefillError',
  /* 298 */ 'RequestAbortedError',

  // --- ml framework common errors (299-302) ---
  /* 299 */ 'OperatorNotFoundError',
  /* 300 */ 'VersionMismatchError',
  /* 301 */ 'IncompatibleDTypeError',
  /* 302 */ 'DeprecatedOperatorWarning',

  // --- cuda & device errors (303-308) ---
  /* 303 */ 'RuntimeError: CUDA',
  /* 304 */ 'CUDARuntimeError',
  /* 305 */ 'DeviceMismatchError',
  /* 306 */ 'InvalidDeviceError',
  /* 307 */ 'TensorRTCompatibilityError',

  // --- memory & oom errors (308-318) ---
  /* 308 */ 'OutOfMemoryError',
  /* 309 */ 'cuda out of memory',
  /* 310 */ 'MemoryAllocationError',
  /* 311 */ 'DoubleFreeError',
  /* 312 */ 'MemoryLeakWarning',
  /* 313 */ 'OOM',
  /* 314 */ 'out of memory',
  /* 315 */ 'memory allocation',

  // --- environment & installation errors (316-323) ---
  /* 316 */ 'DlOpenError',
  /* 317 */ 'cannot open shared object',
  /* 318 */ 'CompilerError',
  /* 319 */ 'nvcc not found',
  /* 320 */ 'BrokenInstallationError',
  /* 321 */ 'UnsupportedPythonVersionError',

  // --- distributed & nccl errors (322-329) ---
  /* 322 */ 'NCCLError',
  /* 323 */ 'DistributedBackendError',
  /* 324 */ 'PeerAccessError',
  /* 325 */ 'CommunicationAbortedError',

  // --- tensor shape errors (326-332) ---
  /* 326 */ 'ShapeMismatchError',
  /* 327 */ 'InvalidBatchSizeError',
  /* 328 */ 'EmptyTensorError',
  /* 329 */ 'DimensionOutOfBoundsError',
  /* 330 */ 'mismatch',
  /* 331 */ 'incompatible',

  // --- model weight errors (332-340) ---
  /* 332 */ 'SafetensorsError',
  /* 333 */ 'CheckpointCorruptedError',
  /* 334 */ 'InvalidTensorNameError',
  /* 335 */ 'SerializationError',
  /* 336 */ 'missing keys',
  /* 337 */ 'unexpected keys',

  // --- incompatibility errors (338-360) ---
  /* 338 */ 'not compatible',
  /* 339 */ 'not supported',
  /* 340 */ 'unsupported',
  /* 341 */ 'version conflict',
  /* 342 */ 'conflict',
  /* 343 */ 'conflicting',
  /* 344 */ 'ABI mismatch',
  /* 345 */ 'binary incompatible',
  /* 346 */ 'API mismatch',
  /* 347 */ 'protocol mismatch',
  /* 348 */ 'does not match',
  /* 349 */ 'expected',
  /* 350 */ 'requires',
  /* 351 */ 'required',
  /* 352 */ 'breaking change',
  /* 353 */ 'backward incompatible',
  /* 354 */ 'cannot be used',
  /* 355 */ 'incompatible version',
  /* 356 */ 'incompatible type',
  /* 357 */ 'architecture mismatch',
  /* 358 */ 'platform mismatch',
  /* 359 */ 'dependency conflict',
  /* 360 */ 'package conflict',

  // --- specific patterns (361+, add new keywords here) ---
  /* 361 */ '[E]',
  /* 362 */ 'error:',
  /* 363 */ 'Could not',
];

// generate csv from keywords array
function generatePresetCsv(keywords) {
  const lines = ['rank,key_word'];
  keywords.forEach((kw, i) => {
    lines.push((i + 1) + ',' + kw);
  });
  return lines.join('\n');
}

const DEFAULT_PRESET_1_CSV = generatePresetCsv(DEFAULT_PRESET_1_KEYWORDS);

const DEFAULT_PRESET_2_CSV = `rank,key_word
1,error
2,warning
3,info
4,debug
5,trace
6,fatal
7,critical
8,notice
9,alert
10,emerg`;

const DEFAULT_PRESET_3_CSV = `rank,key_word`;

// default presets structure
function getDefaultPresets() {
  return [
    { name: 'Error Keywords', csv: DEFAULT_PRESET_1_CSV },
    { name: 'Common Errors', csv: DEFAULT_PRESET_2_CSV },
    { name: 'Custom', csv: DEFAULT_PRESET_3_CSV }
  ];
}

// ============================================================
// PRESET STORAGE
// ============================================================

let currentPresetIndex = 0;
let presets = null;

// load presets from storage
async function loadPresets() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
      presets = result[STORAGE_KEY];
      // ensure we have 3 presets
      while (presets.length < 3) {
        presets.push({ name: 'Custom ' + (presets.length + 1), csv: DEFAULT_PRESET_3_CSV });
      }
    } else {
      presets = getDefaultPresets();
      // save default presets for background script
      await chrome.storage.local.set({ [STORAGE_KEY]: presets });
    }
  } catch (e) {
    console.error('Failed to load presets:', e);
    presets = getDefaultPresets();
    // save default presets for background script
    await chrome.storage.local.set({ [STORAGE_KEY]: presets });
  }
  return presets;
}

// save presets to storage
async function savePresets() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: presets });
    return true;
  } catch (e) {
    console.error('Failed to save presets:', e);
    return false;
  }
}

// ============================================================
// CSV PARSING
// ============================================================

// parse csv and extract keywords sorted by rank
function parseCsvToKeywords(csvContent) {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 1) {
    return [];
  }
  
  // check if first line is header
  const firstLine = lines[0].trim().toLowerCase();
  const hasHeader = firstLine.includes('rank') && firstLine.includes('key');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  const entries = [];
  
  for (const line of dataLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }
    
    // parse csv line: rank,key_word
    const firstCommaIndex = trimmedLine.indexOf(',');
    if (firstCommaIndex === -1) {
      continue;
    }
    
    const rankStr = trimmedLine.substring(0, firstCommaIndex).trim();
    const keyword = trimmedLine.substring(firstCommaIndex + 1).trim();
    
    const rank = parseInt(rankStr, 10);
    
    if (isNaN(rank)) {
      continue;
    }
    
    if (!keyword) {
      continue;
    }
    
    entries.push({ rank, keyword });
  }
  
  // sort by rank ascending
  entries.sort((a, b) => a.rank - b.rank);
  
  // limit to MAX_KEYWORDS
  const limited = entries.slice(0, MAX_KEYWORDS);
  
  return limited.map(e => e.keyword);
}

// build regex pattern from keywords
function buildRegexFromKeywords(keywords) {
  if (keywords.length === 0) {
    return '';
  }
  
  // escape special regex characters
  const escapedKeywords = keywords.map(kw => {
    return kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  
  return '(' + escapedKeywords.join('|') + ')';
}

// ============================================================
// UI UPDATE
// ============================================================

// update preset selector options
function updatePresetSelector() {
  presetSelect.innerHTML = '';
  
  for (let i = 0; i < presets.length; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = presets[i].name;
    presetSelect.appendChild(opt);
  }
  
  presetSelect.value = currentPresetIndex;
}

// update preset info display
function updatePresetInfo() {
  const preset = presets[currentPresetIndex];
  const keywords = parseCsvToKeywords(preset.csv);
  presetInfoSpan.textContent = keywords.length + '/' + MAX_KEYWORDS + ' keywords';
  presetNameInput.value = preset.name;
}

// update csv textarea
function updateCsvTextarea() {
  const preset = presets[currentPresetIndex];
  csvTextarea.value = preset.csv;
}

// ============================================================
// PRESET HELPERS
// ============================================================

// apply current preset to input field
function applyPresetToInput() {
  if (!presets || !presets[currentPresetIndex]) {
    return;
  }
  
  const preset = presets[currentPresetIndex];
  const keywords = parseCsvToKeywords(preset.csv);
  
  if (keywords.length === 0) {
    return;
  }
  
  const isRegexMode = regexModeRadio.checked;
  
  if (isRegexMode) {
    const regexPattern = buildRegexFromKeywords(keywords);
    caseInsensitiveCheckbox.checked = true;
    globalSearchCheckbox.checked = true;
    patternInput.value = regexPattern;
  } else {
    caseInsensitiveCheckbox.checked = true;
    patternInput.value = keywords.join(', ');
  }
}

// ============================================================
// EVENT HANDLERS - PRESET
// ============================================================

// preset select change
presetSelect.addEventListener('change', async () => {
  currentPresetIndex = parseInt(presetSelect.value, 10);
  updatePresetInfo();
  
  // save active preset index for background script
  await chrome.storage.local.set({ activePresetIndex: currentPresetIndex });
  
  if (csvEditorContainer.style.display === 'block') {
    updateCsvTextarea();
  }
  
  // auto-apply when switching presets
  applyPresetToInput();
});

// preset name change
presetNameInput.addEventListener('change', async () => {
  const newName = presetNameInput.value.trim();
  if (!newName) {
    presetNameInput.value = presets[currentPresetIndex].name;
    return;
  }
  
  presets[currentPresetIndex].name = newName;
  await savePresets();
  updatePresetSelector();
  showStatus('Preset renamed', 'success');
});

// toggle csv editor
let csvEditorVisible = false;

editCsvBtn.addEventListener('click', () => {
  csvEditorVisible = !csvEditorVisible;
  
  if (csvEditorVisible) {
    updateCsvTextarea();
    csvEditorContainer.style.display = 'block';
    editCsvBtn.textContent = 'Hide';
  } else {
    csvEditorContainer.style.display = 'none';
    editCsvBtn.textContent = 'Edit';
  }
});

// save csv
saveCsvBtn.addEventListener('click', async () => {
  const csvContent = csvTextarea.value;
  const keywords = parseCsvToKeywords(csvContent);
  
  if (keywords.length === 0) {
    showStatus('Invalid CSV. Format: rank,key_word', 'error');
    return;
  }
  
  if (keywords.length > MAX_KEYWORDS) {
    showStatus('Too many keywords. Max: ' + MAX_KEYWORDS, 'error');
    return;
  }
  
  presets[currentPresetIndex].csv = csvContent;
  const success = await savePresets();
  
  if (success) {
    updatePresetInfo();
    showStatus('Saved ' + keywords.length + ' keywords', 'success');
  } else {
    showStatus('Failed to save', 'error');
  }
});

// reset current preset to default
resetCsvBtn.addEventListener('click', async () => {
  const defaults = getDefaultPresets();
  presets[currentPresetIndex] = { ...defaults[currentPresetIndex] };
  
  const success = await savePresets();
  
  if (success) {
    updatePresetSelector();
    updatePresetInfo();
    updateCsvTextarea();
    showStatus('Reset to default', 'success');
  } else {
    showStatus('Failed to reset', 'error');
  }
});

// apply preset to search input
applyPresetBtn.addEventListener('click', () => {
  const preset = presets[currentPresetIndex];
  const keywords = parseCsvToKeywords(preset.csv);
  
  if (keywords.length === 0) {
    showStatus('No keywords in preset', 'error');
    return;
  }
  
  const isRegexMode = regexModeRadio.checked;
  
  if (isRegexMode) {
    const regexPattern = buildRegexFromKeywords(keywords);
    caseInsensitiveCheckbox.checked = true;
    globalSearchCheckbox.checked = true;
    patternInput.value = regexPattern;
    showStatus('Loaded ' + keywords.length + ' keywords (regex)', 'success');
  } else {
    caseInsensitiveCheckbox.checked = true;
    patternInput.value = keywords.join(', ');
    showStatus('Loaded ' + keywords.length + ' keywords', 'success');
  }
});

// ============================================================
// SEARCH MODE UI
// ============================================================

function updateSearchModeUI() {
  const isRegexMode = regexModeRadio.checked;
  
  if (isRegexMode) {
    patternLabel.textContent = 'Regular Expression Pattern:';
    patternInput.placeholder = 'e.g., \\d{3}-\\d{4}';
    globalLabel.style.display = 'flex';
  } else {
    patternLabel.textContent = 'Keywords (comma separated):';
    patternInput.placeholder = 'e.g., error, failed, exception';
    globalLabel.style.display = 'none';
  }
}

regexModeRadio.addEventListener('change', () => {
  updateSearchModeUI();
  applyPresetToInput();
});
keywordModeRadio.addEventListener('change', () => {
  updateSearchModeUI();
  applyPresetToInput();
});

// ============================================================
// CONTENT SCRIPT INJECTION
// ============================================================

async function injectScripts(tabId) {
  if (injectedTabs.has(tabId)) {
    return;
  }
  
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles.css']
    });
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    injectedTabs.add(tabId);
  } catch (error) {
    injectedTabs.delete(tabId);
    console.error('Injection error:', error);
    
    let errorMessage = 'failed to inject content scripts';
    
    if (error && error.message) {
      if (error.message.includes('Cannot access contents of url')) {
        errorMessage = 'content scripts cannot run on this page';
      } else {
        errorMessage = 'failed to inject: ' + error.message;
      }
    }
    
    throw new Error(errorMessage);
  }
}

async function sendMessageToTab(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response;
  } catch (error) {
    let needsRetry = false;
    if (error && error.message) {
      if (error.message.includes('Receiving end does not exist')) {
        needsRetry = true;
      }
    }

    if (!needsRetry) {
      throw error;
    }

    injectedTabs.delete(tabId);
    await injectScripts(tabId);

    try {
      const retryResponse = await chrome.tabs.sendMessage(tabId, message);
      return retryResponse;
    } catch (retryError) {
      if (retryError && retryError.message) {
        if (retryError.message.includes('Receiving end does not exist')) {
          throw new Error('content script unavailable');
        }
      }
      throw retryError;
    }
  }
}

// ============================================================
// SEARCH / CLEAR HANDLERS
// ============================================================

searchBtn.addEventListener('click', async () => {
  const pattern = patternInput.value.trim();

  if (!pattern) {
    showStatus('Enter a pattern or keywords', 'error');
    return;
  }
  
  showStatus('Searching...', 'info');

  const isRegexMode = regexModeRadio.checked;

  if (isRegexMode) {
    try {
      const flags = buildRegexFlags();
      new RegExp(pattern, flags);
    } catch (e) {
      showStatus('Invalid regex: ' + e.message, 'error');
      return;
    }
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tabs || tabs.length === 0) {
    showStatus('No active tab found', 'error');
    return;
  }

  const tabId = tabs[0].id;

  try {
    await injectScripts(tabId);

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
        intersectionMode: false
      };
    }

    const response = await sendMessageToTab(tabId, searchParams);

    if (response && response.success) {
      const count = response.count || 0;
      showStatus('Found ' + count + ' match(es)', 'success');
      
      // display hotspots
      if (response.hotspots && response.hotspots.length > 0) {
        displayHotspots(response.hotspots, tabId);
      } else {
        clearHotspots();
      }
    } else {
      const errorMsg = (response && response.error) ? response.error : 'Search failed';
      const missingKeywords = (response && response.missingKeywords) ? response.missingKeywords : [];

      if (missingKeywords.length > 0) {
        showStatus('Missing: ' + missingKeywords.join(', '), 'error');
      } else {
        showStatus(errorMsg, 'error');
      }
      clearHotspots();
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
    clearHotspots();
  }
});

clearBtn.addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tabs || tabs.length === 0) {
    showStatus('No active tab found', 'error');
    return;
  }

  const tabId = tabs[0].id;

  try {
    await injectScripts(tabId);
    const response = await sendMessageToTab(tabId, { action: 'clear' });

    if (response && response.success) {
      showStatus('Highlights cleared', 'success');
      patternInput.value = '';
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

// close button
closeBtn.addEventListener('click', () => {
  window.close();
});

// toggle switch - auto search when on, clear when off
toggleSwitch.addEventListener('change', async () => {
  // save switch state to storage for background script
  await chrome.storage.local.set({ autoSearchEnabled: toggleSwitch.checked });
  
  if (!toggleSwitch.checked) {
    // switch turned off - clear highlights
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tabs && tabs.length > 0) {
      const tabId = tabs[0].id;
      try {
        await injectScripts(tabId);
        await sendMessageToTab(tabId, { action: 'clear' });
        showStatus('Auto-search OFF', 'info');
        clearHotspots();
      } catch (error) {
        // ignore errors
      }
    }
  } else {
    // switch turned on - auto execute search with default preset
    showStatus('Auto-search ON', 'success');
    searchBtn.click();
  }
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function parseKeywords(input) {
  // split only by comma, preserve spaces within keywords
  const keywords = input
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
  
  return keywords;
}

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

function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
}

patternInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// ============================================================
// HOTSPOTS DISPLAY
// ============================================================

let currentTabId = null;

function displayHotspots(hotspots, tabId) {
  currentTabId = tabId;
  
  if (!hotspotsContainer || !hotspotsList) {
    return;
  }
  
  hotspotsList.innerHTML = '';
  
  if (hotspots.length === 0) {
    hotspotsContainer.style.display = 'none';
    return;
  }
  
  hotspotsContainer.style.display = 'block';
  
  // show TOP3 density areas
  for (let i = 0; i < hotspots.length; i++) {
    const hotspot = hotspots[i];
    
    const item = document.createElement('div');
    item.className = 'hotspot-item';
    item.setAttribute('data-area', hotspot.areaIndex);
    
    // rank badge
    const rankBadge = document.createElement('span');
    rankBadge.className = 'hotspot-rank';
    rankBadge.textContent = '#' + hotspot.rank;
    
    const info = document.createElement('div');
    info.className = 'hotspot-info';
    
    const positionText = document.createElement('span');
    positionText.className = 'hotspot-line';
    positionText.textContent = hotspot.position + ' (' + hotspot.count + ' matches)';
    
    const preview = document.createElement('span');
    preview.className = 'hotspot-preview';
    preview.textContent = hotspot.preview || '...';
    
    info.appendChild(positionText);
    info.appendChild(preview);
    
    item.appendChild(rankBadge);
    item.appendChild(info);
    
    item.addEventListener('click', () => {
      scrollToHotspot(hotspot.areaIndex);
    });
    
    hotspotsList.appendChild(item);
  }
}

function clearHotspots() {
  if (hotspotsContainer) {
    hotspotsContainer.style.display = 'none';
  }
  if (hotspotsList) {
    hotspotsList.innerHTML = '';
  }
}

async function scrollToHotspot(areaIndex) {
  if (!currentTabId) {
    showStatus('No active tab', 'error');
    return;
  }
  
  try {
    const response = await sendMessageToTab(currentTabId, {
      action: 'scrollToHotspot',
      areaIndex: areaIndex
    });
    
    if (response && response.success) {
      showStatus('Navigated to hotspot', 'success');
    }
  } catch (error) {
    console.error('Failed to scroll to hotspot:', error);
    showStatus('Navigation failed', 'error');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

async function init() {
  await loadPresets();
  updatePresetSelector();
  updatePresetInfo();
  updateSearchModeUI();
  
  // auto-apply default preset on load
  applyPresetToInput();
  
  // load switch state from storage
  try {
    const result = await chrome.storage.local.get(['autoSearchEnabled']);
    if (result.autoSearchEnabled !== undefined) {
      toggleSwitch.checked = result.autoSearchEnabled;
    }
  } catch (e) {
    // ignore errors
  }
  
  // save active preset index for background script
  await chrome.storage.local.set({ activePresetIndex: currentPresetIndex });
  
  // auto search if switch is on
  if (toggleSwitch.checked) {
    // small delay to ensure UI is ready
    setTimeout(() => {
      searchBtn.click();
    }, 100);
  }
}

init();
