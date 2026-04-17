import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'releases');
mkdirSync(outDir, { recursive: true });

const SEVERITY_COLORS = [
  '#c026d3', '#db2777', '#dc2626', '#ea580c',
  '#f97316', '#eab308', '#84cc16', '#22c55e',
];

function drawRetroGrid(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0f0a2e');
  grad.addColorStop(0.5, '#1a1145');
  grad.addColorStop(1, '#0d0820');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
  ctx.lineWidth = 1;
  const horizon = h * 0.45;
  for (let i = 0; i < 20; i++) {
    const y = horizon + i * i * 2;
    if (y > h) break;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const cx = w / 2;
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, horizon);
    ctx.lineTo(cx + i * (w / 8), h);
    ctx.stroke();
  }
  const topGlow = ctx.createRadialGradient(cx, 0, 0, cx, 0, w * 0.5);
  topGlow.addColorStop(0, 'rgba(192, 38, 211, 0.12)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, w, h * 0.5);
}

function drawNeonText(ctx, text, x, y, fontSize, color, glow) {
  ctx.save();
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = glow;
  ctx.shadowBlur = 30;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 15;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.3;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawRIcon(ctx, x, y, size) {
  const r = size * 0.15;
  ctx.save();
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, r);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', x + size / 2, y + size / 2);
  ctx.restore();
}

function drawColorBar(ctx, x, y, totalW, h) {
  const bw = totalW / SEVERITY_COLORS.length;
  for (let i = 0; i < SEVERITY_COLORS.length; i++) {
    ctx.fillStyle = SEVERITY_COLORS[i];
    ctx.fillRect(x + i * bw, y, bw - 1, h);
  }
}

function drawWindowFrame(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(30, 20, 60, 0.8)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(40, 30, 70, 0.9)';
  ctx.fillRect(x, y, w, 30);
  const dots = ['#ef4444', '#eab308', '#22c55e'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = dots[i];
    ctx.beginPath();
    ctx.arc(x + 20 + i * 18, y + 15, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const LOG_SETS = {
  errors: [
    { text: '[ERROR] CUDA out of memory', kw: 'ERROR', c: '#dc2626' },
    { text: '[WARN] deprecated API call', kw: 'WARN', c: '#f97316' },
    { text: 'RuntimeError: expected float', kw: 'RuntimeError', c: '#c026d3' },
    { text: '[INFO] model loaded success', kw: null, c: null },
    { text: 'SIGSEGV in worker thread', kw: 'SIGSEGV', c: '#db2777' },
    { text: '[ERROR] connection refused', kw: 'ERROR', c: '#dc2626' },
    { text: 'ValueError: invalid shape', kw: 'ValueError', c: '#ea580c' },
    { text: '[DEBUG] checkpoint saved', kw: null, c: null },
    { text: 'OOM killer invoked', kw: 'OOM', c: '#c026d3' },
    { text: '[WARN] timeout exceeded', kw: 'WARN', c: '#f97316' },
    { text: 'segfault at 0x00000000', kw: 'segfault', c: '#db2777' },
    { text: '[INFO] training complete', kw: null, c: null },
  ],
  regex: [
    { text: '2026-04-17 09:12:33 ERROR main.py:42', kw: 'ERROR', c: '#dc2626' },
    { text: '2026-04-17 09:12:34 WARNING config.py:8', kw: 'WARNING', c: '#f97316' },
    { text: '2026-04-17 09:12:35 INFO server started', kw: null, c: null },
    { text: 'Traceback (most recent call last):', kw: 'Traceback', c: '#c026d3' },
    { text: '  File "app.py", line 127, in run', kw: null, c: null },
    { text: '    raise RuntimeError("timeout")', kw: 'RuntimeError', c: '#c026d3' },
    { text: 'RuntimeError: timeout', kw: 'RuntimeError', c: '#c026d3' },
    { text: '2026-04-17 09:12:36 ERROR db.py:89', kw: 'ERROR', c: '#dc2626' },
    { text: 'ConnectionRefusedError: [Errno 111]', kw: 'ConnectionRefusedError', c: '#db2777' },
    { text: '2026-04-17 09:12:37 INFO retrying...', kw: null, c: null },
    { text: '2026-04-17 09:12:38 CRITICAL crash', kw: 'CRITICAL', c: '#dc2626' },
    { text: 'SystemExit: code 1', kw: 'SystemExit', c: '#ea580c' },
  ],
  density: [
    { text: '[10:01] error: disk full', kw: 'error', c: '#dc2626' },
    { text: '[10:01] error: write failed', kw: 'error', c: '#dc2626' },
    { text: '[10:01] error: sync timeout', kw: 'error', c: '#dc2626' },
    { text: '[10:01] warn: retry #3', kw: 'warn', c: '#f97316' },
    { text: '[10:02] error: io exception', kw: 'error', c: '#dc2626' },
    { text: '[10:02] error: corrupt block', kw: 'error', c: '#dc2626' },
    { text: '[10:03] info: recovered', kw: null, c: null },
    { text: '[10:05] info: stable', kw: null, c: null },
    { text: '[10:08] warn: high latency', kw: 'warn', c: '#f97316' },
    { text: '[10:10] info: checkpoint ok', kw: null, c: null },
    { text: '[10:12] error: oom killed', kw: 'error', c: '#dc2626' },
    { text: '[10:12] error: alloc fail', kw: 'error', c: '#dc2626' },
  ],
};

function drawLogLines(ctx, x, y, w, h, count, logSet) {
  const lineH = h / count;
  const logs = logSet || LOG_SETS.errors;
  ctx.font = '13px Monaco, monospace';
  for (let i = 0; i < count; i++) {
    const log = logs[i % logs.length];
    const ly = y + i * lineH + lineH * 0.7;
    if (log.kw && log.c) {
      const idx = log.text.indexOf(log.kw);
      const before = log.text.substring(0, idx);
      const after = log.text.substring(idx + log.kw.length);
      ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
      ctx.fillText(before, x + 10, ly);
      const bw = ctx.measureText(before).width;
      const kwW = ctx.measureText(log.kw).width;
      ctx.fillStyle = log.c;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x + 10 + bw - 2, ly - 12, kwW + 4, 16);
      ctx.globalAlpha = 1;
      ctx.fillStyle = log.c;
      ctx.fillText(log.kw, x + 10 + bw, ly);
      ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
      ctx.fillText(after, x + 10 + bw + kwW, ly);
    } else {
      ctx.fillStyle = 'rgba(200, 200, 220, 0.4)';
      ctx.fillText(log.text, x + 10, ly);
    }
  }
}

function drawPopupPanel(ctx, px, py, pw, ph, opts = {}) {
  ctx.fillStyle = 'rgba(20, 15, 45, 0.9)';
  ctx.strokeStyle = 'rgba(192, 38, 211, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 8);
  ctx.fill();
  ctx.stroke();

  drawRIcon(ctx, px + 15, py + 15, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('RSearch', px + 55, py + 35);

  // toggle
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(px + 240, py + 22, 36, 20, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(px + 262, py + 32, 7, 0, Math.PI * 2);
  ctx.fill();

  // mode tabs
  ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.beginPath();
  ctx.roundRect(px + 15, py + 60, pw - 30, 32, 6);
  ctx.fill();

  const kwActive = opts.mode !== 'regex';
  ctx.fillStyle = kwActive ? '#e879f9' : '#64748b';
  ctx.font = '13px Arial';
  ctx.fillText('Keywords', px + 30, py + 81);
  ctx.fillStyle = kwActive ? '#64748b' : '#e879f9';
  ctx.fillText('Regex', px + 120, py + 81);

  // search input
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px + 15, py + 108, pw - 30, 36, 6);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Monaco, monospace';
  ctx.fillText(opts.inputText || 'error, fail, SIGSEGV, OOM...', px + 25, py + 131);

  // buttons
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(px + 15, py + 160, (pw - 40) / 2, 32, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Search', px + 15 + (pw - 40) / 4, py + 181);

  ctx.fillStyle = 'rgba(100, 100, 120, 0.4)';
  ctx.beginPath();
  ctx.roundRect(px + pw / 2 + 5, py + 160, (pw - 40) / 2, 32, 6);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Clear', px + pw / 2 + 5 + (pw - 40) / 4, py + 181);

  // status
  ctx.textAlign = 'left';
  ctx.fillStyle = '#22c55e';
  ctx.font = '12px Arial';
  ctx.fillText(opts.status || 'Found 847 match(es)', px + 15, py + 220);
}

function save(canvas, name) {
  const p = path.join(outDir, name);
  writeFileSync(p, canvas.toBuffer('image/png'));
  console.log('  ' + name);
}

// ── Screenshot 1: Keywords mode + highlights ──────
function screenshot1() {
  const w = 1280, h = 800;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  drawRetroGrid(ctx, w, h);

  drawNeonText(ctx, 'RSearch', w / 2, 55, 44, '#e879f9', '#c026d3');
  drawNeonText(ctx, '363+ Error Keywords · Auto-Highlight', w / 2, 100, 18, '#94a3b8', '#6366f1');

  drawWindowFrame(ctx, 60, 150, 780, 590);
  drawLogLines(ctx, 60, 185, 780, 555, 28, LOG_SETS.errors);

  drawPopupPanel(ctx, 900, 150, 320, 250, {
    status: 'Found 847 match(es)',
    inputText: 'error, fail, SIGSEGV, OOM...',
  });

  drawColorBar(ctx, 60, 760, 400, 12);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Severity: Critical → Info', 480, 772);

  save(c, 'screenshot-1-1280x800.png');
}

// ── Screenshot 2: Top 3 Density Areas ─────────────
function screenshot2() {
  const w = 1280, h = 800;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  drawRetroGrid(ctx, w, h);

  drawNeonText(ctx, 'Top 3 Error Density Hotspots', w / 2, 55, 36, '#e879f9', '#c026d3');
  drawNeonText(ctx, 'Click to jump to high-density areas', w / 2, 95, 18, '#94a3b8', '#6366f1');

  drawWindowFrame(ctx, 60, 140, 780, 600);
  drawLogLines(ctx, 60, 175, 780, 565, 28, LOG_SETS.density);

  // density indicator bars on the right side of the log window
  const barX = 820;
  const segments = [
    { y: 175, h: 120, opacity: 0.6, label: '#1  156 matches' },
    { y: 370, h: 80, opacity: 0.35, label: '#2  89 matches' },
    { y: 560, h: 60, opacity: 0.2, label: '#3  52 matches' },
  ];
  for (const seg of segments) {
    ctx.fillStyle = `rgba(220, 38, 38, ${seg.opacity})`;
    ctx.fillRect(barX, seg.y, 12, seg.h);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(seg.label, barX + 20, seg.y + seg.h / 2 + 4);
  }

  // hotspot panel
  const px = 950, py = 150, pw = 280;
  ctx.fillStyle = 'rgba(20, 15, 45, 0.9)';
  ctx.strokeStyle = 'rgba(192, 38, 211, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, 360, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e879f9';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Top 3 Density Areas', px + 15, py + 30);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Arial';
  ctx.fillText('Click to jump to high density areas', px + 15, py + 48);

  const hotspots = [
    { rank: '#1', pos: '12%', count: '156 matches', preview: 'error: disk full / write failed' },
    { rank: '#2', pos: '45%', count: '89 matches', preview: 'error: io exception / corrupt' },
    { rank: '#3', pos: '78%', count: '52 matches', preview: 'error: oom killed / alloc fail' },
  ];
  for (let i = 0; i < hotspots.length; i++) {
    const hy = py + 70 + i * 90;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath();
    ctx.roundRect(px + 15, hy, pw - 30, 75, 6);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 13px Arial';
    ctx.fillText(hotspots[i].rank, px + 25, hy + 22);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Arial';
    ctx.fillText(`${hotspots[i].pos}  (${hotspots[i].count})`, px + 55, hy + 22);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Monaco, monospace';
    ctx.fillText(hotspots[i].preview, px + 25, hy + 45);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.font = '10px Arial';
    ctx.fillText('Click to navigate →', px + 25, hy + 63);
  }

  save(c, 'screenshot-2-1280x800.png');
}

// ── Screenshot 3: Regex mode + auto-search ────────
function screenshot3() {
  const w = 1280, h = 800;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  drawRetroGrid(ctx, w, h);

  drawNeonText(ctx, 'Regex Mode + Auto-Search', w / 2, 55, 36, '#e879f9', '#c026d3');
  drawNeonText(ctx, 'Full regex support · Auto-executes on tab switch', w / 2, 95, 18, '#94a3b8', '#6366f1');

  drawWindowFrame(ctx, 60, 140, 780, 600);
  drawLogLines(ctx, 60, 175, 780, 565, 28, LOG_SETS.regex);

  drawPopupPanel(ctx, 900, 140, 320, 260, {
    mode: 'regex',
    inputText: '(Error|CRITICAL|Traceback)',
    status: 'Found 312 match(es)',
  });

  // auto-search badge
  const ax = 900, ay = 420;
  ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
  ctx.beginPath();
  ctx.roundRect(ax, ay, 320, 60, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Auto-Search: ON', ax + 15, ay + 25);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Arial';
  ctx.fillText('Highlights apply on every page load', ax + 15, ay + 45);

  // preset badge
  ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
  ctx.beginPath();
  ctx.roundRect(ax, ay + 75, 320, 60, 8);
  ctx.fill();
  ctx.fillStyle = '#e879f9';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('Preset: Default (363 keywords)', ax + 15, ay + 100);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Arial';
  ctx.fillText('3 customizable slots · CSV import/export', ax + 15, ay + 120);

  save(c, 'screenshot-3-1280x800.png');
}

// ── Small Promo 440x280 ──────────────────────────
function smallPromo() {
  const w = 440, h = 280;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  drawRetroGrid(ctx, w, h);

  drawRIcon(ctx, 30, 40, 50);
  drawNeonText(ctx, 'RSearch', 200, 65, 36, '#e879f9', '#c026d3');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Error Log Search & Highlighter', w / 2, 110);

  const pills = ['363+ Patterns', 'Auto-Highlight', 'Density Hotspots'];
  for (let i = 0; i < pills.length; i++) {
    const fx = 50 + i * 130;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.beginPath();
    ctx.roundRect(fx, 135, 120, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pills[i], fx + 60, 153);
  }

  drawColorBar(ctx, 50, 190, 340, 16);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Severity-based color coding for developers', w / 2, 235);
  ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.font = '11px Arial';
  ctx.fillText('Open Source | Privacy First | Manifest V3', w / 2, 260);

  save(c, 'small-promo-440x280.png');
}

// ── Marquee 1400x560 ─────────────────────────────
function marquee() {
  const w = 1400, h = 560;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  drawRetroGrid(ctx, w, h);

  drawRIcon(ctx, 80, 100, 80);
  drawNeonText(ctx, 'RSearch', 320, 140, 56, '#e879f9', '#c026d3');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Advanced Error Log Search & Highlighter', 100, 220);

  const pills = ['363+ Patterns', 'Auto-Search', 'Top 3 Hotspots', '8 Severity Colors', 'Regex + Keywords'];
  for (let i = 0; i < pills.length; i++) {
    const px = 100 + i * 145;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
    ctx.beginPath();
    ctx.roundRect(px, 260, 135, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pills[i], px + 67, 280);
  }

  drawColorBar(ctx, 100, 320, 500, 20);
  ctx.fillStyle = '#64748b';
  ctx.font = '13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Critical', 100, 360);
  ctx.textAlign = 'right';
  ctx.fillText('Info', 600, 360);

  drawWindowFrame(ctx, 780, 60, 550, 440);
  drawLogLines(ctx, 780, 95, 550, 405, 22, LOG_SETS.errors);

  ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Open Source | Privacy First | Manifest V3 | For Developers', w / 2, h - 30);

  save(c, 'marquee-promo-1400x560.png');
}

console.log('Generating store images...');
screenshot1();
screenshot2();
screenshot3();
smallPromo();
marquee();
console.log('Done — 5 images in releases/');
