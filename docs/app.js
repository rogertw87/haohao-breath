'use strict';

// ---------- 練習資料 ----------
// base: [種類, 預設秒數, 設定頁標籤, 練習中提示(省略時同設定頁標籤)]
const IN = 'in', HOLD = 'hold', OUT = 'out';
const EX = [
  { id: 'box', name: '方塊呼吸', desc: '吸氣、閉氣、吐氣、閉氣，各段等長。',
    base: [[IN, 4, '吸氣'], [HOLD, 4, '吸氣後閉氣', '閉氣'], [OUT, 4, '吐氣'], [HOLD, 4, '吐氣後閉氣', '閉氣']] },
  // 吸／吐後閉氣（原本的 4-7-8，id 不變，以前的紀錄和印章都還在）：4-7-8-0 是吸氣後閉氣，4-0-8-6 是吐氣後閉氣（fMode 選）。
  // 秒數可以調，兩種方式各自記住：custom['478-4780']、custom['478-4086']，都是 [吸氣, 吸氣後閉氣, 吐氣, 吐氣後閉氣]
  { id: '478', name: '吸／吐後閉氣', desc: '4-7-8-0 是吸氣後閉氣：吸氣 4 秒、閉氣 7 秒、吐氣 8 秒。4-0-8-6 是吐氣後閉氣：吸氣 4 秒、吐氣 8 秒、閉氣 6 秒。',
    base: [[IN, 4, '吸氣'], [HOLD, 7, '吸氣後閉氣', '閉氣'], [OUT, 8, '吐氣'], [HOLD, 6, '吐氣後閉氣', '閉氣']] },
  { id: 'belly', name: '諧振式呼吸', bpm: 6, desc: '吸氣與吐氣等長，依每分鐘次數調整節奏。',
    base: [[IN, 4, '吸氣', '腹部吸氣'], [OUT, 6, '吐氣', '慢慢吐氣']] },
  { id: 'nostril', name: '鼻孔交替呼吸', desc: '左右鼻孔輪流吸氣與吐氣。',
    base: [[IN, 4, '吸氣'], [HOLD, 4, '閉氣'], [OUT, 4, '吐氣'], [HOLD, 4, '閉氣']],
    seq: [[0, '左鼻吸氣'], [1, '閉氣'], [2, '右鼻吐氣'], [3, '閉氣'], [0, '右鼻吸氣'], [1, '閉氣'], [2, '左鼻吐氣'], [3, '閉氣']] },
  // 冰人呼吸有自己的設定、練習與完成畫面（見下方「冰人呼吸」）
  { id: 'wimhof', name: '冰人呼吸', own: true },
  { id: 'res', name: '鯨豚式呼吸', desc: '鼻子吸氣；閉上嘴巴，用鼻子慢慢吐氣。吐氣時將喉部肌肉略縮起來，提高呼吸的阻力。',
    base: [[IN, 2, '吸氣', '鼻子吸氣'], [OUT, 8, '吐氣', '閉嘴，喉部略縮慢慢吐']] },
  // 重生呼吸有自己的設定、練習與完成畫面（見下方「重生呼吸」）：幾次小呼吸＋一次大呼吸，吸吐之間沒有空檔
  { id: 'rebirth', name: '重生呼吸', own: true },
  // 白骨觀：靜坐觀想左腳的大拇趾（見下方「白骨觀」），算練習次數
  { id: 'bone', name: '白骨觀', own: true },
  // 聆聽：不做呼吸練習，單純聽聲音（見下方「聆聽」），不算練習次數
  { id: 'listen', name: '聆聽', own: true },
];

// 首頁小圖示：線條 path（32×32）或圖檔
const ICONS = {
  box: 'M16 4L27 10V22L16 28L5 22V10ZM5 10L16 16L27 10M16 16V28',
  478: 'M3 23H6.5C9 23 10 9 12.5 9H19.5C22 9 23 23 25.5 23H29',   // 上下都有一段平的：吸氣後閉氣、吐氣後閉氣
  belly: 'M3 16C7 6 11 6 16 16S25 26 29 16',
  nostril: 'M14.5 4C14.5 9.5 13.5 13.5 10.5 17C7.5 20.5 8 24.5 11.5 25C13.2 25.2 14 23.8 16 23.8S18.8 25.2 20.5 25C24 24.5 24.5 20.5 21.5 17.5M12.3 20.8C13.4 21.3 14.3 22.3 14.7 23.4M19.7 20.8C18.6 21.3 17.7 22.3 17.3 23.4',
  rebirth: 'M16 25.5V13M16 18.5C16 14 12.5 10.5 7 10.5C7 15 10.5 18.5 16 18.5ZM16 15C16 10.5 19.5 7 25 7C25 11.5 21.5 15 16 15Z',   // 新芽
  listen: 'M6.5 19v-3.5a9.5 9.5 0 0 1 19 0V19M6.5 19h3.5v7H8a1.5 1.5 0 0 1-1.5-1.5V19ZM25.5 19H22v7h2a1.5 1.5 0 0 0 1.5-1.5V19Z',   // 耳機
  bone: 'M11.33 17.07L18.6 11.98A2.9 2.9 0 1 1 22.77 11.26A2.9 2.9 0 1 1 20.67 14.93L13.4 20.02A2.9 2.9 0 1 1 9.23 20.74A2.9 2.9 0 1 1 11.33 17.07Z',   // 斜放的卡通狗骨頭
  wimhof: 'M16 4V28M5.6 10L26.4 22M5.6 22L26.4 10M13 6.5L16 9L19 6.5M13 25.5L16 23L19 25.5M7.5 7.7L8.2 11.5L4.5 12.9M24.5 24.3L23.8 20.5L27.5 19.1M27.5 12.9L23.8 11.5L24.5 7.7M4.5 19.1L8.2 20.5L7.5 24.3',
};
// 鯨豚式呼吸：波浪球＋兩圈漣漪，和練習畫面的聲波紋同一個語彙
const ICON_SVGS = { res: '<path d="M20.8 16.0L21.0 16.4L21.2 16.8L21.1 17.2L20.8 17.6L20.4 17.8L20.0 18.1L19.7 18.3L19.5 18.6L19.4 18.9L19.4 19.4L19.3 19.9L19.1 20.2L18.7 20.5L18.3 20.5L17.8 20.4L17.4 20.3L17.0 20.3L16.7 20.3L16.4 20.5L16.0 20.8L15.6 21.0L15.2 21.2L14.8 21.1L14.4 20.8L14.2 20.4L13.9 20.0L13.7 19.7L13.4 19.5L13.1 19.4L12.6 19.4L12.1 19.3L11.8 19.1L11.5 18.7L11.5 18.3L11.6 17.8L11.7 17.4L11.7 17.0L11.7 16.7L11.5 16.4L11.2 16.0L11.0 15.6L10.8 15.2L10.9 14.8L11.2 14.4L11.6 14.2L12.0 13.9L12.3 13.7L12.5 13.4L12.6 13.1L12.6 12.6L12.7 12.1L12.9 11.8L13.3 11.5L13.7 11.5L14.2 11.6L14.6 11.7L15.0 11.7L15.3 11.7L15.6 11.5L16.0 11.2L16.4 11.0L16.8 10.8L17.2 10.9L17.6 11.2L17.8 11.6L18.1 12.0L18.3 12.3L18.6 12.5L18.9 12.6L19.4 12.6L19.9 12.7L20.2 12.9L20.5 13.3L20.5 13.7L20.4 14.2L20.3 14.6L20.3 15.0L20.3 15.3L20.5 15.6L20.8 16.0Z" stroke="none" fill="currentColor"></path><path d="M25.9 16.0L26.0 16.8L26.0 17.6L25.8 18.3L25.4 19.1L24.9 19.7L24.5 20.3L24.1 21.0L23.7 21.6L23.4 22.3L23.0 23.0L22.5 23.7L22.0 24.2L21.2 24.6L20.5 24.8L19.7 24.9L18.9 25.1L18.2 25.2L17.5 25.4L16.8 25.7L16.0 25.9L15.2 26.0L14.4 26.0L13.7 25.8L12.9 25.4L12.3 24.9L11.7 24.5L11.0 24.1L10.4 23.7L9.7 23.4L9.0 23.0L8.3 22.5L7.8 22.0L7.4 21.2L7.2 20.5L7.1 19.7L6.9 18.9L6.8 18.2L6.6 17.5L6.3 16.8L6.1 16.0L6.0 15.2L6.0 14.4L6.2 13.7L6.6 12.9L7.1 12.3L7.5 11.7L7.9 11.0L8.3 10.4L8.6 9.7L9.0 9.0L9.5 8.3L10.0 7.8L10.8 7.4L11.5 7.2L12.3 7.1L13.1 6.9L13.8 6.8L14.5 6.6L15.2 6.3L16.0 6.1L16.8 6.0L17.6 6.0L18.3 6.2L19.1 6.6L19.7 7.1L20.3 7.5L21.0 7.9L21.6 8.3L22.3 8.6L23.0 9.0L23.7 9.5L24.2 10.0L24.6 10.8L24.8 11.5L24.9 12.3L25.1 13.1L25.2 13.8L25.4 14.5L25.7 15.2L25.9 16.0Z" fill="none" stroke-width="1.9" stroke-linejoin="round" opacity=".55"></path><path d="M30.4 16.0L30.4 17.1L30.3 18.3L29.9 19.3L29.5 20.4L28.9 21.4L28.4 22.3L27.9 23.3L27.4 24.3L26.8 25.2L26.2 26.2L25.4 27.0L24.5 27.7L23.5 28.2L22.4 28.6L21.4 28.9L20.3 29.3L19.3 29.6L18.2 29.9L17.1 30.2L16.0 30.4L14.9 30.4L13.7 30.3L12.7 29.9L11.6 29.5L10.6 28.9L9.7 28.4L8.7 27.9L7.7 27.4L6.8 26.8L5.8 26.2L5.0 25.4L4.3 24.5L3.8 23.5L3.4 22.4L3.1 21.4L2.7 20.3L2.4 19.3L2.1 18.2L1.8 17.1L1.6 16.0L1.6 14.9L1.7 13.7L2.1 12.7L2.5 11.6L3.1 10.6L3.6 9.7L4.1 8.7L4.6 7.7L5.2 6.8L5.8 5.8L6.6 5.0L7.5 4.3L8.5 3.8L9.6 3.4L10.6 3.1L11.7 2.7L12.7 2.4L13.8 2.1L14.9 1.8L16.0 1.6L17.1 1.6L18.3 1.7L19.3 2.1L20.4 2.5L21.4 3.1L22.3 3.6L23.3 4.1L24.3 4.6L25.2 5.2L26.2 5.8L27.0 6.6L27.7 7.5L28.2 8.5L28.6 9.6L28.9 10.6L29.3 11.7L29.6 12.7L29.9 13.8L30.2 14.9L30.4 16.0Z" fill="none" stroke-width="1.5" stroke-linejoin="round" stroke-dasharray="2.4 2" opacity=".42"></path>' };

const MUSIC = [['none', '無'], ['handpan', '手碟'], ['drums', '非洲鼓'], ['rain', '雨聲'], ['evening', '傍晚'], ['chant', '藥師真言'], ['campfire', '營火'], ['rainforest', '雷雨'], ['cat', '貓咪呼嚕'], ['shurangama', '楞嚴咒心'], ['dabei', '大悲咒'], ['singing', '歌聲'], ['bowl', '水晶缽']];
// 每首可以列多個檔案，例如 ['audio/rain.m4a', 'audio/rain.mp3']：先播第一個，載入失敗就換下一個
// 依序輪播的背景音樂：播完接下一個，最後一個播完回到第一個
const MUSIC_LISTS = {
  cat: ['audio/cat1.mp3', 'audio/cat2.mp3', 'audio/cat3.mp3'],
  // 楞嚴咒心：唐密唸法（shurangama2）連續 5 遍，再接一般唸法（shurangama1）5 遍
  shurangama: [...Array(5).fill('audio/shurangama2.mp3'), ...Array(5).fill('audio/shurangama1.mp3')],
};
const MUSIC_FILES = { handpan: 'audio/handpan.mp3', drums: 'audio/drums.mp3', rain: 'audio/rain.mp3', evening: 'audio/evening.mp3', chant: 'audio/chant.mp3?v=2', campfire: 'audio/campfire.mp3', rainforest: 'audio/rainforest.mp3', dabei: 'audio/dabei.mp3', singing: 'audio/singing.mp3?v=2', bowl: 'audio/crystalbowl.mp3?v=2' };
// 音檔頭尾本身有淡入淡出的背景音樂：循環時跳過開頭與結尾（秒），兩個播放器無縫接替
const LOOPCUT = { campfire: [1.2, 1.8] };
const KEY = 'haohao-breath-settings';

const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtS = v => (Number.isInteger(v) ? v : v.toFixed(1)) + ' 秒';
const $ = id => document.getElementById(id);

// ---------- 狀態（設定會存在 localStorage） ----------
const DEFAULTS = () => ({ theme: 'light', custom: {}, minutes: 3, music: 'none', vol: 0.5, wh: {}, whAck: false, whHist: [], log: null, nMode: '3', rMode: '4', bdg: null, cueSet: 'bell', bellyCue: 'beat', sy: null, fMode: '4780', rbAck: false, rbSnd: 'breath', lsSel: ['rain'], lsVol: {}, lsMin: 30, lsFade: 1, lsDim: true, bnOpen: false, bnMin: 10, bnAck: false });
const state = Object.assign(
  DEFAULTS(),
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })()
);
let cur = null;        // 目前練習
let timers = [];       // 整段練習的計時器
let phaseTimers = [];  // 單一階段的計時器
let raf = 0, waveStart = null, totalLeft = 0, left = null;
let g = null, gPause0 = null, gPh = null;   // 一般練習的時間表、暫停的時間點、目前這一段（暫停用）

function save() {
  syncMark();   // 雲端同步：記下改了什麼（見下方「雲端同步」）
  const { custom, minutes, music, vol, theme, wh, whAck, whHist, log, nMode, rMode, bdg, cueSet, bellyCue, sy, fMode, rbAck, rbSnd, lsSel, lsVol, lsMin, lsFade, lsDim, bnOpen, bnMin, bnAck } = state;
  try { localStorage.setItem(KEY, JSON.stringify({ custom, minutes, music, vol, theme, wh, whAck, whHist, log, nMode, rMode, bdg, cueSet, bellyCue, sy, fMode, rbAck, rbSnd, lsSel, lsVol, lsMin, lsFade, lsDim, bnOpen, bnMin, bnAck })); } catch (e) {}
}

// ---------- 今日紀錄（存在這台裝置，登入雲端同步時會和其他裝置合併；日期換了就重新計算） ----------
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const todayLog = () => (state.log && state.log.date === today() ? state.log.items : {});
function logDone(id, sec) {
  const items = { ...todayLog() }, c = items[id] || { n: 0, sec: 0 };
  items[id] = { n: c.n + 1, sec: c.sec + sec };
  // 勳章：記下練習的日子、次數、時間，看有沒有拿到新的勳章
  const b = bdg(), dt = today(), h = new Date().getHours(), prev = earned(b);
  b.days[dt] = 1; b.n = { ...b.n, [id]: (b.n[id] || 0) + 1 }; b.total++; b.sec += sec;
  if (id === 'wimhof') b.hold = Math.max(b.hold, 0, ...wh.holds.map(x => x || 0));
  if (h >= 4 && h < 7) b.early = true;
  if (h >= 22 || h < 4) b.late = true;
  b.best = Math.max(b.best, streak(b.days));
  const neu = earned(b).filter(k => !prev.includes(k));
  b.got = { ...b.got }; neu.forEach(k => { b.got[k] = dt; });
  state.log = { date: dt, items };
  state.bdg = b;
  awards.push(...neu);
  save();
}

// ---------- 勳章：銀河（練習天數）+ 印章 ----------
const cnt = (id, k) => b => (b.n[id] || 0) >= k;
const STAMPS = [
  ['first', '初息', '第一次完成練習', b => b.total >= 1], ['box', '方塊', '方塊呼吸 10 次', cnt('box', 10)],
  ['478', '四七八', '吸／吐後閉氣 10 次', cnt('478', 10)], ['belly', '諧振', '諧振式呼吸 10 次', cnt('belly', 10)],
  ['nostril', '交替', '鼻孔交替呼吸 10 次', cnt('nostril', 10)], ['res', '鯨豚', '鯨豚式呼吸 10 次', cnt('res', 10)],
  ['wimhof', '冰人', '冰人呼吸 10 次', cnt('wimhof', 10)],
  // 不設閉氣長度的勳章：閉氣不該為了拿勳章硬撐
  ['early', '晨光', '早上 7 點前練習', b => b.early], ['late', '夜深', '晚上 10 點後練習', b => b.late],
  ['m100', '百分', '累積 100 分鐘', b => b.sec >= 6000], ['m300', '三百分', '累積 300 分鐘', b => b.sec >= 18000],
  ['m500', '五百分', '累積 500 分鐘', b => b.sec >= 30000], ['m700', '七百分', '累積 700 分鐘', b => b.sec >= 42000],
  ['m1000', '千分', '累積 1000 分鐘', b => b.sec >= 60000],
];
const ST_ROT = [-6, 4, -3, 7, -5, 3, -4, 6, -5, -7, 2, -2, 5, -5, 6, -3];
const dkey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const wkey = d => { const m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return dkey(m); };
const awards = []; // 這次練完新拿到、還沒「收下」的勳章
// 勳章紀錄：days 練習過的日期、n 各練習完成次數、sec 累積秒數、hold 最長閉氣、got 取得日期
function bdg() {
  const b = state.bdg || {}, days = { ...(b.days || {}) }, l = state.log;
  if (l && l.items && Object.keys(l.items).length) days[l.date] = 1; // 舊的「今日紀錄」也算
  return { days, n: b.n || {}, total: b.total || 0, sec: b.sec || 0, hold: b.hold || 0, early: !!b.early, late: !!b.late, best: b.best || 0, got: b.got || {} };
}
const earned = b => STAMPS.filter(x => x[3](b)).map(x => x[0]);
// 連續天數：只算有練的日子；每週（一到日）可休息 1 天不中斷；今天還沒練不算中斷
function streak(days) {
  const ks = Object.keys(days).sort();
  if (!ks.length) return 0;
  const first = ks[0], d = new Date(); d.setHours(12, 0, 0, 0);
  if (!days[dkey(d)]) d.setDate(d.getDate() - 1);
  let n = 0; const rest = {};
  for (;;) {
    const k = dkey(d);
    if (k < first) break;
    if (days[k]) n++;
    else { const w = wkey(d); if (rest[w]) break; rest[w] = 1; }
    d.setDate(d.getDate() - 1);
  }
  return n;
}
// 銀河：第 n 天時，旋臂從外圈長到第 n 顆星的位置；核心在後段慢慢亮起，第 30 天完整（畫好的圖會快取）
// ink=true：淺色主題用的藍綠墨色；false：深色主題用的亮色。都是透明底
const galCache = {};
function galaxyAt(n, ink) {
    const C=galCache,K=n+(ink?'i':'g');if(C[K]!==undefined)return C[K];
    try{
      const Z=540,c=document.createElement('canvas');c.width=c.height=Z;const x=c.getContext('2d');
      let sd=11;const R=()=>(sd=(sd*16807)%2147483647)/2147483647,G=()=>(R()+R()+R()+R()-2)/1.15;
      const thOf=k=>3+(14-Math.floor(k/2))*(7.8/14);
      const cut=n<=0?99:n>=30?-1:thOf(n-1)-.45,rCut=cut<0?0:27*Math.exp(.195*cut);
      const vis=th=>cut<0?1:Math.max(0,Math.min(1,(th-cut)/.7));
      const visR=r=>cut<0?1:Math.max(0,Math.min(1,(r-rCut)/(rCut*.15+4)));
      const p=Math.max(0,Math.min(1,n/30)),core=n>=30?1:Math.max(0,(p-.6)/.4)*.45;
      for(let i=0;i<3120;i++)R();
      x.save();x.translate(Z/2,Z/2);x.rotate(-.42);x.scale(1,.4);
      let g=x.createRadialGradient(0,0,0,0,0,250);
      if(ink){g.addColorStop(0,'rgba(90,170,192,.10)');g.addColorStop(.4,'rgba(90,170,192,.04)');g.addColorStop(1,'rgba(90,170,192,0)');}
      else{g.addColorStop(0,'rgba(255,236,210,.18)');g.addColorStop(.3,'rgba(180,192,235,.08)');g.addColorStop(1,'rgba(120,140,200,0)');}
      x.globalAlpha=p;x.fillStyle=g;x.beginPath();x.arc(0,0,250,0,7);x.fill();
      x.globalCompositeOperation=ink?'source-over':'lighter';
      const arm=(j,th)=>{const r=27*Math.exp(.195*th),a=th+j*Math.PI;return [r*Math.cos(a),r*Math.sin(a),r];};
      for(let i=0;i<1600;i++){const j=i%2,t=.8+R()*10.4,[px,py,r]=arm(j,t),sc=6+r*.09,ox=G()*sc,oy=G()*sc,rd=7+R()*10,v=vis(t);if(v<=0)continue;
        x.globalAlpha=v;x.fillStyle=ink?(r<60?'rgba(200,150,95,.02)':'rgba(63,143,166,.025)'):(r<60?'rgba(255,220,185,.016)':'rgba(140,165,255,.028)');x.beginPath();x.arc(px+ox,py+oy,rd,0,7);x.fill();}
      for(let i=0;i<8000;i++){const j=i%2,t=.6+R()*10.6,[px,py,r]=arm(j,t),sc=4+r*.085,a=(ink?.18+R()*.5:(r<65?.05:.12)+R()*(r<65?.22:.5)).toFixed(2),s=ink?(R()<.93?1:1.9):(R()<.95?.9:1.8);
        const fs=ink?(r<65?'rgba(190,135,80,'+a+')':(R()<.5?'rgba(31,111,134,'+a+')':'rgba(90,170,192,'+a+')')):r<65?'rgba(255,225,190,'+a+')':'rgba('+(165+R()*70|0)+','+(188+R()*55|0)+',255,'+a+')',ox=G()*sc,oy=G()*sc,v=vis(t);if(v<=0)continue;
        x.globalAlpha=v;x.fillStyle=fs;x.fillRect(px+ox,py+oy,s,s);}
      for(let i=0;i<2500;i++){const r=Math.pow(R(),.7)*235,a=R()*7,al=(.05+R()*.18).toFixed(2),v=visR(r);if(v<=0)continue;
        x.globalAlpha=v;x.fillStyle=(ink?'rgba(63,143,166,':'rgba(210,215,240,')+al+')';x.fillRect(r*Math.cos(a),r*Math.sin(a),.8,.8);}
      for(let i=0;i<70;i++){const j=i%2,t=2.5+R()*8,[px,py]=arm(j,t),ox=G()*6,oy=G()*6,rd=1+R()*1.6,v=vis(t);if(v<=0)continue;
        x.globalAlpha=v;x.fillStyle=ink?'rgba(214,110,150,.4)':'rgba(255,120,170,.35)';x.beginPath();x.arc(px+ox,py+oy,rd,0,7);x.fill();}
      if(core>0){g=x.createRadialGradient(0,0,0,0,0,62);
        if(ink){g.addColorStop(0,'rgba(214,160,100,.55)');g.addColorStop(.18,'rgba(214,160,100,.28)');g.addColorStop(.55,'rgba(214,160,100,.07)');g.addColorStop(1,'rgba(214,160,100,0)');}
        else{g.addColorStop(0,'rgba(255,246,228,.85)');g.addColorStop(.12,'rgba(255,228,192,.45)');g.addColorStop(.45,'rgba(255,210,170,.10)');g.addColorStop(1,'rgba(255,200,160,0)');}
        x.globalAlpha=core;x.fillStyle=g;x.beginPath();x.arc(0,0,62,0,7);x.fill();}
      x.globalCompositeOperation='destination-out';
      for(let i=0;i<1000;i++){const j=i%2,t=2.3+R()*8.5-.2,[px,py,r]=arm(j,t),sc=2.5+r*.035,ox=G()*sc,oy=G()*sc,rd=2+R()*4,v=vis(t);if(v<=0)continue;
        x.globalAlpha=v;x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.arc(px+ox,py+oy,rd,0,7);x.fill();}
      x.restore();
      const b64=atob(c.toDataURL('image/png').split(',')[1]),u8=new Uint8Array(b64.length);for(let i=0;i<b64.length;i++)u8[i]=b64.charCodeAt(i);
      C[K]=URL.createObjectURL(new Blob([u8],{type:'image/png'}));
    }catch(e){C[K]='';}
    return C[K];

}
let bTab = 'gal';
// 地藏王菩薩的畫（docs/assets/dizang.jpg，900×1257）；檔案還沒放上來時，先不顯示「下一張」預告
let dizangOk = false;
{ const im = new Image(); im.onload = () => { dizangOk = true; if (!screens.badges.hidden) renderBadges(); }; im.src = 'assets/dizang.jpg'; }
function renderBadges() {
  const B = bdg();
  // 60 天一輪：前 30 天點亮銀河（每天一顆星），後 30 天翻開地藏王菩薩的畫（每天一塊）
  const SP = 30, nd = Object.keys(B.days).length, stg = nd > 0 ? Math.floor((nd - 1) / SP) : 0;
  const lit = nd - stg * SP, isJ = stg % 2 === 1, full = Math.floor(stg / 2);
  $('bStageJ').hidden = !isJ; $('bStageG').hidden = isJ;
  $('bNext').hidden = isJ || !dizangOk; $('bJText').hidden = !isJ;
  $('bNextLeft').textContent = lit >= SP ? '明天開始' : '再 ' + (SP - lit) + ' 天';
  // 畫分成 5×6 塊，從最下面一排（蓮花座）往上翻，每排先中間再往兩側
  const JROW = [2, 1, 3, 0, 4], jRank = {};
  { let q = 0; for (let r = 5; r >= 0; r--) for (const c of JROW) jRank[r * 5 + c] = q++; }
  const jl = isJ ? lit : 0;
  $('bTiles').innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const r = Math.floor(i / 5), c = i % 5, on = jRank[i] < jl, last = jRank[i] === jl - 1;
    const cell = document.createElement('div'), t = document.createElement('div');
    cell.className = 'bj-cell' + (on ? ' on' : '');
    t.className = 'bj-tile' + (last ? ' last' : '');
    t.style.backgroundPosition = (c * 25) + '% ' + (r * 20) + '%';
    cell.appendChild(t); $('bTiles').appendChild(cell);
  }
  $('bJSub').textContent = '地藏王菩薩・' + jl + ' / 30';
  // 星星沿兩條旋臂從外往內亮，位置要和銀河圖（傾斜、壓扁）對齊
  const dk = ['dark', 'night', 'fire', 'fireflies', 'chakra', 'gold', 'bone1', 'bone3', 'senko'].includes(state.theme);
  const GR = -.42, GI = .4, GZ = 540, gxy = (px, py) => { const qy = py * GI, X = px * Math.cos(GR) - qy * Math.sin(GR), Y = px * Math.sin(GR) + qy * Math.cos(GR); return [(GZ / 2 + X) / GZ * 100, (GZ / 2 + Y) / GZ * 100]; };
  $('bSpiral').innerHTML = '';
  for (let k = 0; k < SP; k++) {
    const j = k % 2, th = 3 + (14 - Math.floor(k / 2)) * (7.8 / 14), r = 27 * Math.exp(.195 * th), a = th + j * Math.PI;
    const [x, y] = gxy(r * Math.cos(a), r * Math.sin(a)), on = k < lit, last = on && k === lit - 1, sz = on ? 5.5 : 6;
    const el = document.createElement('div');
    el.className = 'bstar';
    Object.assign(el.style, {
      left: x.toFixed(2) + '%', top: y.toFixed(2) + '%', width: sz + 'px', height: sz + 'px', margin: (-sz / 2) + 'px 0 0 ' + (-sz / 2) + 'px',
      background: on ? (dk ? '#ffffff' : '#1f6f86') : 'transparent',
      boxShadow: dk
        ? (last ? '0 0 0 3px var(--screen),0 0 0 4.5px #ffffff,0 0 14px rgba(210,225,255,.85)' : on ? '0 0 5px 1px rgba(215,228,255,.9),0 0 14px rgba(170,190,255,.55)' : 'inset 0 0 0 1px rgba(255,255,255,.5)')
        : (last ? '0 0 0 3px var(--screen),0 0 0 4.5px #1f6f86,0 0 10px rgba(90,170,192,.6)' : on ? '0 0 6px 1px rgba(90,170,192,.55)' : 'inset 0 0 0 1px var(--track)'),
    });
    $('bSpiral').appendChild(el);
  }
  $('bSpiralNote').textContent = $('bJNote').textContent = nd ? '已經練習 ' + nd + ' 天' + (full > 0 && !isJ ? '，這是第 ' + (full + 1) + ' 個銀河' : '') : '每練習一天，就亮一顆星';
  const img = bTab === 'gal' && !isJ ? galaxyAt(lit, !dk) : '';
  $('bGalCore').style.background = dk
    ? 'radial-gradient(circle closest-side,#ffffff 0,#fff6e6 8%,rgba(255,228,190,.6) 18%,rgba(255,216,172,.22) 36%,rgba(255,206,160,.06) 62%,rgba(255,206,160,0) 100%)'
    : 'radial-gradient(circle closest-side,#fffaf0 0,rgba(255,232,196,.95) 9%,rgba(236,186,124,.55) 22%,rgba(214,160,100,.2) 42%,rgba(214,160,100,.05) 66%,rgba(214,160,100,0) 100%)';
  $('bGalImg').style.backgroundImage = img ? "url('" + img + "')" : 'none';
  // 印章
  $('bStamps').innerHTML = '';
  let n = 0;
  STAMPS.forEach(([, name, rule, test], i) => {
    const on = test(B); if (on) n++;
    const el = document.createElement('div');
    el.className = 'bitem';
    el.innerHTML = '<div class="bstamp' + (on ? ' on' : '') + (i % 3 === 1 ? ' square' : '') + '"></div><span class="bsmall"></span>';
    el.firstChild.textContent = name;
    if (on) el.firstChild.style.transform = 'rotate(' + ST_ROT[i] + 'deg)';
    el.lastChild.textContent = rule;
    $('bStamps').appendChild(el);
  });
  $('bGalMeta').textContent = nd + ' 天';
  $('bStMeta').textContent = n + ' / ' + STAMPS.length;
  $('bTabGal').hidden = bTab !== 'gal';
  $('bStamps').hidden = bTab !== 'st';
  document.querySelectorAll('.btab').forEach(b => b.classList.toggle('on', b.dataset.tab === bTab));
}
// 完成畫面上，依序跳出這次拿到的新印章
function showAward() {
  const aw = awards[0];
  $('award').hidden = !aw;
  if (!aw) return;
  const sp = STAMPS.findIndex(x => x[0] === aw);
  if (sp < 0) { awards.shift(); showAward(); return; }
  $('awStamp').textContent = STAMPS[sp][1];
  $('awStamp').classList.toggle('square', sp % 3 === 1);
  $('awTitle').textContent = STAMPS[sp][2];
  $('awSub').textContent = '已經蓋在你的印章冊裡。';
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
const F478 = { 4780: [4, 7, 8, 0], 4086: [4, 0, 8, 6] };
const fKey = () => (state.fMode === '4086' ? '4086' : '4780');
function secsOf(ex) {
  if (ex.id === '478') { const m = fKey(), c = state.custom['478-' + m]; return c && c.length === 4 ? c : F478[m]; }
  if (ex.fixed) return ex.base.map(b => b[1]);
  if (ex.bpm) { const h = 30 / bpmOf(ex); return [h, h]; }
  const c = state.custom[ex.id];
  // 練習的段數改過的話（例如鼻孔交替呼吸多了一段閉氣），舊的自訂秒數就不再適用
  return c && c.length === ex.base.length ? c : ex.base.map(b => b[1]);
}
// 鼻孔交替呼吸可選三段（吸・閉・吐）或四段（吸・閉・吐・閉）；三段時略過吐氣後的閉氣
const n3 = ex => ex.id === 'nostril' && state.nMode !== '4';
const seq478 = () => (fKey() === '4086' ? [[0, '吸氣'], [2, '吐氣'], [3, '閉氣']] : [[0, '吸氣'], [1, '閉氣'], [2, '吐氣']]);
const seqOf = ex => ex.id === '478' ? seq478() : (n3(ex) ? ex.seq.filter(([bi]) => bi !== 3) : ex.seq || ex.base.map((b, i) => [i, b[3] || b[2]]));
const cycleOf = ex => { const s = secsOf(ex); return seqOf(ex).reduce((a, [bi]) => a + s[bi], 0); };

function adj(ex, i, d) {
  if (ex.id === '478') {
    const s = secsOf(ex).slice(), n = d > 0 ? Math.floor(s[i]) + 1 : Math.ceil(s[i]) - 1;
    s[i] = Math.min(60, Math.max(0, n));
    if (seqOf(ex).every(([bi]) => s[bi] === 0)) return;
    state.custom = { ...state.custom, ['478-' + fKey()]: s };
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

// ---------- 鯨豚式呼吸：會放大縮小的球 ----------
// 吸氣時平滑地變大；吐氣時慢慢縮小，邊緣變成流動的細波浪、外面有幾圈淡淡的波紋往外散（有阻力、要出聲）
const ball = $('animBall');
function drawBall(phase, prog, now) {
  const ease = x => .5 - .5 * Math.cos(Math.PI * x), cl = x => Math.max(0, Math.min(1, x));
  const tt = now / 1000, v = phase === 'in' ? ease(prog) : 1 - ease(prog), r = 34 + 70 * v;
  const sh = phase === 'in' || reducedMotion() ? 0 : cl(prog * 8) * cl((1 - prog) * 6), amp = sh * 2.6, N = 96;
  let d = '';
  for (let i = 0; i <= N; i++) {
    const a = i / N * 6.2832, rr = r + amp * Math.sin(a * 16 + tt * 9) + amp * .4 * Math.sin(a * 7 - tt * 5);
    d += (i ? 'L' : 'M') + (150 + rr * Math.cos(a)).toFixed(2) + ' ' + (125 + rr * Math.sin(a)).toFixed(2);
  }
  ball.querySelector('[data-k="ball"]').setAttribute('d', d + 'Z');
  ball.querySelector('[data-k="halo"]').setAttribute('r', (r + 6).toFixed(2));
  ball.querySelectorAll('[data-k="rip"]').forEach((el, i) => {
    const u = ((tt / 2.2) + i / 3) % 1;
    el.setAttribute('r', (r + 6 + u * 34).toFixed(1));
    el.setAttribute('opacity', (sh * .5 * (1 - u)).toFixed(3));
  });
}

function tick() {
  const ex = EX[cur];
  if (ex && waveStart != null) {
    const w = waveSegs(ex), now = performance.now(), tm = ((now - waveStart) / 1000) % w.T;
    if (ex.id === 'res') {
      const sg = segAt(w, tm);
      drawBall(sg.to > sg.from ? 'in' : 'ex', (tm - sg.t0) / ((sg.t1 - sg.t0) || 1), now);
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
let duck = 1; // 冰人呼吸時背景音樂調小（WH_DUCK），讓呼吸提示音聽得清楚
const musicVol = () => state.vol * duck;
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
  fadeIv = setInterval(() => { v = Math.min(1, v + .05); if (audio) audio.volume = v * musicVol(); if (v >= 1) clearInterval(fadeIv); }, 60);
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
  fadeIv = setInterval(() => { v = Math.min(1, v + .05); if (audio) audio.volume = v * musicVol(); if (v >= 1) clearInterval(fadeIv); }, 60);
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
    // 選的錄音已經不在了（例如清除過瀏覽器資料），或那首音樂已下架（例如水下），改回「無」
    const gone = m => m.startsWith('mine:') ? !myUrls[m.slice(5)] : !MUSIC.some(([k]) => k === m);
    if (gone(state.music)) { state.music = 'none'; save(); }
    if (state.wh && state.wh.music && gone(state.wh.music)) { state.wh = { ...state.wh, music: 'none' }; save(); }
    if (cur != null && !screens.setup.hidden) renderSetup();
    if (cur != null && !screens.rbSetup.hidden) rbRenderSetup();
    if (cur != null && !screens.whSetup.hidden) whRenderSetup();
    if (cur != null && !screens.lsSetup.hidden) lsRenderSetup();
  });
}
function addMine(f) {
  if (f.size > MINE_MB * 1024 * 1024) { alert('檔案太大，請選 ' + MINE_MB + 'MB 以下的錄音。'); return; }
  const id = Date.now().toString(36);
  idb('readwrite', st => st.put({ blob: f, name: f.name }, id)).then(() => {
    myUrls[id] = URL.createObjectURL(f);
    mine.push({ id, name: stripExt(f.name) });
    // 在冰人呼吸設定頁上傳的，就選為冰人呼吸的背景音樂；其他練習（包括重生呼吸）共用一般的背景音樂
    if (cur != null && EX[cur].id === 'wimhof') { whSet('music', 'mine:' + id); return; }
    // 在聆聽設定頁上傳的，直接加進選的聲音（最多 3 種）
    if (cur != null && EX[cur].id === 'listen') { const s = lsSel(); if (s.length < LS_MAX) state.lsSel = [...s, 'mine:' + id]; save(); lsRenderSetup(); return; }
    state.music = 'mine:' + id; save(); renderMusicSetup();
  }).catch(() => alert('無法儲存這個檔案，請換一個試試。'));
}
function delMine(m) {
  if (!confirm('要刪除「' + m.name + '」嗎？')) return;
  idb('readwrite', st => st.delete(m.id)).catch(() => {});
  if (myUrls[m.id]) URL.revokeObjectURL(myUrls[m.id]);
  delete myUrls[m.id];
  mine = mine.filter(x => x.id !== m.id);
  if (state.music === 'mine:' + m.id) { state.music = 'none'; save(); }
  if (state.wh && state.wh.music === 'mine:' + m.id) { state.wh = { ...state.wh, music: 'none' }; save(); }
  if (Array.isArray(state.lsSel) && state.lsSel.includes('mine:' + m.id)) { state.lsSel = state.lsSel.filter(k => k !== 'mine:' + m.id); save(); }
  renderMusicSetup();
}
// 上傳或刪除錄音後，重畫目前打開的設定頁
function renderMusicSetup() { if (cur != null && EX[cur].id === 'rebirth') rbRenderSetup(); else if (cur != null && EX[cur].id === 'listen') lsRenderSetup(); else if (cur != null && EX[cur].id === 'bone') bpRenderSetup(); else renderSetup(); }
$('mineFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) addMine(f); });

// ---------- 節拍音效（即時合成） ----------
let ac = null, noiseBuf = null, breath = null;
function ctx() {
  if (!ac) {
    // iPhone 靜音模式下仍要播放音效（Safari 17+）
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ac = new (window.AudioContext || window.webkitAudioContext)();
    // 提示音被系統中斷時，背景音樂也一起停
    ac.onstatechange = () => { if (ac.state === 'running') return; if (ls) { lsSysPause(); return; } if (practicing() && !syncPaused) pauseAllAudio(); };
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
const practicing = () => !screens.run.hidden || !$('whRun').hidden || !$('whHold').hidden || !$('rbRun').hidden || !$('bpRun').hidden;
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
// 諧振式呼吸：每段開頭敲一下鼓（吸氣高音、吐氣低音）；at 是要在什麼時間敲（試聽用），不給就是現在
function drumFx(high, at) {
  if (syncPaused) return; // 暫停中不要排入聲音，否則恢復時會一次全部響起
  ctx();
  const now = at || ac.currentTime, f0 = high ? 520 : 390;
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
// 其他練習：每段開頭播放提示音（吸氣、吸氣後閉氣、吐氣、吐氣後閉氣）。兩組可在設定頁切換：
// 鈴聲：audio/cues/ 四個音檔，已去掉開頭空白並調成一樣大聲
// 舌鼓：原本的 audio/cue-in、cue-out、cue-hold.wav（鋼舌鼓高低音，兩次閉氣都是木魚）
const CUESETS = [['bell', '鈴聲'], ['drum', '舌鼓']];
// 諧振式呼吸只有吸氣、吐氣，提示音另外選：鼓聲（原本的，預設）或鈴聲（和上面的鈴聲同一組）
const BELLYCUES = [['beat', '鼓聲'], ['bell', '鈴聲']];
const CUE_KEYS = ['in', 'hold-in', 'out', 'hold-out'];
const cueBufs = {};
let cueSrc = null;
function cueUrl(set, key) {
  return set === 'drum' ? 'audio/cue-' + (key.startsWith('hold') ? 'hold' : key) + '.wav' : 'audio/cues/' + key + '.wav';
}
function loadCue(key, set) {
  const u = cueUrl(set || state.cueSet || 'bell', key);
  return cueBufs[u] || (cueBufs[u] = fetch(u).then(r => r.arrayBuffer()).then(a => ac.decodeAudioData(a)).catch(() => null));
}
function loadCues() {
  ctx(); stopPreview();
  CUE_KEYS.forEach(key => loadCue(key));
  if (state.bellyCue === 'bell') { loadCue('in', 'bell'); loadCue('out', 'bell'); }
}
// 設定頁點選提示音時試聽一輪：吸氣、閉氣、吐氣、閉氣，每個間隔 1 秒
let preview = [], previewTok = 0, previewEnd = 0;
function stopPreview() {
  previewTok++;
  preview.forEach(s => { try { s.stop(); } catch (e) {} });
  preview = [];
}
// 諧振式呼吸試聽吸氣、吐氣兩聲（belly 為 true）；鼓聲是即時合成的，直接排兩下
function previewCues(set, belly) {
  ctx(); stopPreview();
  const tok = previewTok;
  keepAlive.play().catch(() => {});
  clearTimeout(previewEnd);
  previewEnd = setTimeout(() => { if (!practicing() && !ls) keepAlive.pause(); }, 6000);
  if (belly && set === 'beat') { const t0 = ac.currentTime + .05; drumFx(true, t0); drumFx(false, t0 + 1.2); return; }
  const keys = belly ? ['in', 'out'] : CUE_KEYS, gap = belly ? 1.2 : 1;
  Promise.all(keys.map(key => loadCue(key, set))).then(bufs => {
    if (tok !== previewTok) return;
    const t0 = ac.currentTime + .05;
    bufs.forEach((b, i) => {
      if (!b) return;
      const s = ac.createBufferSource(), g = ac.createGain();
      g.gain.value = .6; s.buffer = b;
      s.connect(g); g.connect(ac.destination); s.start(t0 + i * gap);
      preview.push(s);
    });
  });
}
// 閉氣要分吸氣後還是吐氣後：往前找最近一段不是閉氣的呼吸
function prevKind(ex, seq, i) {
  for (let j = 1; j < seq.length; j++) {
    const q = ex.base[seq[(i - j + seq.length) % seq.length][0]][0];
    if (q !== HOLD) return q;
  }
  return IN;
}
function cueFx(k, gain, prev, set) {
  if (syncPaused) return;
  loadCues();
  const key = k === IN ? 'in' : k === OUT ? 'out' : prev === OUT ? 'hold-out' : 'hold-in';
  loadCue(key, set).then(b => {
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
const screens = { badges: $('badges'), setup: $('setup'), run: $('run'), done: $('done'), whSetup: $('whSetup'), whRun: $('whRun'), whHold: $('whHold'), whDone: $('whDone'), rbSetup: $('rbSetup'), rbRun: $('rbRun'), rbDone: $('rbDone'), lsSetup: $('lsSetup'), lsRun: $('lsRun'), lsDone: $('lsDone'), bpSetup: $('bpSetup'), bpRun: $('bpRun'), bpDone: $('bpDone') };
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
    icon.innerHTML = '<svg viewBox="0 0 32 32">' + (ICON_SVGS[ex.id]
      || '<path d="' + ICONS[ex.id] + '" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>') + '</svg>';
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
    } else row.addEventListener('click', () => openEx(i));
    list.appendChild(row);
  });
}

const MODES = {
  nostril: { key: 'nMode', def: '3', opts: [['3', '三段（吸・閉・吐）'], ['4', '四段（吸・閉・吐・閉）']] },
  478: { key: 'fMode', def: '4780', opts: [['4780', '4-7-8-0'], ['4086', '4-0-8-6']] },
};
// 背景音樂選項（一般練習和冰人呼吸共用）：內建音樂、我的錄音、「＋ 上傳錄音」
function musicGrid(box, current, pick) {
  box.innerHTML = '';
  MUSIC.concat(mine.map(m => ['mine:' + m.id, m.name])).forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + (k === current ? ' on' : '');
    b.textContent = l; b.title = l;
    b.addEventListener('click', () => pick(k));
    box.appendChild(b);
  });
  if (mine.length < MINE_MAX) {
    const b = document.createElement('button');
    b.className = 'music-opt music-upload';
    b.textContent = '＋ 上傳錄音';
    b.addEventListener('click', () => $('mineFile').click());
    box.appendChild(b);
  }
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
  const rows = ex.id === '478'
    ? seqOf(ex).map(([bi]) => ({ label: ex.base[bi][2], val: fmtS(secs[bi]), i: bi }))
    : ex.bpm
    ? [{ label: '每分鐘', val: bpmOf(ex) + ' 次', i: 0 }]
    : (n3(ex) ? ex.base.slice(0, 3) : ex.base).map((b, i) => ({ label: b[2], val: fmtS(secs[i]), i }));
  // 練習方式：鼻孔交替呼吸（三段／四段）、吸／吐後閉氣（4-7-8-0／4-0-8-6）
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
  musicGrid($('music'), state.music, k => { state.music = k; save(); renderSetup(); });
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
  // 提示音：諧振式呼吸選鼓聲或鈴聲（自己記一組），其他練習選鈴聲或舌鼓
  const belly = ex.id === 'belly';
  $('cueGrid').innerHTML = '';
  (belly ? BELLYCUES : CUESETS).forEach(([k, l]) => {
    const cur = belly ? (state.bellyCue || 'beat') : (state.cueSet || 'bell');
    const b = document.createElement('button');
    b.className = 'music-opt' + (cur === k ? ' on' : '');
    b.textContent = l;
    b.addEventListener('click', () => { if (belly) state.bellyCue = k; else state.cueSet = k; save(); renderSetup(); previewCues(k, belly); });
    $('cueGrid').appendChild(b);
  });
}

// ---------- 流程 ----------
function clearPhase() { phaseTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); phaseTimers = []; }
function clearAll() {
  clearPhase(); cancelAnimationFrame(raf); stopBreath(); stopCue(); keepAlive.pause(); syncPaused = false; clearTimeout(resumeCheck); showResumeTip(false);
  timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
}

function openEx(i) {   // 不能叫 open，會蓋掉瀏覽器的 window.open（Google 登入要用它開視窗）
  clearAll(); stopMusic(true);
  cur = i;
  if (EX[i].own) { if (EX[i].id === 'rebirth') rbOpen(); else if (EX[i].id === 'listen') lsOpen(); else if (EX[i].id === 'bone') bpOpen(); else whOpen(); return; }
  renderSetup();
  show('setup');
  screens.setup.scrollTop = 0;
}
function closeEx() {
  if (rb) rbEnd();
  if (bp) bpEnd();
  g = null; gPause0 = null; gPausedUi(false);
  lsStopAll();
  clearAll(); stopMusic(); releaseWake(); duck = 1;
  cur = null;
  renderToday();
  show(null);
  syncResume();   // 練習中沒做的同步，回到首頁再做
  $('whSafety').hidden = true;
  $('rbSafety').hidden = true;
  $('bpSafety').hidden = true;
}

function dotEl(ex) { return ex.id === 'box' ? $('boxDot') : ex.id === 'nostril' ? $('nDot') : null; }
function setDot(el, x, y, dur) {
  el.style.transition = dur ? 'transform ' + dur + 's linear' : 'none';
  el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  if (!dur) void el.offsetWidth;
}

// 方塊、鼻孔交替：第 i 段圓點要走到哪個角
function dotTarget(ex, i) {
  const by = ex.id === 'nostril' ? 218 : 216;
  const BL = [0, by], TL = [0, 0], TR = [216, 0], BR = [216, by];
  return ex.id === 'nostril' ? (n3(ex) ? [TL, TR, BR, TR, TL, BL] : [TL, TR, BR, BR, TR, TL, BL, BL])[i] : [TL, TR, BR, BL][i % 4];
}
// 跑第 i 個階段；0 秒的階段直接跳過
function run(i) {
  const ex = EX[cur], seq = seqOf(ex), secs = secsOf(ex), [bi, label] = seq[i], t = secs[bi];
  clearPhase();
  const k = ex.base[bi][0];
  stopBreath();
  if (t) { if (ex.id === 'belly') { if (state.bellyCue === 'bell') cueFx(k, 0, null, 'bell'); else drumFx(k === IN); } else cueFx(k, 0, k === HOLD ? prevKind(ex, seq, i) : null); }
  if (i === 0) waveStart = performance.now();
  const el = dotEl(ex);
  if (el) {
    const nc = dotTarget(ex, i);
    if (i === 0) setDot(el, 0, ex.id === 'nostril' ? 218 : 216, 0); // 每輪從左下角出發
    setDot(el, nc[0], nc[1], t);
  }
  if (!t) { run((i + 1) % seq.length); return; }
  gPh = { t, t0: performance.now(), next: (i + 1) % seq.length, label, nc: el ? dotTarget(ex, i) : null };   // 暫停後要接著走：這一段多長、什麼時候開始、下一段、圓點要走到哪
  brPhase = { k, prev: k === HOLD ? prevKind(ex, seq, i) : null, t0: performance.now(), dur: t };  // 螢火蟲跟著呼吸亮暗用
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
  duck = 1;
  const ex = EX[cur], total = state.minutes * 60, end = Date.now() + LEAD + total * 1000;
  ctx(); // 在按下按鈕時就啟用音效，手機瀏覽器才不會擋
  loadCues();
  keepAlive.play().catch(() => {});
  if (state.music !== 'none' && !audio) playMusic(state.music);

  $('animBox').hidden = ex.id !== 'box';
  $('animN').hidden = ex.id !== 'nostril';
  ball.toggleAttribute('hidden', ex.id !== 'res'); // SVG 元素沒有 .hidden 屬性
  $('animWave').hidden = ['box', 'nostril', 'res'].includes(ex.id);
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
  // g：這次練習的時間表（暫停時整個往後挪）。goAt 準備好、開始第一段，endAt 練完
  const now = performance.now();
  g = { total, exId: ex.id, goAt: now + LEAD, endAt: now + LEAD + total * 1000, go: false }; gPause0 = null; gPh = null;
  gPausedUi(false);
  gSched();
}
// 照時間表排好：開始第一段、每秒更新剩下的時間、時間到練完
function gSched() {
  const now = performance.now(), G = g;
  if (!G.go) timers.push(setTimeout(() => { G.go = true; run(0); }, Math.max(0, G.goAt - now)));
  timers.push(setInterval(() => { totalLeft = Math.min(G.total, (G.endAt - performance.now()) / 1000); updateTotal(); }, 1000));
  timers.push(setTimeout(() => { clearAll(); stopMusic(); g = null; gPause0 = null; logDone(G.exId, G.total); show('done'); showAward(); }, Math.max(0, G.endAt - now)));
}
function gPausedUi(on) { $('gPauseBtn').hidden = on; $('gResumeBtn').hidden = !on; }
// 暫停：倒數、圓點、波形、主題的動態背景都停在原地，提示音收掉（背景音樂照常，和其他練習一樣）
function gPause() {
  if (!g || gPause0 || screens.run.hidden) return;
  const now = performance.now(); gPause0 = now;
  clearPhase(); timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; cancelAnimationFrame(raf); stopBreath(); stopCue();
  totalLeft = Math.min(g.total, (g.endAt - now) / 1000); updateTotal();
  const el = dotEl(EX[cur]);
  if (el) { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); setDot(el, m.m41, m.m42, 0); }
  $('phaseLabel').textContent = '已暫停';
  gPausedUi(true);
}
// 繼續：時間表往後挪暫停的時間，這一段剩下的部分接著走完，再進下一段
function gResume() {
  if (!g || !gPause0) return;
  const now = performance.now(), dt = now - gPause0; gPause0 = null;
  g.goAt += dt; g.endAt += dt; if (waveStart != null) waveStart += dt; if (brPhase) brPhase.t0 += dt;
  gSched();
  const ph = gPh;
  if (g.go && ph) {
    ph.t0 += dt;
    const rem = Math.max(0, ph.t0 + ph.t * 1000 - now), el = dotEl(EX[cur]);
    if (el && ph.nc) setDot(el, ph.nc[0], ph.nc[1], rem / 1000);
    $('phaseLabel').textContent = ph.label;
    if (ph.t >= 1) { left = Math.max(1, Math.ceil(rem / 1000)); $('countText').textContent = left; phaseTimers.push(setInterval(() => { if (left > 1) left--; $('countText').textContent = left; }, 1000)); }
    phaseTimers.push(setTimeout(() => run(ph.next), rem));
  } else $('phaseLabel').textContent = '';
  raf = requestAnimationFrame(tick);
  gPausedUi(false);
}

function stopEx() {
  clearAll(); stopMusic(); g = null; gPause0 = null; gPausedUi(false);
  renderSetup();
  show('setup');
}

// ---------- 冰人呼吸 ----------
// 換氣（快速深呼吸）→ 吐氣後閉氣（自己決定何時吸氣）→ 深吸一口憋 15 秒 → 吐氣，重複數輪
const WH_DEF = { breaths: 30, rounds: 3, mode: 'free', sound: true, vibe: true };
const WH_PACE = [1.7, 1.3];        // 每口吸、吐秒數
const WH_VIDEO = [60, 90, 120];
const WH_DUCK = .6;                // 冰人呼吸時背景音樂的音量比例    // 「跟隨影片節奏」每輪閉氣目標
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
    ['輪數', c.rounds + ' 輪', () => whSet('rounds', Math.max(1, c.rounds - 1)), () => whSet('rounds', Math.min(10, c.rounds + 1))],
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
  musicGrid($('whMusic'), c.music || 'none', k => whSet('music', k));
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
function whCue(k, prev) { if (whSound()) cueFx(k, .35, prev); }
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
  duck = WH_DUCK;
  const wm = whCfg().music || 'none';
  if (wm !== 'none') playMusic(wm);
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
    whText(String(i), '/ ' + c.breaths, '吸飽', c.breaths - i < 3 ? '最後幾口，準備吐氣後閉氣' : '');
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
  buzz(60); whCue(HOLD, OUT);
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
  clearAll(); releaseWake(); stopMusic(); duck = 1;
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
  showAward();
}
function whStop() {
  stopCue();
  if (wh.holds.length) { whDone(); return; }
  clearAll(); releaseWake(); stopMusic(); duck = 1;
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

// ---------- 重生呼吸 ----------
// 用鼻子輕鬆吸、爽快吐，吸吐之間沒有空檔：幾口小呼吸（四小一大、六小一大或九小一大）＋一口大呼吸（吸長一點、爽快吐掉、放鬆一下），一直循環到時間到。
// 快呼吸：只做小呼吸，一口接一口，不做大呼吸（四口算一組，拇指琴照 Do、Re、Mi、Sol 循環）
// custom.rebirth = [小呼吸一吸一吐秒數, 大呼吸（吸、吐、放鬆）秒數]；每次 0.1 秒，0 秒就不做那一種呼吸，兩個不能都是 0
const rbOf = () => { const c = state.custom.rebirth; return c && c.length === 2 ? c : [1.5, 4]; };
const RB_MODES = [['4', '四小一大'], ['6', '六小一大'], ['9', '九小一大'], ['fast', '快呼吸']], RB_MODE_NAME = { 4: '四小一大', 6: '六小一大', 9: '九小一大' };
const rbModeOf = m => (RB_MODES.some(([k]) => k === m) ? m : '4');
const rbFast = () => state.rMode === 'fast';
const rbN = () => (state.rMode === '9' ? 9 : state.rMode === '6' ? 6 : 4);
// 實際用的速度：快呼吸不做大呼吸；小呼吸設成 0 秒的話，快呼吸還是用預設的 1.5 秒
const rbOfE = () => { const [a, b] = rbOf(); return rbFast() ? [a || 1.5, 0] : [a, b]; };
// 吐氣提示音：呼吸聲（預設，真人錄的一吸一吐，小呼吸、大呼吸各一組，吸氣和吐氣分開）、手鼓、水滴、拇指琴（後三個當場合成）
// 呼吸聲在吸氣開始時放吸氣的錄音、水滴落地時放吐氣的錄音；其他三個只在吐氣時響
const RBSNDS = [['breath', '呼吸聲'], ['hand', '手鼓'], ['drop', '水滴'], ['kalimba', '拇指琴']];
const RB_BREATH = { si: 'audio/rb-breath-small-in.wav', so: 'audio/rb-breath-small-out.wav', bi: 'audio/rb-breath-big-in.wav', bo: 'audio/rb-breath-big-out.wav' };
const rbSndOf = k => (RBSNDS.some(([x]) => x === k) ? k : 'breath');
const rbExBufs = {};
function rbExBuf(b) {
  return rbExBufs[b] || (rbExBufs[b] = fetch(RB_BREATH[b]).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
    .then(a => new Promise((ok, no) => ac.decodeAudioData(a, ok, no))).catch(() => null));
}
// 放一段呼吸錄音：b 是 si/so/bi/bo；每次音量、快慢差一點點。d 有給的話，到這一段結束前淡掉（速度調很快時，吸氣聲不會拖到下一段）
function rbBreath(out, b, t, d) {
  rbExBuf(b).then(buf => {
    if (!buf || (out !== rbOutG && out !== rbPvG)) return;
    const s = ac.createBufferSource(), g = ac.createGain(), t0 = Math.max(t, ac.currentTime), v = .75 * (1 + (Math.random() - .5) * .16);
    s.buffer = buf; s.playbackRate.value = 1 + (Math.random() - .5) * .06; g.gain.setValueAtTime(v, t0);
    s.connect(g); g.connect(out); s.start(t0);
    if (d && d < buf.duration) { g.gain.setValueAtTime(v, t0 + Math.max(.03, d - .08)); g.gain.linearRampToValueAtTime(0, t0 + d); s.stop(t0 + d + .02); }
  });
}
const RB_N4 = [523.25, 587.33, 659.25, 783.99], RB_N6 = [392, 440, 523.25, 587.33, 659.25, 783.99], RB_N9 = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
// big 是大呼吸那一口（聲音深一點、長一點）；j 是第幾口小呼吸，n 是一組幾口小呼吸。每一聲的音高、音量隨機差一點點，重複幾百次也不會像機器
function rbSynthFx(out, k, big, j, n, t, nz) {
  const rv = a => 1 + (Math.random() - .5) * a;
  const tone = (type, f0, f1, glide, v, dec) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + glide);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0008, t + dec);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dec + .05);
  };
  if (k === 'drop') {
    const f = (big ? 620 : 900) * rv(.12), v = 1.25 * rv(.2);
    tone('sine', f, f * (big ? 2.1 : 1.9), big ? .09 : .06, .34 * v, big ? .17 : .11);   // 水泡的聲音：音高很快往上
    tone('sine', f * .45, f * .4, .02, .06 * v, .04);                                    // 落水那一下
  } else if (k === 'kalimba') {
    const L = n === 9 ? RB_N9 : n === 6 ? RB_N6 : RB_N4, f = big ? 261.63 : L[Math.min(Math.max(j || 0, 0), L.length - 1)], v = .8 * rv(.15);
    tone('sine', f, f, 0, .42 * v, big ? 1 : .55);                  // 簧片的主音
    tone('sine', f * 2, f * 2, 0, (big ? .16 : .06) * v, big ? .5 : .25);  // 高八度：低音 Do 在手機喇叭上也聽得到
    tone('sine', f * 5.95, f * 5.95, 0, .07 * v, .035);            // 手指撥下去那一下
  } else {
    const f = (big ? 200 : 245) * rv(.05), v = .8 * rv(.2);
    tone('sine', f * 1.25, f, .09, .5 * v, big ? .55 : .32);        // 鼓皮的主音：敲下去音高往下掉，像把氣放掉
    tone('sine', f * 1.62, f * 1.5, .06, .16 * v, big ? .28 : .16); // 鼓身的共鳴
    tone('triangle', f * 2.3, f * 2.2, .03, .05 * v, .08);
    if (nz) {                                                       // 手掌碰到鼓皮
      const bp = ac.createBiquadFilter(), ng = ac.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = .7;
      ng.gain.setValueAtTime(.07 * v, t); ng.gain.exponentialRampToValueAtTime(.001, t + .03);
      nz.connect(bp); bp.connect(ng); ng.connect(out); nz.start(t); nz.stop(t + .05);
    }
  }
}
let rb = null, rbRaf = 0, rbOutG = null, rbPvG = null;
const rbNow = () => (rb.pausedAt != null ? rb.pausedAt - rb.offset : performance.now() - rb.offset);
// 一組：n 口小呼吸（吸 60%、吐 40%）＋大呼吸（吸 47.5%、吐 22.5%、放鬆 30%）；設成 0 秒的那一種呼吸就跳過
function rbSegs() {
  const [a, b] = rbOfE(), n = rbN(), q = [];
  for (let j = 0; j < n; j++) q.push({ ph: 'sin', d: a * .6, j }, { ph: 'sout', d: a * .4, j });
  q.push({ ph: 'bin', d: b * .475, j: n }, { ph: 'bout', d: b * .225, j: n }, { ph: 'brest', d: b * .3, j: n });
  return q.filter(x => x.d > 0);
}
const rbKind = () => { if (rbFast()) return '快呼吸'; const [a, b] = rbOf(); return a === 0 ? '只做大呼吸' : b === 0 ? '只做小呼吸' : RB_MODE_NAME[rbN()]; };

function rbOpen() {
  rbRenderSetup();
  show('rbSetup');
  screens.rbSetup.scrollTop = 0;
  if (!state.rbAck) rbSafety(true);
}
function rbSafety(on) {
  $('rbSafety').hidden = !on;
  $('rbChk').checked = false; $('rbAckBtn').disabled = true;
  $('rbAckBox').hidden = !!state.rbAck;
  $('rbSafetyClose').hidden = !state.rbAck;
}
$('rbChk').addEventListener('change', e => { $('rbAckBtn').disabled = !e.target.checked; });
function rbOpts(box, list, isOn, pick) {
  box.innerHTML = '';
  list.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + (isOn(k) ? ' on' : '');
    b.textContent = l;
    b.addEventListener('click', () => pick(k));
    box.appendChild(b);
  });
}
function rbRenderSetup() {
  const [a, b] = rbOf(), fast = rbFast(), mode = rbModeOf(state.rMode);
  bind('minutes', state.minutes);
  $('rbMinutes').value = state.minutes;
  rbOpts($('rbModes'), RB_MODES, k => mode === k, k => { state.rMode = k; save(); rbRenderSetup(); });
  $('rbModeNote').textContent = fast ? '只做小呼吸，一口接一口，不做大呼吸。'
    : a === 0 ? '速度裡的小呼吸設成 0 秒，現在只做大呼吸。' : b === 0 ? '速度裡的大呼吸設成 0 秒，現在只做小呼吸。'
    : RB_MODE_NAME[mode].slice(0, 1) + '口小呼吸，再一口大呼吸，一組約 ' + Math.round(rbN() * a + b) + ' 秒。';
  $('rbSpeedNote').textContent = fast ? '快呼吸只做小呼吸，只要調這一個速度。' : '設成 0 秒就不做那一種呼吸。';
  $('rbRows').innerHTML = '';
  (fast ? [['小呼吸', 0]] : [['小呼吸', 0], ['大呼吸', 1]]).forEach(([label, i]) => {
    const row = document.createElement('div');
    row.className = 'phase-row';
    row.innerHTML = '<span class="phase-row-label"></span><div class="stepper"><button class="step" aria-label="減少">−</button><span class="step-val"></span><button class="step" aria-label="增加">+</button></div>';
    row.querySelector('.phase-row-label').textContent = label;
    row.querySelector('.step-val').textContent = fmtS((fast ? rbOfE() : [a, b])[i]);
    const [dec, inc] = row.querySelectorAll('.step');
    dec.addEventListener('click', () => rbAdj(i, -1));
    inc.addEventListener('click', () => rbAdj(i, 1));
    $('rbRows').appendChild(row);
  });
  $('rbReset').hidden = a === 1.5 && b === 4;
  // 背景音樂：和其他練習共用同一個設定
  musicGrid($('rbMusic'), state.music, k => { state.music = k; save(); rbRenderSetup(); });
  $('rbMineBox').hidden = !mine.length;
  $('rbMineRows').innerHTML = '';
  mine.forEach(m => {
    const row = document.createElement('div');
    row.className = 'mine-row';
    row.innerHTML = '<span></span><button>刪除</button>';
    row.firstChild.textContent = m.name;
    row.lastChild.addEventListener('click', () => delMine(m));
    $('rbMineRows').appendChild(row);
  });
  $('rbMusicHint').hidden = state.music === 'none';
  const snd = rbSndOf(state.rbSnd);
  rbOpts($('rbSnds'), RBSNDS, k => snd === k, k => { state.rbSnd = k; save(); rbRenderSetup(); rbPreview(k); });
  $('rbSndNote').textContent = '每次吐氣響一聲，點一下可以試聽。' + (snd === 'breath' ? '吸氣、吐氣都有聲音：小呼吸用短的那一組，大呼吸用長的那一組。' : snd === 'kalimba'
    ? (fast ? '每一口往上彈一個音：Do、Re、Mi、Sol，一直循環。' : rbN() === 9 ? '九口小呼吸從低音 Sol 一路往上彈，大呼吸回到更低的 Do。' : rbN() === 6 ? '六口小呼吸是 Sol、La、Do、Re、Mi、Sol 往上走，大呼吸回到低音 Do。' : '四口小呼吸是 Do、Re、Mi、Sol 往上走，大呼吸回到低音 Do。閉著眼睛也知道做到第幾口。')
    : fast ? '快呼吸每一口都是小呼吸的聲音。' : '大呼吸那一口會深一點、長一點。');
}
// 速度：每次 0.1 秒，小 0～3 秒、大 0～8 秒
function rbAdj(i, d) {
  const c = rbOf().slice();
  if (rbFast() && !c[0]) c[0] = 1.5;
  const v = Math.min(i ? 8 : 3, Math.max(0, Math.round((c[i] + d * .1) * 10) / 10));
  if (v === 0 && (c[1 - i] === 0 || (rbFast() && i === 0))) return;   // 快呼吸只有小呼吸，不能設成 0
  c[i] = v; state.custom = { ...state.custom, rebirth: c }; save(); rbRenderSetup();
}
// 試聽：手鼓、水滴是小、小、大；拇指琴把一整組的音彈一遍
function rbStopPv() {
  const g = rbPvG; if (!g) return;
  rbPvG = null;
  try { const t = ac.currentTime; g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + .08); setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 150); } catch (e) {}
}
function rbPreview(k) {
  ctx(); stopPreview(); rbStopPv();
  keepAlive.play().catch(() => {});
  clearTimeout(previewEnd);
  previewEnd = setTimeout(() => { if (!practicing() && !ls) keepAlive.pause(); }, 5000);
  const g = ac.createGain(); g.connect(ac.destination); rbPvG = g;
  const t0 = ac.currentTime + .05, n = rbN(), fast = rbFast();   // 快呼吸：試聽都是小呼吸
  if (k === 'breath') { (fast ? [['si', 0], ['so', .75], ['si', 1.5], ['so', 2.25]] : [['si', 0], ['so', .75], ['bi', 1.45], ['bo', 2.75]]).forEach(([b, dt]) => rbBreath(g, b, t0 + dt)); return; }   // 一口小呼吸、一口大呼吸
  if (k === 'kalimba') { for (let j = 0; j < n; j++) rbSynthFx(g, k, false, j, n, t0 + j * .32, null); if (!fast) rbSynthFx(g, k, true, n, n, t0 + n * .32 + .1, null); return; }
  [0, 1, 2].forEach(i => rbSynthFx(g, k, !fast && i === 2, i, n, t0 + i * .5, noise()));
}
function rbFadeOut() {
  const g = rbOutG; if (!g) return;
  rbOutG = null;
  try { const t = ac.currentTime; g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + .12); setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 250); } catch (e) {}
}

// 練習
function rbStart() {
  clearAll(); stopMusic(true); rbStopPv(); cancelAnimationFrame(rbRaf);
  $('rbSafety').hidden = true;
  ctx(); keepAlive.play().catch(() => {}); lockWake();
  rbFadeOut(); rbOutG = ac.createGain(); rbOutG.connect(ac.destination);
  ['si', 'so', 'bi', 'bo'].forEach(rbExBuf);
  if (state.music !== 'none') playMusic(state.music);   // 背景音樂：和其他練習一樣，開始時播放
  rb = { offset: 0, pausedAt: null, ph: 'ready', segI: 0, segs: null, segT: 0, phT: 0, hit: false, ripT: null };
  rb.phT = rbNow();
  rbPausedUi(false);
  $('rbSub').textContent = rbFast() ? '快呼吸・小呼吸 ' + fmtS(rbOfE()[0]) : rbOf()[0] === 0 ? '大呼吸 ' + fmtS(rbOf()[1]) : '小呼吸 ' + fmtS(rbOf()[0]);
  $('rbLeft').textContent = fmt(state.minutes * 60);
  $('rbProgress').style.transition = 'none'; $('rbProgress').style.width = '0%'; void $('rbProgress').offsetWidth; $('rbProgress').style.transition = '';
  rbText('準備', '坐好或平躺，放鬆肩膀');
  $('rbDots').style.visibility = 'hidden';
  show('rbRun');
  const tick = () => { rbTick(); rbRaf = requestAnimationFrame(tick); };
  rbRaf = requestAnimationFrame(tick);
}
function rbText(label, hint) {
  if ($('rbLabel').textContent !== label) $('rbLabel').textContent = label;
  if ($('rbHint').textContent !== hint) $('rbHint').textContent = hint;
}
function rbTick() {
  const r = rb;
  if (!r || r.pausedAt != null) return;
  const now = rbNow(), el = (now - r.phT) / 1000;
  if (r.ph === 'ready') { rbBall(1, 1, .45 + .06 * Math.sin(el * 2.2), 0, false); rbRip(now); if (el >= 3) rbGo(r.phT + 3000); return; }
  let s = r.segs[r.segI], e = (now - r.segT) / 1000, moved = false, missed = null;
  while (e >= s.d) {
    if (rbIsOut(s) && !r.hit) missed = s;   // 很快的速度下，一整段吐氣可能在兩個畫面之間就過去了：還是要響一聲
    r.segT += s.d * 1000; r.segI++; moved = true; r.hit = false;
    if (r.segI >= r.segs.length) { if (r.segT >= r.endAt) { rbFinish(r.segT); return; } r.segI = 0; r.segs = rbSegs(); }   // 時間到了就在這一組做完時結束
    s = r.segs[r.segI]; e = (now - r.segT) / 1000;
  }
  if (moved) rbSegStart(s);
  const left = Math.max(0, Math.ceil((r.endAt - now) / 1000));
  if (left !== r.left) {
    r.left = left;
    $('rbLeft').textContent = fmt(left);
    $('rbProgress').style.width = Math.min(100, 100 - left / (state.minutes * 60) * 100) + '%';
  }
  const k = Math.min(1, e / s.d), d = rbDrop(s.ph, k);
  rbBall(d.y, d.op, d.sc, d.st, d.big);
  // 水滴落到底的那一刻：響提示音、濺起水珠
  if (rbIsOut(s) && !r.hit && k >= rbKh(s.ph)) { r.hit = true; rbHit(s, r.segT + rbKh(s.ph) * s.d * 1000); }
  else if (missed) rbHit(missed, now);
  rbRip(now);
}
function rbGo(at) {
  const r = rb;
  r.ph = 'go'; r.goT = at; r.endAt = at + state.minutes * 60000; r.segs = rbSegs(); r.segI = 0; r.segT = at; r.phT = at; r.left = null;
  $('rbDots').style.visibility = rbFast() ? 'hidden' : 'visible';   // 快呼吸不用數，不顯示小點
  rbSegStart(r.segs[0]);
}
function rbSegStart(s) {
  const fast = rbFast(), lab = fast ? '快呼吸' : s.ph === 'sin' || s.ph === 'sout' ? '第 ' + (s.j + 1) + ' 口' : s.ph === 'brest' ? '放鬆' : '大呼吸';
  const hint = rbNow() >= rb.endAt ? (fast ? '快結束了，做完這幾口就停' : '最後一組，做完就結束') : fast ? '一口接一口，鼻子輕鬆吸、爽快吐，吸吐之間沒有空檔' : s.ph === 'bin' ? '吸長一點' : s.ph === 'bout' ? '爽快地吐出去' : s.ph === 'brest' ? '放鬆一下，接著下一組' : '鼻子輕鬆吸、爽快吐，吸吐之間沒有空檔';
  rbText(lab, hint);
  rbDots(s);
  // 呼吸聲：吸氣一開始就放吸氣的錄音
  if ((s.ph === 'sin' || s.ph === 'bin') && rbSndOf(state.rbSnd) === 'breath' && !syncPaused && rbOutG) rbBreath(rbOutG, s.ph === 'bin' ? 'bi' : 'si', ac.currentTime, s.d);
}
// 水滴只從上面往下掉：吸氣時在上面慢慢聚成一滴（大呼吸聚得比較大），吐氣時掉下來，落地就消失、濺起小水珠
const rbIsOut = s => s.ph === 'sout' || s.ph === 'bout';
const rbKh = ph => (ph === 'bout' ? .17 : .3);   // 吐氣這一段的前 30%（大呼吸 17%，掉得比較快）水滴就落到底
function rbDrop(ph, k) {
  const grow = q => Math.sin(Math.min(1, q / .9) * Math.PI / 2);
  if (ph === 'sin') return { y: 1, op: Math.min(1, k / .2), sc: .2 + .55 * grow(k), st: 0, big: false };
  if (ph === 'bin') return { y: 1, op: Math.min(1, k / .15), sc: .25 + .9 * grow(k), st: 0, big: true };
  if (ph === 'sout' || ph === 'bout') {
    const big = ph === 'bout', kh = rbKh(ph), s0 = big ? 1.15 : .75;
    if (k < kh) { const q = k / kh; return { y: 1 - q * q, op: 1, sc: s0, st: .9 * Math.sin(Math.PI * q), big }; }
    return { y: 0, op: 0, sc: s0, st: 0, big };
  }
  return { y: 0, op: 0, sc: 1, st: 0, big: false };
}
// 落地：決定這次濺起的小水珠（小呼吸 4 顆、大呼吸 7 顆，方向和力道每次都有一點不同），響提示音
function rbHit(s, t) {
  const big = s.ph === 'bout', n = big ? 7 : 4;
  rb.ripT = t; rb.ripBig = big;
  rb.spl = Array.from({ length: n }, (_, i) => ({ a: ((i + .5) / n - .5) * 2.3 + (Math.random() - .5) * .25, v: (big ? 240 : 160) * (.8 + .4 * Math.random()) }));
  if (syncPaused || !rbOutG) return;
  const snd = rbSndOf(state.rbSnd);
  if (snd === 'breath') rbBreath(rbOutG, big ? 'bo' : 'so', ac.currentTime);
  else rbSynthFx(rbOutG, snd, big, s.j, rbN(), ac.currentTime, noise());
}
// y 是高度（0 底下、1 上面），op 透明度，sc 大小，st 掉落時拉長，big 是大呼吸那一滴（帶一點金光）
function rbBall(y, op, sc, st, big) {
  const b = $('rbDrop'), sy = sc * (1 + .25 * st), sx = sc * (1 - .1 * st);
  b.style.transform = 'translateY(' + (2 + 160 * (1 - y)).toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
  b.style.opacity = op;
  b.style.filter = big ? 'drop-shadow(0 0 14px rgba(243,197,106,.45))' : 'drop-shadow(0 0 4px rgba(90,170,192,.25))';
  const sh = $('rbShadow');
  sh.style.opacity = (.25 * (1 - y) * op).toFixed(2);
  sh.style.transform = 'scale(' + (1 - .6 * y).toFixed(2) + ')';
}
// 濺起的小水珠，大呼吸中間還會彈起一小柱水
function rbRip(now) {
  const ds = document.querySelectorAll('#rbSplash [data-s]'), jet = $('rbJet');
  if (!rb || rb.ripT == null || reducedMotion()) { ds.forEach(el => { el.style.opacity = 0; }); jet.style.opacity = 0; return; }
  const tt = (now - rb.ripT) / 1000, g = 1100, spl = rb.spl || [];
  ds.forEach((el, i) => {
    const q = spl[i];
    if (!q || tt < 0) { el.style.opacity = 0; return; }
    const vx = q.v * Math.sin(q.a), vy = q.v * Math.cos(q.a), T = 2 * vy / g;
    if (tt > T) { el.style.opacity = 0; return; }
    el.style.opacity = (1 - Math.pow(tt / T, 4)).toFixed(2);
    el.style.transform = 'translate(' + (vx * tt).toFixed(1) + 'px,' + (-vy * tt + g * tt * tt / 2).toFixed(1) + 'px)';
  });
  const T = .55;
  if (rb.ripBig && tt >= 0 && tt < T) { const v = Math.sin(Math.PI * tt / T); jet.style.opacity = (.9 * Math.min(1, v * 3)).toFixed(2); jet.style.transform = 'scaleY(' + v.toFixed(3) + ')'; }
  else jet.style.opacity = 0;
}
// 下方的小點：數到第幾口，金色那顆是大呼吸
function rbDots(s) {
  const n = rbN(), [a, b] = rbOfE();
  document.querySelectorAll('#rbDots [data-d]').forEach((el, i) => {
    el.style.display = (i < 9 && (i >= n || a === 0)) || (i === 9 && b === 0) ? 'none' : '';
    const idx = i === 9 ? n : i, on = s && idx <= s.j;
    el.style.background = on ? (i === 9 ? '#e0a94a' : '#5aaac0') : 'transparent';
  });
}
function rbPausedUi(on) { $('rbPauseBtn').hidden = on; $('rbResumeBtn').hidden = !on; }
function rbPause() { if (!rb || rb.pausedAt != null) return; rb.pausedAt = performance.now(); rbPausedUi(true); rbText('已暫停', '按「繼續」接著練習'); }
function rbResume() {
  if (!rb || rb.pausedAt == null) return;
  rb.offset += performance.now() - rb.pausedAt; rb.pausedAt = null; rbPausedUi(false);
  if (rb.ph === 'go') rbSegStart(rb.segs[rb.segI]); else rbText('準備', '坐好或平躺，放鬆肩膀');
}
function rbEnd() { cancelAnimationFrame(rbRaf); releaseWake(); rbFadeOut(); stopMusic(); keepAlive.pause(); rb = null; }
// 練完：時間到、最後一組做完才算一次；中途停止不記錄
function rbFinish(at) {
  const sec = Math.max(1, Math.round((at - rb.goT) / 1000));
  rbEnd();
  if (!syncPaused) { ctx(); [[1, .14, 2.6], [2.76, .04, 1.5], [5.4, .015, .8]].forEach(([m, v, d]) => {
    const now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 523.25 * m; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(v, now + .01); g.gain.exponentialRampToValueAtTime(.0001, now + d);
    o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + d + .05);
  }); }
  logDone('rebirth', sec);
  $('rbDoneText').textContent = mins(sec) + ' 分鐘・' + rbKind();
  show('rbDone');
  showAward();
}
function rbStop() { rbEnd(); syncPaused = false; showResumeTip(false); rbRenderSetup(); show('rbSetup'); }
function rbAction(a) {
  if (a === 'start') rbStart();
  else if (a === 'stop') rbStop();
  else if (a === 'pause') rbPause();
  else if (a === 'resume') rbResume();
  else if (a === 'safety') rbSafety(true);
  else if (a === 'safety-close') $('rbSafety').hidden = true;
  else if (a === 'ack') { if ($('rbChk').checked) { state.rbAck = true; save(); $('rbSafety').hidden = true; } }
  else if (a === 'reset') { const c = { ...state.custom }; delete c.rebirth; state.custom = c; save(); rbRenderSetup(); }
}
$('rbMinutes').addEventListener('input', e => { state.minutes = Math.min(30, Math.max(1, +e.target.value)); save(); rbRenderSetup(); });

// ---------- 白骨觀：靜坐觀想左腳的大拇趾（方法參考楊定一博士） ----------
// 安定 30 秒（自然呼吸）→ 觀想 8 秒 → 皮、肉、筋膜各 15 秒撥開（選「直接露出骨頭」或減少動態效果就跳過）→ 只剩白骨，只專注在這裡（每 3 分鐘換一句提醒）→ 最後 30 秒回到呼吸 → 響一聲鐘結束
// 撥開皮肉的動畫只在這個練習；白骨主題的其他練習一律是撥好的樣子。練習畫面用主題自己的背景和顏色；左腳的畫法：淺色主題用白描、深色主題用月白，白骨主題照主題本身
const BP_REM = ['走神了也沒關係，輕輕回到大拇趾', '不用用力，只是看著它', '只看這一段白骨，其他一概不理'];
let bp = null, bpRaf = 0;
const bpLook = () => BONE[state.theme] || (['dark', 'night', 'fire', 'fireflies', 'chakra', 'gold', 'senko'].includes(state.theme) ? 'moon' : 'ink');
function bpOpen() {
  bpRenderSetup();
  show('bpSetup');
  screens.bpSetup.scrollTop = 0;
  if (!state.bnAck) bpSafety(true);
}
function bpSafety(on) {
  $('bpSafety').hidden = !on;
  $('bpChk').checked = false; $('bpAckBtn').disabled = true;
  $('bpAckBox').hidden = !!state.bnAck;
  $('bpSafetyClose').hidden = !state.bnAck;
}
$('bpChk').addEventListener('change', e => { $('bpAckBtn').disabled = !e.target.checked; });
function bpRenderSetup() {
  const m = state.bnMin || 10, open = !!state.bnOpen;
  $('bpMinutes').value = m; $('bpMinVal').textContent = m; $('bpMinBtn').textContent = m;
  rbOpts($('bpOpenOpts'), [[false, '自動撥皮肉'], [true, '直接露出骨頭']], v => open === v, v => { state.bnOpen = v; save(); bpRenderSetup(); });
  $('bpOpenNote').textContent = open ? '安定下來以後，直接是撥好、露出白骨的樣子。' : '安定下來以後，皮、肉、筋膜一層層撥開，約 1 分鐘撥完，之後停住。';
  // 背景音樂：和其他練習共用同一個設定
  musicGrid($('bpMusic'), state.music, k => { state.music = k; save(); bpRenderSetup(); });
  $('bpMineBox').hidden = !mine.length;
  $('bpMineRows').innerHTML = '';
  mine.forEach(mm => {
    const row = document.createElement('div');
    row.className = 'mine-row';
    row.innerHTML = '<span></span><button>刪除</button>';
    row.firstChild.textContent = mm.name;
    row.lastChild.addEventListener('click', () => delMine(mm));
    $('bpMineRows').appendChild(row);
  });
  $('bpMusicHint').hidden = state.music === 'none';
}
$('bpMinutes').addEventListener('input', e => { state.bnMin = Math.min(30, Math.max(3, +e.target.value)); save(); bpRenderSetup(); });
const bpEl = () => (bp ? ((bp.pAt != null ? bp.pAt : performance.now()) - bp.t0 - bp.off) / 1000 : 0);
function bpAt(el) {
  const T = bp.T, quick = bp.open || reducedMotion();
  if (el >= T - 30) return { ph: 3, lab: '回到呼吸', hint: '慢慢把注意力帶回呼吸，再感覺整個身體', fade: Math.min(1, (el - (T - 30)) / 10) };
  if (el < 30) return { ph: quick ? 3 : 0, lab: '安定下來', hint: '坐好，放鬆肩膀，先自然地呼吸幾口', fade: 0 };
  const e = el - 30, P = BN_T0 + 3 * BN_LAYER;
  if (!quick && e < P) {
    if (e < BN_T0) return { ph: 0, lab: '觀想', hint: '把注意力放到左腳的大拇趾', fade: 0 };
    const p = (e - BN_T0) / BN_LAYER, n = ['皮', '肉', '筋膜'][Math.min(2, Math.floor(p))];
    return { ph: p, lab: '剝去' + n, hint: '想像大拇趾的' + n + '一層層剝開，不急，慢慢來', fade: 0 };
  }
  const f = e - (quick ? 0 : P), k = Math.floor(f / 180), rem = k > 0 && f - k * 180 < 20;
  return { ph: 3, lab: '只剩白骨', hint: rem ? BP_REM[(k - 1) % BP_REM.length] : '只專注在這裡，其他一概不理', fade: 0 };
}
function bpText(l, h) { if ($('bpLabel').textContent !== l) $('bpLabel').textContent = l; if ($('bpHint').textContent !== h) $('bpHint').textContent = h; }
function bpPausedUi(on) { $('bpPauseBtn').hidden = on; $('bpResumeBtn').hidden = !on; }
function bpStart() {
  clearAll(); stopMusic(true); stopPreview(); cancelAnimationFrame(bpRaf);
  $('bpSafety').hidden = true;
  ctx(); keepAlive.play().catch(() => {}); lockWake();
  if (state.music !== 'none') playMusic(state.music);   // 背景音樂：和其他練習一樣，開始時播放
  const m = state.bnMin || 10;
  bp = { t0: performance.now(), off: 0, pAt: null, T: m * 60, open: !!state.bnOpen, cv: null, last: null, left: -1 };
  bpPausedUi(false);
  $('bpLeft').textContent = fmt(m * 60);
  $('bpProgress').style.transition = 'none'; $('bpProgress').style.width = '0%'; void $('bpProgress').offsetWidth; $('bpProgress').style.transition = '';
  bpText('安定下來', '坐好，放鬆肩膀，先自然地呼吸幾口');
  show('bpRun');
  const tick = () => { bpTick(); bpRaf = requestAnimationFrame(tick); };
  bpRaf = requestAnimationFrame(tick);
}
function bpTick() {
  if (!bp) return;
  const el = bpEl();
  if (bp.pAt == null && el >= bp.T) { bpFinish(); return; }
  const st = bpAt(Math.min(el, bp.T));
  if (bp.pAt == null) {
    bpText(st.lab, st.hint);
    const left = Math.max(0, Math.ceil(bp.T - el));
    if (left !== bp.left) { bp.left = left; $('bpLeft').textContent = fmt(left); $('bpProgress').style.width = Math.min(100, el / bp.T * 100) + '%'; }
  }
  bpDraw(st);
}
// 畫面：主題自己的背景照常（和其他練習一樣），這張透明的畫布上只畫左腳，大拇趾在正中間偏上，只有大拇趾亮；回到呼吸時整隻腳慢慢淡一點、白骨的光收起來
// 其他腳趾偏暗時往主題的底色沉（白骨主題用原本的顏色）
function bpVeil() {
  if (BONE[state.theme]) return '';
  const c = getComputedStyle(document.documentElement).getPropertyValue('--screen').trim(), m = /^#([0-9a-f]{6})$/i.exec(c);
  if (!m) return '';
  const n = parseInt(m[1], 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',.62)';
}
function bpDraw(st) {
  const c = $('bpCv'), W = c.clientWidth, H = c.clientHeight;
  if (!W || !H) return;
  const d = Math.min(2, window.devicePixelRatio || 1), k = bpLook(), veil = bpVeil(), t = performance.now() / 1000;
  if (!bp.cv || bp.cv.k !== k || bp.cv.veil !== veil || c.width !== Math.round(W * d) || c.height !== Math.round(H * d)) {
    c.width = Math.round(W * d); c.height = Math.round(H * d);
    bp.cv = { k, veil, off: bnOff(W, H, d), cache: {} };
  }
  const g2 = c.getContext('2d');
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, c.width, c.height); g2.setTransform(d, 0, 0, d, 0, 0);
  const S = Math.min(160, W * .4, H * .2), X = W / 2, Y = Math.max(84, H * .15), pulse = (reducedMotion() ? .5 : .5 + .5 * Math.sin(t * 2 * Math.PI / 10)) * (1 - st.fade);
  c.style.opacity = (1 - .45 * st.fade).toFixed(3);
  bnToeC(g2, k, X, Y, S, st.ph, pulse, bp.cv.off, bp.cv.cache, 1, veil);
}
function bpPause() { if (!bp || bp.pAt != null) return; bp.pAt = performance.now(); bpPausedUi(true); bpText('已暫停', '按「繼續」接著練習'); }
function bpResume() { if (!bp || bp.pAt == null) return; bp.off += performance.now() - bp.pAt; bp.pAt = null; bpPausedUi(false); }
function bpEnd() { cancelAnimationFrame(bpRaf); releaseWake(); stopMusic(); keepAlive.pause(); bp = null; }
// 練完：時間到響一聲鐘，記進今天的練習；中途停止不記錄
function bpFinish() {
  const sec = Math.round(bp.T);
  bpEnd();
  if (!syncPaused) { ctx(); [[1, .14, 2.6], [2.76, .04, 1.5], [5.4, .015, .8]].forEach(([m, v, d]) => {
    const now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 523.25 * m; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(v, now + .01); g.gain.exponentialRampToValueAtTime(.0001, now + d);
    o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + d + .05);
  }); }
  logDone('bone', sec);
  $('bpDoneText').textContent = mins(sec) + ' 分鐘・白骨觀';
  show('bpDone');
  showAward();
}
function bpStop() { bpEnd(); syncPaused = false; showResumeTip(false); bpRenderSetup(); show('bpSetup'); }
function bpAction(a) {
  if (a === 'start') bpStart();
  else if (a === 'stop') bpStop();
  else if (a === 'pause') bpPause();
  else if (a === 'resume') bpResume();
  else if (a === 'safety') bpSafety(true);
  else if (a === 'safety-close') $('bpSafety').hidden = true;
  else if (a === 'ack') { if ($('bpChk').checked) { state.bnAck = true; save(); $('bpSafety').hidden = true; } }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && bp) lockWake(); });

// ---------- 聆聽：不做呼吸練習，單純聽聲音 ----------
// 最多同時 3 種聲音，各自調音量；時間 10–60 分鐘或不限，結束前慢慢變小聲（音量平方曲線，聽起來比較均勻）
// 自動變暗：開始播放後 10 秒沒碰螢幕，蓋上一層全黑的畫面。不算練習次數、不給印章
// 每種聲音一條音軌：同一個網站（或自己上傳）的音檔接到自己的 GainNode，iPhone 也能各自調音量、慢慢變小聲
const LS_MAX = 3, LS_MINS = [10, 20, 30, 45, 60, 0], LS_FADES = [1, 10], LS_DIM_AFTER = 10000;
let ls = null, lsIv = 0, lsWarn = false, lsWarnT = 0;
const lsKnown = k => typeof k === 'string' && (k.startsWith('mine:') ? !!myUrls[k.slice(5)] : k !== 'none' && MUSIC.some(([x]) => x === k));
const lsSel = () => (Array.isArray(state.lsSel) ? state.lsSel : []).filter(lsKnown).slice(0, LS_MAX);
const lsVolOf = k => { const v = (state.lsVol || {})[k]; return typeof v === 'number' ? v : .7; };
function lsName(k) {
  if (k.startsWith('mine:')) { const m = mine.find(x => x.id === k.slice(5)); return m ? m.name : '我的錄音'; }
  const m = MUSIC.find(([x]) => x === k); return m ? m[1] : k;
}
function lsToggle(k) {
  const sel = lsSel();
  if (sel.includes(k)) { state.lsSel = sel.filter(x => x !== k); lsWarn = false; }
  else if (sel.length < LS_MAX) state.lsSel = [...sel, k];
  else { lsWarnGo(); return; }
  save(); lsRenderSetup();
}
// 已經選了 3 種還點別的：提醒最多 3 種（說明變紅色 2.5 秒）
function lsWarnGo() {
  clearTimeout(lsWarnT); lsWarn = true; lsRenderSetup();
  lsWarnT = setTimeout(() => { lsWarn = false; if (!screens.lsSetup.hidden) lsRenderSetup(); }, 2500);
}
function lsSetVol(k, v) {
  state.lsVol = { ...(state.lsVol || {}), [k]: v }; save();
  const t = ls && ls.tr.find(x => x.k === k);
  if (t) { t.v = v; lsApply(t, .06); }
}
// 音量列：名稱、滑桿、（設定頁才有）× 取消
function lsVolRows(box, items, canDel) {
  box.innerHTML = '';
  items.forEach(({ k, v }) => {
    const row = document.createElement('div');
    row.className = 'ls-vol';
    row.innerHTML = '<span class="ls-vol-name"></span><input type="range" min="0" max="1" step="0.05" aria-label="音量">' + (canDel ? '<button class="ls-vol-del" aria-label="取消這個聲音">×</button>' : '');
    row.firstChild.textContent = lsName(k);
    const r = row.querySelector('input');
    r.value = v;
    r.addEventListener('input', () => lsSetVol(k, +r.value));
    if (canDel) row.lastChild.addEventListener('click', () => lsToggle(k));
    box.appendChild(row);
  });
}
function lsOpts(box, opts, isOn, pick) {
  box.innerHTML = '';
  opts.forEach(([k, l]) => {
    const b = document.createElement('button');
    b.className = 'music-opt' + (isOn(k) ? ' on' : '');
    b.textContent = l;
    b.addEventListener('click', () => pick(k));
    box.appendChild(b);
  });
}
function lsRenderSetup() {
  const sel = lsSel(), full = sel.length >= LS_MAX, min = +state.lsMin || 0, fd = +state.lsFade || 1, fm = min ? Math.min(fd, min / 2) : 0, warn = lsWarn && full;
  $('lsSelNote').textContent = '最多選 ' + LS_MAX + ' 種' + (sel.length ? '・已選 ' + sel.length : '');
  $('lsSelNote').classList.toggle('warn', warn);
  const box = $('lsSounds');
  box.innerHTML = '';
  MUSIC.filter(([k]) => k !== 'none').concat(mine.map(m => ['mine:' + m.id, m.name])).forEach(([k, l]) => {
    const on = sel.includes(k), b = document.createElement('button');
    b.className = 'music-opt' + (on ? ' on' : '') + (!on && full ? ' ls-off' : '');
    b.textContent = l; b.title = l; b.setAttribute('aria-pressed', on);
    b.addEventListener('click', () => lsToggle(k));
    box.appendChild(b);
  });
  if (mine.length < MINE_MAX) {
    const b = document.createElement('button');
    b.className = 'music-opt music-upload' + (full ? ' ls-off' : '');
    b.textContent = '＋ 上傳錄音';
    b.addEventListener('click', () => { if (lsSel().length >= LS_MAX) lsWarnGo(); else $('mineFile').click(); });
    box.appendChild(b);
  }
  $('lsVolBox').hidden = !sel.length;
  lsVolRows($('lsVols'), sel.map(k => ({ k, v: lsVolOf(k) })), true);
  $('lsMixNote').textContent = !sel.length ? '先選一種聲音。最多可以選 3 種一起播，例如雨聲加手碟。'
    : full ? (warn ? '最多只能選 3 種。' : '已經選了 3 種。') + '想換別的，先點一個已選的取消。'
    : '可以再選，最多 3 種一起播。播放時也能調音量。';
  $('lsMixNote').classList.toggle('warn', warn);
  $('lsMineBox').hidden = !mine.length;
  $('lsMineRows').innerHTML = '';
  mine.forEach(m => {
    const row = document.createElement('div');
    row.className = 'mine-row';
    row.innerHTML = '<span></span><button>刪除</button>';
    row.firstChild.textContent = m.name;
    row.lastChild.addEventListener('click', () => delMine(m));
    $('lsMineRows').appendChild(row);
  });
  lsOpts($('lsMins'), LS_MINS.map(m => [m, m ? m + ' 分鐘' : '不限']), m => m === min, m => { state.lsMin = m; save(); lsRenderSetup(); });
  $('lsFadeBox').hidden = !min;
  lsOpts($('lsFades'), LS_FADES.map(f => [f, '最後 ' + f + ' 分鐘']), f => f === fd, f => { state.lsFade = f; save(); lsRenderSetup(); });
  $('lsTimeNote').textContent = !min ? '不限時間：想停的時候按「停止」。'
    : fm < fd ? '時間比較短，會在最後 ' + fm + ' 分鐘慢慢變小聲，時間到就停。' : '聲音會慢慢變小，時間到就停，不會突然斷掉。';
  const dk = !!state.lsDim;
  $('lsDimBox').innerHTML = '';
  const t = document.createElement('button');
  t.className = 'wh-toggle' + (dk ? ' on' : '');
  t.setAttribute('role', 'switch'); t.setAttribute('aria-checked', dk);
  t.innerHTML = '<span>自動變暗</span><span class="wh-switch"></span>';
  t.addEventListener('click', () => { state.lsDim = !state.lsDim; save(); lsRenderSetup(); });
  $('lsDimBox').appendChild(t);
  $('lsDimNote').textContent = (dk ? '開始播放後，10 秒沒碰螢幕，畫面就會變暗，適合睡前。點一下螢幕就會顯示控制。' : '播放時也可以按「變暗」，讓畫面暗下來。') + '播放時螢幕不會自動關掉，播完才會。';
  $('lsStartBtn').textContent = min ? '開始聆聽 · ' + min + ' 分鐘' : '開始聆聽';
  $('lsStartBtn').classList.toggle('ls-off', !sel.length);
}
function lsOpen() {
  lsWarn = false;
  lsRenderSetup();
  show('lsSetup');
  screens.lsSetup.scrollTop = 0;
}
// 一條音軌：音檔（循環、輪播或自己上傳的）＋雨聲、水晶缽多一層當場合成的聲音
function lsTrack(k, l) {
  const a0 = ctx(), g = a0.createGain();
  g.gain.value = 0; g.connect(a0.destination);
  const t = { k, l, v: lsVolOf(k), g, els: [], nodes: [], ivs: [], cur: null, sw: false, direct: false };
  const live = () => ls === l && !l.paused;
  const list = MUSIC_LISTS[k] || (k.startsWith('mine:') ? [myUrls[k.slice(5)]] : null);
  const srcs = list ? null : [].concat(MUSIC_FILES[k] || []);
  const first = list ? list[0] : srcs[0];
  // 同一個網站（或自己上傳）的音檔才接到 GainNode；別的網站的音檔直接調 volume，至少一定聽得到
  try { const u = new URL(first, location.href); t.direct = !(u.protocol === 'blob:' || u.origin === location.origin); } catch (e) { t.direct = true; }
  const mk = src => {
    const a = new Audio();
    a.preload = 'auto'; a.setAttribute('playsinline', '');
    if (src) a.src = src;
    if (!t.direct) { try { a0.createMediaElementSource(a).connect(g); } catch (e) { t.direct = true; } }
    if (t.direct) a.volume = 0;
    // 被系統停掉（來電、別的 App 開始播放…）：整個暫停，等使用者按「繼續」
    a.addEventListener('pause', () => { if (t.cur === a && !a.ended && !t.sw && live()) lsSysPause(); });
    t.els.push(a);
    return a;
  };
  if (srcs) {
    const a = mk(srcs.shift());
    a.loop = true;
    a.onerror = () => { if (srcs.length && ls === l) { a.src = srcs.shift(); if (live()) a.play().catch(() => {}); } };
    const cut = LOOPCUT[k];
    if (cut) {
      // 頭尾有淡入淡出的音檔：跳過頭尾，兩個播放器接替
      a.loop = false;
      const b = mk();
      t.ivs.push(setInterval(() => {
        if (!b.src && a.currentSrc) b.src = a.currentSrc;
        const c = t.cur;
        if (!c || c.paused || !c.duration || c.currentTime < c.duration - cut[1]) return;
        const nx = c === a ? b : a;
        nx.currentTime = cut[0]; t.cur = nx; nx.play().catch(() => {}); c.pause();
      }, 40));
    }
    t.cur = a; a.play().catch(() => {});
  } else {
    let i = 0;
    const a = mk(list[0]);
    const next = () => {
      if (ls !== l) return;
      i = (i + 1) % list.length;
      t.sw = true;
      if (a.src.endsWith(list[i])) a.currentTime = 0; else a.src = list[i];
      t.sw = false;
      if (live()) a.play().catch(() => {});
    };
    a.onended = next; a.onerror = () => { if (list.length > 1) next(); };
    t.cur = a; a.play().catch(() => {});
  }
  const flt = (type, fr) => { const n = a0.createBiquadFilter(); n.type = type; n.frequency.value = fr; return n; };
  const gn = v => { const n = a0.createGain(); n.gain.value = v; return n; };
  if (k === 'rain') {
    const s = noise(), hp = flt('highpass', 900), lp = flt('lowpass', 6000), gg = gn(.35);
    s.connect(hp); hp.connect(lp); lp.connect(gg); gg.connect(g); s.start(); t.nodes.push(s);
  }
  if (k === 'bowl') {
    [[196, .06], [294, .035], [392, .025], [523.25, .012]].forEach(([fr, v], i) => {
      const o = a0.createOscillator(), gg = gn(v), lf = a0.createOscillator(), d = gn(v * .6);
      o.type = 'sine'; o.frequency.value = fr; o.connect(gg); gg.connect(g);
      lf.frequency.value = .07 + i * .03; lf.connect(d); d.connect(gg.gain);
      o.start(); lf.start(); t.nodes.push(o, lf);
    });
  }
  return t;
}
const lsEl = () => (ls ? ((ls.paused ? ls.pAt : performance.now()) - ls.t0) / 1000 : 0);
// 整體音量：開頭 3 秒淡入；有設時間的，最後一段慢慢變小聲
function lsLevel() {
  if (!ls || ls.paused) return 0;
  const el = lsEl();
  let f = Math.min(1, el / 3);
  if (ls.total) { const r = Math.max(0, Math.min(1, (ls.total - el) / ls.fade)); f *= r * r; }
  return f;
}
function lsApply(t, tc) {
  const v = t.v * lsLevel();
  try { t.g.gain.setTargetAtTime(v, ac.currentTime, tc || .15); } catch (e) {}
  if (t.direct) t.els.forEach(a => { a.volume = Math.max(0, Math.min(1, v)); });
}
function lsTick() {
  const l = ls;
  if (!l) return;
  const el = lsEl();
  if (l.total && el >= l.total) { lsEnd(); return; }
  if (!l.paused) l.tr.forEach(t => lsApply(t));
  if (!l.paused && state.lsDim && $('lsDim').hidden && performance.now() - l.poke > LS_DIM_AFTER) lsDimShow(true);
  if (!$('lsDim').hidden && BONE[state.theme]) lsDimDraw();
  lsUpdate();
}
function lsUpdate() {
  const l = ls;
  if (!l) return;
  const el = lsEl(), left = l.total ? Math.max(0, l.total - el) : 0, tt = l.total ? fmt(left) : fmt(Math.floor(el));
  $('lsTop').textContent = (l.total ? '剩 ' : '已播 ') + tt;
  $('lsBar').style.visibility = l.total ? 'visible' : 'hidden';
  $('lsProgress').style.width = (l.total ? Math.min(100, el / l.total * 100) : 0) + '%';
  $('lsStatus').textContent = l.paused ? (l.sys ? '聲音被系統暫停了，按「繼續」接著播放' : '已暫停') : l.total && left <= l.fade ? '正在慢慢變小聲'
    : BONE[state.theme] ? BN_TXT[4] : '';
  $('lsDimTime').textContent = l.paused ? '已暫停' : tt;
  $('lsPauseBtn').hidden = l.paused; $('lsResumeBtn').hidden = !l.paused;
  screens.lsRun.classList.toggle('ls-paused', l.paused);
}
function lsDimShow(on) { $('lsDim').hidden = !on; if (on && BONE[state.theme]) lsDimDraw(); }
function lsStart() {
  const sel = lsSel();
  if (!sel.length) return;
  lsStopAll(); clearAll(); stopMusic(true);
  ctx(); keepAlive.play().catch(() => {}); lockWake();
  const m = +state.lsMin || 0, total = m * 60, now = performance.now();
  const l = { tr: [], t0: now, paused: false, pAt: 0, sys: false, total, fade: total ? Math.min((+state.lsFade || 1) * 60, total / 2) : 0, poke: now };
  ls = l;
  l.tr = sel.map(k => lsTrack(k, l));
  $('lsNames').textContent = sel.map(lsName).join('・');
  lsVolRows($('lsRunVols'), l.tr.map(t => ({ k: t.k, v: t.v })), false);
  lsDimShow(false);
  lsIv = setInterval(lsTick, 200);
  lsUpdate();
  show('lsRun');
  screens.lsRun.scrollTop = 0;
}
function lsPause() {
  const l = ls;
  if (!l || l.paused) return;
  l.paused = true; l.pAt = performance.now();
  l.tr.forEach(t => { try { t.g.gain.setTargetAtTime(0, ac.currentTime, .08); } catch (e) {} if (t.direct) t.els.forEach(a => { a.volume = 0; }); });
  setTimeout(() => { if (ls === l && l.paused) l.tr.forEach(t => t.els.forEach(a => { if (!a.paused) a.pause(); })); }, 350);
  lsDimShow(false);
  lsUpdate();
}
function lsSysPause() { if (!ls || ls.paused) return; ls.sys = true; lsPause(); }
function lsResume() {
  const l = ls;
  if (!l || !l.paused) return;
  ctx(); keepAlive.play().catch(() => {});
  const now = performance.now();
  l.t0 += now - l.pAt; l.paused = false; l.sys = false; l.poke = now;
  l.tr.forEach(t => { const a = t.cur; if (a && a.paused) a.play().catch(() => {}); lsApply(t, .4); });
  lsUpdate();
}
// 停掉所有音軌：0.5 秒淡出後才真的停
function lsStopAll() {
  clearInterval(lsIv); lsIv = 0;
  const l = ls;
  ls = null;
  if (!l) return;
  const t0 = ac ? ac.currentTime : 0;
  l.tr.forEach(t => {
    try { t.g.gain.cancelScheduledValues(t0); t.g.gain.setValueAtTime(t.g.gain.value, t0); t.g.gain.linearRampToValueAtTime(0, t0 + .5); } catch (e) {}
    t.ivs.forEach(clearInterval);
    t.els.forEach(a => { a.onended = null; a.onerror = null; });
  });
  setTimeout(() => {
    l.tr.forEach(t => {
      t.els.forEach(a => { try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) {} });
      t.nodes.forEach(n => { try { n.stop(); } catch (e) {} });
      try { t.g.disconnect(); } catch (e) {}
    });
  }, 600);
  keepAlive.pause();
  lsDimShow(false);
  screens.lsRun.classList.remove('ls-paused');
}
function lsEnd() {
  const l = ls;
  if (!l) return;
  lsStopAll(); releaseWake();
  $('lsDoneText').textContent = '聽了 ' + Math.round(l.total / 60) + ' 分鐘。' + (state.lsDim ? '晚安。' : '');
  screens.lsDone.classList.toggle('ls-dark', !!state.lsDim);
  show('lsDone');
}
function lsStop() { lsStopAll(); releaseWake(); lsRenderSetup(); show('lsSetup'); }
function lsAction(a) {
  if (a === 'start') lsStart();
  else if (a === 'pause') lsPause();
  else if (a === 'resume') lsResume();
  else if (a === 'stop') lsStop();
  else if (a === 'dim') lsDimShow(true);
  else if (a === 'wake') { if (ls) ls.poke = performance.now(); lsDimShow(false); }
}
// 碰到螢幕就重新計時，10 秒沒碰才變暗
['pointerdown', 'input', 'keydown'].forEach(ev => $('lsRun').addEventListener(ev, () => { if (ls) ls.poke = performance.now(); }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && ls) { lockWake(); lsTick(); } });

// ---------- 事件 ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  const a = b.dataset.action;
  if (a === 'close') closeEx();
  else if (a === 'start') start();
  else if (a === 'stop') stopEx();
  else if (a === 'g-pause') gPause();
  else if (a === 'g-resume') gResume();
  else if (a === 'resume') resumeAllAudio();
  else if (a === 'badges-open') { setMenu(false); renderBadges(); screens.badges.scrollTop = 0; show('badges'); }
  else if (a === 'badges-close') show(null);
  else if (a === 'btab') { bTab = b.dataset.tab; renderBadges(); }
  else if (a === 'award-next') { awards.shift(); showAward(); }
  else if (a.startsWith('install-')) installAction(a.slice(8), e);
  else if (a.startsWith('sync-')) syncAction(a.slice(5), b, e);
  else if (a.startsWith('wh-')) whAction(a.slice(3));
  else if (a.startsWith('rb-')) rbAction(a.slice(3));
  else if (a.startsWith('ls-')) lsAction(a.slice(3));
  else if (a.startsWith('bp-')) bpAction(a.slice(3));
  else if (a === 'reset') { const c = { ...state.custom }; delete c[EX[cur].id === '478' ? '478-' + fKey() : EX[cur].id]; state.custom = c; save(); renderSetup(); }
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

// ---------- 主題（首頁選單：淺色、深色、夜空、營火、螢火蟲、櫻花、脈輪、中脈、白骨1～3、仙女棒；顏色在 styles.css） ----------
const THEMES = ['light', 'dark', 'night', 'fire', 'fireflies', 'sakura', 'chakra', 'gold', 'bone1', 'bone2', 'bone3', 'senko'];
const SKY = { fireflies: "url('assets/themes2/fireflies.jpg')", sakura: "url('assets/themes2/sakura-run.jpg')",  // 各畫面的背景圖
  chakra: 'linear-gradient(180deg,#191340 0%,#120e2e 48%,#0b0a1c 100%)', gold: 'linear-gradient(180deg,#1f1327 0%,#150d1b 50%,#0c0910 100%)',
  bone1: 'linear-gradient(180deg,#0c131a 0%,#0a1016 60%,#070b10 100%)', bone2: 'radial-gradient(ellipse at 50% 42%,#f7f3ea 0%,#f3eee3 55%,#e9e1cf 100%)', bone3: 'linear-gradient(180deg,#17120e 0%,#120e0b 60%,#0d0a08 100%)',
  senko: 'linear-gradient(180deg,#14141d 0%,#131110 55%,#12100e 100%)' };
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
  if (t === 'night') root.style.setProperty('--sky', starTex());
  else if (t === 'fire') root.style.setProperty('--sky', reducedMotion() ? "url('assets/warm/ember-v1.jpg')" : "url('assets/warm/ember-v1-plain.jpg')");
  else if (SKY[t]) root.style.setProperty('--sky', SKY[t]);
  else root.style.removeProperty('--sky');
  syncSparks();
  document.querySelectorAll('[data-theme-pick]').forEach(b => b.classList.toggle('on', b.dataset.themePick === t));
}
document.querySelectorAll('[data-theme-pick]').forEach(b => b.addEventListener('click', () => {
  state.theme = b.dataset.themePick;
  save(); applyTheme();
}));

// ---------- 會動的主題背景：營火的火星、螢火蟲、櫻花瓣 ----------
// 只有一個畫布，跟著目前最上層的畫面（首頁或某個練習畫面）移動；換畫面時會接著動。切到別的 App 時瀏覽器會自動暫停。
// 手機開了「減少動態效果」：營火改用畫好火星的靜態背景；螢火蟲、櫻花只畫一張靜止的。
function reducedMotion() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
const FX_OF = { fire: 'sparks', fireflies: 'fireflies', sakura: 'sakura', night: 'meteors', chakra: 'chakra', gold: 'goldbeam', bone1: 'bone1', bone2: 'bone2', bone3: 'bone3', senko: 'senko' };
const fx = { c: null, raf: 0, last: null, kind: null, st: null, w: 0, h: 0, drawn: null };
let brPhase = null;  // 練習時目前這一段（吸氣、閉氣或吐氣）什麼時候開始、有多長
// 練習時吸飽的程度 0～1：吸氣慢慢變 1、吐氣慢慢變 0、閉氣時維持；不在練習（或冰人呼吸）就是 null
function breathNow() {
  if (!brPhase || screens.run.hidden || cur == null || EX[cur].id === 'wimhof') return null;
  const u = Math.min(1, Math.max(0, ((gPause0 || performance.now()) - brPhase.t0) / (brPhase.dur * 1000)));   // 暫停時停在原地
  return brPhase.k === IN ? u : brPhase.k === OUT ? 1 - u : (brPhase.prev === OUT ? 0 : 1);
}
// 光點、花瓣先畫好，之後每格直接貼上
const fxImgs = {};
function glowImg(key, n, stops) {
  if (fxImgs[key]) return fxImgs[key];
  const c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'), r = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  stops.forEach(([p, col]) => r.addColorStop(p, col)); g.fillStyle = r; g.fillRect(0, 0, n, n); return fxImgs[key] = c;
}
const sparkImg = () => glowImg('spark', 32, [[0, 'rgba(255,236,190,1)'], [.18, 'rgba(255,190,100,.95)'], [.42, 'rgba(255,120,40,.35)'], [1, 'rgba(255,90,20,0)']]);
const fireflyImg = () => glowImg('firefly', 64, [[0, 'rgba(255,255,220,1)'], [.12, 'rgba(226,250,140,.95)'], [.35, 'rgba(170,230,70,.35)'], [1, 'rgba(170,230,70,0)']]);
// 櫻花瓣：前端有個小缺口，靠花心那頭比較白
function petalImgs() {
  if (fxImgs.petals) return fxImgs.petals;
  const mk = (c0, c1) => {
    const c = document.createElement('canvas'); c.width = c.height = 40; const g = c.getContext('2d');
    g.beginPath(); g.moveTo(20, 37); g.bezierCurveTo(8, 30, 3, 16, 12, 5); g.quadraticCurveTo(16, 4, 20, 10); g.quadraticCurveTo(24, 4, 28, 5); g.bezierCurveTo(37, 16, 32, 30, 20, 37); g.closePath();
    const r = g.createLinearGradient(20, 37, 20, 4); r.addColorStop(0, c0); r.addColorStop(1, c1); g.fillStyle = r; g.fill();
    g.strokeStyle = 'rgba(214,110,145,.35)'; g.lineWidth = .8; g.stroke(); return c;
  };
  return fxImgs.petals = [mk('#fff1f5', '#f7b3c8'), mk('#ffe9f0', '#f39cb8'), mk('#fff6f8', '#f8c4d4')];
}
const metImg = () => glowImg('meteor', 64, [[0, 'rgba(255,255,255,1)'], [.18, 'rgba(226,238,255,.85)'], [.45, 'rgba(150,185,255,.28)'], [1, 'rgba(120,160,255,0)']]);
// 流星：從右上往左下，尾巴隨飛行距離拉開
const newMet = (W, H) => {
  const R = Math.random, a = (152 + R() * 7) * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a),
    x = W * (.45 + R() * .75), y = H * (-.1 + R() * .28), v = 430 + R() * 220,
    tx = dx < 0 ? (-60 - x) / (dx * v) : 99, ty = dy > 0 ? (H + 60 - y) / (dy * v) : 99;
  return { x, y, dx, dy, v, len: 80 + R() * 70, w: 1.1 + R() * .9, age: 0, trav: 0, life: Math.max(.5, Math.min(tx, ty)) + .25 };
};
// 會閃爍的星星：亮起來、停一下、暗下去，然後換個地方重來
const newTw = (W, H) => {
  const R = Math.random;
  return { x: R() * W, y: R() * H * .92, r: 1.5 + R() * 2.4, t: -R() * 10, up: .9 + R() * 1.3, hold: .25 + R() * .7, dn: 1 + R() * 1.6, gap: 5 + R() * 9 };
};
const twA = w => {
  if (w.t < 0) return 0;
  if (w.t < w.up) return w.t / w.up;
  const b = w.t - w.up; if (b < w.hold) return 1;
  const c = b - w.hold; return c < w.dn ? 1 - c / w.dn : 0;
};
// 飛碟：慢慢橫越，幾秒後突然加速竄走，後面拖一道彩虹
const newUfo = (W, H) => {
  const R = Math.random, dir = R() < .5 ? 1 : -1;
  return { dir, x: dir > 0 ? -50 : W + 50, y0: H * (.08 + R() * .17), y: 0, v: 16 + R() * 14, s: 11 + R() * 5, t: 0, cruise: 5 + R() * 7, out: false, outT: 0, a: 0, sp: 0 };
};
const RB = ['rgba(255,95,109,', 'rgba(255,163,108,', 'rgba(255,224,102,', 'rgba(125,223,143,', 'rgba(111,200,255,', 'rgba(176,139,255,'];
function drawUfo(g, u, t) {
  const s = u.s, d = u.dir; g.save(); g.translate(u.x, u.y);
  const L = Math.min(250, s * 2 + (u.sp || 0) * .34);
  if (L > s * 2.2) {
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const o = (i - 2.5) * s * .15, x0 = -d * s * .85, x1 = -d * L, gr = g.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, RB[i] + (.55 * u.a).toFixed(3) + ')'); gr.addColorStop(.45, RB[i] + (.3 * u.a).toFixed(3) + ')'); gr.addColorStop(1, RB[i] + '0)');
      g.strokeStyle = gr; g.lineWidth = s * .14; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, o); g.bezierCurveTo(x0 + (x1 - x0) * .4, o * 1.25, x0 + (x1 - x0) * .7, o * 1.6, x1, o * 2); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
  }
  g.globalCompositeOperation = 'lighter';
  const gl = g.createRadialGradient(0, 0, 0, 0, 0, s * 2.4);
  gl.addColorStop(0, 'rgba(150,220,255,' + (.2 * u.a).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(120,180,255,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(0, 0, s * 2.4, 0, 6.2832); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = u.a; g.fillStyle = '#101d28'; g.strokeStyle = 'rgba(175,218,255,.8)'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(0, 0, s, s * .28, 0, 0, 6.2832); g.fill(); g.stroke();
  g.beginPath(); g.ellipse(0, -s * .04, s * .46, s * .34, 0, Math.PI, 0); g.fill(); g.stroke();
  for (let i = -1; i <= 1; i++) {
    const bl = .3 + .7 * Math.pow(Math.sin(t * 3.2 + i * 2.1), 2);
    g.fillStyle = 'rgba(255,' + Math.round(198 + 45 * bl) + ',140,' + (bl * u.a).toFixed(3) + ')';
    g.beginPath(); g.arc(i * s * .52, s * .2, s * .1, 0, 6.2832); g.fill();
  }
  g.globalAlpha = 1; g.restore();
}
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
// 脈輪、中脈兩個主題：首頁的中脈放在右邊不擋到練習名稱，練習畫面放在呼吸圖形正中間；「吸氣」和數字後面的光淡掉，字才清楚
const C7S=['244,134,146','246,172,118','242,214,134','146,210,170','136,192,236','156,160,238','206,180,248'];
const ezC=u=>u*u*(3-2*u);
const glowC=(g,x,y,r,col,a,mid)=>{if(a<=.002)return;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+col+','+a.toFixed(3)+')');gr.addColorStop(mid||.4,'rgba('+col+','+(a*.4).toFixed(3)+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);};
const chLay=(st,W,H,beam)=>{const l=st.lay||{},v=l.vis;
  if(v){const top=96,bot=H-110,vc=v.y+v.h/2,hh=Math.min(v.h,260),cb=l.clear&&l.clear.length?Math.max(...l.clear.map(r=>r.y+r.h)):vc+hh/2+90,root=Math.min(bot-6,cb+70),crown=top+8,throat=vc-hh*.34;
    return {run:true,x:v.x+v.w/2,top,bot:beam?bot+6:bot,k:1,clear:l.clear,ys:[root,Math.min(root-34,cb+28),vc+hh*.34,vc,throat,(crown+throat)/2,crown]};}
  const x=W/2+Math.min(W,480)/2-54,top=132,bot=beam?H+10:H-30,ys=[];for(let i=0;i<7;i++)ys.push(bot-(beam?40:18)+(top+10-(bot-(beam?40:18)))*i/6);
  return {run:false,x,top,bot,k:l.home===false?0:1,ys};};
const fxClear=(g,rs)=>{(rs||[]).forEach(r=>fxClear1(g,r));};
const fxClear1=(g,r)=>{if(!r)return;g.save();g.globalCompositeOperation='destination-out';g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(Math.max(r.w/2+60,110)/80,(r.h/2+16)/80);
  const gr=g.createRadialGradient(0,0,0,0,0,80);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(.6,'rgba(0,0,0,.85)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-80,-80,160,160);g.restore();};
let _chDot=null;const chDot=()=>{if(_chDot)return _chDot;const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d'),r=g.createRadialGradient(12,12,0,12,12,12);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(210,190,255,.75)');r.addColorStop(1,'rgba(210,190,255,0)');g.fillStyle=r;g.fillRect(0,0,24,24);return _chDot=c;};
let _gbDot=null;const gbDot=()=>{if(_gbDot)return _gbDot;const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d'),r=g.createRadialGradient(12,12,0,12,12,12);r.addColorStop(0,'rgba(255,246,220,1)');r.addColorStop(.3,'rgba(255,186,90,.75)');r.addColorStop(1,'rgba(255,186,90,0)');g.fillStyle=r;g.fillRect(0,0,24,24);return _gbDot=c;};
let _gbBeam=null;const gbBeam=()=>{if(_gbBeam)return _gbBeam;const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d'),im=g.createImageData(64,256);
  for(let y=0;y<256;y++)for(let x=0;x<64;x++){const d=(x-31.5)/13,v=y/255,a=Math.exp(-d*d)*Math.min(1,v*8,(1-v)*10),i=(y*64+x)*4;im.data[i]=255;im.data[i+1]=196;im.data[i+2]=110;im.data[i+3]=Math.round(a*255);}
  g.putImageData(im,0,0);return _gbBeam=c;};
// ---------- 白骨觀主題（白骨1 月白、白骨2 白描、白骨3 燭光）----------
// 左腳的前半段：五根腳趾和前腳掌（低頭看自己的左腳，大拇趾在右邊）。只有大拇趾會撥開：皮、肉、筋膜從趾尖沿著中線一層層往兩邊撥開，
// 只撥開前兩節，到第三節停住，撥開後不再合回去；露出的白骨會發亮。只有要撥開的大拇趾是亮的，其他腳趾和前腳掌偏暗
// 首頁右邊放一隻整隻稍暗的左腳；練習和聆聽時大拇趾在呼吸圖形／畫面的正中間。設定頁可以選「自動撥皮肉」或「直接露出骨頭」（所有練習共用）
const BONE = { bone1: 'moon', bone2: 'ink', bone3: 'candle' };
// 白骨觀主題：左腳的大拇趾（腳趾朝上，像低頭看自己的腳），皮、肉、筋膜三層從趾尖往腳背一層層剝除，最後只剩骨頭
// 座標：趾尖 y=0，往下到腳背 y≈1.2；x=0 是中線。S＝1 個單位的像素
function bnSm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function bnEz(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
// 大拇趾的寬度（一半）：趾尖圓、趾間關節稍微收、往腳背慢慢變寬
function bnHw(y) {
  var cap = .23;
  if (y < cap) { var u = (cap - y) / cap; return .275 * Math.sqrt(Math.max(0, 1 - u * u)); }
  return .275 - .024 * Math.exp(-Math.pow((y - .5) / .12, 2)) + .065 * bnSm(.66, 1.15, y);
}
// 中線：趾尖稍微往外側（左邊）偏，像真的大拇趾
function bnCx(y) { return -.035 * Math.pow(Math.max(0, 1 - y), 2); }
// 一層的外形：d 是往內縮的距離（皮 0、肉 .035、筋膜 .075）
function bnLayerPath(g, X, Y, S, d, y1, keep) {
  var L = [], R = [], y;
  for (y = 0; y <= y1; y += .01) {
    var w = bnHw(y) - d; if (w <= 0) continue;
    var wl = w * (.94 + .03 * bnSm(.4, .8, y));
    L.push([X + (bnCx(y) - wl) * S, Y + y * S]); R.push([X + (bnCx(y) + w) * S, Y + y * S]);
  }
  if (!L.length) return;
  if (!keep) g.beginPath(); g.moveTo(L[0][0], L[0][1]);
  for (var i = 1; i < L.length; i++) g.lineTo(L[i][0], L[i][1]);
  for (i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath();
}
// 整隻左腳的前半段：五根腳趾和前腳掌（低頭看自己的左腳：大拇趾在右邊，四根小腳趾往左排），只有大拇趾會撥開
// 大拇趾自己的三層只畫到趾根（y≈.86，撥開也停在這裡）；再往下是前腳掌，和其他腳趾一起畫，蓋住第三節
var BN_FOOT = true, BN_WEB = .86;
var BN_Y1 = BN_FOOT ? 1.02 : 1.32, BN_F0 = BN_FOOT ? .86 : .98, BN_F1 = BN_FOOT ? .99 : 1.24;
// 四根小腳趾：[中線 x, 半寬, 趾尖 y, 根部 y, 往內彎]
var BN_TOES = [[-.47, .14, .13, .8, 0], [-.79, .135, .24, .86, .02], [-1.09, .128, .36, .92, .05], [-1.36, .12, .5, .99, .1]];
var BN_FOOTST = { moon: ['#c9a691', 'rgba(255,232,214,.45)', .8, 'rgba(245,225,215,.4)'], ink: ['#ead6c0', 'rgba(80,58,40,.55)', 1.2, 'rgba(255,250,244,.75)'], candle: ['rgba(255,206,160,.16)', 'rgba(255,214,160,.72)', 1.4, null] };
// 大拇趾的輪廓線：整隻腳時兩側都只畫到趾根，下面接前腳掌的輪廓
function bnOutline(x, X, Y, S, d, y1) {
  if (!BN_FOOT) { bnLayerPath(x, X, Y, S, d, y1); x.stroke(); return; }
  var L = [], R = [], y;
  for (y = 0; y <= BN_WEB + .04; y += .01) { var w = bnHw(y) - d; if (w <= 0) continue; var wl = w * (.94 + .03 * bnSm(.4, .8, y)); L.push([X + (bnCx(y) - wl) * S, Y + y * S]); R.push([X + (bnCx(y) + w) * S, Y + y * S]); }
  if (!R.length) return;
  x.beginPath(); x.moveTo(L[L.length - 1][0], L[L.length - 1][1]);
  for (var i = L.length - 2; i >= 0; i--) x.lineTo(L[i][0], L[i][1]);
  for (i = 0; i < R.length; i++) x.lineTo(R[i][0], R[i][1]);
  x.stroke();
}
// 前腳掌和四根小腳趾的外形。回傳：填色用的封閉路徑已建好；另外給兩段要描邊的線（外側＋腳趾、內側）
function bnFootPath(g, X, Y, S) {
  var P = function (x, y) { return [X + x * S, Y + y * S]; }, A = [P(-1.42, 1.78), P(-1.48, 1.45), P(-1.5, 1.15)], B = [];
  for (var i = BN_TOES.length - 1; i >= 0; i--) {
    var t = BN_TOES[i], c = t[0], hw = t[1], tip = t[2], base = t[3], tl = t[4], cap = hw * 1.3, y;
    var wAt = function (y) { return hw * (1 + .14 * bnSm(base - .28, base, y)); }, cx = function (y) { return c + tl * (y - base); };
    for (y = base; y >= tip + cap; y -= .02) A.push(P(cx(y) - wAt(y), y));
    for (var a = Math.PI; a >= -1e-6; a -= Math.PI / 16) { var yy = tip + cap - Math.sin(a) * cap; A.push(P(cx(yy) + Math.cos(a) * hw, yy)); }
    for (y = tip + cap; y <= base - .03; y += .02) A.push(P(cx(y) + wAt(y), y));
  }
  A.push(P(bnCx(BN_WEB) - (bnHw(BN_WEB)) * .97, BN_WEB));
  // 大拇趾的趾根到腳背：沿著大拇趾的內側往下
  for (var yb = BN_WEB; yb <= 1.78; yb += .02) B.push(P(bnCx(Math.min(yb, 1.2)) + bnHw(Math.min(yb, 1.2)), yb));
  g.beginPath(); g.moveTo(A[0][0], A[0][1]);
  for (var j = 1; j < A.length; j++) g.lineTo(A[j][0], A[j][1]);
  for (j = 0; j < B.length; j++) g.lineTo(B[j][0], B[j][1]);
  g.closePath();
  return [A, B];
}
// 畫四根小腳趾和前腳掌（大拇趾趾根以上空著，撥開時下面才不會是皮）。dim＝偏暗的程度 0–1；veil＝偏暗用的顏色（不給就照主題）
var BN_DIM = { moon: 'rgba(6,10,14,.62)', ink: 'rgba(243,238,227,.62)', candle: 'rgba(12,9,7,.64)' };
var BN_UNDER = { candle: 'rgba(16,12,9,.92)' };
function bnFoot(g, k, X, Y, S, dim, off, veil) {
  if (!BN_FOOT) return;
  var mk = function (n) { var c = off[n]; if (!c) c = off[n] = document.createElement('canvas'); if (c.width !== off.width || c.height !== off.height) { c.width = off.width; c.height = off.height; } return c; };
  var c = mk('__foot'), x = c.getContext('2d'), d = off.__d, fs = BN_FOOTST[k];
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.setTransform(d, 0, 0, d, 0, 0);
  x.save();
  x.beginPath(); x.rect(-1e4, -1e4, 2e4, 2e4); bnLayerPath(x, X, Y, S, 0, BN_WEB, true); x.clip('evenodd');
  var L = bnFootPath(x, X, Y, S); x.fillStyle = fs[0]; x.fill();
  x.strokeStyle = fs[1]; x.lineWidth = fs[2];
  L.forEach(function (pts) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (var j = 1; j < pts.length; j++) x.lineTo(pts[j][0], pts[j][1]); x.stroke(); });
  // 小腳趾的趾甲
  BN_TOES.forEach(function (t) {
    var cx = X + (t[0] + t[4] * (t[2] + t[1] * .9 - t[3])) * S, cy = Y + (t[2] + t[1] * .9) * S;
    x.beginPath(); x.ellipse(cx, cy, t[1] * .62 * S, t[1] * .6 * S, 0, 0, 6.2832);
    if (fs[3]) { x.fillStyle = fs[3]; x.fill(); }
    if (k !== 'moon') { x.strokeStyle = fs[1]; x.lineWidth = k === 'ink' ? .8 : .9; x.globalAlpha = .7; x.stroke(); x.globalAlpha = 1; }
  });
  // 燭光的皮是半透明的：偏暗時在下面墊一層暗色，第三節（蹠骨）才不會從前腳掌透出亮光
  if (dim > 0 && BN_UNDER[k]) { x.globalCompositeOperation = 'destination-over'; bnFootPath(x, X, Y, S); x.fillStyle = BN_UNDER[k]; x.globalAlpha = dim; x.fill(); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
  x.restore();
  x.globalCompositeOperation = 'destination-out';
  // 往腳踝淡出
  var fo = x.createLinearGradient(0, Y + 1.36 * S, 0, Y + 1.7 * S); fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = fo; x.fillRect(-1e4, Y + 1.36 * S, 2e4, 1e4);
  // 偏暗：只有要撥開的大拇趾（前兩節）是亮的，其他腳趾和前腳掌整片蓋一層和背景相近的顏色（不是變透明，第三節才不會透出來）
  if (dim > 0) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = veil || BN_DIM[k]; x.globalAlpha = dim; x.fillRect(-1e4, -1e4, 2e4, 2e4); x.globalAlpha = 1; }
  x.globalCompositeOperation = 'source-over';
  g.drawImage(c, 0, 0, c.width / d, c.height / d);
}
// 骨頭：遠節趾骨、近節趾骨、第一蹠骨（往腳背淡出）
var BN_BONES = [
  // [上端 y, 下端 y, [[y, 半寬]...], 上端凸出, 下端凸出]
  [.075, .395, [[.08, .062], [.1, .094], [.14, .09], [.2, .068], [.27, .078], [.34, .122], [.385, .138]], .02, -.01],
  [.43, .79, [[.44, .1], [.47, .126], [.52, .108], [.6, .08], [.68, .086], [.74, .124], [.78, .152]], .02, -.014],
  [.83, 1.22, [[.84, .132], [.88, .172], [.95, .142], [1.02, .112], [1.12, .1], [1.22, .1]], .03, 0]
];
function bnBonePath(g, X, Y, S, b) {
  var pts = b[2], top = b[0], bot = b[1], L = [], R = [];
  function hwAt(y) {
    if (y <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) if (y <= pts[i][0]) { var a = pts[i - 1], c = pts[i], u = (y - a[0]) / (c[0] - a[0]); u = u * u * (3 - 2 * u); return a[1] + (c[1] - a[1]) * u; }
    return pts[pts.length - 1][1];
  }
  for (var y = top; y <= bot + 1e-6; y += .008) { var w = hwAt(y), cx = bnCx(y); L.push([X + (cx - w) * S, Y + y * S]); R.push([X + (cx + w) * S, Y + y * S]); }
  g.beginPath();
  var tc = bnCx(top);
  g.moveTo(L[0][0], L[0][1]);
  g.quadraticCurveTo(X + tc * S, Y + (top - b[3] * 2) * S, R[0][0], R[0][1]);
  for (var i = 1; i < R.length; i++) g.lineTo(R[i][0], R[i][1]);
  var bc = bnCx(bot);
  g.quadraticCurveTo(X + bc * S, Y + (bot - b[4] * 2) * S, L[L.length - 1][0], L[L.length - 1][1]);
  for (i = L.length - 2; i >= 0; i--) g.lineTo(L[i][0], L[i][1]);
  g.closePath();
}
// 趾甲（只在皮那一層）
function bnNailPath(g, X, Y, S) {
  var L = [], R = [], y;
  for (y = .05; y <= .27; y += .01) { var w = Math.min(.165, bnHw(y) - .06) * (1 - .25 * bnSm(.18, .27, y)); if (w <= 0) continue; L.push([X + (bnCx(y) - w * .95) * S, Y + y * S]); R.push([X + (bnCx(y) + w) * S, Y + y * S]); }
  g.beginPath(); g.moveTo(L[0][0], L[0][1]);
  for (var i = 1; i < L.length; i++) g.lineTo(L[i][0], L[i][1]);
  g.bezierCurveTo(L[L.length - 1][0], Y + .33 * S, R[R.length - 1][0], Y + .33 * S, R[R.length - 1][0], R[R.length - 1][1]);
  for (i = R.length - 2; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath();
}
// 三種畫法
var BN_ST = {
  moon: { bone: ['#ffffff', '#e7e6e1'], boneLine: 'rgba(255,255,255,.0)', glow: 'rgba(214,232,255,.75)', glowA: .9,
    layer: [['#c9a691', 'rgba(255,232,214,.45)'], ['#a0707a', 'rgba(240,180,186,.38)'], ['rgba(170,192,214,.5)', 'rgba(232,242,252,.5)']],
    nail: 'rgba(245,225,215,.45)', edge: '255,255,255', fade: 'rgba(5,9,13,1)' },
  ink: { bone: ['#ffffff', '#f5f0e6'], boneLine: 'rgba(52,44,36,.72)', glow: 'rgba(0,0,0,.12)', glowA: 0,
    layer: [['#ead6c0', 'rgba(80,58,40,.55)'], ['#e2bcb2', 'rgba(120,62,50,.42)'], ['rgba(200,212,218,.72)', 'rgba(70,86,96,.42)']],
    nail: 'rgba(255,250,244,.75)', edge: '120,90,60', fade: 'rgba(243,238,227,1)' },
  candle: { bone: ['#fffbf2', '#f2e3c8'], boneLine: 'rgba(255,236,200,.0)', glow: 'rgba(255,196,120,.65)', glowA: .85,
    layer: [['rgba(255,206,160,.16)', 'rgba(255,214,160,.72)'], ['rgba(255,176,130,.14)', 'rgba(255,190,140,.6)'], ['rgba(255,232,205,.1)', 'rgba(255,230,200,.5)']],
    nail: null, edge: '255,220,170', fade: 'rgba(21,17,13,1)' }
};
var BN_D = [0, .036, .078];
// 畫一層（還沒剝的部分）。p＝剝除進度 0–1：從趾尖往腳背剝，剝開的邊緣有一道淡淡的光
function bnLayer(g, k, i, X, Y, S, p, cvs) {
  var st = BN_ST[k], c = cvs, x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
  x.setTransform(c.__d, 0, 0, c.__d, 0, 0);
  if (k === 'candle') {
    // 燭光：不畫皮肉，只畫三條輪廓線；剝的時候輪廓往骨頭收、慢慢淡掉
    bnLayerPath(x, X, Y, S, BN_D[i], BN_Y1);
    x.fillStyle = st.layer[i][0]; x.fill();
    x.strokeStyle = st.layer[i][1]; x.lineWidth = i === 0 ? 1.4 : 1; x.setLineDash(i === 2 ? [3, 4] : []); bnOutline(x, X, Y, S, BN_D[i], BN_Y1); x.setLineDash([]);
  } else {
    bnLayerPath(x, X, Y, S, BN_D[i], BN_Y1);
    var gr = x.createLinearGradient(X - .3 * S, 0, X + .3 * S, 0);
    gr.addColorStop(0, st.layer[i][0]); gr.addColorStop(.55, st.layer[i][0]); gr.addColorStop(1, st.layer[i][0]);
    x.fillStyle = gr; x.fill();
    if (k === 'ink') { x.strokeStyle = st.layer[i][1]; x.lineWidth = i === 0 ? 1.3 : .9; bnOutline(x, X, Y, S, BN_D[i], BN_Y1); }
    else { x.strokeStyle = st.layer[i][1]; x.lineWidth = .8; bnOutline(x, X, Y, S, BN_D[i], BN_Y1); }
    if (i === 0 && st.nail) { bnNailPath(x, X, Y, S); x.fillStyle = st.nail; x.fill(); if (k === 'ink') { x.strokeStyle = 'rgba(80,58,40,.5)'; x.lineWidth = .9; x.stroke(); } }
    if (i === 2) {
      // 筋膜：幾條順著腳趾的細線（伸趾肌腱）
      x.save(); bnLayerPath(x, X, Y, S, BN_D[2], BN_Y1); x.clip();
      x.strokeStyle = st.layer[2][1]; x.lineWidth = .7;
      [-.11, -.05, 0, .05, .11].forEach(function (o, j) { x.globalAlpha = j === 2 ? 1 : .6; x.beginPath(); for (var y = .06; y <= 1.18; y += .02) { var xx = X + (bnCx(y) + o * (bnHw(y) / .3)) * S; if (y === .06) x.moveTo(xx, Y + y * S); else x.lineTo(xx, Y + y * S); } x.stroke(); });
      x.globalAlpha = 1; x.restore();
    }
    if (i === 1) {
      // 肉：淡淡的紋理
      x.save(); bnLayerPath(x, X, Y, S, BN_D[1], BN_Y1); x.clip();
      x.strokeStyle = st.layer[1][1]; x.globalAlpha = .35; x.lineWidth = .6;
      for (var j = 0; j < 9; j++) { var o = -.22 + j * .055; x.beginPath(); for (var y = .03; y <= 1.18; y += .03) { var xx = X + (bnCx(y) + o * (bnHw(y) / .3) + .006 * Math.sin(y * 20 + j)) * S; if (y === .03) x.moveTo(xx, Y + y * S); else x.lineTo(xx, Y + y * S); } x.stroke(); }
      x.globalAlpha = 1; x.restore();
    }
  }
  // 往腳背淡出
  x.globalCompositeOperation = 'destination-out';
  var f0 = BN_FOOT && i > 0 ? .76 : BN_F0, f1 = BN_FOOT && i > 0 ? .86 : BN_F1;
  var fo = x.createLinearGradient(0, Y + f0 * S, 0, Y + f1 * S); fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = fo; x.fillRect(-1e4, Y + f0 * S, 2e4, 1e4);
  x.globalCompositeOperation = 'source-over';
  if (p <= 0) { g.drawImage(c, 0, 0, c.width / c.__d, c.height / c.__d); return; }
  bnSplit(g, k, i, X, Y, S, p, c);
}
// 撥開：從趾尖沿著中線裂開，左右兩半往外翻開（外側不動、往外收、再往外拉一點），裂口一路往腳背延伸；
// 翻開的邊緣有一道內面的顏色，底下那層靠近邊緣有一點陰影，看起來是一層一層被撥開
var BN_FOLD = {
  moon: [['rgba(255,236,224,.85)', 'rgba(0,0,0,.42)'], ['rgba(246,196,204,.75)', 'rgba(0,0,0,.36)'], ['rgba(240,248,255,.7)', 'rgba(0,0,0,.26)']],
  ink: [['rgba(70,50,35,.7)', 'rgba(90,64,40,.16)'], ['rgba(110,56,46,.6)', 'rgba(110,56,46,.14)'], ['rgba(60,78,88,.55)', 'rgba(60,78,88,.12)']],
  candle: [['rgba(255,226,180,.85)', 'rgba(0,0,0,.1)'], ['rgba(255,200,160,.75)', 'rgba(0,0,0,.08)'], ['rgba(255,236,210,.65)', 'rgba(0,0,0,.06)']]
};
var BN_STOP = .92;   // 裂口最後停在 y≈.86（第二節和第三節之間）
function bnSplit(g, k, i, X, Y, S, p, c) {
  // 裂口從趾尖往下，只撥開前兩節，到第三節（連著腳背那一段）上緣就停住；撥開後不再合回去
  var d = c.__d, front = -.06 + BN_STOP * bnEz(p), step = 2, eL = [], eR = [], yEnd = 1.34 * S;
  // 先在另一張畫布上拼好（不透明地拼，接縫才不會有條紋），最後整張用同一個透明度畫上去
  var T = c.__tmp, t = T.getContext('2d');
  t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, T.width, T.height); t.setTransform(d, 0, 0, d, 0, 0);
  var Y0 = Math.round(Y), py, lastY = 0;
  for (py = 0; py < yEnd; py += step) {
    var y = py / S;
    if (y >= front) break;
    lastY = py + step;
    var w = bnHw(y) - BN_D[i]; if (w <= 0) continue;
    var u = bnEz((front - y) / .1), sx = 1 - .9 * u, sh = .06 * S * u;
    var cx = X + bnCx(y) * S, xl = cx - w * (.94 + .03 * bnSm(.4, .8, y)) * S - 3, xr = cx + w * S + 3, yy = Y0 + py;
    var wL = cx - xl, wR = xr - cx;
    // 左半邊：外側不動、往外收；右半邊一樣
    t.drawImage(c, xl * d, yy * d, wL * d, step * d, xl - sh, yy, wL * sx, step);
    t.drawImage(c, cx * d, yy * d, wR * d, step * d, xr + sh - wR * sx, yy, wR * sx, step);
    if (u > .03) { eL.push([xl - sh + wL * sx, yy + step / 2]); eR.push([xr + sh - wR * sx, yy + step / 2]); }
  }
  // 還沒裂開的部分一次畫
  var y1 = Y0 + lastY;
  if (y1 * d < c.height) t.drawImage(c, 0, y1 * d, c.width, c.height - y1 * d, 0, y1, c.width / d, c.height / d - y1);
  // 翻開的邊緣（內面的顏色）和底下那層的陰影
  var f = BN_FOLD[k][i];
  if (f[0] && eL.length > 1) {
    [eL, eR].forEach(function (E, side) {
      var dir = side ? -1 : 1;
      t.save();
      t.globalCompositeOperation = 'destination-over';
      t.strokeStyle = f[1]; t.lineWidth = k === 'ink' ? 5 : 7; t.filter = 'blur(3px)'; t.lineCap = 'round';
      t.beginPath(); E.forEach(function (q, j) { var x = q[0] + dir * 4; if (j) t.lineTo(x, q[1]); else t.moveTo(x, q[1]); }); t.stroke();
      t.filter = 'none'; t.globalCompositeOperation = 'source-over';
      t.strokeStyle = f[0]; t.lineWidth = k === 'ink' ? 1.1 : 1.8;
      t.beginPath(); E.forEach(function (q, j) { if (j) t.lineTo(q[0], q[1]); else t.moveTo(q[0], q[1]); }); t.stroke();
      t.restore();
    });
  }
  g.drawImage(T, 0, 0, T.width / d, T.height / d);
}
// 骨頭；pulse 0–1 讓光慢慢亮暗
function bnBone(g, k, X, Y, S, a, pulse) {
  var st = BN_ST[k];
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  if (st.glowA) {
    var gl = g.createRadialGradient(X, Y + .55 * S, 0, X, Y + .55 * S, .75 * S);
    var ga = st.glowA * (.35 + .3 * (pulse || 0));
    gl.addColorStop(0, st.glow.replace(/[\d.]+\)$/, (ga * .55).toFixed(3) + ')')); gl.addColorStop(.5, st.glow.replace(/[\d.]+\)$/, (ga * .18).toFixed(3) + ')')); gl.addColorStop(1, st.glow.replace(/[\d.]+\)$/, '0)'));
    g.save(); g.translate(X, Y + .55 * S); g.scale(.62, 1); g.translate(-X, -(Y + .55 * S)); g.fillStyle = gl; g.fillRect(X - S, Y - .3 * S, 2 * S, 1.8 * S); g.restore();
  }
  BN_BONES.forEach(function (b, j) {
    bnBonePath(g, X, Y, S, b);
    var gr = g.createLinearGradient(X - .2 * S, 0, X + .2 * S, 0); gr.addColorStop(0, st.bone[1]); gr.addColorStop(.42, st.bone[0]); gr.addColorStop(1, st.bone[1]);
    g.fillStyle = gr;
    if (st.glowA) { g.shadowColor = st.glow; g.shadowBlur = 10 + 10 * (pulse || 0); }
    else { g.shadowColor = 'rgba(60,45,30,.18)'; g.shadowBlur = 6; g.shadowOffsetY = 2; }
    g.fill(); g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
    if (st.boneLine && k === 'ink') { g.strokeStyle = st.boneLine; g.lineWidth = 1.1; g.stroke(); }
    // 骨頭上的一點紋理
    g.save(); bnBonePath(g, X, Y, S, b); g.clip();
    g.strokeStyle = k === 'ink' ? 'rgba(60,50,40,.16)' : 'rgba(150,140,125,.22)'; g.lineWidth = .7;
    var mid = (b[0] + b[1]) / 2; g.beginPath(); g.moveTo(X + (bnCx(mid) - .015) * S, Y + (b[0] + .04) * S); g.quadraticCurveTo(X + (bnCx(mid) + .02) * S, Y + mid * S, X + (bnCx(mid) - .01) * S, Y + (b[1] - .04) * S); g.stroke();
    g.restore();
  });
  // 蹠骨往腳背淡出
  g.globalCompositeOperation = 'destination-out';
  var b0 = BN_FOOT ? 1.08 : .98, b1 = BN_FOOT ? 1.24 : 1.2;
  var fo = g.createLinearGradient(0, Y + b0 * S, 0, Y + b1 * S); fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = fo; g.fillRect(X - .4 * S, Y + b0 * S, .8 * S, .4 * S);
  g.globalCompositeOperation = 'source-over';
  g.restore();
}
// 完整的一幀：ph＝剝除進度 0–3（0 皮還在、1 皮剝完、2 肉剝完、3 只剩骨頭）
function bnToe(g, k, X, Y, S, ph, pulse, layerCanvas, boneA, dim) {
  // 骨頭畫在自己的一層，避免「往腳背淡出」把底下的背景也挖掉
  var bc = layerCanvas.__bone, bx = bc.getContext('2d');
  bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, bc.width, bc.height); bx.setTransform(bc.__d, 0, 0, bc.__d, 0, 0);
  bnBone(bx, k, X, Y, S, 1, pulse);
  g.globalAlpha = boneA == null ? 1 : boneA; g.drawImage(bc, 0, 0, bc.width / bc.__d, bc.height / bc.__d); g.globalAlpha = 1;
  bnFoot(g, k, X, Y, S, dim == null ? 1 : dim, layerCanvas);
  for (var i = 2; i >= 0; i--) bnLayer(g, k, i, X, Y, S, Math.max(0, Math.min(1, ph - i)), layerCanvas);
  // 撥開後露出的前兩節白骨再亮一點：筋膜撥開時慢慢亮起來（燭光一開始就透出來，跟著撥開慢慢變亮）
  bnBloom(g, k, X, Y, S, k === 'candle' ? .35 + .65 * bnEz(ph / 3) : bnEz(ph - 2), pulse);
}
var BN_GLOW = { moon: '214,232,255', candle: '255,204,140', ink: '255,255,255' };
function bnBloom(g, k, X, Y, S, r, pulse) {
  if (r <= 0) return;
  var c = BN_GLOW[k], pl = .75 + .25 * (pulse || 0), cy = Y + .42 * S;
  g.save();
  // 只在撥開的範圍（前兩節）裡亮，第三節還包著皮肉，不讓光蓋上去
  g.beginPath(); g.rect(X - S, Y - .4 * S, 2 * S, 1.2 * S); g.clip();
  if (k === 'ink') {
    // 白描：在米色的紙上，骨頭四周暈出一圈白光，再把骨頭和墨線重畫在最上面，看起來更白、更亮
    [50, 30, 14].forEach(function (b) {
      [0, 1].forEach(function (j) { bnBonePath(g, X, Y, S, BN_BONES[j]); g.shadowColor = 'rgba(255,255,255,' + (r * pl).toFixed(3) + ')'; g.shadowBlur = b; g.fillStyle = '#ffffff'; g.fill(); });
    });
    g.shadowColor = 'transparent'; g.shadowBlur = 0;
    [0, 1].forEach(function (j) {
      var b = BN_BONES[j]; bnBonePath(g, X, Y, S, b);
      var gr = g.createLinearGradient(X - .2 * S, 0, X + .2 * S, 0); gr.addColorStop(0, '#f7f3ea'); gr.addColorStop(.45, '#ffffff'); gr.addColorStop(1, '#f7f3ea');
      g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(52,44,36,.72)'; g.lineWidth = 1.1; g.stroke();
      g.save(); bnBonePath(g, X, Y, S, b); g.clip(); g.strokeStyle = 'rgba(60,50,40,.16)'; g.lineWidth = .7;
      var mid = (b[0] + b[1]) / 2; g.beginPath(); g.moveTo(X + (bnCx(mid) - .015) * S, Y + (b[0] + .04) * S); g.quadraticCurveTo(X + (bnCx(mid) + .02) * S, Y + mid * S, X + (bnCx(mid) - .01) * S, Y + (b[1] - .04) * S); g.stroke(); g.restore();
    });
  } else {
    // 月白、燭光：用「疊加」的方式畫一圈光暈，再讓骨頭本身發光
    g.globalCompositeOperation = 'lighter';
    var rg = g.createRadialGradient(X, cy, 0, X, cy, .6 * S);
    rg.addColorStop(0, 'rgba(' + c + ',' + (.3 * r * pl).toFixed(3) + ')'); rg.addColorStop(.55, 'rgba(' + c + ',' + (.1 * r * pl).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + c + ',0)');
    g.save(); g.translate(X, cy); g.scale(.68, 1); g.translate(-X, -cy); g.fillStyle = rg; g.fillRect(X - S, cy - S, 2 * S, 2 * S); g.restore();
    [0, 1].forEach(function (j) {
      bnBonePath(g, X, Y, S, BN_BONES[j]);
      g.shadowColor = 'rgba(' + c + ',' + (.8 * r).toFixed(3) + ')'; g.shadowBlur = 14 + 10 * pl;
      g.fillStyle = 'rgba(255,255,255,' + (.13 * r * pl).toFixed(3) + ')'; g.fill();
    });
  }
  g.restore();
}
function bnOff(W, H, d) { var c = document.createElement('canvas'); c.width = W * d; c.height = H * d; c.__d = d; var b = document.createElement('canvas'); b.width = W * d; b.height = H * d; b.__d = d; c.__bone = b; var t = document.createElement('canvas'); t.width = W * d; t.height = H * d; c.__tmp = t; return c; }

// 撥開後的三層和前腳掌會停住不動，只有白骨的光在變：先畫成一張，沒變就直接貼上，手機比較省力。dim＝其他地方偏暗的程度，veil＝偏暗用的顏色
function bnToeC(g, k, X, Y, S, ph, pulse, off, cache, dim = 1, veil = '') {
  const bc = off.__bone, bx = bc.getContext('2d');
  bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, bc.width, bc.height); bx.setTransform(bc.__d, 0, 0, bc.__d, 0, 0);
  bnBone(bx, k, X, Y, S, 1, pulse);
  g.drawImage(bc, 0, 0, bc.width / bc.__d, bc.height / bc.__d);
  const key = [k, X.toFixed(1), Y.toFixed(1), S.toFixed(1), ph.toFixed(3), dim.toFixed(2), veil, off.width, off.height].join('|');
  if (cache.key !== key) {
    const C = cache.c || (cache.c = document.createElement('canvas'));
    C.width = off.width; C.height = off.height;
    const cx = C.getContext('2d'); cx.setTransform(off.__d, 0, 0, off.__d, 0, 0);
    bnFoot(cx, k, X, Y, S, dim, off, veil);
    for (let i = 2; i >= 0; i--) bnLayer(cx, k, i, X, Y, S, Math.max(0, Math.min(1, ph - i)), off);
    cache.key = key;
  }
  g.drawImage(cache.c, 0, 0, cache.c.width / off.__d, cache.c.height / off.__d);
  bnBloom(g, k, X, Y, S, k === 'candle' ? .35 + .65 * bnEz(ph / 3) : bnEz(ph - 2), pulse);
}
// 白描的宣紙：纖維、斑點和四角稍暗，先畫好一張
function bnGrain(W, H, d) {
  const c = document.createElement('canvas'); c.width = W * d; c.height = H * d;
  const g = c.getContext('2d'); g.scale(d, d);
  let s = 5; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < W * H / 260; i++) { g.fillStyle = 'rgba(120,100,70,' + (.03 + R() * .05).toFixed(3) + ')'; g.fillRect(R() * W, R() * H, .6 + R(), .6 + R()); }
  g.strokeStyle = 'rgba(140,120,90,.06)'; g.lineWidth = .5;
  for (let i = 0; i < W * H / 3300; i++) { const x = R() * W, y = R() * H, a = R() * 6.28, l = 6 + R() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + R() * 4, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(160,130,90,0)'); v.addColorStop(1, 'rgba(160,130,90,.12)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return c;
}
// 節奏：先 8 秒完整的腳趾，皮、肉、筋膜各 15 秒撥開（約 1 分鐘），之後停住。開了「減少動態效果」就直接是撥開後的樣子
const BN_T0 = 8, BN_LAYER = 15;
const bnPhOf = el => reducedMotion() ? 3 : Math.max(0, Math.min(3, (el - BN_T0) / BN_LAYER));
const BN_TXT = ['觀想左腳的大拇趾', '慢慢剝去皮', '剝去肉', '剝去筋膜', '只剩白骨。只專注在這裡，其他一概不理'];
const bnTxtOf = el => BN_TXT[reducedMotion() ? 4 : el < BN_T0 ? 0 : Math.min(4, 1 + Math.floor((el - BN_T0) / BN_LAYER))];
// 這次練習已經練了幾秒（暫停不算；聆聽用自己的計時）；不在練習就是 null。開始一次新的練習就從 0 算
let bnE = 0, bnLast = null, bnWas = false;
function bnEl() {
  if (ls && !screens.lsRun.hidden) return lsEl();
  if (!practicing()) { bnWas = false; bnLast = null; return null; }
  const now = performance.now();
  if (!bnWas) { bnWas = true; bnE = 0; bnLast = now; }
  const dt = bnLast == null ? 0 : Math.min(1, Math.max(0, now - bnLast) / 1000); bnLast = now;
  if (!(syncPaused || wh.paused || (rb && rb.pausedAt != null))) bnE += dt;
  return bnE;
}
// 會動的背景：白描是宣紙，月白、燭光有幾點很淡的微塵，燭光的光微微晃動；再畫左腳（練習時大拇趾在正中間）
function bnFx(k) {
  return {
    lay: true,
    init(st, W, H) { st.m = []; for (let i = 0; i < 26; i++) st.m.push({ x: Math.random() * W, y: Math.random() * H, v: 4 + Math.random() * 8, r: .5 + Math.random() * 1.1, ph: Math.random() * 6.28 }); },
    move(st, dt, W, H) { if (k === 'ink') return; for (const q of st.m) { q.y -= q.v * dt; q.ph += dt; if (q.y < -4) { q.y = H + 4; q.x = Math.random() * W; } } },
    draw(st, g, W, H, t) {
      const cw = g.canvas.width, ch = g.canvas.height, d = cw / W;
      if (!st.off || st.offW !== cw || st.offH !== ch) { st.off = bnOff(W, H, d); st.tmp = bnOff(W, H, d); st.cache = {}; st.offW = cw; st.offH = ch; st.grain = null; }
      if (k === 'ink') { if (!st.grain) st.grain = bnGrain(W, H, d); g.drawImage(st.grain, 0, 0, W, H); }
      else { g.fillStyle = k === 'moon' ? 'rgb(200,220,240)' : 'rgb(255,214,160)'; for (const q of st.m) { g.globalAlpha = .12 + .14 * Math.pow(Math.sin(q.ph), 2); g.beginPath(); g.arc(q.x + Math.sin(q.ph * .6) * 3, q.y, q.r, 0, 6.2832); g.fill(); } g.globalAlpha = 1; }
      if (k === 'candle') { const fl = .85 + .1 * Math.sin(t * 2.3) * Math.sin(t * 1.1 + 1) + .05 * Math.sin(t * 7.1); glowC(g, W / 2, H * .42, H * .55, '255,170,90', .1 * fl); }
      const l = st.lay || {}, v = l.vis, pulse = .5 + .5 * Math.sin(t * 2 * Math.PI / 10);
      let X, Y, S, A, dim = 1, ph = 3;
      if (v && st.ls) { S = Math.min(170, v.h * .78); X = v.x + v.w / 2; Y = v.y + v.h / 2 - .6 * S; A = 1; }
      else if (v) { S = Math.max(150, Math.min(200, v.h * .78)); X = v.x + v.w / 2; Y = v.y + v.h / 2 - .6 * S; A = .4; }
      else if (l.home) { S = 140; X = W - 46; Y = 180; A = .55; dim = .45; }
      else return;
      // 撥開皮肉的動畫只在「白骨觀」練習；這裡（首頁、其他練習、聆聽）一律是撥好、露出白骨的樣子
      if (A >= 1) { bnToeC(g, k, X, Y, S, ph, pulse, st.off, st.cache, dim); return; }
      const T = st.tmp, tx = T.getContext('2d');
      tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, T.width, T.height); tx.setTransform(d, 0, 0, d, 0, 0);
      bnToeC(tx, k, X, Y, S, ph, pulse, st.off, st.cache, dim);
      g.globalAlpha = A; g.drawImage(T, 0, 0, W, H); g.globalAlpha = 1;
      if (v) fxClear(g, l.clear);
    }
  };
}
// 聆聽變暗的畫面：放一隻淡淡的左腳，大拇趾在中間，已經撥好、露出白骨；這個畫面一律是深色，其他腳趾和前腳掌往黑暗裡沉（白描也一樣）
let bnDim = null;
function lsDimDraw() {
  const c = $('lsDimCv'), k = BONE[state.theme];
  if (!c || !k || !ls) return;
  const W = 300, H = 270, d = Math.min(2, window.devicePixelRatio || 1);
  if (c.width !== W * d || !bnDim) { c.width = W * d; c.height = H * d; bnDim = { off: bnOff(W, H, d), cache: {} }; }
  const g = c.getContext('2d'), t = performance.now() / 1000;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.setTransform(d, 0, 0, d, 0, 0);
  bnToeC(g, k, W / 2, 36, 150, 3, .5 + .5 * Math.sin(t * 2 * Math.PI / 10), bnDim.off, bnDim.cache, 1, 'rgba(4,6,8,.7)');
  // 左邊和下面慢慢淡掉，不會被畫布切出一條邊
  g.globalCompositeOperation = 'destination-out';
  let f = g.createLinearGradient(0, 0, 80, 0); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = f; g.fillRect(0, 0, 80, H);
  f = g.createLinearGradient(0, H - 70, 0, H); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = f; g.fillRect(0, H - 70, W, 70);
  g.globalCompositeOperation = 'source-over';
}
// 每一種有 init（一打開就鋪滿）、move（移動）、draw（畫出來）；br 是練習時吸飽的程度，不在練習時是 null
// ── 動態背景共用的小工具 ──
const axBlob=(g,x,y,r,c0,c1)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();};
const axEase=u=>{u=u<0?0:u>1?1:u;return u*u*(3-2*u);};
const axRand=seed=>{let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};};
const axCol=W=>{const w=Math.min(W,480);return [(W-w)/2,w];};   // 內容那一欄（最寬 480）的左邊和寬度
// ── 仙女棒（線香花火）：火星的多寡照自己的節奏，不跟著呼吸 ──
// 火星往外飛，飛到一半分岔成兩三條，有的再分一次；偶爾掉下一顆小火屑
function skStep(st,x,y,inten,dt){const R=Math.random,sp=st.sp;st.acc+=dt*58*inten;
  while(st.acc>=1){st.acc-=1;const a=R()*6.2832,v=(170+R()*170)*(.45+.55*inten);sp.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:.26+R()*.24,gen:0,fk:.5+R()*.3,done:false,len:16+R()*16});}
  for(let i=sp.length-1;i>=0;i--){const p=sp[i];p.t+=dt;if(p.t>=p.life){sp.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;
    if(!p.done&&p.t>p.life*p.fk&&p.gen<2){p.done=true;const n=p.gen===0?2+Math.floor(R()*3):(R()<.55?2:0),a0=Math.atan2(p.vy,p.vx),v0=Math.hypot(p.vx,p.vy)*.8;
      for(let j=0;j<n;j++){const a2=a0+(R()*2-1)*.95;sp.push({x:p.x,y:p.y,vx:Math.cos(a2)*v0,vy:Math.sin(a2)*v0,t:0,life:.12+R()*.14,gen:p.gen+1,fk:.55,done:false,len:p.len*.62});}}}
  st.et-=dt;if(st.et<=0){st.et=.5+R()*1.4;st.em.push({x,y,vx:(R()-.5)*30,vy:10,t:0});}
  for(let i=st.em.length-1;i>=0;i--){const p=st.em[i];p.t+=dt;if(p.t>1.3){st.em.splice(i,1);continue;}p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}}
function skDraw(st,g){g.globalCompositeOperation='lighter';g.lineCap='round';
  for(const p of st.sp){const v=Math.hypot(p.vx,p.vy)||1,L=Math.min(p.len,p.t*v),k=p.t/p.life,a=1-k*k,x0=p.x-p.vx/v*L,y0=p.y-p.vy/v*L;
    g.strokeStyle='rgba(255,150,50,'+(.3*a).toFixed(3)+')';g.lineWidth=2.6;g.beginPath();g.moveTo(x0,y0);g.lineTo(p.x,p.y);g.stroke();
    g.strokeStyle='rgba(255,236,190,'+(.95*a).toFixed(3)+')';g.lineWidth=1;g.beginPath();g.moveTo(x0,y0);g.lineTo(p.x,p.y);g.stroke();}
  for(const p of st.em){g.fillStyle='rgba(255,170,80,'+(.9*(1-p.t/1.3)).toFixed(3)+')';g.beginPath();g.arc(p.x,p.y,1.3,0,6.2832);g.fill();}
  g.globalCompositeOperation='source-over';}
// 靜止的一束火星（開了「減少動態效果」時用）
function skStill(g,x,y){const R=axRand(11);g.globalCompositeOperation='lighter';g.lineCap='round';
  for(let i=0;i<22;i++){const a=R()*6.2832,r0=10+R()*26,r1=r0+18+R()*26,x0=x+Math.cos(a)*r0,y0=y+Math.sin(a)*r0,x1=x+Math.cos(a)*r1,y1=y+Math.sin(a)*r1,n=2+Math.floor(R()*2);
    g.strokeStyle='rgba(255,150,50,.26)';g.lineWidth=2.6;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
    g.strokeStyle='rgba(255,236,190,.85)';g.lineWidth=1;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);
    for(let j=0;j<n;j++){const a2=a+(R()*2-1)*.9,l=8+R()*10;g.moveTo(x1,y1);g.lineTo(x1+Math.cos(a2)*l,y1+Math.sin(a2)*l);}g.stroke();}
  g.globalCompositeOperation='source-over';}
const FXS = {
 // 仙女棒：一顆小火球，火星像松葉一樣一段一段分岔散開。有呼吸圓點的練習，圓點就是那顆火球；其他畫面是一根紙捻從上面垂下來，火球掛在尾端。
 // 火星的多寡照自己的節奏（一輪 26 秒：剛點著 → 越來越旺 → 最旺 → 慢慢變小 → 只剩細細幾點），不跟著呼吸。開了「減少動態效果」就是一束靜止的火星
 senko:{lay:true,
  init(st){st.sp=[];st.em=[];st.acc=0;st.et=1;st.t=Math.random()*26;st.x=null;st.y=0;st.top=null;st.inten=.6;st.cv=null;st.dotEl=null;st.layQ=null;},
  level(T){const c=T%26,b=c<4?.25+.2*axEase(c/4):c<9?.45+.55*axEase((c-4)/5):c<15?1:c<22?1-.8*axEase((c-15)/7):.2;return b*(.92+.08*Math.sin(T*2.3));},
  // 呼吸的圓點現在在畫面的哪裡（這個畫面沒有圓點就是 null）
  dot(st){const c=st.cv;if(st.layQ!==st.lay||(st.dotEl&&!st.dotEl.isConnected)){st.layQ=st.lay;st.dotEl=(c.parentElement?[...c.parentElement.querySelectorAll('[data-fxdot]')]:[]).find(e=>e.getBoundingClientRect().width>0)||null;}   // 看得見的那一個
    const e=st.dotEl;if(!e)return null;const r=e.getBoundingClientRect(),cr=c.getBoundingClientRect();if(!r.width||!cr.width)return null;const k=c.clientWidth/cr.width;return [(r.left+r.width/2-cr.left)*k,(r.top+r.height/2-cr.top)*k];},
  move(st,dt,W,H){const rm=reducedMotion();
    if(!rm&&!(st.cv&&st.cv.isConnected)){st.sp.length=0;st.em.length=0;st.x=null;return;}   // 剛換畫面：等畫布接上再開始
    if(!rm)st.t+=dt;const T=st.t,v=(st.lay||{}).vis,col=axCol(W),d=rm?null:this.dot(st);
    if(d){st.x=d[0];st.y=d[1];st.top=null;}
    else if(v){st.x=col[0]+col[1]-46+(rm?0:3*Math.sin(T*.8));st.y=Math.max(104,v.y-4);st.top=64;}   // 沒有圓點的練習：掛在呼吸圖形的右上方
    else if((st.lay||{}).home){st.x=col[0]+col[1]*.8+(rm?0:3*Math.sin(T*.8));st.y=Math.min(H*.37,320);st.top=-4;}   // 首頁：從最上面垂下來，掛在右邊
    else{st.x=col[0]+col[1]-46+(rm?0:3*Math.sin(T*.8));st.y=Math.min(H*.37,320);st.top=88;}   // 其他畫面（白骨觀練習、設定頁）：靠右邊，從標題列下面垂下來，不穿過右上角的時間
    st.inten=rm?.8:this.level(T);if(!rm)skStep(st,st.x,st.y,st.inten,dt);},
  draw(st,g,W,H){st.cv=g.canvas;if(st.x==null)return;const L=st.lay||{},x=st.x,y=st.y,it=st.inten,rm=reducedMotion();
    if(rm)skStill(g,x,y);else skDraw(st,g);
    if(L.vis)fxClear(g,L.clear);
    // 火光最後才畫，文字後面只清掉火星，不會留下一塊暗影
    axBlob(g,x,y,150,'rgba(255,140,50,'+(.14*it).toFixed(3)+')','rgba(255,140,50,0)');axBlob(g,x,y,40,'rgba(255,176,84,'+(.55*it).toFixed(3)+')','rgba(255,176,84,0)');
    if(st.top!=null){const x0=x-(rm?0:3*Math.sin(st.t*.8));   // 紙捻和火球
      g.strokeStyle='rgba(214,190,160,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x0,st.top);g.quadraticCurveTo(x0,(st.top+y)/2,x,y-26);g.stroke();
      g.strokeStyle='rgba(128,96,66,.9)';g.lineWidth=1.4;g.beginPath();g.moveTo(x,y-26);g.lineTo(x,y-4);g.stroke();
      axBlob(g,x,y,11,'rgba(255,214,140,1)','rgba(255,170,70,0)');g.fillStyle='#fff6dc';g.beginPath();g.arc(x,y,4.2,0,6.2832);g.fill();}}},
  // 營火：火星從下方火光冒出，一直往上飄、一邊閃一邊淡掉，速度和數量固定
  sparks: {
    init(st, W, H) { st.p = []; st.acc = 0; for (let i = 0; i < 200; i++) this.move(st, .05, W, H); },
    move(st, dt, W, H) {
      st.acc += Math.min(110, 32 * W / 360) * dt;
      while (st.acc >= 1) {
        st.acc -= 1;
        st.p.push({ x: W / 2 + (Math.random() + Math.random() - 1) * W * .55, y: H - 10 - Math.random() * Math.min(180, H * .2),
          vx: (Math.random() - .5) * 8, vy: -(16 + Math.random() * 30), r: 3 + Math.random() ** 3 * 7,
          age: 0, life: 5 + Math.random() * 6, ph: Math.random() * 6.28, fl: 2 + Math.random() * 5 });
      }
      st.p = st.p.filter(s => {
        s.age += dt; if (s.age > s.life || s.y < -20) return false;
        s.ph += dt * s.fl; s.x += (s.vx + Math.sin(s.ph * .7) * 6) * dt; s.y += s.vy * dt; return true;
      });
    },
    draw(st, g) {
      const img = sparkImg(); g.globalCompositeOperation = 'lighter';
      for (const s of st.p) {
        const u = s.age / s.life, a = Math.max(0, (1 - u) * (u < .08 ? u / .08 : 1) * (.6 + .4 * Math.sin(s.ph)));
        const len = 1 + Math.min(2.2, Math.abs(s.vy) / 30);   // 往上飄時拉成一小條光
        g.globalAlpha = a; g.drawImage(img, s.x - s.r, s.y - s.r * len, s.r * 2, s.r * 2 * len);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  },
  // 螢火蟲：慢慢飛、各自一閃一閃；練習時一起跟著呼吸亮暗（吸飽最亮、吐完最暗）
  fireflies: {
    init(st, W, H) {
      st.p = []; st.lv = 1; const n = Math.min(60, Math.round(30 * W * H / 259200));
      for (let i = 0; i < n; i++) st.p.push({ x: Math.random() * W, y: H * (.2 + .76 * Math.pow(Math.random(), .7)), a: Math.random() * 6.28, turn: 0,
        v: 5 + Math.random() * 9, P: 2.6 + Math.random() * 3.2, ph: Math.random(), G: 12 + Math.random() * 10 });
    },
    move(st, dt, W, H, t, br) {
      st.lv += ((br == null ? 1 : .1 + .9 * br) - st.lv) * Math.min(1, dt * 3);
      for (const f of st.p) {
        f.turn += (Math.random() - .5) * dt * 3; f.turn *= Math.pow(.3, dt); f.a = wrapA(f.a + f.turn * dt);
        if (f.y < H * .18) f.a += wrapA(Math.PI / 2 - f.a) * dt; if (f.y > H - 30) f.a += wrapA(-Math.PI / 2 - f.a) * dt;
        f.x += Math.cos(f.a) * f.v * dt; f.y += Math.sin(f.a) * f.v * dt * .7 + Math.sin(t * 1.3 + f.ph * 6) * 3 * dt;
        if (f.x < -30) f.x = W + 30; else if (f.x > W + 30) f.x = -30;
      }
    },
    draw(st, g, W, H, t, br) {
      const img = fireflyImg(); g.globalCompositeOperation = 'lighter';
      for (const f of st.p) {
        const u = (t / f.P + f.ph) % 1, blink = u < .4 ? Math.pow(Math.sin(Math.PI * u / .4), 2) : 0;
        const b = br == null ? (.06 + .94 * blink) * st.lv : st.lv * (.5 + .5 * blink); if (b < .02) continue;
        const G = f.G * (.6 + .4 * b); g.globalAlpha = Math.min(1, b); g.drawImage(img, f.x - G, f.y - G, G * 2, G * 2);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  },
  // 櫻花：花瓣一邊翻轉、一邊左右擺著往下飄
  sakura: {
    init(st, W, H) { st.p = []; const n = Math.min(50, Math.round(22 * W * H / 259200)); for (let i = 0; i < n; i++) st.p.push(this.petal(W, Math.random() * H)); },
    petal(W, y) {
      const R = Math.random, im = petalImgs();
      return { x: R() * (W + 80) - 80, y, vy: 24 + R() * 20, vx: 6 + R() * 10, rot: R() * 6.28, vr: (R() - .5) * 2.4, fl: R() * 6.28, vf: 1.5 + R() * 2.5,
        sw: R() * 6.28, fs: .6 + R() * .8, amp: 8 + R() * 16, sz: 12 + R() * 9, img: im[(R() * 3) | 0], a: .8 + R() * .2 };
    },
    move(st, dt, W, H) {
      for (const p of st.p) {
        p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt; p.fl += p.vf * dt; p.sw += p.fs * dt;
        if (p.y > H + 24 || p.x > W + 40) Object.assign(p, this.petal(W, -24 - Math.random() * 40));
      }
    },
    draw(st, g) {
      for (const p of st.p) {
        g.save(); g.translate(p.x + Math.sin(p.sw) * p.amp, p.y); g.rotate(p.rot); g.scale(1, .2 + .8 * Math.abs(Math.cos(p.fl)));
        g.globalAlpha = p.a; g.drawImage(p.img, -p.sz / 2, -p.sz / 2, p.sz, p.sz); g.restore();
      }
      g.globalAlpha = 1;
    }
  },
  // 夜空：流星雨。平常什麼都沒有，每隔 15～26 秒來一陣，一次三到六顆；另外有幾顆星星輪流閃，偶爾飛過一台飛碟
  meteors: {
    init(st) { st.p = []; st.q = []; st.next = 4 + Math.random() * 8; st.u = null; st.uNext = 25 + Math.random() * 30; st.tw = null; },
    move(st, dt, W, H) {
      st.next -= dt;
      if (st.next <= 0) {
        const n = 3 + ((Math.random() * 4) | 0);
        for (let i = 0; i < n; i++) st.q.push(i * (.12 + Math.random() * .35));
        st.next = 15 + Math.random() * 11;
      }
      st.q = st.q.map(v => v - dt).filter(v => { if (v <= 0) { st.p.push(newMet(W, H)); return false; } return true; });
      const keep = [];
      for (const m of st.p) { m.age += dt; const d = m.v * dt; m.trav += d; m.x += m.dx * d; m.y += m.dy * d; if (m.age < m.life) keep.push(m); }
      st.p = keep;
      if (!st.tw) { st.tw = []; for (let i = 0; i < 11; i++) st.tw.push(newTw(W, H)); }
      for (const w of st.tw) { w.t += dt; if (w.t > w.up + w.hold + w.dn) { const n = newTw(W, H); n.t = -Math.random() * w.gap; Object.assign(w, n); } }
      if (!st.u) { st.uNext -= dt; if (st.uNext <= 0) { st.u = newUfo(W, H); st.uNext = 70 + Math.random() * 70; } }
      else {
        const u = st.u; u.t += dt;
        if (!u.out && u.t > u.cruise) { u.out = true; u.outT = u.t; }
        const k = u.out ? u.t - u.outT : 0, sp = u.v * (1 + k * k * 34); u.sp = sp;
        u.x += u.dir * sp * dt; if (u.out) u.y0 -= sp * .35 * dt;
        u.y = u.y0 + Math.sin(u.t * 1.1) * 3.5;
        u.a = Math.min(1, u.t / 1.2) * (u.out ? Math.max(0, 1 - k / 1.1) : 1);
        if (u.a <= 0 || u.x < -120 || u.x > W + 120 || u.y < -120) st.u = null;
      }
    },
    draw(st, g, W, H, t) {
      const img = metImg();
      if (st.u) drawUfo(g, st.u, t);
      g.globalCompositeOperation = 'lighter';
      if (st.tw) for (const w of st.tw) {
        const a = twA(w); if (a <= .02) continue;
        const r = w.r * 3.2; g.globalAlpha = a * .95; g.drawImage(img, w.x - r, w.y - r, r * 2, r * 2);
        if (w.r > 2.4) {
          const L = w.r * 3.4; g.strokeStyle = 'rgba(255,255,255,' + (a * .45).toFixed(3) + ')'; g.lineWidth = .8;
          g.beginPath(); g.moveTo(w.x - L, w.y); g.lineTo(w.x + L, w.y); g.moveTo(w.x, w.y - L); g.lineTo(w.x, w.y + L); g.stroke();
        }
        g.globalAlpha = 1;
      }
      for (const m of st.p) {
        const u = m.age / m.life, a = (u < .08 ? u / .08 : 1) * (u > .62 ? Math.max(0, (1 - u) / .38) : 1) * .9;
        if (a <= .01) continue;
        const L = Math.min(m.len, m.trav), tx = m.x - m.dx * L, ty = m.y - m.dy * L, gr = g.createLinearGradient(m.x, m.y, tx, ty);
        gr.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')'); gr.addColorStop(.18, 'rgba(214,232,255,' + (a * .55).toFixed(3) + ')');
        gr.addColorStop(.55, 'rgba(150,190,255,' + (a * .18).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(120,160,255,0)');
        g.strokeStyle = gr; g.lineWidth = m.w; g.lineCap = 'round';
        g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(tx, ty); g.stroke();
        const r = m.w * 3.4; g.globalAlpha = a; g.drawImage(img, m.x - r, m.y - r, r * 2, r * 2); g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'source-over';
    }
  },
 // 脈輪：七個脈輪沿著中脈，每 8 秒一道光從海底輪走到頂輪，到頂上散成一圈光；小光點沿著中脈往上飄
 chakra:{lay:true,init(st){st.stars=[];for(let i=0;i<64;i++)st.stars.push({x:Math.random(),y:Math.random(),r:.5+Math.random()*.9,ph:Math.random()*6.28,f:.3+Math.random()*.7});st.p=[];st.acc=0;},
  move(st,dt,W,H){const L=chLay(st,W,H);st.acc+=5*dt;while(st.acc>=1){st.acc-=1;st.p.push({y:L.bot-Math.random()*30,v:30+Math.random()*30,ph:Math.random()*6.28,r:1.2+Math.random()*1.2,life:0});}
    st.p=st.p.filter(q=>{q.y-=q.v*dt;q.ph+=dt*3;q.life+=dt;return q.y>L.top&&q.y<H+40;});},
  draw(st,g,W,H,t){const L=chLay(st,W,H),x=L.x,top=L.top,bot=L.bot,K=L.k;
    g.globalCompositeOperation='lighter';g.fillStyle='#d8d2ff';
    for(const s of st.stars){g.globalAlpha=.18+.22*Math.pow(Math.sin(t*s.f+s.ph),2);g.beginPath();g.arc(s.x*W,s.y*H,s.r,0,6.2832);g.fill();}
    g.globalAlpha=1;if(K<=0){g.globalCompositeOperation='source-over';return;}g.globalAlpha=K;
    const c=t%8,pulse=c<2.6?bot+(top-bot)*ezC(c/2.6):null,bloom=c>=2.4&&c<5?(c-2.4)/2.6:0;
    const dim=g.createLinearGradient(0,bot,0,top);C7S.forEach((cc,i)=>dim.addColorStop(i/6,'rgba('+cc+',.2)'));g.fillStyle=dim;g.beginPath();g.roundRect(x-5,top,10,bot-top,5);g.fill();
    g.save();g.shadowColor='rgba(190,176,250,.6)';g.shadowBlur=20;const lit=g.createLinearGradient(0,bot,0,top);C7S.forEach((cc,i)=>lit.addColorStop(i/6,'rgba('+cc+','+(L.run?.6:.56)+')'));
    g.fillStyle=lit;g.beginPath();g.roundRect(x-5,top,10,bot-top,5);g.fill();g.restore();
    g.fillStyle='rgba(255,255,255,'+(L.run?.26:.22)+')';g.fillRect(x-1.2,top+5,2.4,bot-top-10);
    L.ys.forEach((y,i)=>{const k=.66+(pulse===null?0:Math.exp(-Math.pow((y-pulse)/30,2)));glowC(g,x,y,32+12*Math.min(1,k),C7S[i],.38*k);glowC(g,x,y,12,'255,255,255',.45*Math.min(1.2,k),.5);});
    if(pulse!==null)glowC(g,x,pulse,30,'255,255,255',.5);
    if(bloom>0){const r=10+(L.run?26:54)*ezC(Math.min(1,bloom)),a=(1-bloom)*(L.run?.4:.5);glowC(g,x,top+10,26+30*bloom,'220,190,255',a);g.strokeStyle='rgba(230,210,255,'+(a*.8).toFixed(3)+')';g.lineWidth=1.2;g.beginPath();g.arc(x,top+10,r,0,6.2832);g.stroke();}
    const img=chDot();for(const q of st.p){g.globalAlpha=Math.min(1,q.life*2)*.7*K;g.drawImage(img,x-q.r*2+Math.sin(q.ph)*6,q.y-q.r*2,q.r*4,q.r*4);}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';if(L.run)fxClear(g,L.clear);}},
 // 中脈：一道金色光柱從底下貫通到頭頂，小光點一直用同樣的速度往上流，頭頂一團柔和的光
 goldbeam:{lay:true,init(st,W,H){st.p=[];for(let i=0;i<40;i++)st.p.push(this.mote(H,true));},
  mote(H,any){return {y:any?Math.random()*H:H+Math.random()*20,dx:(Math.random()*2-1)*(4+Math.random()*20),v:40+Math.random()*55,ph:Math.random()*6.28,f:1+Math.random()*2,r:1+Math.random()*1.6};},
  move(st,dt,W,H){const L=chLay(st,W,H,true);for(let i=0;i<st.p.length;i++){const q=st.p[i];q.y-=q.v*dt;q.ph+=q.f*dt;if(q.y<L.top+6){st.p[i]=this.mote(H,false);st.p[i].y=L.bot+Math.random()*20;}}},
  draw(st,g,W,H,t){const L=chLay(st,W,H,true),x=L.x,top=L.top,bot=L.bot,K=L.k*.75,sh=.9+.1*Math.sin(t*1.7)*Math.sin(t*.63),beam=gbBeam();if(K<=0)return;
    g.globalCompositeOperation='lighter';glowC(g,x,bot-20,90,'255,150,60',.22*K);
    g.globalAlpha=.6*K*sh;g.drawImage(beam,x-115,top,230,bot-top);g.globalAlpha=.95*K*sh;g.drawImage(beam,x-42,top,84,bot-top);g.globalAlpha=1;
    g.fillStyle='rgba(255,240,205,'+(.6*K).toFixed(3)+')';g.fillRect(x-5,top+6,10,bot-top-12);
    glowC(g,x,top+4,80,'255,196,110',.34*K);glowC(g,x,top+4,26,'255,240,210',.7*K,.5);
    const img=gbDot();for(const q of st.p){const e=Math.max(0,Math.min(1,(q.y-top)/60,(bot-q.y)/60));if(e<=0)continue;g.globalAlpha=e*(.45+.55*Math.pow(Math.sin(q.ph),2))*K;g.drawImage(img,x+q.dx+Math.sin(q.ph*.7)*2-q.r*2,q.y-q.r*2,q.r*4,q.r*4);}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';if(L.run)fxClear(g,L.clear);}},
 bone1:bnFx('moon'),bone2:bnFx('ink'),bone3:bnFx('candle')
};
// 脈輪、中脈：量出呼吸圖形和「吸氣／數字」在畫面上的位置（看不見的不算），中脈的光才知道要放哪、避開哪裡
function fxLay(host, c) {
  const cr = c.getBoundingClientRect(), R = e => { const r = e.getBoundingClientRect(); return r.width ? { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height } : null; };
  const all = sel => [...host.querySelectorAll(sel)].map(R).filter(Boolean);
  return { home: host.classList.contains('home'), vis: all('[data-fxvis]')[0] || null, clear: all('[data-fxclear]') };
}
// 要畫在哪個畫面：目前打開的練習畫面，沒有的話就是首頁（冰人呼吸的閉氣畫面不畫）
function fxHost() {
  const open = Object.values(screens).find(s => !s.hidden);
  return open ? (open.classList.contains('wh-hold') ? null : open) : document.querySelector('.home');
}
function drawFx(now) {
  fx.raf = requestAnimationFrame(drawFx);
  const host = fxHost(), c = fx.c, bnT = bnEl();
  if (!host) { c.hidden = true; fx.last = null; return; }
  if (c.parentNode !== host) host.prepend(c);
  c.hidden = false;
  const W = c.clientWidth, H = c.clientHeight; if (!W || !H) return;
  const still = reducedMotion();
  if (!fx.st || Math.abs(W - fx.w) > 40) { fx.st = {}; FXS[fx.kind].init(fx.st, W, H); fx.drawn = null; }
  if (still && fx.drawn === host && W === fx.w && H === fx.h) return;   // 減少動態效果：畫面沒換就不重畫
  fx.w = W; fx.h = H;
  const k = Math.min(2, window.devicePixelRatio || 1), cw = Math.round(W * k), ch = Math.round(H * k);
  if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
  const dt = still || fx.last == null ? 0 : Math.min(.05, Math.max(0, now - fx.last) / 1000); fx.last = now;
  const t = now / 1000, br = breathNow(), F = FXS[fx.kind];
  if (F.lay && (fx.layHost !== host || now - (fx.layT || 0) > 300)) { fx.layHost = host; fx.layT = now; fx.st.lay = fxLay(host, c); }
  fx.st.el = bnT; fx.st.ls = !!(ls && !screens.lsRun.hidden);
  F.move(fx.st, dt, W, H, t, br);
  const g = c.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, W, H); F.draw(fx.st, g, W, H, t, br);
  fx.drawn = host;
}
function syncSparks() {
  const kind = FX_OF[state.theme], on = !!kind && !((kind === 'sparks' || kind === 'meteors') && reducedMotion());
  if (on) {
    if (!fx.c) { fx.c = document.createElement('canvas'); fx.c.className = 'sparks'; fx.c.setAttribute('aria-hidden', 'true'); }
    if (fx.kind !== kind) { fx.kind = kind; fx.st = null; fx.last = null; }
    if (!fx.raf) { fx.last = null; fx.raf = requestAnimationFrame(drawFx); }
  } else {
    if (fx.raf) cancelAnimationFrame(fx.raf);
    fx.raf = 0; fx.st = null; fx.kind = null;
    if (fx.c) fx.c.remove();
  }
}

// ---------- 首頁右上角選單 ----------
function setMenu(open) {
  $('menuPop').hidden = !open;
  $('menuBtn').setAttribute('aria-expanded', open);
}
$('menuBtn').addEventListener('click', () => setMenu($('menuPop').hidden));
document.addEventListener('click', e => { if (!e.target.closest('#menu')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ---------- 雲端同步：練習紀錄、勳章、冰人呼吸紀錄和設定，存在每個人自己的 Google 雲端硬碟 ----------
// 放在雲端硬碟裡「應用程式專用」的隱藏資料夾：只有這個網站讀得到，別人（包括做網站的人）都看不到。
// 在 Google Cloud 建好「網頁應用程式」用戶端後，把用戶端 ID 填在這裡；空的就完全不顯示同步。
var GOOGLE_CLIENT_ID = '1015820070001-lsv79hbhorgdjl31s4nbltm3drict1r6.apps.googleusercontent.com';
var SYNC_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var SYNC_FILE = 'haohao-breath.json';
var LS_SYNC = 'haohao-breath-sync';   // 這台裝置的登入狀態 { email, token, exp, fileId, at }
var DRIVE = 'https://www.googleapis.com/drive/v3', UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
var syncOn = !!GOOGLE_CLIENT_ID;
// 會同步的設定（音量每台裝置不一樣，不同步）
var SET_KEYS = ['custom', 'minutes', 'music', 'theme', 'wh', 'whAck', 'nMode', 'rMode', 'cueSet', 'bellyCue', 'fMode', 'rbAck', 'rbSnd', 'lsSel', 'lsMin', 'lsFade', 'lsDim', 'bnOpen', 'bnMin', 'bnAck'];
// state.sy（跟著設定一起存）：dev 這台裝置的代號、others 其他裝置的紀錄、stamps 每項設定最後修改的時間、dirty 最後一次有變更的時間
var sync = null, lastSnap = null, applying = false;
var syncTimer = 0, syncBusy = false, syncAgain = false, syncErr = '', tokenClient = null, gisP = null;
// 比較兩份資料：先把物件的欄位排好順序，順序不同但內容一樣也算一樣
const syCanon = v => Array.isArray(v) ? v.map(syCanon) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => { o[k] = syCanon(v[k]); return o; }, {}) : v;
const sySame = (a, b) => JSON.stringify(syCanon(a)) === JSON.stringify(syCanon(b));
const r1 = x => Math.round(x * 10) / 10;   // 秒數留一位小數，免得加加減減出現很長的小數

// 設定攤平成一項一項：custom.box、wh.rounds… 各自比修改時間
function setFlat(st) {
  const f = {};
  const put = (k, v) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.startsWith('mine:')) v = 'mine';   // 自己上傳的錄音只在那台裝置上
    f[k] = v;
  };
  SET_KEYS.forEach(k => {
    const v = st[k];
    if (k === 'custom' || k === 'wh') Object.keys(v || {}).forEach(j => put(k + '.' + j, v[j]));
    // 聆聽選的聲音：自己上傳的錄音只在那台裝置上，不同步
    else if (k === 'lsSel') put(k, (Array.isArray(v) ? v : []).filter(x => typeof x === 'string' && !x.startsWith('mine:')));
    else put(k, v);
  });
  return f;
}
function applySet(f) {
  const o = { custom: {}, wh: {} };
  Object.keys(f).forEach(k => {
    const i = k.indexOf('.');
    if (i > 0) { const a = k.slice(0, i); if (o[a]) o[a][k.slice(i + 1)] = f[k]; } else o[k] = f[k];
  });
  // 別台裝置選的是自己上傳的錄音（這台沒有那個檔案），或這個版本還沒有的音樂：維持這台原本的選擇
  const ok = m => m === 'none' || MUSIC.some(([k]) => k === m);
  const pick = (v, was) => (v === 'mine' || !ok(v) ? was : v);
  state.custom = o.custom;
  const w = { ...o.wh };
  if (w.music !== undefined) w.music = pick(w.music, state.wh && state.wh.music);
  if (w.music === undefined) delete w.music;
  state.wh = w;
  SET_KEYS.forEach(k => {
    if (k === 'custom' || k === 'wh' || !(k in o)) return;
    // 聆聽：別台裝置選的聲音，加上這台自己上傳、正在選的錄音（最多 3 種）
    if (k === 'lsSel') { const own = (Array.isArray(state.lsSel) ? state.lsSel : []).filter(x => typeof x === 'string' && x.startsWith('mine:')); state.lsSel = [...(Array.isArray(o[k]) ? o[k] : []), ...own].slice(0, 3); return; }
    state[k] = k === 'music' ? pick(o[k], state.music) : o[k];
  });
}
// 每一項各自比修改時間，新的贏；被刪掉的（例如恢復預設）也有時間，所以不會被另一台裝置加回來
function mergeFlat(lf, ls, rf, rs) {
  const out = {}, outS = {};
  new Set([...Object.keys(lf), ...Object.keys(ls), ...Object.keys(rf), ...Object.keys(rs)]).forEach(k => {
    const a = ls[k] || 0, b = rs[k] || 0, useR = b > a || (b === a && k in rf);
    const v = useR ? rf[k] : lf[k];
    if (v !== undefined) out[k] = v;
    if (a || b) outS[k] = Math.max(a, b);
  });
  return { f: out, s: outS };
}
function syncSnap() { return { f: setFlat(state), rec: JSON.stringify([state.bdg, state.log, state.whHist]) }; }
// save() 每次都會叫這裡：記下改了什麼，登入中就幾秒後存上去
function syncMark() {
  if (!syncOn || applying || !lastSnap || !state.sy) return;
  const s = syncSnap(), now = Date.now();
  let changed = s.rec !== lastSnap.rec;
  new Set([...Object.keys(s.f), ...Object.keys(lastSnap.f)]).forEach(k => {
    if (!sySame(s.f[k], lastSnap.f[k])) { state.sy.stamps[k] = now; changed = true; }
  });
  lastSnap = s;
  if (!changed) return;
  state.sy.dirty = now;
  if (sync && tokenOk()) { clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, 1500); }
  setTimeout(paintSync, 0);
}
const syncDirty = () => !!(state.sy && state.sy.dirty > ((sync && sync.at) || 0));
const tokenOk = () => !!(sync && sync.token && sync.exp > Date.now() + 60000);

// 練習紀錄：每台裝置各記各的，合起來就是全部。這台的部分 = 現在的總數 − 其他裝置的
function myRec(others) {
  const b = bdg(), o = Object.values(others || {}), n = { ...b.n };
  let total = b.total, sec = b.sec;
  o.forEach(d => {
    const x = d.b || {};
    total -= x.total || 0; sec -= x.sec || 0;
    Object.keys(x.n || {}).forEach(k => { n[k] = (n[k] || 0) - x.n[k]; });
  });
  Object.keys(n).forEach(k => { if (n[k] > 0) return; delete n[k]; });
  let log = null;
  const l = state.log;
  if (l && l.items) {
    const items = {};
    Object.keys(l.items).forEach(k => { items[k] = { n: l.items[k].n, sec: l.items[k].sec }; });
    o.forEach(d => {
      if (!d.log || d.log.date !== l.date) return;
      Object.keys(d.log.items || {}).forEach(k => { if (items[k]) { items[k].n -= d.log.items[k].n; items[k].sec -= d.log.items[k].sec; } });
    });
    Object.keys(items).forEach(k => { if (items[k].n <= 0) delete items[k]; else items[k].sec = Math.max(0, r1(items[k].sec)); });
    log = { date: l.date, items };
  }
  // 天數、最長閉氣、早晚、印章日期：合併時取聯集或最大，重複算也不會多
  return { b: { days: b.days, n, total: Math.max(0, total), sec: Math.max(0, r1(sec)), hold: b.hold, early: b.early, late: b.late, best: b.best, got: b.got }, log };
}
function combine(parts) {
  const t = today(), b = { days: {}, n: {}, total: 0, sec: 0, hold: 0, early: false, late: false, best: 0, got: {} }, items = {};
  parts.forEach(p => {
    const x = p.b || {};
    Object.assign(b.days, x.days || {});
    Object.keys(x.n || {}).forEach(k => { b.n[k] = (b.n[k] || 0) + x.n[k]; });
    b.total += x.total || 0; b.sec += x.sec || 0;
    b.hold = Math.max(b.hold, x.hold || 0); b.early = b.early || !!x.early; b.late = b.late || !!x.late; b.best = Math.max(b.best, x.best || 0);
    Object.keys(x.got || {}).forEach(k => { if (!b.got[k] || x.got[k] < b.got[k]) b.got[k] = x.got[k]; });
    if (p.log && p.log.date === t) Object.keys(p.log.items || {}).forEach(k => {
      const c = items[k] || { n: 0, sec: 0 }, y = p.log.items[k];
      items[k] = { n: c.n + y.n, sec: r1(c.sec + y.sec) };
    });
  });
  b.sec = r1(b.sec);
  b.best = Math.max(b.best, streak(b.days));
  earned(b).forEach(k => { if (!b.got[k]) b.got[k] = t; });   // 合起來才達到的印章（例如兩台加起來滿 100 分鐘）
  return { bdg: b, log: Object.keys(items).length ? { date: t, items } : null };
}
function mergeWh(a, b) {
  const m = {};
  [...(a || []), ...(b || [])].forEach(x => { if (x && x.d) m[x.d] = x; });
  return Object.values(m).sort((x, y) => x.d - y.d).slice(-50);
}
function devName() { const p = platform(); return p === 'ios' ? 'iPhone／iPad' : p === 'android' ? 'Android' : p === 'desktop' ? '電腦' : '手機'; }

// 雲端硬碟：應用程式專用資料夾裡的一個檔案
function gfetch(url, opt) {
  opt = opt || {};
  opt.headers = Object.assign({}, opt.headers, { Authorization: 'Bearer ' + sync.token });
  return fetch(url, opt).then(r => {
    if (r.status === 401) { sync.token = null; sync.exp = 0; saveLogin(); throw { code: 'auth' }; }
    if (!r.ok) throw { code: 'http', status: r.status };
    return r;
  });
}
function findFile() {
  if (sync.fileId) return Promise.resolve(sync.fileId);
  const q = encodeURIComponent("name='" + SYNC_FILE + "' and trashed=false");
  return gfetch(DRIVE + '/files?spaces=appDataFolder&orderBy=modifiedTime%20desc&fields=files(id)&q=' + q)
    .then(r => r.json()).then(j => (j.files && j.files[0] ? j.files[0].id : null));
}
function readRemote(id) {
  if (!id) return Promise.resolve(null);
  return gfetch(DRIVE + '/files/' + id + '?alt=media').then(r => r.json()).catch(e => {
    if (e && e.status === 404) { sync.fileId = null; return findFile().then(id2 => (id2 && id2 !== id ? readRemote(id2) : null)); }
    throw e;
  });
}
function writeRemote(id, body) {
  const data = JSON.stringify(body);
  if (id) return gfetch(UPLOAD + '/' + id + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: data }).then(() => id);
  const b = 'hhb' + Date.now();
  const multi = '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify({ name: SYNC_FILE, parents: ['appDataFolder'] }) +
    '\r\n--' + b + '\r\nContent-Type: application/json\r\n\r\n' + data + '\r\n--' + b + '--';
  return gfetch(UPLOAD + '?uploadType=multipart&fields=id', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: multi })
    .then(r => r.json()).then(j => j.id);
}
function saveLogin() { try { if (sync) localStorage.setItem(LS_SYNC, JSON.stringify(sync)); else localStorage.removeItem(LS_SYNC); } catch (e) {} }
function refreshSynced() {
  applyTheme();
  renderToday();
  if (!screens.badges.hidden) renderBadges();
  if (!screens.setup.hidden && cur != null) renderSetup();
  if (!screens.whSetup.hidden) whRenderSetup();
}
function syncNow() {
  if (!syncOn || !sync || !tokenOk()) { paintSync(); return Promise.resolve(); }
  if (syncBusy || practicing() || ls) { syncAgain = true; return Promise.resolve(); }   // 練習中不動資料，練完再同步
  syncBusy = true; syncErr = ''; paintSync();
  const t0 = Date.now();
  let id = null;
  return findFile().then(fid => { id = fid; return readRemote(fid); }).then(remote => {
    if (practicing() || ls) throw { code: 'later' };
    if (remote && remote.app !== 'haohao-breath') remote = null;
    const sy = state.sy, me = sy.dev, others = {};
    Object.keys((remote && remote.dev) || {}).forEach(k => { if (k !== me) others[k] = remote.dev[k]; });
    const mine = Object.assign({ at: t0, ua: devName() }, myRec(sy.others));
    const all = combine([mine, ...Object.values(others)]);
    const rset = (remote && remote.set) || {};
    const m = mergeFlat(setFlat(state), sy.stamps || {}, rset.f || {}, rset.s || {});
    const wh = mergeWh(state.whHist, remote && remote.wh);
    // 放進這台裝置（這一步不算新的變更），重畫畫面
    applying = true;
    try {
      state.bdg = all.bdg; state.log = all.log; state.whHist = wh;
      applySet(m.f);
      sy.others = others; sy.stamps = m.s;
      save();
    } finally { applying = false; }
    lastSnap = syncSnap();
    refreshSynced();
    const noAt = d => d && Object.assign({}, d, { at: 0 });
    if (remote && sySame(remote.set, { f: m.f, s: m.s }) && sySame(remote.wh, wh) && sySame(noAt(remote.dev && remote.dev[me]), noAt(mine))) return id;   // 雲端已經是最新的
    return writeRemote(id, { app: 'haohao-breath', v: 1, at: Date.now(), set: { f: m.f, s: m.s }, dev: Object.assign({}, others, { [me]: mine }), wh });
  }).then(fid => {
    if (!sync) return;
    sync.fileId = fid || sync.fileId;
    sync.at = t0;
    saveLogin();
  }).catch(e => {
    if (e && e.code === 'later') { syncAgain = true; return; }
    syncErr = e && e.code === 'auth' ? 'auth' : 'fail';
  }).then(() => {
    syncBusy = false;
    paintSync();
    if (syncAgain && !practicing() && !ls) { syncAgain = false; syncNow(); }
  });
}
function syncResume() { if (syncAgain && !syncBusy) { syncAgain = false; syncNow(); } }

// Google 登入：拿一張一小時有效的通行證，只能讀寫這個網站自己的資料夾
function loadGis() {
  if (gisP) return gisP;
  gisP = new Promise((res, rej) => {
    if (gisReady()) { res(); return; }
    const sc = document.createElement('script');
    sc.src = 'https://accounts.google.com/gsi/client';
    sc.async = true;
    sc.onload = () => res();
    sc.onerror = () => { gisP = null; rej({ code: 'gis' }); };
    document.head.appendChild(sc);
  });
  return gisP;
}
function gisReady() { return !!(window.google && google.accounts && google.accounts.oauth2); }
// 一定要在按按鈕的當下呼叫，不然 Google 的視窗會被瀏覽器擋掉
function askToken(done) {
  if (!gisReady()) { loadGis().catch(() => {}); syncErr = 'loading'; paintSync(); return; }
  if (!tokenClient) tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: SYNC_SCOPE, callback: () => {} });
  tokenClient.callback = r => {
    if (r && r.access_token && google.accounts.oauth2.hasGrantedAllScopes(r, SYNC_SCOPE)) done(r);
    else { syncErr = 'denied'; paintSync(); }
  };
  tokenClient.error_callback = () => { syncErr = 'closed'; paintSync(); };
  const opt = { prompt: '' };
  if (sync && sync.email) opt.login_hint = sync.email;
  tokenClient.requestAccessToken(opt);
}
function takeToken(r) {
  sync = sync || {};
  sync.token = r.access_token;
  sync.exp = Date.now() + (Number(r.expires_in) || 3600) * 1000;
  syncErr = '';
  saveLogin();
  paintSync();
}
const inApp = () => platform() === 'inapp';
function signIn() {
  if (inApp()) { paintSync(); return; }
  askToken(r => {
    takeToken(r);
    gfetch(DRIVE + '/about?fields=user(emailAddress)').then(x => x.json()).then(j => {
      if (sync && j.user && j.user.emailAddress) { sync.email = j.user.emailAddress; saveLogin(); }
    }).catch(() => {}).then(() => syncNow());
  });
}
// 登出：這台裝置上的紀錄留著（包括從其他裝置合併過來的），只是不再同步
function signOut() {
  sync = null; syncErr = '';
  saveLogin();
  paintSync();
}
function tapSync() {   // 沒登入就登入；登入了就馬上同步，通行證過期就重新拿一張
  if (!sync) { signIn(); return; }
  if (tokenOk()) { syncNow(); return; }
  if (inApp()) { $('syncSheet').hidden = false; paintSync(); return; }
  askToken(r => { takeToken(r); syncNow(); });
}
function syncAction(a, b, e) {
  if (a === 'open') { setMenu(false); loadGis().catch(() => {}); paintSync(); $('syncSheet').hidden = false; }
  else if (a === 'close') { if (b.id === 'syncSheet' && e.target.closest('.sheet')) return; $('syncSheet').hidden = true; }
  else if (a === 'go') tapSync();
  else if (a === 'out') signOut();
}

const SYNC_MARK = { ok: 'M9.6 13.9l1.8 1.8 3.2-3.4', tap: 'M12 16v-4.6M10 13.4l2-2 2 2', fail: 'M12 11.3v2.6M12 16.2h.01' };
function agoLabel(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return '剛剛';
  if (s < 3600) return Math.floor(s / 60) + ' 分鐘前';
  if (s < 86400) return Math.floor(s / 3600) + ' 小時前';
  const d = new Date(t);
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' ';
}
function paintSync() {
  if (!syncOn) return;
  const st = !sync ? 'off' : syncBusy ? 'busy' : syncErr === 'fail' ? 'fail' : (!tokenOk() || !sync.at || syncDirty()) ? 'tap' : 'ok';
  // 選單「雲端同步」：雲朵裡的小記號和右邊的狀態
  const sst = $('syncSt');
  sst.hidden = !sync;
  sst.className = 'sync-st ' + st;
  sst.textContent = { off: '', busy: '同步中', fail: '同步失敗', tap: '還沒同步', ok: '已同步' }[st];
  $('syncMark').setAttribute('d', SYNC_MARK[st] || '');
  // 雲端同步的視窗
  const txt = $('syncText');
  txt.textContent = '';
  if (!sync) {
    txt.textContent = syncErr === 'loading' ? '正在載入 Google 登入，請再按一次。'
      : syncErr === 'denied' ? '沒有拿到存取雲端硬碟的允許，所以還沒開始同步。可以再按一次登入。'
      : syncErr === 'closed' ? 'Google 登入的視窗沒有打開，或被關掉了。請再按一次；如果一直沒出現，請確認瀏覽器沒有封鎖彈出式視窗。'
      : '用 Google 帳號登入後，這台裝置的紀錄會和你其他裝置的合在一起，換手機、用電腦都看得到同一份。';
  } else {
    const b = document.createElement('b');
    b.textContent = sync.email || '你的 Google 帳號';
    txt.append('用 ', b, ' 同步中', document.createElement('br'),
      st === 'busy' ? '同步中…'
      : st === 'fail' ? '這次沒有同步成功，可能是網路不穩，按「立即同步」再試一次。'
      : syncErr === 'loading' ? '正在載入 Google 登入，請再按一次。'
      : syncErr === 'closed' && !tokenOk() ? 'Google 登入的視窗沒有打開，或被關掉了。請再按一次；如果一直沒出現，請確認瀏覽器沒有封鎖彈出式視窗。'
      : !tokenOk() ? '登入已經過了一段時間，按「立即同步」重新連上（不用再輸入密碼）。'
      : syncDirty() ? '有新的紀錄，幾秒後會自動存上去。'
      : sync.at ? agoLabel(sync.at) + '存好' : '準備中…');
  }
  $('syncOut').hidden = !sync;
  const go = $('syncGo');
  go.textContent = !sync ? '用 Google 登入同步' : syncBusy ? '同步中…' : '立即同步';
  go.disabled = syncBusy;
  // LINE、Facebook 這類 App 裡的瀏覽器，Google 不讓登入
  const ia = inApp() && (!sync || !tokenOk()), line = /Line\//i.test(navigator.userAgent || '');
  $('syncInapp').hidden = !ia;
  go.hidden = ia;
  if (ia) {
    $('syncInappMsg').textContent = line
      ? '請點右上角的「⋮」，選「用預設瀏覽器開啟」，或按下面的按鈕，改用 Chrome 或 Safari 打開就可以登入。'
      : '請點右上角的選單，選「用瀏覽器開啟」，改用 Chrome 或 Safari 打開就可以登入。';
    $('syncInappGo').hidden = !line;
    if (line) $('syncInappGo').href = location.href.split('#')[0] + (location.search ? '&' : '?') + 'openExternalBrowser=1&sync=1';
  }
  const nd = state.sy ? Object.keys(state.sy.others || {}).length + 1 : 1;
  $('syncNote').textContent = (sync && nd > 1 ? '這個帳號裡有 ' + nd + ' 台裝置的紀錄，已經合在一起。' : '') +
    '同步的有練習紀錄、勳章、冰人呼吸的閉氣紀錄和練習設定；音量和自己上傳的錄音只留在這台裝置。資料存在你自己的 Google 雲端硬碟裡一個隱藏的專用資料夾，只有好好呼吸讀得到，別人（包括做這個網站的人）都看不到。';
  // 勳章頁的說明
  $('bStore').textContent = sync ? '紀錄會同步到你的 Google 雲端硬碟（' + (sync.email || '已登入') + '），換手機、用電腦登入同一個帳號就看得到。'
    : '紀錄只存在這支手機，換手機或清除瀏覽器資料會不見。';
  $('bSyncLink').hidden = !!sync;
}
function startSync() {
  if (!syncOn) return;
  $('syncItem').hidden = false;
  try { sync = JSON.parse(localStorage.getItem(LS_SYNC) || 'null'); } catch (e) { sync = null; }
  if (!state.sy) {
    // 第一次：同步之前就改過的設定記為很早以前改的（比預設值新、比之後任何一次修改舊）
    const def = setFlat(DEFAULTS()), now = setFlat(state), stamps = {};
    Object.keys(now).forEach(k => { if (!sySame(now[k], def[k])) stamps[k] = 1; });
    state.sy = { dev: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), others: {}, stamps, dirty: 0 };
    applying = true; try { save(); } finally { applying = false; }
  }
  state.sy.stamps = state.sy.stamps || {};
  lastSnap = syncSnap();
  if (sync) loadGis().catch(() => {});      // 先載入，按「點我同步」時才能馬上跳出 Google 的視窗
  paintSync();
  if (tokenOk()) syncNow();
  setInterval(paintSync, 30000);
  // 從 LINE 改用瀏覽器打開時，直接打開同步的視窗
  if (/[?&]sync=1/.test(location.search)) {
    try { history.replaceState(null, '', location.pathname + location.search.replace(/[?&](sync|openExternalBrowser)=1/g, '').replace(/^&/, '?') + location.hash); } catch (e) {}
    syncAction('open');
  }
}
document.addEventListener('visibilitychange', () => {
  if (!syncOn) return;
  if (document.visibilityState === 'visible' && sync && tokenOk()) syncNow();   // 切回來時抓最新的
  else paintSync();
});

applyTheme();
renderHome();
renderToday();
loadMine();
startSync();
