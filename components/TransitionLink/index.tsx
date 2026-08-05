'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import {
  prefersReducedMotion,
  runWithViewTransition,
  supportsViewTransition,
} from '@/libs/viewTransition';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  /** router.push に渡すため内部パス文字列に限定する */
  href: string;
};

/**
 * ページ遷移を document.startViewTransition で包む next/link ラッパー（DESIGN.md 7章）。
 *
 * - VT 非対応ブラウザ・prefers-reduced-motion: reduce では素の Link 遷移にフォールバック
 * - 修飾キー付きクリック・中クリック・target 指定（_self 以外）・download・
 *   外部 URL（`/` 始まりでない href）はブラウザ標準挙動に任せる
 * - prefetch など Link の機能はそのまま使える（横取りするのは左クリックだけ）
 */
export default function TransitionLink({ href, onClick, replace, scroll, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (rest.target && rest.target !== '_self') ||
      (rest.download !== undefined && rest.download !== false) ||
      // 外部 URL・相対パス・ハッシュのみ等、router.push に向かない href は素通し
      // （`//host` のプロトコル相対 URL も外部扱い）
      !href.startsWith('/') ||
      href.startsWith('//') ||
      !supportsViewTransition() ||
      prefersReducedMotion()
    ) {
      return; // Link のデフォルト遷移（VT なし）に任せる
    }
    // 同一 pathname への遷移は「commit = usePathname の変化」を検知できず
    // タイムアウトまで画面が凍結するため VT しない
    if (href.split(/[?#]/)[0] === pathname) {
      return;
    }
    event.preventDefault();
    runWithViewTransition(() => {
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
    });
  };

  return <Link href={href} replace={replace} scroll={scroll} {...rest} onClick={handleClick} />;
}
