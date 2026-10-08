'use strict';

// ---------- 練習資料 ----------
// base: [種類, 預設秒數, 設定頁標籤, 練習中提示(省略時同設定頁標籤)]
const IN = 'in', HOLD = 'hold', OUT = 'out';
const EX = [
  { id: 'box', name: '方塊呼吸', desc: '吸氣、停住、吐氣、停住，各段等長。',
    base: [[IN, 4, '吸氣'], [HOLD, 4, '吸氣後停住', '停住'], [OUT, 4, '吐氣'], [HOLD, 4, '吐氣後停住', '停住']] },
  { id: '478', name: '4-7-8 放鬆呼吸', label: '4-7-8', fixed: true, desc: '吸氣 4 秒、停住 7 秒、吐氣 8 秒。',
    base: [[IN, 4, '吸氣'], [HOLD, 7, '停住'], [OUT, 8, '吐氣']] },
  { id: 'belly', name: '諧振式呼吸', bpm: 6, desc: '吸氣與吐氣等長，依每分鐘次數調整節奏。',
    base: [[IN, 4, '吸氣', '腹部吸氣'], [OUT, 6, '吐氣', '慢慢吐氣']] },
  { id: 'nostril', name: '鼻孔交替呼吸', desc: '左右鼻孔輪流吸氣與吐氣。',
    base: [[IN, 4, '吸氣'], [HOLD, 4, '停住'], [OUT, 4, '吐氣']],
    seq: [[0, '左鼻吸氣'], [1, '停住'], [2, '右鼻吐氣'], [0, '右鼻吸氣'], [1, '停住'], [2, '左鼻吐氣']] },
  { id: 'pursed', name: '呼氣練習', desc: '用鼻子吸氣，再把嘴唇噘成圓形，慢慢吐氣。吐氣約為吸氣的兩倍長。',
    base: [[IN, 2, '吸氣', '鼻子吸氣'], [OUT, 6, '吐氣', '圓唇慢吐']] },
  { id: 'res', name: '鯨豚式呼吸', wip: true, desc: '吸氣與吐氣等長，每分鐘約 5.5 次。',
    base: [[IN, 5.5, '吸氣'], [OUT, 5.5, '吐氣']] },
  { id: 'wimhof', name: '冰人呼吸', wip: true,
    desc: '深吸、放鬆吐氣連續 30 次，接著吐氣後閉氣，再深吸一口閉氣後吐氣。請坐著或躺著練習，不要在水中或開車時進行。',
    base: [[IN, 2, '深吸', '吸'], [OUT, 1, '放鬆吐氣', '吐'], [HOLD, 60, '吐氣後閉氣', '閉氣'], [IN, 2, '恢復吸氣', '深吸一口'], [HOLD, 15, '吸氣後閉氣', '閉氣'], [OUT, 2, '吐氣']],
    seq: [...Array.from({ length: 30 }, (_, i) => [[0, '吸 ' + (i + 1)], [1, '吐']]).flat(), [2, '吐氣後閉氣'], [3, '深吸一口'], [4, '閉氣'], [5, '吐氣']] },
];

// 首頁小圖示：線條 path（32×32）或圖檔
const ICONS = {
  box: 'M16 4L27 10V22L16 28L5 22V10ZM5 10L16 16L27 10M16 16V28',
  478: 'M4 24C8 24 9 9 13 9H19C24 9 25 24 28 24',
  belly: 'M3 16C7 6 11 6 16 16S25 26 29 16',
  nostril: 'M5 16a11 8.5 0 1 0 22 0a11 8.5 0 1 0-22 0M10 16a2.2 3.4 0 1 0 4.4 0a2.2 3.4 0 1 0-4.4 0M17.6 16a2.2 3.4 0 1 0 4.4 0a2.2 3.4 0 1 0-4.4 0',
  wimhof: 'M16 4V28M5.6 10L26.4 22M5.6 22L26.4 10M13 6.5L16 9L19 6.5M13 25.5L16 23L19 25.5M7.5 7.7L8.2 11.5L4.5 12.9M24.5 24.3L23.8 20.5L27.5 19.1M27.5 12.9L23.8 11.5L24.5 7.7M4.5 19.1L8.2 20.5L7.5 24.3',
};
const ICON_IMGS = { res: 'icons/whale.png', pursed: 'icons/wind.png' };

const MUSIC = [['none', '無'], ['handpan', '手碟'], ['drums', '非洲鼓']];
const MUSIC_FILES = { handpan: 'audio/handpan.mp3', drums: 'audio/drums.mp3' };
const KEY = 'haohao-breath-settings';

const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtS = v => (Number.isInteger(v) ? v : v.toFixed(1)) + ' 秒';
const $ = id => document.getElementById(id);

// ---------- 狀態（設定會存在 localStorage） ----------
const state = Object.assign(
  { custom: {}, minutes: 3, music: 'none', vol: 0.5 },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })()
);
let cur = null;        // 目前練習
let timers = [];       // 整段練習的計時器
let phaseTimers = [];  // 單一階段的計時器
let raf = 0, waveStart = null, totalLeft = 0, left = null;

function save() {
  const { custom, minutes, music, vol } = state;
  try { localStorage.setItem(KEY, JSON.stringify({ custom, minutes, music, vol })); } catch (e) {}
}

// ---------- 節奏計算 ----------
const bpmOf = ex => { const c = state.custom[ex.id]; return c && c.length === 1 ? c[0] : ex.bpm; };
function secsOf(ex) {
  if (ex.fixed) return ex.base.map(b => b[1]);
  if (ex.bpm) { const h = 30 / bpmOf(ex); return [h, h]; }
  return state.custom[ex.id] || ex.base.map(b => b[1]);
}
const seqOf = ex => ex.seq || ex.base.map((b, i) => [i, b[3] || b[2]]);
const cycleOf = ex => { const s = secsOf(ex); return seqOf(ex).reduce((a, [bi]) => a + s[bi], 0); };

function adj(ex, i, d) {
  if (ex.bpm) {
    const n = Math.min(12, Math.max(1, bpmOf(ex) + d));
    state.custom = { ...state.custom, [ex.id]: [n] };
  } else {
    const s = secsOf(ex).slice();
    const n = d > 0 ? Math.floor(s[i]) + 1 : Math.ceil(s[i]) - 1;
    s[i] = Math.min(60, Math.max(0, n));
    if (s.every(v => v === 0)) return; // 不能全部都是 0
    state.custom = { ...state.custom, [ex.id]: s };
  }
  save();
  renderSetup();
}

// ---------- 波形 ----------
function waveSegs(ex) {
  const secs = secsOf(ex); let t = 0, lv = 0; const segs = [];
  seqOf(ex).forEach(([bi]) => {
    const k = ex.base[bi][0], d = secs[bi], to = k === IN ? 1 : k === OUT ? 0 : lv;
    segs.push({ t0: t, t1: t + d, from: lv, to }); t += d; lv = to;
  });
  return { T: t, segs, W: Math.max(300, t * 16) };
}
const segAt = (w, tm) => w.segs.find(s => tm < s.t1) || w.segs[w.segs.length - 1];
function waveAt(w, tm) {
  const s = segAt(w, tm), p = Math.min(1, Math.max(0, (tm - s.t0) / ((s.t1 - s.t0) || 1)));
  const e = (1 - Math.cos(Math.PI * p)) / 2, v = s.from + (s.to - s.from) * e;
  return [tm / w.T * w.W, 140 - v * 120];
}
function waveD(ex) {
  const w = waveSegs(ex), pts = [], N = Math.max(120, Math.ceil(w.T * 8));
  for (let c = -1; c <= 1; c++) for (let i = 0; i <= N; i++) {
    const [x, y] = waveAt(w, w.T * i / N); pts.push((x + c * w.W).toFixed(1) + ' ' + y.toFixed(1));
  }
  return 'M' + pts.join(' L');
}

// ---------- 呼氣練習人物 ----------
const SVGNS = 'http://www.w3.org/2000/svg';
const fig = $('animFig');
for (let k = 0; k < 6; k++) {
  const d = document.createElementNS(SVGNS, 'circle');
  d.setAttribute('data-k', 'dot'); d.setAttribute('r', '5'); d.setAttribute('fill', '#5aaac0'); d.setAttribute('opacity', '0');
  $('figDots').appendChild(d);
  const p = document.createElementNS(SVGNS, 'circle');
  p.setAttribute('data-k', 'puff'); p.setAttribute('r', '3'); p.setAttribute('fill', 'none');
  p.setAttribute('stroke', '#1f6f86'); p.setAttribute('stroke-width', '2.5'); p.setAttribute('opacity', '0');
  $('figPuffs').appendChild(p);
}
function drawFig(phase, prog, now) {
  const q = k => fig.querySelector('[data-k="' + k + '"]');
  const A = (el, o) => { for (const k in o) el.setAttribute(k, o[k]); };
  const ease = x => .5 - .5 * Math.cos(Math.PI * x);
  const s = phase === 'in' ? .25 + .75 * ease(prog) : 1 - .75 * ease(prog), n = (s - .25) / .75, rise = -8 * n;
  A(q('body'), { transform: 'translate(0 ' + rise.toFixed(2) + ')' });
  A(q('head'), { transform: 'translate(0 ' + (rise * .6).toFixed(2) + ')' });
  const m = phase === 'ex' ? Math.min(1, prog * 6) : Math.max(0, 1 - prog * 6), e = m * m * (3 - 2 * m), y = 236 + rise * .6;
  A(q('lips'), { cy: y.toFixed(2), rx: (24 - 12 * e).toFixed(2), ry: (5 + 7 * e).toFixed(2) });
  A(q('hole'), { cy: y.toFixed(2), rx: (4.5 * e).toFixed(2), ry: (5 * e).toFixed(2) });
  const f = phase === 'in' ? ease(Math.min(1, prog * 1.6)) : Math.max(0, 1 - prog * 4);
  [q('nosL'), q('nosR')].forEach((el, k) => A(el, {
    rx: (3.2 + 3.3 * f).toFixed(2), ry: (2.2 + 2.3 * f).toFixed(2), cx: (k ? 207 + 1.5 * f : 193 - 1.5 * f).toFixed(2),
  }));
  const ny = 203 + rise * .6;
  fig.querySelectorAll('[data-k="dot"]').forEach((c, k) => {
    if (phase !== 'in') { c.setAttribute('opacity', '0'); return; }
    const t = ((now / 1100) + k / 6) % 1, side = k % 2 ? 1 : -1, sx = 200 + side * 95, sy = 300, tx = 200 + side * 7;
    A(c, { cx: (sx + (tx - sx) * t).toFixed(1), cy: (sy + (ny - sy) * t - Math.sin(Math.PI * t) * 20).toFixed(1), opacity: (.9 * Math.sin(Math.PI * t)).toFixed(2) });
  });
  fig.querySelectorAll('[data-k="puff"]').forEach((c, k) => {
    if (phase !== 'ex' || prog < .08) { c.setAttribute('opacity', '0'); return; }
    const t = ((now / 1500) + k / 6) % 1, sp = (k - 2.5) * .22;
    A(c, { cx: (200 + sp * 120 * t).toFixed(1), cy: (y + 10 + 95 * t).toFixed(1), r: (3 + 10 * t).toFixed(1), opacity: (.8 * (1 - t) * Math.min(1, t * 5)).toFixed(2) });
  });
}

// 波形與人物每格畫面更新
function tick() {
  const ex = EX[cur];
  if (ex && waveStart != null) {
    const w = waveSegs(ex), now = performance.now(), tm = ((now - waveStart) / 1000) % w.T;
    if (ex.id === 'pursed') {
      const sg = segAt(w, tm);
      drawFig(sg.to > sg.from ? 'in' : 'ex', (tm - sg.t0) / ((sg.t1 - sg.t0) || 1), now);
    } else {
      const [x, y] = waveAt(w, tm);
      $('waveDot').style.transform = 'translate(150px,' + y + 'px)';
      $('waveG').setAttribute('transform', 'translate(' + (150 - x).toFixed(2) + ' 0)');
    }
  }
  raf = requestAnimationFrame(tick);
}

// ---------- 背景音樂（手碟、非洲鼓，練習開始時淡入） ----------
let audio = null, fadeIv = 0;
function playMusic(kind) {
  stopMusic(true);
  if (!MUSIC_FILES[kind]) return;
  const au = new Audio(MUSIC_FILES[kind]);
  au.loop = true; au.volume = 0; au.play().catch(() => {});
  audio = au;
  let v = 0;
  fadeIv = setInterval(() => { v = Math.min(1, v + .05); au.volume = v * state.vol; if (v >= 1) clearInterval(fadeIv); }, 60);
}
function stopMusic(immediate) {
  clearInterval(fadeIv);
  const au = audio; audio = null;
  if (!au) return;
  if (immediate) { au.pause(); return; }
  const from = au.volume, t0 = performance.now();
  const iv = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / 600);
    au.volume = from * (1 - p);
    if (p >= 1) { clearInterval(iv); au.pause(); }
  }, 30);
}

// ---------- 節拍音效（即時合成） ----------
let ac = null, noiseBuf = null, breath = null;
function ctx() {
  if (!ac) {
    // iPhone 靜音模式下仍要播放音效（Safari 17+）
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ac = new (window.AudioContext || window.webkitAudioContext)();
    // 在點擊當下播一段無聲，解鎖手機上的音效
    const s = ac.createBufferSource();
    s.buffer = ac.createBuffer(1, 1, ac.sampleRate);
    s.connect(ac.destination); s.start(0);
  }
  if (ac.state === 'suspended' || ac.state === 'interrupted') ac.resume();
  return ac;
}

// 較舊的 iPhone 在靜音模式會把合成音效靜音，播放一段無聲音檔可以避免
const keepAlive = (() => {
  const n = 4000, buf = new Uint8Array(44 + n), v = new DataView(buf.buffer);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) buf[o + i] = s.charCodeAt(i); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true); buf.fill(128, 44);
  let bin = ''; buf.forEach(b => { bin += String.fromCharCode(b); });
  const a = new Audio('data:audio/wav;base64,' + btoa(bin));
  a.loop = true;
  a.setAttribute('playsinline', '');
  return a;
})();
function noise() {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  return s;
}
function stopBreath() {
  const b = breath; if (!b) return;
  breath = null;
  const t = ac.currentTime;
  try { b.g.gain.cancelScheduledValues(t); b.g.gain.setTargetAtTime(0, t, .08); b.s.stop(t + .5); } catch (e) {}
}
// 諧振式呼吸：每段開頭敲一下鼓（吸氣高音、吐氣低音）
function drumFx(high) {
  ctx();
  const now = ac.currentTime, f0 = high ? 520 : 390;
  [[1, .32, .22], [1.5, .12, .12], [2.4, .06, .07]].forEach(([m, v, d]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = m === 1 ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(f0 * m * 1.15, now);
    o.frequency.exponentialRampToValueAtTime(f0 * m, now + .02);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(v, now + .002);
    g.gain.exponentialRampToValueAtTime(.001, now + d);
    o.connect(g); g.connect(ac.destination);
    o.start(now); o.stop(now + d + .05);
  });
  const s = noise(), hp = ac.createBiquadFilter(), ng = ac.createGain();
  hp.type = 'highpass'; hp.frequency.value = 4000;
  ng.gain.setValueAtTime(.1, now); ng.gain.exponentialRampToValueAtTime(.001, now + .025);
  s.connect(hp); hp.connect(ng); ng.connect(ac.destination);
  s.start(now); s.stop(now + .04);
}
// 其他練習：吸氣、吐氣時播放呼吸聲，停住時安靜
function breathFx(k, t) {
  stopBreath();
  if (k === HOLD || !t) return;
  ctx();
  const now = ac.currentTime, s = noise(), bp = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), g = ac.createGain();
  bp.type = 'bandpass'; bp.Q.value = .8; lp.type = 'lowpass'; lp.frequency.value = 3200;
  const inh = k === IN, peak = inh ? .4 : .5, a = Math.min(.6, t * .35);
  bp.frequency.setValueAtTime(inh ? 700 : 1300, now);
  bp.frequency.linearRampToValueAtTime(inh ? 1500 : 600, now + t);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + a);
  g.gain.setValueAtTime(peak, now + Math.max(a, t * .6));
  g.gain.linearRampToValueAtTime(0, now + t);
  s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ac.destination);
  s.start(now); s.stop(now + t + .05);
  breath = { s, g };
}

// ---------- 畫面 ----------
const screens = { setup: $('setup'), run: $('run'), done: $('done') };
function show(mode) {
  for (const k in screens) screens[k].hidden = k !== mode;
  document.body.style.overflow = mode ? 'hidden' : '';
}
function bind(key, val) { document.querySelectorAll('[data-bind="' + key + '"]').forEach(el => { el.textContent = val; }); }

function renderHome() {
  const list = $('list');
  list.innerHTML = '';
  EX.forEach((ex, i) => {
    const row = document.createElement('button');
    row.className = 'row';
    const icon = document.createElement('div');
    icon.className = 'row-icon';
    if (ICON_IMGS[ex.id]) {
      icon.innerHTML = '<img src="' + ICON_IMGS[ex.id] + '" alt="">';
    } else {
      icon.innerHTML = '<svg viewBox="0 0 32 32"><path d="' + ICONS[ex.id] + '" fill="none" stroke="#1f6f86" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    }
    const name = document.createElement('span');
    name.className = 'row-name';
    name.textContent = ex.label || ex.name;
    row.append(icon, name);
    row.addEventListener('click', () => open(i));
    list.appendChild(row);
  });
}

function renderSetup() {
  const ex = EX[cur], secs = secsOf(ex), cycle = cycleOf(ex);
  bind('name', ex.name);
  bind('desc', ex.desc);
  bind('minutes', state.minutes);
  $('wip').hidden = !ex.wip;
  $('setupBody').hidden = !!ex.wip;
  if (ex.wip) return;

  $('adjust').hidden = !!ex.fixed;
  $('rhythmTitle').textContent = ex.bpm ? '呼吸次數' : '每段秒數';
  const rows = ex.bpm
    ? [{ label: '每分鐘', val: bpmOf(ex) + ' 次', i: 0 }]
    : ex.base.map((b, i) => ({ label: b[2], val: fmtS(secs[i]), i }));
  $('phaseRows').innerHTML = '';
  rows.forEach(r => {
    const row = document.createElement('div');
    row.className = 'phase-row';
    row.innerHTML = '<span class="phase-row-label"></span><div class="stepper"><button class="step" aria-label="減少">−</button><span class="step-val"></span><button class="step" aria-label="增加">+</button></div>';
    row.querySelector('.phase-row-label').textContent = r.label;
    row.querySelector('.step-val').textContent = r.val;
    const [dec, inc] = row.querySelectorAll('.step');
    dec.addEventListener('click', () => adj(ex, r.i, -1));
    inc.addEventListener('click', () => adj(ex, r.i, 1));
    $('phaseRows').appendChild(row);
  });
  const r1 = Math.round(cycle * 10) / 10;
  $('cycleText').textContent = ex.bpm
    ? '每 ' + fmtS(r1) + '一吸一吐，吸氣與吐氣各 ' + fmtS(Math.round(cycle * 5) / 10)
    : '一輪 ' + fmtS(r1) + '，' + state.minutes + ' 分鐘約 ' + Math.floor(state.minutes * 60 / cycle) + ' 輪';

  $('minutes').value = state.minutes;
  $('music').innerHTML = '';
  MUSIC.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + (k === state.music ? ' on' : '');
    b.textContent = l;
    b.addEventListener('click', () => { state.music = k; save(); renderSetup(); });
    $('music').appendChild(b);
  });
  $('musicHint').hidden = state.music === 'none';
}

// ---------- 流程 ----------
function clearPhase() { phaseTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); phaseTimers = []; }
function clearAll() {
  clearPhase(); cancelAnimationFrame(raf); stopBreath(); keepAlive.pause();
  timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
}

function open(i) {
  clearAll(); stopMusic(true);
  cur = i;
  renderSetup();
  show('setup');
  screens.setup.scrollTop = 0;
}
function close() {
  clearAll(); stopMusic();
  cur = null;
  show(null);
}

function dotEl(ex) { return ex.id === 'box' ? $('boxDot') : ex.id === 'nostril' ? $('nDot') : null; }
function setDot(el, x, y, dur) {
  el.style.transition = dur ? 'transform ' + dur + 's linear' : 'none';
  el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  if (!dur) void el.offsetWidth;
}

// 跑第 i 個階段；0 秒的階段直接跳過
function run(i) {
  const ex = EX[cur], seq = seqOf(ex), secs = secsOf(ex), [bi, label] = seq[i], t = secs[bi];
  clearPhase();
  const k = ex.base[bi][0];
  if (ex.id === 'belly') { stopBreath(); if (t) drumFx(k === IN); } else breathFx(k, t);
  if (i === 0) waveStart = performance.now();
  const el = dotEl(ex);
  if (el) {
    const by = ex.id === 'nostril' ? 218 : 216;
    const BL = [0, by], TL = [0, 0], TR = [216, 0], BR = [216, by];
    const nc = ex.id === 'nostril' ? [TL, TR, BR, TR, TL, BL][i] : [TL, TR, BR, BL][i % 4];
    if (i === 0) setDot(el, BL[0], BL[1], 0); // 每輪從左下角出發
    setDot(el, nc[0], nc[1], t);
  }
  if (!t) { run((i + 1) % seq.length); return; }
  $('phaseLabel').textContent = label;
  left = t >= 1 ? Math.ceil(t) : null;
  $('countText').textContent = left == null ? '' : left;
  if (t >= 1) phaseTimers.push(setInterval(() => { if (left > 1) left--; $('countText').textContent = left; }, 1000));
  phaseTimers.push(setTimeout(() => run((i + 1) % seq.length), t * 1000));
}

function updateTotal() {
  $('totalText').textContent = fmt(totalLeft);
  $('progress').style.width = Math.min(100, 100 - (totalLeft / (state.minutes * 60)) * 100) + '%';
}

function start() {
  clearAll();
  const ex = EX[cur], total = state.minutes * 60, end = Date.now() + total * 1000;
  ctx(); // 在按下按鈕時就啟用音效，手機瀏覽器才不會擋
  keepAlive.play().catch(() => {});
  if (state.music !== 'none' && !audio) playMusic(state.music);

  $('animBox').hidden = ex.id !== 'box';
  $('animN').hidden = ex.id !== 'nostril';
  fig.toggleAttribute('hidden', ex.id !== 'pursed'); // SVG 元素沒有 .hidden 屬性
  $('animWave').hidden = ['box', 'nostril', 'pursed'].includes(ex.id);
  $('wavePath').setAttribute('d', waveD(ex));
  $('waveG').setAttribute('transform', 'translate(150 0)');
  $('waveDot').style.transform = 'translate(150px,140px)';
  $('cycleSec').textContent = fmtS(Math.round(cycleOf(ex) * 10) / 10);
  const el = dotEl(ex);
  if (el) setDot(el, 0, ex.id === 'nostril' ? 218 : 216, 0);
  $('phaseLabel').textContent = '';
  $('countText').textContent = '';

  totalLeft = total;
  $('progress').style.transition = 'none';
  updateTotal();
  void $('progress').offsetWidth;
  $('progress').style.transition = '';
  bind('minutes', state.minutes);
  show('run');

  waveStart = null;
  raf = requestAnimationFrame(tick);
  timers.push(setTimeout(() => run(0), 60));
  timers.push(setInterval(() => { totalLeft = (end - Date.now()) / 1000; updateTotal(); }, 1000));
  timers.push(setTimeout(() => { clearAll(); stopMusic(); show('done'); }, total * 1000));
}

function stop() {
  clearAll(); stopMusic();
  renderSetup();
  show('setup');
}

// ---------- 事件 ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const a = b.dataset.action;
  if (a === 'close') close();
  else if (a === 'start') start();
  else if (a === 'stop') stop();
  else if (a === 'reset') { const c = { ...state.custom }; delete c[EX[cur].id]; state.custom = c; save(); renderSetup(); }
});
$('minutes').addEventListener('input', e => {
  state.minutes = Math.min(30, Math.max(1, +e.target.value));
  save(); renderSetup();
});

renderHome();
