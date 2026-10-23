// /card のプロフィールカード。
//  - ドラッグで回す(横 = 回転、縦 = 傾き)。離すと慣性で回り、摩擦で必ず止まる
//  - ダブルタップ / Enter / Space で「入る」(回しながら拡大 → 白い幕 → トップへ)
//  - ← → キーで 30° ずつ回す
// 毎フレーム書き換える値は DOM の属性ではなく変数に持ち、style に直接書く。

const stage = document.querySelector('[data-card-stage]');
const card = document.querySelector('[data-card]');
const veil = document.querySelector('[data-card-veil]');

if (stage && card && veil) {
  /** ドラッグ量(px)→回転量(度)。1画面ぶんスワイプでおよそ1回転半 */
  const DRAG_TO_DEG = 0.6;
  /** これ未満の移動はドラッグではなくタップとみなす(px) */
  const TAP_SLOP = 8;
  /** タップとみなす最大の押下時間(ms) */
  const TAP_MAX_MS = 250;
  /** 2回目のタップをダブルタップとみなす猶予(ms) */
  const DOUBLE_TAP_MS = 320;
  /** 慣性の減衰率(1フレームあたり)。1未満なので必ず止まる = 無限ループにならない */
  const FRICTION = 0.94;
  /** これ未満の速度になったら慣性を打ち切る(度/フレーム) */
  const STOP_SPEED = 0.02;
  /** 縦ドラッグで許す傾きの範囲(度) */
  const TILT_LIMIT = 16;
  /** 「入る」で移る先 */
  const ENTER_URL = '/';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 静止時の構え。正対させると立体だと気づかれず、深くすると歪んで見えるので浅く振る
  let spin = -8;
  let tilt = 3;
  let velocity = 0;
  let rafId = null;
  let launching = false;
  let lastTapAt = 0;
  const drag = { active: false, id: -1, x: 0, y: 0, startX: 0, startY: 0, at: 0, moved: 0 };

  /** spin / tilt を画面に反映する。クロームの帯の位置と濃さも回転角から決める */
  function paint() {
    card.style.transform = `rotateX(${tilt.toFixed(2)}deg) rotateY(${spin.toFixed(2)}deg)`;
    const rad = (spin * Math.PI) / 180;
    // 面が正対するほど帯は中央、斜めになるほど端へ流れる
    card.style.setProperty('--sheen-pos', `${((Math.sin(rad) * 0.5 + 0.5) * 100).toFixed(1)}%`);
    // 斜めに構えたときいちばん強く照る(sin 2θ)
    card.style.setProperty('--sheen-lum', (0.2 + Math.abs(Math.sin(rad * 2)) * 0.6).toFixed(2));
  }

  /** 指を離したあとの慣性。速度が閾値を下回った時点で止める(有限) */
  function startInertia() {
    if (rafId !== null) return;
    const step = () => {
      velocity *= FRICTION;
      if (Math.abs(velocity) < STOP_SPEED) {
        velocity = 0;
        rafId = null;
        return;
      }
      spin += velocity;
      // 傾きは触っていない間、ゆっくり既定値へ戻す
      tilt += (3 - tilt) * 0.08;
      paint();
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  function stopInertia() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    velocity = 0;
  }

  /** 「入る」。カードを回しながら拡大し、白い幕で受けてからトップへ移る */
  function launch() {
    if (launching) return;
    stopInertia();
    if (reduced) {
      location.href = ENTER_URL;
      return;
    }
    launching = true;
    veil.classList.add('pc-veil-on');
    card.style.transition = 'transform 700ms cubic-bezier(.5,0,.75,0)';
    requestAnimationFrame(() => {
      card.style.transform = `rotateX(0deg) rotateY(${(spin + 540).toFixed(2)}deg) scale(1.45)`;
    });
    setTimeout(() => {
      location.href = ENTER_URL;
    }, 720);
  }

  stage.addEventListener('pointerdown', (e) => {
    if (launching) return;
    stopInertia();
    drag.active = true;
    drag.id = e.pointerId;
    drag.x = drag.startX = e.clientX;
    drag.y = drag.startY = e.clientY;
    drag.at = e.timeStamp;
    drag.moved = 0;
    // 指がカードの外へ出ても、離すまでこの要素がイベントを受け取り続ける
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!drag.active || drag.id !== e.pointerId || launching) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY));

    spin += dx * DRAG_TO_DEG;
    velocity = dx * DRAG_TO_DEG;
    tilt = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, tilt - dy * 0.2));
    paint();
  });

  function onPointerUp(e) {
    if (!drag.active || drag.id !== e.pointerId) return;
    drag.active = false;
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);

    const isTap = drag.moved < TAP_SLOP && e.timeStamp - drag.at < TAP_MAX_MS;
    if (isTap) {
      // ドラッグの回転と共存させるため、タップは「動いていない短い押下」に限る。
      // 2回目が猶予内なら入る、そうでなければ1回目として覚えるだけ
      if (e.timeStamp - lastTapAt < DOUBLE_TAP_MS) {
        lastTapAt = 0;
        launch();
      } else {
        lastTapAt = e.timeStamp;
      }
      return;
    }
    if (!reduced) startInertia();
  }
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      launch();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      stopInertia();
      spin += e.key === 'ArrowRight' ? 30 : -30;
      paint();
    }
  });

  // 「戻る」でこのページに戻ってきたとき(bfcache から復元されたとき)、幕と拡大を元に戻す
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    launching = false;
    veil.classList.remove('pc-veil-on');
    card.style.transition = '';
    paint();
  });

  paint();
}
