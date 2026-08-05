/**
 * View Transitions API の軽量ヘルパー（DESIGN.md 7章）。
 *
 * Next の experimental.viewTransition は React の実験ビルドを要求するため使わず、
 * document.startViewTransition を自前でラップする。仕組みは3点:
 *
 * 1. TransitionLink がクリックを横取りし runWithViewTransition(navigate) を呼ぶ
 * 2. startViewTransition のコールバックが「新ページの DOM commit」まで解決しない
 *    Promise を返す（この間ブラウザは旧画面のスナップショットを保持する）
 * 3. ViewTransitionManager が usePathname の変化を検知して
 *    resolvePendingViewTransition を呼び、新画面が撮影されてモーフが走る
 *
 * 非対応ブラウザと prefers-reduced-motion: reduce は呼び出し側でガードし、
 * 通常遷移（VT なし）に自動フォールバックする。
 */

// --- 共有要素の view-transition-name 生成（サーバー/クライアント両用） -----

/**
 * view-transition-name は CSS カスタム識別子なので、microCMS の記事 id を
 * 安全な文字だけに落とす。同一ページ内で同じ名前が2要素に付くと
 * View Transition 自体が失敗するため、名前は必ず記事 id 由来で一意にする。
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/** 記事タイトルの共有要素名（一覧の行タイトル ⇔ 詳細の h1） */
export function articleTitleTransitionName(id: string): string {
  return `article-title-${sanitizeId(id)}`;
}

/** 記事日付の共有要素名（一覧の行日付 ⇔ 詳細メタの日付） */
export function articleDateTransitionName(id: string): string {
  return `article-date-${sanitizeId(id)}`;
}

// --- クライアント側の遷移制御（サーバーでは呼ばないこと） ------------------

/** ナビゲーション完了待ちの保険。超えたら旧画面の凍結を解いて通常表示に落とす */
const NAVIGATION_TIMEOUT_MS = 800;

let pendingResolve: (() => void) | null = null;
let transitionActive = false;

export function supportsViewTransition(): boolean {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 新ページの commit（pathname の変化）を ViewTransitionManager から通知する */
export function resolvePendingViewTransition(): void {
  if (pendingResolve) {
    pendingResolve();
    pendingResolve = null;
  }
}

/**
 * navigate（router.push など）を View Transition で包んで実行する。
 * 対応可否・reduced-motion は呼び出し側で確認しておくこと。
 * VT が進行中なら多重起動せず、そのまま navigate だけ実行する。
 */
export function runWithViewTransition(navigate: () => void): void {
  if (transitionActive || !supportsViewTransition()) {
    navigate();
    return;
  }
  transitionActive = true;
  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        pendingResolve = resolve;
        navigate();
        // ナビゲーションが失敗・中断しても描画が固まり続けないための保険。
        // 自分の resolve がまだ保留中のときだけ解決する（後続の VT を誤爆しない）
        setTimeout(() => {
          if (pendingResolve === resolve) {
            resolvePendingViewTransition();
          }
        }, NAVIGATION_TIMEOUT_MS);
      });
    });
  } catch {
    // VT の起動自体に失敗したらナビゲーションだけは必ず実行する
    transitionActive = false;
    navigate();
    return;
  }
  transition.finished.finally(() => {
    transitionActive = false;
  });
}
