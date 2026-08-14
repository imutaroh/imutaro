'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BrandIcon from '@/components/BrandIcon';
import { PROFILE_EMAIL } from '@/libs/profile';
import styles from './index.module.css';

type Fact = { key: string; value: string };
type LinkItem = { label: string; icon: 'github' | 'zenn' | 'note' | 'x'; href: string };

type Props = {
  age: number;
  facts: Fact[];
  links: LinkItem[];
  /** 裏面に出す、このページ自身のURL(スキームなし) */
  url: string;
  /**
   * ダブルタップ / Enter で「入る」ときの処理。
   * `/card` はトップへ遷移、トップの幕は幕を外す、と呼び出し側で意味が変わる。
   * 演出(回転+拡大+白幕)が終わってから呼ばれる
   */
  onEnter: () => void;
  /** 画面下のヒント右側の文言(例: 「ダブルタップで入る」) */
  enterHint: string;
  /** 操作に気づかない人・操作したくない人のための逃げ道 */
  fallback: ReactNode;
  /**
   * 名前を見出しとして出すか。`/card` はこのカードがページ本体なので h1、
   * トップの幕は LP の h1（ヒーロー見出し）が別にあるので p にする。
   * h1 が2つあると、DOM 上先に来る幕のほうがページの主見出しに読めてしまう
   */
  nameAs?: 'h1' | 'p';
};

const EMAIL = PROFILE_EMAIL;

/** ドラッグ量(px)→回転量(度)。1画面ぶんスワイプでおよそ1回転半 */
const DRAG_TO_DEG = 0.6;
/** これ未満の移動はドラッグではなくタップとみなす(px) */
const TAP_SLOP = 8;
/** タップとみなす最大の押下時間(ms) */
const TAP_MAX_MS = 250;
/** 2回目のタップをダブルタップとみなす猶予(ms) */
const DOUBLE_TAP_MS = 320;
/** 慣性の減衰率(1フレームあたり)。1未満で必ず停止する＝無限ループにならない */
const FRICTION = 0.94;
/** これ未満の速度になったら慣性を打ち切る(度/フレーム) */
const STOP_SPEED = 0.02;
/** 縦ドラッグで許す傾きの範囲(度) */
const TILT_LIMIT = 16;

export default function ProfileCard({
  age,
  facts,
  links,
  url,
  onEnter,
  enterHint,
  fallback,
  nameAs = 'h1',
}: Props) {
  const Name = nameAs;
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [launching, setLaunching] = useState(false);

  // 毎フレーム書き換える値は state に置かず ref で持つ(再レンダリングを起こさない)
  // 静止時の構え。正対させると立体だと気づかれず、深くすると歪んで見えるので浅く振る
  const spin = useRef(-8);
  const tilt = useRef(3);
  const velocity = useRef(0);
  const rafId = useRef<number | null>(null);

  const drag = useRef({ active: false, id: -1, x: 0, y: 0, startX: 0, startY: 0, at: 0, moved: 0 });
  const lastTapAt = useRef(0);
  const launchTimer = useRef<number | null>(null);

  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /** spin/tilt を DOM に反映する。クローム帯の位置と濃さも回転角から導く */
  const paint = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = `rotateX(${tilt.current.toFixed(2)}deg) rotateY(${spin.current.toFixed(2)}deg)`;
    const rad = (spin.current * Math.PI) / 180;
    // 面が正対するほど帯は中央、斜めになるほど端へ流れる
    el.style.setProperty('--sheen-pos', `${((Math.sin(rad) * 0.5 + 0.5) * 100).toFixed(1)}%`);
    // 斜めに構えたときいちばん強く照る(sin(2θ))
    el.style.setProperty('--sheen-lum', (0.2 + Math.abs(Math.sin(rad * 2)) * 0.6).toFixed(2));
  }, []);

  useEffect(() => {
    paint();
  }, [paint]);

  /** 指を離したあとの慣性。速度が閾値を下回った時点で rAF を止める(有限) */
  const startInertia = useCallback(() => {
    if (rafId.current !== null) return;
    const step = () => {
      velocity.current *= FRICTION;
      if (Math.abs(velocity.current) < STOP_SPEED) {
        velocity.current = 0;
        rafId.current = null;
        return;
      }
      spin.current += velocity.current;
      // 傾きは触っていない間ゆっくり既定値へ戻す
      tilt.current += (3 - tilt.current) * 0.08;
      paint();
      rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
  }, [paint]);

  const stopInertia = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    velocity.current = 0;
  }, []);

  useEffect(
    () => () => {
      stopInertia();
      if (launchTimer.current !== null) window.clearTimeout(launchTimer.current);
    },
    [stopInertia],
  );

  /** 「入る」。カードを回しながら拡大し、白い幕で受けてから onEnter を呼ぶ */
  const launch = useCallback(() => {
    if (launching) return;
    stopInertia();
    if (reduced.current) {
      onEnter();
      return;
    }
    setLaunching(true);
    const el = cardRef.current;
    if (el) {
      el.style.transition = 'transform 700ms cubic-bezier(.5,0,.75,0)';
      requestAnimationFrame(() => {
        el.style.transform = `rotateX(0deg) rotateY(${(spin.current + 540).toFixed(2)}deg) scale(1.45)`;
      });
    }
    launchTimer.current = window.setTimeout(onEnter, 720);
  }, [launching, onEnter, stopInertia]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (launching) return;
    stopInertia();
    const d = drag.current;
    d.active = true;
    d.id = e.pointerId;
    d.x = d.startX = e.clientX;
    d.y = d.startY = e.clientY;
    d.at = e.timeStamp;
    d.moved = 0;
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || d.id !== e.pointerId || launching) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.startX, e.clientY - d.startY));

    spin.current += dx * DRAG_TO_DEG;
    velocity.current = dx * DRAG_TO_DEG;
    tilt.current = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, tilt.current - dy * 0.2));
    paint();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || d.id !== e.pointerId) return;
    d.active = false;
    stageRef.current?.releasePointerCapture?.(e.pointerId);

    const isTap = d.moved < TAP_SLOP && e.timeStamp - d.at < TAP_MAX_MS;
    if (isTap) {
      // ドラッグ回転と共存させるため、タップは「動いていない短い押下」に限定する。
      // 2回目が猶予内なら遷移、そうでなければ1回目として記録するだけ
      if (e.timeStamp - lastTapAt.current < DOUBLE_TAP_MS) {
        lastTapAt.current = 0;
        launch();
      } else {
        lastTapAt.current = e.timeStamp;
      }
      return;
    }
    if (!reduced.current) startInertia();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      launch();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      stopInertia();
      spin.current += e.key === 'ArrowRight' ? 30 : -30;
      paint();
    }
  };

  return (
    <div className={styles.screen}>
      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        // 幕(HomeGate)が「スクロールしたら開く」の判定でカードのドラッグを
        // 横取りしないよう、掴む対象をこの目印で見分けられるようにする
        data-card-stage=""
        role="button"
        tabIndex={0}
        aria-label={`プロフィールカード。ドラッグで回転、${enterHint}、または Enter キー`}
      >
        <div ref={cardRef} className={styles.card}>
          {/* ---- 表: 中身は全部こちらに置く ---- */}
          <div className={`${styles.face} ${styles.front}`}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>( imutaro / card )</span>
              <div className={styles.portrait}>
                <Image
                  src="/imutaro-icon.png"
                  alt=""
                  width={512}
                  height={512}
                  priority
                  sizes="340px"
                  className={styles.portraitImg}
                />
              </div>
              <div className={styles.identity}>
                <Name className={styles.name}>imutaro</Name>
                <p className={styles.role}>Data Engineer</p>
              </div>
              <dl className={styles.facts}>
                {facts.map((f) => (
                  <div className={styles.factRow} key={f.key}>
                    <dt>{f.key}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className={styles.links}>
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      <BrandIcon name={l.icon} size={14} />
                      {l.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${EMAIL}`} className={styles.link}>
                    Email
                  </a>
                </li>
              </ul>
              <Link href="/blog" className={styles.blogLink}>
                ブログを読む <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className={styles.frame} aria-hidden="true" />
            <div className={styles.sheen} aria-hidden="true" />
          </div>

          {/* ---- 裏: QR とその行き先だけを置く面 ---- */}
          <div className={`${styles.face} ${styles.back}`}>
            <div className={styles.weave} aria-hidden="true" />
            <div className={styles.backMark}>
              {/* QR は白地でないと読み取り精度が落ちるので、白の板に載せる。
                  SVG 自体が白の背景矩形を持つ。next/image は SVG に追加設定が要るので素の img */}
              <span className={styles.backQr}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/qr-imutaro-com.svg"
                  alt={`${url} の QR コード`}
                  width={148}
                  height={148}
                  className={styles.backQrImg}
                />
              </span>
              <p className={styles.backUrl}>{url}</p>
            </div>
            <div className={styles.frame} aria-hidden="true" />
            <div className={styles.sheen} aria-hidden="true" />
          </div>

          {/* ---- 厚み(側面4枚) ---- */}
          <div className={`${styles.side} ${styles.sideL}`} />
          <div className={`${styles.side} ${styles.sideR}`} />
          <div className={`${styles.side} ${styles.sideT}`} />
          <div className={`${styles.side} ${styles.sideB}`} />
        </div>
      </div>

      {/* 「回せる」「ダブルタップで入れる」は自明ではないので必ず言葉で置く */}
      <p className={styles.hint}>
        <span>ドラッグで回す</span>
        <span className={styles.hintSep} aria-hidden="true">
          /
        </span>
        <span>{enterHint}</span>
      </p>
      {/* 操作に気づかない人・操作したくない人のための逃げ道 */}
      {fallback}

      <div className={`${styles.veil} ${launching ? styles.veilOn : ''}`} aria-hidden="true" />
    </div>
  );
}
