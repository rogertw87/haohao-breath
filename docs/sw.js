// 好好呼吸：離線存檔
// 1. 練習要用的東西（網頁、程式、主題圖片、提示音、呼吸聲）第一次打開時就存起來，之後沒網路也能練習
// 2. 背景聲音存在另一個地方（hh-sound），在「離線使用」裡下載，或有網路時播過一次就自動留著；換新版也不會被清掉
// 3. 網頁本身先試網路（拿到新版），網路太慢或沒網路就用存著的
// 改了不帶版本號的檔案（圖片、提示音、說明頁）時，把 VER 加一，手機才會換成新的
const VER = 'v1';
const APP = 'hh-app-' + VER, SND = 'hh-sound', FONT = 'hh-font';
const CORE = [
  './', 'index.html', 'help.html', 'privacy.html', 'thanks.html', 'manifest.webmanifest', 'favicon.ico',
  'icons/favicon.png', 'icons/favicon-32.png', 'icons/favicon-48.png', 'icons/favicon-96.png', 'icons/favicon-144.png', 'icons/favicon-192.png', 'icons/favicon-512.png', 'icons/wind.png',
  'assets/dizang.jpg', 'assets/themes2/fireflies.jpg', 'assets/themes2/sakura.jpg', 'assets/themes2/sakura-run.jpg', 'assets/warm/ember-v1.jpg', 'assets/warm/ember-v1-plain.jpg',
  'audio/breath-in.mp3', 'audio/breath-out.mp3',
  'audio/cue-in.wav', 'audio/cue-out.wav', 'audio/cue-hold.wav',
  'audio/cues/in.wav', 'audio/cues/out.wav', 'audio/cues/hold-in.wav', 'audio/cues/hold-out.wav',
  'audio/rb-breath-small-in.wav', 'audio/rb-breath-small-out.wav', 'audio/rb-breath-big-in.wav', 'audio/rb-breath-big-out.wav'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(APP);
    // 程式和樣式的檔名帶版本號（app.js?v=81），從首頁裡找出來一起存
    let extra = [];
    try {
      const html = await (await fetch('./', { cache: 'no-cache' })).text();
      extra = [...html.matchAll(/(?:src|href)="((?:app\.js|styles\.css)\?v=[^"]+)"/g)].map(m => m[1]);
    } catch (err) {}
    await Promise.all(CORE.concat(extra).map(u => fetch(u, { cache: 'no-cache' }).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('hh-app-') && k !== APP) await caches.delete(k);
    await self.clients.claim();
  })());
});

// 背景聲音：audio/ 底下的 mp3（呼吸聲除外，那是練習本身要用的）
const isSound = u => u.origin === location.origin && /\/audio\/[^/]+\.mp3$/.test(u.pathname) && !/\/breath-(in|out)\.mp3$/.test(u.pathname);

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (u.pathname.endsWith('/sw.js')) return;
    if (isSound(u)) e.respondWith(sound(r));
    else if (r.mode === 'navigate') e.respondWith(page(r, u));
    else e.respondWith(asset(r, u));
  } else if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') e.respondWith(font(r, u));
});

// 網頁：先試網路，4 秒沒回來或沒網路就用存著的；網路之後回來了，下次打開就是新版
async function page(r, u) {
  const c = await caches.open(APP), key = u.origin + u.pathname;
  const net = fetch(r).then(res => { if (res.ok) c.put(key, res.clone()); return res; });
  const old = () => c.match(key).then(x => x || c.match('./')).then(x => x || c.match('index.html'));
  try {
    return await Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]);
  } catch (err) {
    const x = await old();
    if (x) return x;
    return net.catch(() => new Response('<meta charset="utf-8"><p style="font:16px sans-serif;padding:24px">現在沒有網路，這一頁還沒存起來。</p>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
  }
}

// 其他檔案（程式、樣式、圖片、提示音）：存著的優先，沒有才上網拿，拿到就存起來
async function asset(r, u) {
  const c = await caches.open(APP);
  const hit = await c.match(r.url);
  if (hit) return ranged(r, hit);
  try {
    const res = await fetch(r.url);
    if (res.ok && res.status === 200) {
      await c.put(r.url, res.clone());
      // 換了新版（app.js?v=82）就把舊版拿掉
      if (u.search.startsWith('?v=')) for (const k of await c.keys()) { const o = new URL(k.url); if (o.pathname === u.pathname && o.search !== u.search) c.delete(k); }
    }
    return ranged(r, res);
  } catch (err) {
    const any = await c.match(r.url, { ignoreSearch: true });
    return any || Response.error();
  }
}

// 背景聲音：存著的就從手機裡播；沒存的，有網路時先整個下載、存好再播（只用一次流量，下次不用再下載）
const DL = new Map();
function keep(url) {
  if (!DL.has(url)) {
    const p = caches.open(SND).then(c => fetch(url).then(res => { if (!res.ok || res.status !== 200) throw new Error('bad'); return c.put(url, res); }));
    DL.set(url, p); p.catch(() => {}).finally(() => DL.delete(url));
  }
  return DL.get(url);
}
async function sound(r) {
  // 「離線使用」裡的下載：網頁自己會存，這裡直接上網拿
  if (r.headers.get('x-hh-dl')) return fetch(r).catch(() => new Response('', { status: 503 }));
  const c = await caches.open(SND), url = r.url;
  let hit = await c.match(url);
  if (!hit && !r.headers.has('range') && !DL.has(url)) {
    // 整個檔案的請求（例如「離線使用」裡的下載）：一邊傳給網頁顯示進度，一邊存起來
    try {
      const res = await fetch(url);
      if (res.ok && res.status === 200) { const p = c.put(url, res.clone()); DL.set(url, p); p.catch(() => {}).finally(() => DL.delete(url)); }
      return res;
    } catch (err) { return new Response('', { status: 503 }); }
  }
  if (!hit) {
    try { await keep(url); hit = await c.match(url); } catch (err) {}
  }
  if (!hit) return new Response('', { status: 503 });
  return ranged(r, hit);
}

// 播放器會一段一段要（Range），尤其 iPhone 一定要照要的那一段回（206），不然不會播
async function ranged(r, res) {
  const h = r.headers.get('range');
  if (!h || res.status !== 200) return res;
  const m = /^bytes=(\d*)-(\d*)$/.exec(h.trim());
  const b = await res.blob(), n = b.size;
  let s, e;
  if (!m || (m[1] === '' && m[2] === '')) return new Response('', { status: 416, headers: { 'Content-Range': 'bytes */' + n } });
  if (m[1] === '') { s = Math.max(0, n - +m[2]); e = n - 1; }
  else { s = +m[1]; e = m[2] === '' ? n - 1 : Math.min(+m[2], n - 1); }
  if (s >= n || s > e) return new Response('', { status: 416, headers: { 'Content-Range': 'bytes */' + n } });
  const part = b.slice(s, e + 1);
  return new Response(part, {
    status: 206, statusText: 'Partial Content',
    headers: { 'Content-Type': res.headers.get('Content-Type') || b.type || 'application/octet-stream', 'Content-Range': 'bytes ' + s + '-' + e + '/' + n, 'Content-Length': String(part.size), 'Accept-Ranges': 'bytes' }
  });
}

// 字型（Google Fonts）：用過的存起來；沒網路時沒存到的字就用手機內建的字
async function font(r, u) {
  const c = await caches.open(FONT), hit = await c.match(r);
  if (hit && u.hostname === 'fonts.gstatic.com') return hit;
  const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
  if (hit) { net.catch(() => {}); return hit; }
  try { return await net; } catch (err) { return new Response('', { status: 503 }); }
}
