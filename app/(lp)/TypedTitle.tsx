'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TypedTitle.module.css';

type Props = {
  lines: string[];
  className?: string;
};

// ターミナル風の見出し。ホバー(タッチではタップ)で末尾からバックスペースで
// 消え、タイプし直されて必ず戻る。1打ごとにキーボード風のタイプ音を鳴らす。
// 音はWeb Audioでその場で合成する(音源ファイルなし・音量控えめ)。
// ブラウザの自動再生ポリシー上、ページ内で一度もクリック等をしていない間は
// AudioContextが動かないため無音になる(仕様)。
export default function TypedTitle({ lines, className }: Props) {
  const total = lines.join('').length;
  const [visibleCount, setVisibleCount] = useState(total);
  const [typing, setTyping] = useState(false);
  const busyRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      audioRef.current?.close().catch(() => {});
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const ensureAudio = () => {
    if (!audioRef.current) {
      try {
        audioRef.current = new AudioContext();
        // キー音の芯になるホワイトノイズ(50ms)を一度だけ作る
        const ctx = audioRef.current;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noiseRef.current = buf;
      } catch {
        return;
      }
    }
    // クリック済みならrunningになる。未クリックなら失敗して無音のまま
    audioRef.current.resume().catch(() => {});
  };

  // メカニカルキーボード風の短いクリック音
  const tick = () => {
    const ctx = audioRef.current;
    const noise = noiseRef.current;
    if (!ctx || !noise || ctx.state !== 'running') return;
    const t = ctx.currentTime;

    // 高域のカチッ(ノイズ+バンドパス)
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400 + Math.random() * 1600;
    bp.Q.value = 1.2;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.06, t);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    src.connect(bp).connect(g1).connect(ctx.destination);
    src.start(t);

    // 低域のコトッ(短い矩形波)
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 140 + Math.random() * 60;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.025, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(g2).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  };

  const replay = () => {
    if (busyRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    busyRef.current = true;
    setTyping(true);
    ensureAudio();

    const eraseMs = 45;
    const typeMs = 70;
    const pauseMs = 400;

    // 消す(右から左へ)
    for (let i = 1; i <= total; i++) {
      schedule(() => {
        setVisibleCount(total - i);
        tick();
      }, eraseMs * i);
    }
    // 打ち直す(左から右へ)
    const typeStart = eraseMs * total + pauseMs;
    for (let i = 1; i <= total; i++) {
      schedule(() => {
        setVisibleCount(i);
        tick();
      }, typeStart + typeMs * i);
    }
    schedule(() => {
      setTyping(false);
      busyRef.current = false;
    }, typeStart + typeMs * total + 100);
  };

  let offset = 0;

  return (
    // リプレイはクリック時のみ。ホバー発火はスクロール中にカーソルが
    // 見出しを横切っただけで作動し、表示が壊れたように見えるため廃止(Issue #13)
    <h1
      className={`${className ?? ''} ${styles.title}`}
      aria-label={lines.join('')}
      onClick={replay}
      // 見出しそのものが操作子なので、キーボードからも同じ体験に到達できるようにする。
      // role は h1 のまま(button にすると見出し構造が消える)、Enter/Space で発火
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          replay();
        }
      }}
    >
      {lines.map((line, lineIndex) => {
        const start = offset;
        offset += line.length;
        const end = offset;
        // カーソルは「最後に見えている文字」の行に置く。全消し中は先頭行。
        const cursorHere =
          visibleCount <= 0
            ? lineIndex === 0
            : visibleCount > start && visibleCount <= end;
        // 行内でのカーソル挿入位置(この文字数ぶん表示した直後に置く)
        const cursorPos = Math.max(0, Math.min(visibleCount - start, line.length));
        const cursor = (
          <span className={`${styles.cursor} ${typing ? styles.cursorSolid : ''}`} />
        );
        return (
          <span className={styles.line} key={lineIndex} aria-hidden="true">
            {cursorHere && cursorPos === 0 && cursor}
            {Array.from(line).map((ch, i) => (
              <span key={i}>
                <span
                  className={start + i < visibleCount ? styles.char : styles.charHidden}
                >
                  {ch}
                </span>
                {cursorHere && cursorPos === i + 1 && cursor}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
