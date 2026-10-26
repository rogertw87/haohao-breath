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
    base: [[IN, 4, '吸氣'], [HOLD, 4, '閉氣'], [OUT, 4, '吐氣'], [HOLD, 4, '閉氣']],
    seq: [[0, '左鼻吸氣'], [1, '閉氣'], [2, '右鼻吐氣'], [3, '閉氣'], [0, '右鼻吸氣'], [1, '閉氣'], [2, '左鼻吐氣'], [3, '閉氣']] },
  // 冰人呼吸有自己的設定、練習與完成畫面（見下方「冰人呼吸」）
  { id: 'wimhof', name: '冰人呼吸', own: true },
  { id: 'pursed', name: '呼氣練習', desc: '用鼻子吸氣，再把嘴唇噘成圓形，慢慢吐氣。吐氣約為吸氣的兩倍長。',
    base: [[IN, 2, '吸氣', '鼻子吸氣'], [OUT, 6, '吐氣', '圓唇慢吐']] },
  // 重生呼吸：數次短促的小呼吸＋一次深呼吸；base 第 5 欄是吸氣的深度（波形高度，1 = 吸滿）
  { id: 'rebirth', name: '重生呼吸', wip: true, desc: '吸氣與吐氣都用鼻子，相連不停頓。先做數次短促的小呼吸，再接一次較大的深呼吸，依序循環。',
    base: [[IN, 1.5, '小吸氣', '小吸', .55], [OUT, 1.5, '小吐氣', '小吐'], [IN, 4, '大吸氣', '大吸氣'], [OUT, 4, '大吐氣', '大吐氣']] },
  { id: 'res', name: '鯨豚式呼吸', wip: true, desc: '吸氣與吐氣等長，每分鐘約 5.5 次。',
    base: [[IN, 5.5, '吸氣'], [OUT, 5.5, '吐氣']] },
];

// 首頁小圖示：線條 path（32×32）或圖檔
const ICONS = {
  box: 'M16 4L27 10V22L16 28L5 22V10ZM5 10L16 16L27 10M16 16V28',
  478: 'M4 24C8 24 9 9 13 9H19C24 9 25 24 28 24',
  belly: 'M3 16C7 6 11 6 16 16S25 26 29 16',
  nostril: 'M5 16a11 8.5 0 1 0 22 0a11 8.5 0 1 0-22 0M10 16a2.2 3.4 0 1 0 4.4 0a2.2 3.4 0 1 0-4.4 0M17.6 16a2.2 3.4 0 1 0 4.4 0a2.2 3.4 0 1 0-4.4 0',
  rebirth: 'M16 10V24M16 9L13.5 5.5M16 9L18.5 5.5M16 15C13 9 7.5 6.5 5 8.5C3 10.5 5.5 15.5 16 15.5M16 15C19 9 24.5 6.5 27 8.5C29 10.5 26.5 15.5 16 15.5M16 16.5C10 16.5 6.5 19 8 22.5C9.5 25.5 14 22.5 16 18M16 16.5C22 16.5 25.5 19 24 22.5C22.5 25.5 18 22.5 16 18',
  wimhof: 'M16 4V28M5.6 10L26.4 22M5.6 22L26.4 10M13 6.5L16 9L19 6.5M13 25.5L16 23L19 25.5M7.5 7.7L8.2 11.5L4.5 12.9M24.5 24.3L23.8 20.5L27.5 19.1M27.5 12.9L23.8 11.5L24.5 7.7M4.5 19.1L8.2 20.5L7.5 24.3',
};
const ICON_IMGS = { res: 'icons/whale.png', pursed: 'icons/wind.png' };

const MUSIC = [['none', '無'], ['handpan', '手碟'], ['drums', '非洲鼓'], ['underwater', '水下'], ['rain', '雨聲'], ['evening', '傍晚'], ['chant', '持咒'], ['campfire', '營火'], ['rainforest', '雷雨'], ['cat', '貓咪'], ['shurangama', '楞嚴咒心']];
// 每首可以列多個檔案，例如 ['audio/rain.m4a', 'audio/rain.mp3']：先播第一個，載入失敗就換下一個
// 依序輪播的背景音樂：播完接下一個，最後一個播完回到第一個
const MUSIC_LISTS = {
  cat: ['audio/cat1.mp3', 'audio/cat2.mp3', 'audio/cat3.mp3'],
  // 楞嚴咒心：唐密唸法（shurangama2）連續 5 遍，再接一般唸法（shurangama1）5 遍
  shurangama: [...Array(5).fill('audio/shurangama2.mp3'), ...Array(5).fill('audio/shurangama1.mp3')],
};
const MUSIC_FILES = { handpan: 'audio/handpan.mp3', drums: 'audio/drums.mp3', underwater: 'audio/underwater.mp3', rain: 'audio/rain.mp3', evening: 'audio/evening.mp3', chant: 'audio/chant.mp3?v=2', campfire: 'audio/campfire.mp3', rainforest: 'audio/rainforest.mp3' };
// 音檔頭尾本身有淡入淡出的背景音樂：循環時跳過開頭與結尾（秒），兩個播放器無縫接替
const LOOPCUT = { campfire: [1.2, 1.8] };
const KEY = 'haohao-breath-settings';

const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtS = v => (Number.isInteger(v) ? v : v.toFixed(1)) + ' 秒';
const $ = id => document.getElementById(id);

// ---------- 狀態（設定會存在 localStorage） ----------
const state = Object.assign(
  { theme: 'light', custom: {}, minutes: 3, music: 'none', vol: 0.5, wh: {}, whAck: false, whHist: [], log: null, nMode: '3', rMode: '4' },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })()
);
let cur = null;        // 目前練習
let timers = [];       // 整段練習的計時器
let phaseTimers = [];  // 單一階段的計時器
let raf = 0, waveStart = null, totalLeft = 0, left = null;

function save() {
  const { custom, minutes, music, vol, theme, wh, whAck, whHist, log, nMode, rMode } = state;
  try { localStorage.setItem(KEY, JSON.stringify({ custom, minutes, music, vol, theme, wh, whAck, whHist, log, nMode, rMode })); } catch (e) {}
}

// ---------- 今日紀錄（只存在這台裝置，日期換了就重新計算） ----------
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const todayLog = () => (state.log && state.log.date === today() ? state.log.items : {});
function logDone(id, sec) {
  const items = { ...todayLog() }, c = items[id] || { n: 0, sec: 0 };
  items[id] = { n: c.n + 1, sec: c.sec + sec };
  state.log = { date: today(), items };
  save();
}
const mins = sec => Math.max(1, Math.round(sec / 60));
function renderToday() {
  const it = todayLog(), rows = EX.filter(e => it[e.id]).map(e => ({ name: e.name, n: it[e.id].n, sec: it[e.id].sec }));
  const n = rows.reduce((a, r) => a + r.n, 0), sec = rows.reduce((a, r) => a + r.sec, 0);
  $('today').hidden = !n;
  if (!n) return;
  $('todayMin').textContent = mins(sec) + ' 分鐘';
  $('todayN').textContent = '完成 ' + n + ' 次';
  $('todayRows').innerHTML = '';
  rows.forEach(r => {
    const row = document.createElement('div');
    row.className = 'today-row';
    row.innerHTML = '<span></span><span></span>';
    row.children[0].textContent = r.name;
    row.children[1].textContent = r.n + ' 次 · ' + mins(r.sec) + ' 分鐘';
    $('todayRows').appendChild(row);
  });
}

// ---------- 節奏計算 ----------
const bpmOf = ex => { const c = state.custom[ex.id]; return c && c.length === 1 ? c[0] : ex.bpm; };
// 重生呼吸設定的是「小呼吸」「大呼吸」各一吸一吐的總秒數
const rbOf = () => { const c = state.custom.rebirth; return c && c.length === 2 ? c : [1.5, 4]; };
function secsOf(ex) {
  if (ex.id === 'rebirth') { const [a, b] = rbOf(); return [a / 2, a / 2, b / 2, b / 2]; }
  if (ex.fixed) return ex.base.map(b => b[1]);
  if (ex.bpm) { const h = 30 / bpmOf(ex); return [h, h]; }
  const c = state.custom[ex.id];
  // 練習的段數改過的話（例如鼻孔交替呼吸多了一段閉氣），舊的自訂秒數就不再適用
  return c && c.length === ex.base.length ? c : ex.base.map(b => b[1]);
}
// 鼻孔交替呼吸可選三段（吸・閉・吐）或四段（吸・閉・吐・閉）；三段時略過吐氣後的閉氣
const n3 = ex => ex.id === 'nostril' && state.nMode !== '4';
function rbSeq() {
  const q = [];
  for (let j = 1; j <= (state.rMode === '9' ? 9 : 4); j++) q.push([0, '小吸 ' + j], [1, '小吐 ' + j]);
  return q.concat([[2, '大吸氣'], [3, '大吐氣']]);
}
const seqOf = ex => ex.id === 'rebirth' ? rbSeq() : (n3(ex) ? ex.seq.filter(([bi]) => bi !== 3) : ex.seq || ex.base.map((b, i) => [i, b[3] || b[2]]));
const cycleOf = ex => { const s = secsOf(ex); return seqOf(ex).reduce((a, [bi]) => a + s[bi], 0); };

function adj(ex, i, d) {
  if (ex.id === 'rebirth') {
    const c = rbOf().slice();
    c[i] = Math.min(20, Math.max(1, c[i] + d * .5));
    state.custom = { ...state.custom, rebirth: c };
  } else if (ex.bpm) {
    const n = Math.min(12, Math.max(1, bpmOf(ex) + d));
    state.custom = { ...state.custom, [ex.id]: [n] };
  } else {
    const s = secsOf(ex).slice();
    const n = d > 0 ? Math.floor(s[i]) + 1 : Math.ceil(s[i]) - 1;
    s[i] = Math.min(60, Math.max(0, n));
    if (s.slice(0, n3(ex) ? 3 : s.length).every(v => v === 0)) return; // 用到的段不能全部都是 0
    state.custom = { ...state.custom, [ex.id]: s };
  }
  save();
  renderSetup();
}

// ---------- 波形 ----------
function waveSegs(ex) {
  const secs = secsOf(ex); let t = 0, lv = 0; const segs = [];
  seqOf(ex).forEach(([bi]) => {
    const k = ex.base[bi][0], d = secs[bi], to = k === IN ? (ex.base[bi][4] || 1) : k === OUT ? 0 : lv;
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
  p.setAttribute('class', 'fig-puff'); p.setAttribute('stroke-width', '2.5'); p.setAttribute('opacity', '0');
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
let audio = null, fadeIv = 0, loopIv = 0, loopPair = [];
function playMusic(kind) {
  stopMusic(true);
  if (MUSIC_LISTS[kind]) { playList(MUSIC_LISTS[kind]); return; }
  if (kind.startsWith('mine:')) { if (myUrls[kind.slice(5)]) playList([myUrls[kind.slice(5)]]); return; }
  if (!MUSIC_FILES[kind]) return;
  const srcs = [].concat(MUSIC_FILES[kind]);
  const au = new Audio(srcs.shift());
  let switching = false;
  au.onerror = () => { if (srcs.length && audio === au) { switching = true; au.src = srcs.shift(); au.play().catch(() => {}).finally(() => { switching = false; }); } };
  // 被系統停掉（例如切去看影片）時，提示音也一起停
  au.addEventListener('pause', () => { if (audio === au && !switching && !au.error) pauseAllAudio(); });
  au.loop = true; au.volume = 0; au.play().catch(() => {});
  audio = au;
  let v = 0;
  fadeIv = setInterval(() => { v = Math.min(1, v + .05); if (audio) audio.volume = v * state.vol; if (v >= 1) clearInterval(fadeIv); }, 60);
  const cut = LOOPCUT[kind];
  if (cut) {
    // 快播到結尾淡出前，換另一個播放器從淡入之後接著播
    au.loop = false;
    const B = new Audio();
    B.addEventListener('pause', () => { if (audio === B) pauseAllAudio(); });
    loopPair = [au, B];
    loopIv = setInterval(() => {
      const a = audio;
      if (a !== au && a !== B) return;
      if (!B.src && au.currentSrc) B.src = au.currentSrc;
      if (!a.duration || a.paused || a.currentTime < a.duration - cut[1]) return;
      const nx = a === au ? B : au;
      nx.currentTime = cut[0]; nx.volume = a.volume;
      audio = nx; nx.play().catch(() => {}); a.pause();
    }, 40);
  }
}
function playList(list) {
  let k = 0;
  const au = new Audio(list[0]);
  const next = () => {
    if (audio !== au) return;
    k = (k + 1) % list.length;
    // 下一首是同一個檔案就從頭重播，不必重新載入
    if (au.src.endsWith(list[k])) au.currentTime = 0; else au.src = list[k];
    au.play().catch(() => {});
  };
  au.onended = next; au.onerror = next;
  // 播完一首時也會觸發 pause，那不算被系統停掉
  au.addEventListener('pause', () => { if (audio === au && !au.ended && !au.error) pauseAllAudio(); });
  au.volume = 0; au.play().catch(() => {});
  audio = au;
  let v = 0;
  fadeIv = setInterval(() => { v = Math.min(1, v + .05); if (audio) audio.volume = v * state.vol; if (v >= 1) clearInterval(fadeIv); }, 60);
}
function stopMusic(immediate) {
  clearInterval(fadeIv); clearInterval(loopIv);
  const au = audio; audio = null;
  loopPair.forEach(a => { if (a !== au) a.pause(); }); loopPair = [];
  if (!au) return;
  if (immediate) { au.pause(); return; }
  const from = au.volume, t0 = performance.now();
  const iv = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / 600);
    au.volume = from * (1 - p);
    if (p >= 1) { clearInterval(iv); au.pause(); }
  }, 30);
}

// ---------- 我的錄音（使用者自己上傳，只存在這台裝置的瀏覽器裡，不會上傳到網站） ----------
const MINE_MAX = 10, MINE_MB = 60;
let mine = [];        // [{ id, name }]
const myUrls = {};    // id → 播放用的網址
const stripExt = n => String(n || '').replace(/\.[^.]+$/, '') || '錄音';
function idb(mode, fn) {
  return new Promise((ok, no) => {
    const r = indexedDB.open('haohao-mine', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('f');
    r.onerror = () => no(r.error);
    r.onsuccess = () => {
      const tx = r.result.transaction('f', mode), q = fn(tx.objectStore('f'));
      tx.oncomplete = () => ok(q && q.result);
      tx.onerror = () => no(tx.error);
    };
  });
}
function loadMine() {
  const keys = [], vals = [];
  return idb('readonly', st => {
    const c = st.openCursor();
    c.onsuccess = () => { const cur = c.result; if (cur) { keys.push(cur.key); vals.push(cur.value); cur.continue(); } };
  }).then(() => {
    mine = [];
    keys.forEach((k, i) => {
      const v = vals[i];
      if (v && v.blob) { myUrls[k] = URL.createObjectURL(v.blob); mine.push({ id: String(k), name: stripExt(v.name) }); }
    });
  }).catch(() => {}).then(() => {
    // 選的錄音已經不在了（例如清除過瀏覽器資料），改回「無」
    if (state.music.startsWith('mine:') && !myUrls[state.music.slice(5)]) { state.music = 'none'; save(); }
    if (cur != null && !screens.setup.hidden) renderSetup();
  });
}
function addMine(f) {
  if (f.size > MINE_MB * 1024 * 1024) { alert('檔案太大，請選 ' + MINE_MB + 'MB 以下的錄音。'); return; }
  const id = Date.now().toString(36);
  idb('readwrite', st => st.put({ blob: f, name: f.name }, id)).then(() => {
    myUrls[id] = URL.createObjectURL(f);
    mine.push({ id, name: stripExt(f.name) });
    state.music = 'mine:' + id; save(); renderSetup();
  }).catch(() => alert('無法儲存這個檔案，請換一個試試。'));
}
function delMine(m) {
  if (!confirm('要刪除「' + m.name + '」嗎？')) return;
  idb('readwrite', st => st.delete(m.id)).catch(() => {});
  if (myUrls[m.id]) URL.revokeObjectURL(myUrls[m.id]);
  delete myUrls[m.id];
  mine = mine.filter(x => x.id !== m.id);
  if (state.music === 'mine:' + m.id) { state.music = 'none'; save(); }
  renderSetup();
}
$('mineFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) addMine(f); });

// ---------- 節拍音效（即時合成） ----------
let ac = null, noiseBuf = null, breath = null;
function ctx() {
  if (!ac) {
    // iPhone 靜音模式下仍要播放音效（Safari 17+）
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ac = new (window.AudioContext || window.webkitAudioContext)();
    // 提示音被系統中斷時，背景音樂也一起停
    ac.onstatechange = () => { if (ac.state !== 'running' && practicing() && !syncPaused) pauseAllAudio(); };
    // 在點擊當下播一段無聲，解鎖手機上的音效
    const s = ac.createBufferSource();
    s.buffer = ac.createBuffer(1, 1, ac.sampleRate);
    s.connect(ac.destination); s.start(0);
  }
  if (ac.state === 'suspended' || ac.state === 'interrupted') ac.resume();
  return ac;
}

// ---------- 背景音樂與提示音保持一致 ----------
// 練習中只要其中一個被系統停掉，另一個也跟著停；回到網頁時兩個一起恢復
let syncPaused = false;
const practicing = () => !screens.run.hidden || !$('whRun').hidden || !$('whHold').hidden;
const showResumeTip = on => document.querySelectorAll('.resume-tip').forEach(b => { b.hidden = !on; });
function pauseAllAudio() {
  if (!practicing() || syncPaused) return;
  syncPaused = true;
  stopCue();
  if (audio && !audio.paused) audio.pause();
  if (ac && ac.state === 'running') ac.suspend();
  keepAlive.pause();
  showResumeTip(true);
}
const audioStopped = () => (ac && ac.state !== 'running') || (audio && audio.paused);
let resumeCheck = 0;
function resumeAllAudio() {
  clearTimeout(resumeCheck);
  if (!practicing()) { syncPaused = false; return; }
  syncPaused = false;
  showResumeTip(false);
  if (ac && ac.state !== 'running') ac.resume().catch(() => {});
  if (audio && audio.paused) audio.play().catch(() => {});
  keepAlive.play().catch(() => {});
  // iPhone 不允許網頁自己恢復聲音，失敗的話顯示「點一下繼續」
  resumeCheck = setTimeout(() => { if (practicing() && audioStopped()) { syncPaused = false; pauseAllAudio(); } }, 800);
}
function onReturn() {
  if (!document.hidden && practicing() && (syncPaused || audioStopped())) resumeAllAudio();
}
document.addEventListener('visibilitychange', onReturn);
window.addEventListener('pageshow', onReturn);
window.addEventListener('focus', onReturn);

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
  try {
    // 從目前音量淡出，避免直接跳回預定值造成「啪」一聲
    const gn = b.g.gain;
    if (gn.cancelAndHoldAtTime) gn.cancelAndHoldAtTime(t);
    else { const v = gn.value; gn.cancelScheduledValues(t); gn.setValueAtTime(v, t); }
    gn.setTargetAtTime(0, t, .08);
    b.s.stop(t + .5);
  } catch (e) {}
}
// 諧振式呼吸：每段開頭敲一下鼓（吸氣高音、吐氣低音）
function drumFx(high) {
  if (syncPaused) return; // 暫停中不要排入聲音，否則恢復時會一次全部響起
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
// 其他練習：每段開頭播放提示音（吸氣、停住、吐氣各一個音檔）
const cueBufs = {};
let cueSrc = null;
function loadCues() {
  ctx();
  ['in', 'out', 'hold'].forEach(key => {
    if (!cueBufs[key]) cueBufs[key] = fetch('audio/cue-' + key + '.wav')
      .then(r => r.arrayBuffer()).then(a => ac.decodeAudioData(a)).catch(() => null);
  });
}
function cueFx(k, gain) {
  if (syncPaused) return;
  loadCues();
  const key = k === IN ? 'in' : k === OUT ? 'out' : 'hold';
  cueBufs[key].then(b => {
    if (!b) return;
    const s = ac.createBufferSource(), g = ac.createGain();
    g.gain.value = gain || .6; s.buffer = b;
    s.connect(g); g.connect(ac.destination); s.start();
    cueSrc = { s, g };
  });
}
function stopCue() {
  const c = cueSrc; if (!c) return;
  cueSrc = null;
  const t = ac.currentTime;
  try { c.g.gain.setTargetAtTime(0, t, .08); c.s.stop(t + .4); } catch (e) {}
}

// ---------- 畫面 ----------
const screens = { setup: $('setup'), run: $('run'), done: $('done'), whSetup: $('whSetup'), whRun: $('whRun'), whHold: $('whHold'), whDone: $('whDone') };
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
    row.className = 'row' + (ex.wip ? ' row-wip' : '');
    const icon = document.createElement('div');
    icon.className = 'row-icon';
    if (ICON_IMGS[ex.id]) {
      icon.innerHTML = '<img src="' + ICON_IMGS[ex.id] + '" alt="">';
    } else {
      icon.innerHTML = '<svg viewBox="0 0 32 32"><path d="' + ICONS[ex.id] + '" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    }
    const name = document.createElement('span');
    name.className = 'row-name';
    name.textContent = ex.label || ex.name;
    const main = document.createElement('div');
    main.className = 'row-main';
    main.append(icon, name);
    row.append(main);
    if (ex.wip) {
      // 還沒做好的練習：灰掉、標示「未上架」，不能點
      row.setAttribute('aria-disabled', 'true');
      const tag = document.createElement('span');
      tag.className = 'row-tag'; tag.textContent = '未上架';
      row.append(tag);
    } else row.addEventListener('click', () => open(i));
    list.appendChild(row);
  });
}

const MODES = {
  nostril: { key: 'nMode', def: '3', opts: [['3', '三段（吸・閉・吐）'], ['4', '四段（吸・閉・吐・閉）']] },
  rebirth: { key: 'rMode', def: '4', opts: [['4', '四小一大'], ['9', '九小一大']] },
};
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
  const rows = ex.id === 'rebirth'
    ? [['小呼吸（一吸一吐）', 0], ['大呼吸（一吸一吐）', 1]].map(([label, i]) => ({ label, val: fmtS(rbOf()[i]), i }))
    : ex.bpm
    ? [{ label: '每分鐘', val: bpmOf(ex) + ' 次', i: 0 }]
    : (n3(ex) ? ex.base.slice(0, 3) : ex.base).map((b, i) => ({ label: b[2], val: fmtS(secs[i]), i }));
  // 練習方式：鼻孔交替呼吸（三段／四段）、重生呼吸（四小一大／九小一大）
  const modes = MODES[ex.id];
  $('nModeBox').hidden = !modes;
  $('nModes').innerHTML = '';
  if (modes) modes.opts.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + ((state[modes.key] || modes.def) === k ? ' on' : '');
    b.textContent = l;
    b.addEventListener('click', () => { state[modes.key] = k; save(); renderSetup(); });
    $('nModes').appendChild(b);
  });
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
  const opts = MUSIC.concat(mine.map(m => ['mine:' + m.id, m.name]));
  opts.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + (k === state.music ? ' on' : '');
    b.textContent = l; b.title = l;
    b.addEventListener('click', () => { state.music = k; save(); renderSetup(); });
    $('music').appendChild(b);
  });
  if (mine.length < MINE_MAX) {
    const b = document.createElement('button');
    b.className = 'music-opt music-upload';
    b.textContent = '＋ 上傳錄音';
    b.addEventListener('click', () => $('mineFile').click());
    $('music').appendChild(b);
  }
  $('mineBox').hidden = !mine.length;
  $('mineRows').innerHTML = '';
  mine.forEach(m => {
    const row = document.createElement('div');
    row.className = 'mine-row';
    row.innerHTML = '<span></span><button>刪除</button>';
    row.firstChild.textContent = m.name;
    row.lastChild.addEventListener('click', () => delMine(m));
    $('mineRows').appendChild(row);
  });
  $('musicHint').hidden = state.music === 'none';
}

// ---------- 流程 ----------
function clearPhase() { phaseTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); phaseTimers = []; }
function clearAll() {
  clearPhase(); cancelAnimationFrame(raf); stopBreath(); stopCue(); keepAlive.pause(); syncPaused = false; clearTimeout(resumeCheck); showResumeTip(false);
  timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
}

function open(i) {
  clearAll(); stopMusic(true);
  cur = i;
  if (EX[i].own) { whOpen(); return; }
  renderSetup();
  show('setup');
  screens.setup.scrollTop = 0;
}
function close() {
  clearAll(); stopMusic(); releaseWake();
  cur = null;
  renderToday();
  show(null);
  $('whSafety').hidden = true;
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
  stopBreath();
  if (t) { if (ex.id === 'belly') drumFx(k === IN); else cueFx(k); }
  if (i === 0) waveStart = performance.now();
  const el = dotEl(ex);
  if (el) {
    const by = ex.id === 'nostril' ? 218 : 216;
    const BL = [0, by], TL = [0, 0], TR = [216, 0], BR = [216, by];
    const nc = ex.id === 'nostril' ? (n3(ex) ? [TL, TR, BR, TR, TL, BL] : [TL, TR, BR, BR, TR, TL, BL, BL])[i] : [TL, TR, BR, BL][i % 4];
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
  // 按下開始後先等 2.5 秒（讓音樂先進來、準備好），再開始第一段
  const LEAD = 2500;
  const ex = EX[cur], total = state.minutes * 60, end = Date.now() + LEAD + total * 1000;
  ctx(); // 在按下按鈕時就啟用音效，手機瀏覽器才不會擋
  loadCues();
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
  timers.push(setTimeout(() => run(0), LEAD));
  timers.push(setInterval(() => { totalLeft = Math.min(total, (end - Date.now()) / 1000); updateTotal(); }, 1000));
  timers.push(setTimeout(() => { clearAll(); stopMusic(); logDone(ex.id, total); show('done'); }, LEAD + total * 1000));
}

function stop() {
  clearAll(); stopMusic();
  renderSetup();
  show('setup');
}

// ---------- 冰人呼吸 ----------
// 換氣（快速深呼吸）→ 吐氣後閉氣（自己決定何時吸氣）→ 深吸一口憋 15 秒 → 吐氣，重複數輪
const WH_DEF = { breaths: 30, rounds: 3, mode: 'free', sound: true, vibe: true };
const WH_PACE = [1.7, 1.3];        // 每口吸、吐秒數
const WH_VIDEO = [60, 90, 120];    // 「跟隨影片節奏」每輪閉氣目標
const fmtUp = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const whCfg = () => Object.assign({}, WH_DEF, state.wh || {});
const wh = { phase: null, round: 1, now: 1, holds: [], t0: 0, paused: false };
let wakeLock = null;

function whSet(k, v) { state.wh = { ...whCfg(), [k]: v }; save(); whRenderSetup(); }
function whRenderSetup() {
  const c = whCfg();
  $('whBreaths').textContent = c.breaths;
  $('whRounds').textContent = c.rounds;
  $('whHoldDesc').textContent = c.mode === 'video' ? '1:00 起' : '自己決定';
  const rows = [
    ['呼吸次數', c.breaths + ' 次', () => whSet('breaths', Math.max(20, c.breaths - 5)), () => whSet('breaths', Math.min(40, c.breaths + 5))],
    ['輪數', c.rounds + ' 輪', () => whSet('rounds', Math.max(1, c.rounds - 1)), () => whSet('rounds', Math.min(5, c.rounds + 1))],
  ];
  $('whRows').innerHTML = '';
  rows.forEach(([label, val, dec, inc]) => {
    const row = document.createElement('div');
    row.className = 'phase-row';
    row.innerHTML = '<span class="phase-row-label"></span><div class="stepper"><button class="step" aria-label="減少">−</button><span class="step-val"></span><button class="step" aria-label="增加">+</button></div>';
    row.querySelector('.phase-row-label').textContent = label;
    row.querySelector('.step-val').textContent = val;
    const [d, i] = row.querySelectorAll('.step');
    d.addEventListener('click', dec); i.addEventListener('click', inc);
    $('whRows').appendChild(row);
  });
  $('whModes').innerHTML = '';
  [['free', '自由模式'], ['video', '跟隨影片節奏']].forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + (c.mode === k ? ' on' : '');
    b.textContent = l;
    b.addEventListener('click', () => whSet('mode', k));
    $('whModes').appendChild(b);
  });
  $('whModeNote').textContent = c.mode === 'video'
    ? '每輪閉氣依序為 1:00、1:30、2:00，時間到會提示吸氣。不舒服就提早吸氣。'
    : '閉氣時碼表往上數，不設目標。想吸氣時按下按鈕即可。';
  $('whToggles').innerHTML = '';
  [['sound', '聲音'], ['vibe', '震動']].forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'wh-toggle' + (c[k] ? ' on' : '');
    b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', c[k]);
    b.innerHTML = '<span></span><span class="wh-switch"></span>';
    b.firstChild.textContent = l;
    b.addEventListener('click', () => whSet(k, !c[k]));
    $('whToggles').appendChild(b);
  });
}
function whOpen() {
  whRenderSetup();
  show('whSetup');
  screens.whSetup.scrollTop = 0;
  if (!state.whAck) whSafety(true);
}
function whSafety(on) {
  $('whSafety').hidden = !on;
  $('whChk').checked = false; $('whAckBtn').disabled = true;
  $('whAckBox').hidden = !!state.whAck;
  $('whSafetyClose').hidden = !state.whAck;
}
$('whChk').addEventListener('change', e => { $('whAckBtn').disabled = !e.target.checked; });

// 聲音與震動
const whSound = () => whCfg().sound && !syncPaused;
function buzz(p) { if (whCfg().vibe && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }
function tone(f, d, v, type) {
  if (!whSound()) return;
  ctx();
  const now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(v, now + .01); g.gain.exponentialRampToValueAtTime(.0001, now + d);
  o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + d + .05);
}
function bell(f) { [[1, .14, 2.6], [2.76, .04, 1.5], [5.4, .015, .8]].forEach(([m, v, d]) => tone(f * m, d, v)); }
function whCue(k) { if (whSound()) cueFx(k, .35); }
// 人聲呼吸錄音（audio/breath-in.mp3、breath-out.mp3）；錄音音量小，載入時自動放大。沒有檔案時改用輕柔的短音
const breathBufs = {};
function loadBreath(b) {
  return breathBufs[b] || (breathBufs[b] = fetch('audio/breath-' + b + '.mp3')
    .then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
    .then(a => new Promise((ok, no) => ac.decodeAudioData(a, ok, no)))
    .then(buf => {
      let pk = 0;
      for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; } }
      buf.norm = pk > 0 ? Math.min(80, .6 / pk) : 1;
      return buf;
    }).catch(() => null));
}
function breathCue(k) {
  if (!whSound()) return;
  const run = wh.run;
  loadBreath(k === IN ? 'in' : 'out').then(buf => {
    if (wh.run !== run || !whSound()) return;
    if (!buf) { tone(k === IN ? 392 : 330, .35, .05); return; }
    const now = ac.currentTime, s = ac.createBufferSource(), g = ac.createGain(), gv = .8 * buf.norm;
    s.buffer = buf;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(gv, now + .03);
    // 吸氣錄音在最後一刻才結束，加一段柔和收尾，避免聽起來被切斷
    if (k === IN) { const e = now + buf.duration; g.gain.setValueAtTime(gv, e - .45); g.gain.exponentialRampToValueAtTime(gv * .02, e); }
    s.connect(g); g.connect(ac.destination); s.start(now, k === IN ? 0 : .15);
  });
}

// 練習中螢幕不要自動變暗
function lockWake() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { wakeLock = l; }).catch(() => {}); } catch (e) {} }
function releaseWake() { try { if (wakeLock) wakeLock.release(); } catch (e) {} wakeLock = null; }
document.addEventListener('visibilitychange', () => { if (!document.hidden && wh.phase && (!$('whRun').hidden || !$('whHold').hidden)) lockWake(); });

// 呼吸圓圈
function circ(sc, dur, ease) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = $('whCirc');
    el.style.transition = dur ? 'transform ' + dur + 's ' + ease : 'none';
    el.style.transform = 'scale(' + sc + ')';
  }));
}
function whAt(fn, abs) { phaseTimers.push(setTimeout(fn, Math.max(0, abs - performance.now()))); }
function whText(big, small, label, hint) {
  $('whBig').textContent = big; $('whSmall').textContent = small;
  $('whLabel').textContent = label; $('whHint').textContent = hint;
}
function whRoundText() { bind('whRound', '第 ' + wh.round + ' 輪 / 共 ' + whCfg().rounds + ' 輪'); }
function whPausedUi(on) {
  wh.paused = on;
  $('whPauseBtn').hidden = on; $('whResumeBtn').hidden = !on;
}

function whStart() {
  clearAll(); stopMusic(true);
  $('whSafety').hidden = true;
  ctx(); loadCues(); loadBreath('in'); loadBreath('out');
  keepAlive.play().catch(() => {});
  lockWake();
  wh.holds = []; wh.run = {}; wh.start = performance.now();
  whPausedUi(false);
  whBetween(1);
}
function whBetween(r) {
  clearPhase();
  wh.phase = 'between'; wh.round = r; whRoundText();
  show('whRun');
  whText('', '', '第 ' + r + ' 輪', '準備開始換氣');
  circ(.35, .6, 'ease');
  whAt(() => whBreathe(1), performance.now() + 2500);
}
function whBreathe(n) {
  clearPhase();
  const c = whCfg(), [ti, te] = WH_PACE;
  wh.phase = 'breathe';
  const step = (i, t0) => {
    wh.now = i;
    whText(String(i), '/ ' + c.breaths, '吸飽', c.breaths - i < 3 ? '最後幾口，準備吐氣後停住' : '');
    circ(1, ti, 'cubic-bezier(.3,.1,.4,1)');
    if (i === c.breaths) bell(523.25);
    breathCue(IN);
    whAt(() => { $('whLabel').textContent = '放鬆吐出'; circ(.35, te, 'cubic-bezier(.5,0,.8,.6)'); breathCue(OUT); }, t0 + ti * 1000);
    const t1 = t0 + (ti + te) * 1000;
    whAt(() => (i < c.breaths ? step(i + 1, t1) : whHold()), t1);
  };
  step(n, performance.now());
}
function whHold() {
  clearPhase();
  const tgt = whCfg().mode === 'video' ? WH_VIDEO[Math.min(wh.round, 3) - 1] : 0;
  wh.phase = 'hold'; wh.t0 = performance.now();
  $('whHoldTime').textContent = '0:00';
  $('whTarget').hidden = !tgt;
  $('whTarget').textContent = tgt ? fmtUp(tgt) + ' 時提示吸氣，不舒服就提早吸氣' : '';
  show('whHold');
  buzz(60); whCue(HOLD);
  let k = 1;
  phaseTimers.push(setInterval(() => {
    const e = (performance.now() - wh.t0) / 1000;
    $('whHoldTime').textContent = fmtUp(e);
    if (e >= 30 * k) { k++; tone(660, .5, .05); } // 每 30 秒輕響一聲
    if (tgt && e >= tgt) whBreatheIn();
  }, 250));
}
function whBreatheIn() {
  if (wh.phase !== 'hold') return;
  wh.holds.push((performance.now() - wh.t0) / 1000);
  whRecover();
}
function whRecover() {
  clearPhase();
  wh.phase = 'recover';
  show('whRun');
  whText('15', '', '深吸一口氣，憋住', '');
  circ(1, 1.6, 'ease-out'); whCue(IN); buzz(60);
  const T = performance.now();
  for (let s = 1; s <= 15; s++) whAt(() => {
    const left = 15 - s;
    if (left > 0) { $('whBig').textContent = left; if (left <= 3) { tone(880, .12, .12, 'triangle'); buzz(80); } }
    else whRest();
  }, T + s * 1000);
}
function whRest() {
  clearPhase();
  wh.phase = 'rest';
  whText('', '', '吐氣', '放鬆，準備下一輪');
  circ(.35, 3, 'ease-in-out'); whCue(OUT);
  whAt(() => {
    bell(392);
    if (wh.round < whCfg().rounds) whBetween(wh.round + 1);
    else { logDone('wimhof', (performance.now() - wh.start) / 1000); whDone(); } // 全部輪數練完才算一次
  }, performance.now() + 4000);
}
function whDone() {
  clearAll(); releaseWake();
  wh.phase = null; wh.run = null;
  const h = wh.holds.slice();
  if (h.length) { state.whHist = [...(state.whHist || []), { d: Date.now(), h: h.map(x => Math.round(x)) }].slice(-50); save(); }
  $('whResultsBox').hidden = !h.length;
  $('whResults').innerHTML = '';
  h.forEach((x, i) => {
    const row = document.createElement('div');
    row.className = 'wh-result';
    row.innerHTML = '<span></span><span></span>';
    row.children[0].textContent = '第 ' + (i + 1) + ' 輪';
    row.children[1].textContent = fmtUp(x);
    $('whResults').appendChild(row);
  });
  show('whDone');
}
function whStop() {
  stopCue();
  if (wh.holds.length) { whDone(); return; }
  clearAll(); releaseWake();
  wh.phase = null; wh.run = null;
  whRenderSetup(); show('whSetup');
}
function whPause() {
  clearPhase(); stopCue();
  circ(.35, .4, 'ease');
  whPausedUi(true);
  whText('', '', '已暫停', '按「繼續」接著練習');
}
function whResume() {
  whPausedUi(false);
  const p = wh.phase, r = wh.round;
  if (p === 'breathe') whBreathe(wh.now || 1);
  else if (p === 'recover') whRecover();
  else if (p === 'between') whBetween(r);
  else if (r < whCfg().rounds) whBetween(r + 1);
  else whDone();
}
function whAction(a) {
  if (a === 'start') whStart();
  else if (a === 'stop') whStop();
  else if (a === 'pause') whPause();
  else if (a === 'resume') whResume();
  else if (a === 'in') whBreatheIn();
  else if (a === 'safety') whSafety(true);
  else if (a === 'safety-close') $('whSafety').hidden = true;
  else if (a === 'ack') { if ($('whChk').checked) { state.whAck = true; save(); $('whSafety').hidden = true; } }
  else if (a === 'open') {
    const on = $('whSettings').hidden;
    $('whSettings').hidden = !on;
    $('whOpenSign').textContent = on ? '－' : '＋';
    document.querySelector('[data-action="wh-open"]').setAttribute('aria-expanded', on);
  }
}

// ---------- 事件 ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const a = b.dataset.action;
  if (a === 'close') close();
  else if (a === 'start') start();
  else if (a === 'stop') stop();
  else if (a === 'resume') resumeAllAudio();
  else if (a.startsWith('install-')) installAction(a.slice(8), e);
  else if (a.startsWith('wh-')) whAction(a.slice(3));
  else if (a === 'reset') { const c = { ...state.custom }; delete c[EX[cur].id]; state.custom = c; save(); renderSetup(); }
});
$('minutes').addEventListener('input', e => {
  state.minutes = Math.min(30, Math.max(1, +e.target.value));
  save(); renderSetup();
});

// ---------- 加到手機桌面 ----------
let installEvt = null; // Android／電腦 Chrome 可以直接跳出安裝視窗
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
window.addEventListener('appinstalled', () => { installEvt = null; $('installSheet').hidden = true; });
function platform() {
  const u = navigator.userAgent || '';
  if (/Line\//i.test(u) || /FBAN|FBAV|Instagram/i.test(u)) return 'inapp';
  if (/iPhone|iPad|iPod/i.test(u) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(u)) return 'android';
  return 'desktop';
}
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
function installInfo() {
  const p = platform();
  if (p === 'inapp') return ['目前在 LINE 或其他 App 裡開啟', ['點右上角或右下角的「⋯」或分享按鈕', '選「用預設瀏覽器開啟」或「在 Safari／Chrome 中開啟」', '在瀏覽器裡再點一次選單的「加到手機桌面」']];
  if (p === 'ios') return ['iPhone／iPad（請用 Safari 開啟）', ['點畫面下方（或網址列旁）的分享按鈕：方框加向上箭頭', '往下滑，點「加入主畫面」', '點右上角「新增」，桌面就會出現好好呼吸的圖示']];
  if (p === 'android') return ['Android（建議用 Chrome 開啟）', installEvt ? ['點下方「立即加入」', '在跳出的視窗點「安裝」或「新增」'] : ['點右上角的「⋮」選單', '點「加到主畫面」或「安裝應用程式」', '點「新增」，桌面就會出現好好呼吸的圖示']];
  return ['電腦瀏覽器', installEvt ? ['點下方「立即加入」'] : ['手機打開這個網址後，再點選單的「加到手機桌面」', '電腦版 Chrome／Edge 可點網址列右側的安裝圖示']];
}
function installAction(a, e) {
  if (a === 'open') {
    setMenu(false);
    const [title, steps] = installInfo();
    $('installTitle').textContent = title;
    $('installSteps').innerHTML = '';
    steps.forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<span class="install-n"></span><span></span>';
      li.children[0].textContent = i + 1; li.children[1].textContent = t;
      $('installSteps').appendChild(li);
    });
    $('installGo').hidden = !installEvt;
    $('installSheet').hidden = false;
  } else if (a === 'close') {
    // 點視窗內容不關閉，只有點背景或「知道了」才關
    if (e.target.closest('.sheet') && !e.target.closest('.install-ok')) return;
    $('installSheet').hidden = true;
  } else if (a === 'prompt' && installEvt) {
    const ev = installEvt; installEvt = null;
    ev.prompt();
    ev.userChoice.finally(() => { $('installSheet').hidden = true; });
  }
}
// 已經從桌面圖示打開的話，就不顯示這個選項
$('installItem').hidden = isStandalone();

// ---------- 配色（首頁選單：淺色、深色、夜空；顏色在 styles.css） ----------
const THEMES = ['light', 'dark', 'night'];
// 夜空：一次畫成一張完整的星空圖（銀河、小星、少數亮星光暈），當作背景圖
let _starUrl=null;let _starV=2;const starTex=()=>{if(_starUrl)return _starUrl;try{const W=480,H=1000,k=2,c=document.createElement('canvas');c.width=W*k;c.height=H*k;const x=c.getContext('2d');x.scale(k,k);let r=11;const R=()=>(r=(r*16807)%2147483647)/2147483647,G=()=>(R()+R()+R()+R()-2)/2;
  const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#000000');bg.addColorStop(1,'#000000');x.fillStyle=bg;x.fillRect(0,0,W,H);
  const ax=-60,ay=H*.92,bx=W+60,by=H*.08,dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,band=t=>[ax+dx*t,ay+dy*t];
  const blob=(px,py,rad,col)=>{const g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-rad,py-rad,rad*2,rad*2);};
  const hs=(i,j,s)=>{let h=(Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(s,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;};
  const vn=(X,Y,s)=>{const i=Math.floor(X),j=Math.floor(Y),fx=X-i,fy=Y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=hs(i,j,s),b=hs(i+1,j,s),c2=hs(i,j+1,s),d=hs(i+1,j+1,s);return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v;};
  const fbm=(X,Y,s)=>{let t=0,am=.5,f=1;for(let o=0;o<5;o++){t+=am*vn(X*f,Y*f,s+o);f*=2.03;am*=.5;}return t;};
  const GW=240,GH=Math.round(GW*H/W),gc=document.createElement('canvas');gc.width=GW;gc.height=GH;const gx=gc.getContext('2d'),im=gx.createImageData(GW,GH),MI=new Float32Array(GW*GH);
  for(let gy=0;gy<GH;gy++)for(let gp=0;gp<GW;gp++){const px=gp/GW*W,py=gy/GH*H,rx=px-ax,ry=py-ay,t=(rx*dx+ry*dy)/(len*len),d0=rx*nx+ry*ny;
    const d=d0-(fbm(t*3,7.3,40)-.5)*70,core=Math.exp(-Math.pow((t-.6)/.16,2)),wid=50+45*core;
    const prof=Math.exp(-(d*d)/(2*wid*wid)),along=.4+.6*Math.exp(-Math.pow((t-.55)/.35,2)),n=fbm(px/70,py/70,1),n2=fbm(px/20,py/20,9);
    let I=prof*along*Math.pow(n,2.2)*2.2*(.55+.9*n2)+core*Math.exp(-(d*d)/(2*30*30))*1.1*Math.pow(n,1.5)*1.6;
    const dn=fbm(px/40+3,py/40,20),lane=Math.exp(-Math.pow((d-4-(dn-.5)*50)/(16+22*core),2)),dust=Math.min(1,Math.max(0,(dn-.3)*2.2))*lane*Math.min(1,.35+t*1.4);
    I*=1-.95*dust;I*=1-Math.max(0,fbm(px/12,py/12,30)-.5)*prof*1.3;MI[gy*GW+gp]=I;
    const w=core,o=(gy*GW+gp)*4,v=Math.min(1,I);im.data[o]=Math.min(255,(150+110*w)*v);im.data[o+1]=Math.min(255,(165+50*w)*v);im.data[o+2]=Math.min(255,(235-75*w)*v);im.data[o+3]=255;}
  gx.putImageData(im,0,0);x.globalCompositeOperation='lighter';x.imageSmoothingEnabled=true;x.globalAlpha=.38;x.filter='blur(1.5px)';x.drawImage(gc,0,0,W,H);x.filter='none';x.globalAlpha=.2;x.drawImage(gc,0,0,W,H);x.globalAlpha=1;x.globalCompositeOperation='source-over';
  const MIat=(px,py)=>MI[Math.min(GH-1,Math.max(0,Math.floor(py/H*GH)))*GW+Math.min(GW-1,Math.max(0,Math.floor(px/W*GW)))];
  const star=(px,py,m)=>{const tc=R(),col=tc<.12?'170,195,255':tc<.25?'205,220,255':tc<.85?'255,255,255':tc<.95?'255,236,200':'255,205,160',rad=.22+m*1.05,a=Math.min(1,.18+m*.9);x.fillStyle='rgba('+col+','+a.toFixed(2)+')';x.beginPath();x.arc(px,py,rad,0,Math.PI*2);x.fill();
    if(m>.8){blob(px,py,3+m*5,'rgba('+col+','+(0.25*m).toFixed(2)+')');if(m>.93){x.strokeStyle='rgba('+col+',.22)';x.lineWidth=.4;x.beginPath();x.moveTo(px-7,py);x.lineTo(px+7,py);x.moveTo(px,py-7);x.lineTo(px,py+7);x.stroke();}}};
  for(let j=0;j<1700;j++)star(R()*W,R()*H,Math.pow(R(),3.2));
  for(let j=0,m=0;j<400000&&m<26000;j++){const px=R()*W,py=R()*H;if(R()<Math.min(1,MIat(px,py)*1.6)){const a=.12+R()*.3,cc=R();x.fillStyle=cc<.3?'rgba(200,212,255,'+a.toFixed(2)+')':cc<.85?'rgba(255,255,255,'+a.toFixed(2)+')':'rgba(255,225,190,'+a.toFixed(2)+')';const z=R()<.8?.5:.8;x.fillRect(px,py,z,z);m++;}}
  for(let j=0,m=0;j<80000&&m<4000;j++){const px=R()*W,py=R()*H;if(R()<Math.min(1,MIat(px,py)*1.4)){star(px,py,Math.pow(R(),5)*.6);m++;}}
  for(let j=0;j<22;j++)star(R()*W,R()*H*.9,.85+R()*.15);
  _starUrl='url('+c.toDataURL('image/jpeg',.9)+')';}catch(e){_starUrl='none';}return _starUrl;};
function applyTheme() {
  const t = THEMES.includes(state.theme) ? state.theme : 'light', root = document.documentElement;
  if (t === 'light') delete root.dataset.theme; else root.dataset.theme = t;
  if (t === 'night') root.style.setProperty('--sky', starTex()); else root.style.removeProperty('--sky');
  document.querySelectorAll('[data-theme-pick]').forEach(b => b.classList.toggle('on', b.dataset.themePick === t));
}
document.querySelectorAll('[data-theme-pick]').forEach(b => b.addEventListener('click', () => {
  state.theme = b.dataset.themePick;
  save(); applyTheme();
}));

// ---------- 首頁右上角選單 ----------
function setMenu(open) {
  $('menuPop').hidden = !open;
  $('menuBtn').setAttribute('aria-expanded', open);
}
$('menuBtn').addEventListener('click', () => setMenu($('menuPop').hidden));
document.addEventListener('click', e => { if (!e.target.closest('#menu')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

applyTheme();
renderHome();
renderToday();
loadMine();
