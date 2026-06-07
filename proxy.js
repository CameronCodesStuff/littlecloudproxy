const PROXY   = 'https://little-cloud-efc0.detlaffcameron.workers.dev/';

const frame   = document.getElementById('proxy-frame');
const input   = document.getElementById('url-input');
const goBtn   = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const fwdBtn  = document.getElementById('fwd-btn');
const refBtn  = document.getElementById('refresh-btn');
const openBtn = document.getElementById('open-btn');
const extBtn  = document.getElementById('ext-btn');
const splash  = document.getElementById('splash');
const blocked = document.getElementById('blocked');
const pill    = document.getElementById('pill');
const bar     = document.getElementById('load-bar');

let hist = [];
let idx  = -1;
let cur  = '';

function clean(u) {
  u = u.trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

function toProxy(u) {
  return PROXY + '?url=' + encodeURIComponent(u);
}

function setLoading(on) {
  pill.className   = on ? 'loading' : 'ok';
  pill.textContent = on ? 'loading…' : 'ready ☁';
  bar.className    = on ? 'go' : 'done';
}

function updateBtns() {
  backBtn.disabled = idx <= 0;
  fwdBtn.disabled  = idx >= hist.length - 1;
}

function go(raw, push = true) {
  raw = clean(raw);
  if (!raw) return;

  cur         = raw;
  input.value = raw;

  blocked.classList.remove('show');
  splash.style.display = 'none';
  setLoading(true);

  if (push) {
    hist = hist.slice(0, idx + 1);
    hist.push(raw);
    idx = hist.length - 1;
  }

  updateBtns();
  frame.src = toProxy(raw);
}

frame.addEventListener('load', () => {
  setLoading(false);
  if (!frame.src || frame.src === 'about:blank') return;
  try {
    const u   = new URL(frame.src);
    const raw = u.searchParams.get('url');
    if (raw) {
      cur         = raw;
      input.value = raw;
      hist[idx]   = raw;
    }
  } catch (_) {}
});

frame.addEventListener('error', () => {
  pill.className   = 'err';
  pill.textContent = 'blocked 🌧';
  bar.className    = 'done';
  blocked.classList.add('show');
});

window.addEventListener('message', e => {
  if (
    !e.origin.includes('detlaffcameron.workers.dev') &&
    e.origin !== location.origin
  ) return;
  const { type, url, title } = e.data || {};
  if (type === 'navigate' && url)   go(url);
  if (type === 'title'    && title) document.title = title + ' — Little Cloud Proxy';
});

goBtn.addEventListener('click',   () => go(input.value));
input.addEventListener('keydown', e  => { if (e.key === 'Enter') go(input.value); });

backBtn.addEventListener('click', () => {
  if (idx > 0) { idx--; go(hist[idx], false); }
});
fwdBtn.addEventListener('click', () => {
  if (idx < hist.length - 1) { idx++; go(hist[idx], false); }
});

refBtn.addEventListener('click',  () => { if (cur) go(cur, false); });
openBtn.addEventListener('click', () => { if (cur) window.open(cur, '_blank'); });
extBtn.addEventListener('click',  () => { if (cur) window.open(cur, '_blank'); });

document.querySelectorAll('.ql').forEach(el =>
  el.addEventListener('click', e => {
    e.preventDefault();
    go(el.dataset.url);
  })
);

input.focus();

function goHome() {
  frame.src = "about:blank";
  splash.style.display = "flex";
  blocked.classList.remove("show");
  input.value = "";
  cur = "";
  pill.textContent = "—";
  pill.className = "";
  bar.className = "";
}
