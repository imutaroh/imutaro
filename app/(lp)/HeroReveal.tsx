'use client';

import { useEffect } from 'react';

// 入場アニメ(fadeInUp)の開始をフォント準備完了まで遅らせるための解除役。
// 起動直後はフォント到着待ちで初回描画が最大500ms保留され、その間も
// アニメの時計だけが進んで「中途半端な位置にガクッと出現」になるため、
// (lp)/layout.tsx のインラインスクリプトが html に js-hero-hold を付けて
// アニメを一時停止し、このコンポーネントが条件成立後に外す(Issue #9)。
const REVEAL_TIMEOUT_MS = 900;

export default function HeroReveal() {
  useEffect(() => {
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      // 2フレーム待ち、フォント適用後の再レイアウトが済んでから再生を始める
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('js-hero-hold');
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
