'use client';

import { useEffect } from 'react';

// 入場アニメ(fadeInUp)の開始をフォント準備完了まで遅らせるための解除役。
// 起動直後はフォント到着待ちで初回描画が最大500ms保留され、その間も
// アニメの時計だけが進んで「中途半端な位置にガクッと出現」になるため、
// (lp)/layout.tsx のインラインスクリプトが html に js-hero-hold を付けて
// アニメを一時停止し、このコンポーネントが条件成立後に外す(Issue #9)。
// 保険の上限。ここを長く取りすぎると、フォントが遅い回線で「ヘッダー以外ほぼ白」の
// 時間がそのまま伸びる(保留中は入場のテキスト4段だけでなくリボンも不可視のため)。
// 入場そのものが約1.3秒なので、待ちは体感の許容量からこの値に抑える。
// テキストと金属を同じ時計に乗せているのは「流れに運ばれて版面が来る」連続感を
// 保つためで、金属だけ先に走らせる分離案はその連続感と引き換えになる
const REVEAL_TIMEOUT_MS = 450;

export default function HeroReveal() {
  useEffect(() => {
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      // 2フレーム待ち、フォント適用後の再レイアウトが済んでから再生を始める
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const html = document.documentElement;
          // layout.tsx の保険(1600ms)を止める。残すと解除済みの後にもう一度
          // data-hero-hold-at が上書きされ、HeroStage の猶予窓判定が狂う
          const w = window as Window & { __heroHoldTimer?: number };
          if (w.__heroHoldTimer !== undefined) {
            window.clearTimeout(w.__heroHoldTimer);
            w.__heroHoldTimer = undefined;
          }
          html.classList.remove('js-hero-hold');
          // 解除時刻は「解除直後ならまだ入場を再生してよい」の判定に HeroStage が読む。
          // layout.tsx の保険(1600ms)だけが刻む状態にしておくと、将来 (lp)/loading.tsx や
          // Suspense 境界が入ってコミットが分割されたとき、通常経路だけ猶予窓が効かず
          // 入場が無言で消える(エラーも出ない)
          html.dataset.heroHoldAt = String(performance.now());
        });
      });
    };

    // フォント読み込みが遅い回線でもヒーローを出しっぱなしにしない保険
    const timer = window.setTimeout(release, REVEAL_TIMEOUT_MS);
    if (document.fonts) {
      document.fonts.ready.then(release, release);
    } else {
      release();
    }

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
