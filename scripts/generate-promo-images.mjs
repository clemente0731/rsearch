import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

mkdirSync(distPath, { recursive: true });

// severity colors
const SEVERITY_COLORS = [
  '#c026d3', '#db2777', '#dc2626', '#ea580c',
  '#f97316', '#eab308', '#84cc16', '#22c55e'
];

// draw retro grid background
function drawRetroGrid(ctx, w, h) {
  // dark background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0f0a2e');
  grad.addColorStop(0.5, '#1a1145');
  grad.addColorStop(1, '#0d0820');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // perspective grid lines
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
  ctx.lineWidth = 1;

  // horizontal lines (converging to horizon)
  const horizon = h * 0.45;
  for (let i = 0; i < 20; i++) {
    const y = horizon + (i * i * 2);
    if (y > h) break;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // vertical lines from vanishing point
  const cx = w / 2;
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, horizon);
    ctx.lineTo(cx + i * (w / 8), h);
    ctx.stroke();
  }

  // top glow
  const topGlow = ctx.createRadialGradient(cx, 0, 0, cx, 0, w * 0.5);
  topGlow.addColorStop(0, 'rgba(192, 38, 211, 0.12)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, w, h * 0.5);
}

// draw neon text
function drawNeonText(ctx, text, x, y, fontSize, color, glowColor) {
  ctx.save();
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // glow layers
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 30;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 15;
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 5;
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.3;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// draw the R icon
function drawRIcon(ctx, x, y, size) {
  const radius = size * 0.15;
  ctx.save();
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#dc2626';

  // rounded rect
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R', x + size / 2, y + size / 2);
  ctx.restore();
}

// draw color bar (severity gradient)
function drawColorBar(ctx, x, y, totalWidth, height) {
  const barWidth = totalWidth / SEVERITY_COLORS.length;
  for (let i = 0; i < SEVERITY_COLORS.length; i++) {
    ctx.fillStyle = SEVERITY_COLORS[i];
    ctx.beginPath();
    const bx = x + i * barWidth;
    const radius = 3;
    ctx.moveTo(bx + radius, y);
    ctx.lineTo(bx + barWidth - 1, y);
    ctx.lineTo(bx + barWidth - 1, y + height);
    ctx.lineTo(bx + radius, y + height);
    ctx.quadraticCurveTo(bx, y + height, bx, y + height - radius);
    ctx.lineTo(bx, y + radius);
    ctx.quadraticCurveTo(bx, y, bx + radius, y);
    ctx.fill();
  }
}

// draw fake log lines with highlights
function drawLogLines(ctx, x, y, w, h, lineCount) {
  const lineHeight = h / lineCount;
  const logTexts = [
    { text: '[ERROR] CUDA out of memory', highlight: 'ERROR', color: '#dc2626' },
    { text: '[WARN] deprecated API call', highlight: 'WARN', color: '#f97316' },
    { text: 'RuntimeError: expected float', highlight: 'RuntimeError', color: '#c026d3' },
    { text: '[INFO] model loaded success', highlight: null, color: null },
    { text: 'SIGSEGV in worker thread', highlight: 'SIGSEGV', color: '#db2777' },
    { text: '[ERROR] connection refused', highlight: 'ERROR', color: '#dc2626' },
    { text: 'ValueError: invalid shape', highlight: 'ValueError', color: '#ea580c' },
    { text: '[DEBUG] checkpoint saved', highlight: null, color: null },
    { text: 'OOM killer invoked', highlight: 'OOM', color: '#c026d3' },
    { text: '[WARN] timeout exceeded', highlight: 'WARN', color: '#f97316' },
    { text: 'segfault at 0x00000000', highlight: 'segfault', color: '#db2777' },
    { text: '[INFO] training complete', highlight: null, color: null },
  ];

  ctx.font = '13px Monaco, monospace';
  for (let i = 0; i < lineCount; i++) {
    const log = logTexts[i % logTexts.length];
    const ly = y + i * lineHeight + lineHeight * 0.7;

    if (log.highlight && log.color) {
      const idx = log.text.indexOf(log.highlight);
      const before = log.text.substring(0, idx);
      const kw = log.highlight;
      const after = log.text.substring(idx + kw.length);

      ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
      ctx.fillText(before, x + 10, ly);

      const bw = ctx.measureText(before).width;

      // highlight bg
      const kwWidth = ctx.measureText(kw).width;
      ctx.fillStyle = log.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x + 10 + bw - 2, ly - 12, kwWidth + 4, 16);
      ctx.globalAlpha = 1;

      ctx.fillStyle = log.color;
      ctx.fillText(kw, x + 10 + bw, ly);

      ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
      ctx.fillText(after, x + 10 + bw + kwWidth, ly);
    } else {
      ctx.fillStyle = 'rgba(200, 200, 220, 0.4)';
      ctx.fillText(log.text, x + 10, ly);
    }
  }
}

// === Screenshot 1280x800 ===
function generateScreenshot() {
  const w = 1280;
  const h = 800;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  drawRetroGrid(ctx, w, h);

  // title
  drawNeonText(ctx, 'RSearch', w / 2, 60, 48, '#e879f9', '#c026d3');
  drawNeonText(ctx, 'Error Log Search & Highlighter', w / 2, 110, 20, '#94a3b8', '#6366f1');

  // browser window mock
  const bx = 60;
  const by = 160;
  const bw = 780;
  const bh = 580;

  // window frame
  ctx.fillStyle = 'rgba(30, 20, 60, 0.8)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  // title bar
  ctx.fillStyle = 'rgba(40, 30, 70, 0.9)';
  ctx.fillRect(bx, by, bw, 30);
  // dots
  const dots = ['#ef4444', '#eab308', '#22c55e'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = dots[i];
    ctx.beginPath();
    ctx.arc(bx + 20 + i * 18, by + 15, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // log lines
  drawLogLines(ctx, bx, by + 35, bw, bh - 35, 28);

  // popup panel
  const px = 900;
  const py = 160;
  const pw = 320;
  const ph = 520;

  ctx.fillStyle = 'rgba(20, 15, 45, 0.9)';
  ctx.strokeStyle = 'rgba(192, 38, 211, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 8);
  ctx.fill();
  ctx.stroke();

  // popup header
  drawRIcon(ctx, px + 15, py + 15, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('RSearch', px + 55, py + 35);

  // toggle switch
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(px + 240, py + 22, 36, 20, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(px + 262, py + 32, 7, 0, Math.PI * 2);
  ctx.fill();

  // search mode
  ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.beginPath();
  ctx.roundRect(px + 15, py + 60, pw - 30, 32, 6);
  ctx.fill();
  ctx.fillStyle = '#e879f9';
  ctx.font = '13px Arial';
  ctx.fillText('Keywords', px + 30, py + 81);
  ctx.fillStyle = '#64748b';
  ctx.fillText('Regex', px + 120, py + 81);

  // search input
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px + 15, py + 108, pw - 30, 36, 6);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Monaco, monospace';
  ctx.fillText('error, fail, SIGSEGV, OOM...', px + 25, py + 131);

  // search button
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
  ctx.roundRect(px + (pw) / 2 + 5, py + 160, (pw - 40) / 2, 32, 6);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Clear', px + (pw) / 2 + 5 + (pw - 40) / 4, py + 181);

  // status
  ctx.textAlign = 'left';
  ctx.fillStyle = '#22c55e';
  ctx.font = '12px Arial';
  ctx.fillText('Found 847 match(es)', px + 15, py + 220);

  // top 3 density
  ctx.fillStyle = '#e879f9';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('Top 3 Density Areas', px + 15, py + 260);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Arial';
  ctx.fillText('Click to jump to high density areas', px + 15, py + 278);

  // hotspot items
  const hotspots = [
    { rank: '#1', pos: '12%', count: '156 matches' },
    { rank: '#2', pos: '45%', count: '89 matches' },
    { rank: '#3', pos: '78%', count: '52 matches' },
  ];
  for (let i = 0; i < hotspots.length; i++) {
    const hy = py + 295 + i * 52;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath();
    ctx.roundRect(px + 15, hy, pw - 30, 44, 6);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(hotspots[i].rank, px + 25, hy + 18);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Arial';
    ctx.fillText(hotspots[i].pos + ' (' + hotspots[i].count + ')', px + 55, hy + 18);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Arial';
    ctx.fillText('RuntimeError: expected float...', px + 55, hy + 35);
  }

  // color bar at bottom
  drawColorBar(ctx, 60, 760, 400, 12);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Severity: Critical → Info', 480, 772);

  const buf = canvas.toBuffer('image/png');
  const outPath = path.join(distPath, 'screenshot-1280x800.png');
  writeFileSync(outPath, buf);
  console.log('created: ' + outPath);
}

// === Small Promo 440x280 ===
function generateSmallPromo() {
  const w = 440;
  const h = 280;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  drawRetroGrid(ctx, w, h);

  drawRIcon(ctx, 30, 40, 50);
  drawNeonText(ctx, 'RSearch', 200, 65, 36, '#e879f9', '#c026d3');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Error Log Search & Highlighter', w / 2, 110);

  // features
  const features = [
    '363+ Error Patterns',
    'Auto-Highlight',
    'Density Hotspots'
  ];
  for (let i = 0; i < features.length; i++) {
    const fx = 50 + i * 130;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.beginPath();
    ctx.roundRect(fx, 135, 120, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(features[i], fx + 60, 153);
  }

  // color bar
  drawColorBar(ctx, 50, 190, 340, 16);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Severity-based color coding for developers', w / 2, 235);

  ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.font = '11px Arial';
  ctx.fillText('Open Source | Privacy First | Manifest V3', w / 2, 260);

  const buf = canvas.toBuffer('image/png');
  const outPath = path.join(distPath, 'promo-small-440x280.png');
  writeFileSync(outPath, buf);
  console.log('created: ' + outPath);
}

// === Marquee 1400x560 ===
function generateMarquee() {
  const w = 1400;
  const h = 560;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  drawRetroGrid(ctx, w, h);

  // left side: icon + title
  drawRIcon(ctx, 80, 100, 80);
  drawNeonText(ctx, 'RSearch', 320, 140, 56, '#e879f9', '#c026d3');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Advanced Error Log Search & Highlighter', 100, 220);

  // feature pills
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

  // color bar
  drawColorBar(ctx, 100, 320, 500, 20);
  ctx.fillStyle = '#64748b';
  ctx.font = '13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Critical', 100, 360);
  ctx.textAlign = 'right';
  ctx.fillText('Info', 600, 360);

  // right side: log window
  const lx = 780;
  const ly = 60;
  const lw = 550;
  const lh = 440;

  ctx.fillStyle = 'rgba(30, 20, 60, 0.8)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(lx, ly, lw, lh, 8);
  ctx.fill();
  ctx.stroke();

  // title bar
  ctx.fillStyle = 'rgba(40, 30, 70, 0.9)';
  ctx.fillRect(lx, ly, lw, 28);
  const dots = ['#ef4444', '#eab308', '#22c55e'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = dots[i];
    ctx.beginPath();
    ctx.arc(lx + 18 + i * 16, ly + 14, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLogLines(ctx, lx, ly + 32, lw, lh - 32, 22);

  // bottom tagline
  ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Open Source | Privacy First | Manifest V3 | For Developers', w / 2, h - 30);

  const buf = canvas.toBuffer('image/png');
  const outPath = path.join(distPath, 'promo-marquee-1400x560.png');
  writeFileSync(outPath, buf);
  console.log('created: ' + outPath);
}

// run all
generateScreenshot();
generateSmallPromo();
generateMarquee();
console.log('all promo images generated in dist/');
