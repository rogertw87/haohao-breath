# 好好呼吸

呼吸練習網站。純 HTML / CSS / JS，不需要建置。

## 本機預覽

```sh
cd docs
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

（直接雙擊 `index.html` 也能用，但部分瀏覽器會擋住本機音樂檔。）

## 部署

把整個資料夾放到任何靜態主機（GitHub Pages、Netlify、Cloudflare Pages…）即可，記得連同 `audio/handpan.mp3` 與 `icons/` 一起上傳。

## 檔案

- `index.html` — 首頁、設定頁、練習畫面、完成畫面
- `styles.css` — 海洋色系樣式
- `app.js` — 練習資料、節奏計時、動畫（方塊、ㄇ字形、波形、呼氣人物）、手碟音樂、設定儲存（localStorage）
