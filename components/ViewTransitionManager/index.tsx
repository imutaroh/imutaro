'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  prefersReducedMotion,
  resolvePendingViewTransition,
  runWithViewTransition,
  supportsViewTransition,
} from '@/libs/viewTransition';

// SSR では useLayoutEffect が実行されないため警告回避のエイリアスを使う
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * View Transition の完了検知と、ブラウザ戻る/進むでの逆方向モーフを担う常駐
 * コンポーネント（描画なし）。app/layout.tsx に1つだけ置く。
 */
export default function ViewTransitionManager() {
  const pathname = usePathname();
  const renderedPathname = useRef(pathname);
  // 戻る/進む VT 中にピン留めしたブラウザの scroll restoration の復元先。
  // 新 DOM の commit 直後（新画面キャプチャの前）に適用する
  const pendingScrollRestore = useRef<{ x: number; y: number } | null>(null);

  // 新しいページが DOM に commit された瞬間（= pathname が変わった直後）に
  // 保留中の VT を解決し、新画面のスナップショットを撮らせる
  useIsomorphicLayoutEffect(() => {
    renderedPathname.current = pathname;
    if (pendingScrollRestore.current) {
      const { x, y } = pendingScrollRestore.current;
      pendingScrollRestore.current = null;
      window.scrollTo({ left: x, top: y, behavior: 'instant' });
    }
    resolvePendingViewTransition();
  }, [pathname]);

  // ブラウザ戻る/進むの逆方向モーフ。
  //
  // Next の popstate ハンドラ（履歴復元）をそのまま走らせると、復元の commit が
  // View Transition の旧画面キャプチャより先に完了してしまい、モーフが成立しない
  // （新旧スナップショットが同一になる）ことを実測で確認済み。そこで:
  //
  // 1. このリスナーは Next のリスナーより先に登録される
  //    （Next は AppRouter＝木の最上位の useEffect で登録し、React の effect は
  //      子→親の順で実行されるため、子孫であるこのコンポーネントが必ず先勝ち）
  // 2. stopImmediatePropagation で Next のハンドラを一旦止める
  // 3. startViewTransition が旧画面を撮り終えた後（update callback 内）で
  //    同じ popstate を再ディスパッチし、Next に履歴復元を再開させる
  // 4. 復元が commit されると上の layout effect が VT を解決し、モーフが走る
  //
  // 万一リスナー順が逆転しても、再ディスパッチは同一 URL への復元の重複実行に
  // なるだけで壊れない（VT はモーフなしの通常表示に落ちる）
  useEffect(() => {
    // 自分が再ディスパッチした popstate を再インターセプトしないためのフラグ
    let passthrough = false;

    const onPopState = (event: PopStateEvent) => {
      if (passthrough) {
        passthrough = false;
        return;
      }
      // __NA は app router が積んだ履歴エントリの印。それ以外（外部 pushState 等）は
      // Next の素の挙動（無視 or reload）に任せ、VT を挟まない
      if (
        !event.state?.__NA ||
        !supportsViewTransition() ||
        prefersReducedMotion() ||
        document.hidden
      ) {
        return;
      }
      // hash・クエリだけの変化（pathname が同じ）は commit を検知できないので何もしない
      if (window.location.pathname === renderedPathname.current) {
        return;
      }
      event.stopImmediatePropagation();
      // ブラウザの scroll restoration は popstate 直後＝旧 DOM の表示中に、
      // 旧画面キャプチャと同じレンダリング更新内で「scroll イベントより先に」
      // 適用される（実測: キャプチャが復元位置まで飛び、モーフ起点が 復元量 px
      // ずれる）。scroll イベントでは捕まえられないため、キャプチャ直前に走る
      // rAF で毎フレーム位置を確認してピン留めし、復元先は保存しておいて
      // 新 DOM の commit 直後（新画面キャプチャの前）に適用し直す
      const pinnedX = window.scrollX;
      const pinnedY = window.scrollY;
      let restoredScroll: { x: number; y: number } | null = null;
      let pinning = true;
      const pinScroll = () => {
        if (!pinning) {
          return;
        }
        if (window.scrollX !== pinnedX || window.scrollY !== pinnedY) {
          restoredScroll = { x: window.scrollX, y: window.scrollY };
          window.scrollTo({ left: pinnedX, top: pinnedY, behavior: 'instant' });
        }
        requestAnimationFrame(pinScroll);
      };
      requestAnimationFrame(pinScroll);
      runWithViewTransition(() => {
        // update callback は旧画面キャプチャ後に呼ばれるため、ここで解除してよい。
        // 通常遷移へのフォールバック時も同期的に必ず通るのでループは漏れない
        pinning = false;
        pendingScrollRestore.current = restoredScroll;
        passthrough = true;
        // state は捕捉時の event.state ではなく現在の履歴から読む。旧画面キャプチャ〜
        // ここまでの間に連続 popstate が入っても、Next が読む URL(window.location)と
        // state の整合が常に保たれる(介入がなければ event.state と同値で挙動不変)
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return null;
}
