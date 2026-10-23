// トップページのヒーローまわり。
//  1. 入場アニメの一時停止を、フォントの準備ができたら外す
//  2. 見出しをクリックすると、末尾から消えてタイプし直される(キーボード風の音つき)

// ---- 1. 入場アニメの解除 ------------------------------------------------------
// 起動直後はフォントの到着待ちで初回描画が最大 500ms 保留され、その間もアニメの時計だけが進んで
// 「中途半端な位置にガクッと出現」して見える。<head> のインラインスクリプトが html に
// js-hero-hold を付けてアニメを止めておき、ここで外す(Issue #9)。
const REVEAL_TIMEOUT_MS = 900;
let released = false;

function release() {
  if (released) return;
  released = true;
  // 2フレーム待ち、フォント適用後の再レイアウトが済んでから再生を始める
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('js-hero-hold');
    });
  });
}

// フォントの読み込みが遅い回線でも、ヒーローを止めっぱなしにしない保険
setTimeout(release, REVEAL_TIMEOUT_MS);
if (document.fonts) {
  document.fonts.ready.then(release, release);
} else {
  release();
}

// ---- 2. ターミナル風の見出し --------------------------------------------------
// クリック(タッチではタップ)で末尾からバックスペースで消え、タイプし直されて必ず戻る。
// 1打ごとにキーボード風の音を鳴らす。音は Web Audio でその場で合成する(音源ファイルなし・音量控えめ)。
// ブラウザの自動再生の決まりで、ページ内で一度もクリックしていない間は無音になる(仕様)。
// ホバーで発火させないのは、スクロール中にカーソルが横切っただけで動き、壊れて見えるため(Issue #13)
const title = document.querySelector('[data-typed]');
if (title) setupTypedTitle(title);

function setupTypedTitle(h1) {
  const chars = Array.from(h1.querySelectorAll('.tt-char'));
  const lines = Array.from(h1.querySelectorAll('.tt-line'));
  const cursor = h1.querySelector('[data-typed-cursor]');
  const total = chars.length;
  const timers = [];
  let busy = false;
  let audio = null;
  let noise = null;

  // 先頭から count 文字を見せ、カーソルを最後に見えている文字の直後へ動かす(全部消えたら1行目の頭)
  function show(count) {
    chars.forEach((c, i) => c.classList.toggle('tt-char-hidden', i >= count));
    if (count <= 0) {
      lines[0].prepend(cursor);
    } else {
      chars[count - 1].after(cursor);
    }
  }

  function ensureAudio() {
    if (!audio) {
      try {
        audio = new AudioContext();
        // キー音の芯になるホワイトノイズ(50ms)を一度だけ作る
        const buf = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.05), audio.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise = buf;
      } catch {
        return;
      }
    }
    // クリック済みなら running になる。未クリックなら失敗して無音のまま
    audio.resume().catch(() => {});
  }

  // メカニカルキーボード風の短いクリック音
  function tick() {
    if (!audio || !noise || audio.state !== 'running') return;
    const t = audio.currentTime;

    // 高域のカチッ(ノイズ + バンドパス)
    const src = audio.createBufferSource();
    src.buffer = noise;
    const bp = audio.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400 + Math.random() * 1600;
    bp.Q.value = 1.2;
    const g1 = audio.createGain();
    g1.gain.setValueAtTime(0.06, t);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    src.connect(bp).connect(g1).connect(audio.destination);
    src.start(t);

    // 低域のコトッ(短い矩形波)
    const osc = audio.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 140 + Math.random() * 60;
    const g2 = audio.createGain();
    g2.gain.setValueAtTime(0.025, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(g2).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  function schedule(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function replay() {
    if (busy) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    busy = true;
    // 打鍵中はカーソルを点滅させず点灯したままにする(実物のターミナルと同じ)
    cursor.classList.add('tt-cursor-solid');
    ensureAudio();

    const eraseMs = 45;
    const typeMs = 70;
    const pauseMs = 400;

    // 消す(右から左へ)
    for (let i = 1; i <= total; i++) {
      schedule(() => {
        show(total - i);
        tick();
      }, eraseMs * i);
    }
    // 打ち直す(左から右へ)
    const typeStart = eraseMs * total + pauseMs;
    for (let i = 1; i <= total; i++) {
      schedule(() => {
        show(i);
        tick();
      }, typeStart + typeMs * i);
    }
    schedule(() => {
      cursor.classList.remove('tt-cursor-solid');
      busy = false;
      timers.length = 0;
    }, typeStart + typeMs * total + 100);
  }

  h1.addEventListener('click', replay);
}
