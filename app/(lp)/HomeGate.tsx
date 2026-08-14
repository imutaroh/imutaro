'use client';

import { useCallback, useEffect, useState } from 'react';
import ProfileCard from '@/components/ProfileCard';
import type { ProfileFact, StackEntry } from '@/libs/profile';
import styles from './HomeGate.module.css';

type Props = {
  age: number;
  facts: ProfileFact[];
  stack: StackEntry[];
  url: string;
};

/** 初回描画前にインラインスクリプト(layout.tsx)が付ける、幕を出す予定を示すクラス */
const HOLD_CLASS = 'js-gate';

/**
 * トップページの「幕」。カードを1枚かぶせ、入ると下の LP が現れる。
 *
 * 設計上の制約(いずれも外すと壊れる):
 *  - LP の DOM は常に描画したまま、この幕を上に重ねるだけにする。
 *    LP を display:none で隠すとクローラから中身が消え、`/` が空のページになる
 *  - クライアントでのみ描画する。JS が無い/失敗した環境では幕が出ず、素の LP が読める
 *  - **カードの上でのドラッグでは閉じない**。閉じるとカードを回せず、裏の QR に辿り着けない
 *  - 状態を保存しない。読み込み直すたびに毎回カードから始まる(オーナーの指定)
 */
export default function HomeGate(props: Props) {
  // 初期値 false = サーバー描画と最初のクライアント描画が一致する(ハイドレーション不整合を出さない)
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    document.documentElement.classList.remove(HOLD_CLASS);
    // フェードが終わってから DOM ごと外す
    window.setTimeout(() => setOpen(false), 420);
  }, [closing]);

  /**
   * スクロールしようとした = 先へ進みたい、とみなして開ける。
   * ただしカードの上での指の移動は「回す」操作なので除外する。
   * これを外すと、スマホでカードを回そうとした瞬間に幕が閉じて裏が見られない
   */
  const dismissUnlessOnCard = useCallback(
    (e: React.SyntheticEvent) => {
      if ((e.target as HTMLElement | null)?.closest('[data-card-stage]')) return;
      dismiss();
    },
    [dismiss],
  );

  // 幕が出ている間だけ本文のスクロールを止める。
  // 解除漏れでページが操作不能になるのを避けるため、必ず cleanup で戻す
  useEffect(() => {
    if (!open || closing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, closing]);

  if (!open) return null;

  return (
    <div
      className={`${styles.gate} ${closing ? styles.closing : ''}`}
      onWheel={dismissUnlessOnCard}
      onTouchMove={dismissUnlessOnCard}
    >
      <ProfileCard
        {...props}
        onEnter={dismiss}
        enterHint="ダブルタップで開く"
        // LP のヒーロー見出しが h1 なので、幕の名前は見出しにしない
        nameAs="p"
        fallback={
          <button type="button" className={styles.skip} onClick={dismiss}>
            サイトを見る <span aria-hidden="true">→</span>
          </button>
        }
      />
    </div>
  );
}
