'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import type { ProfileFact, StackEntry } from '@/libs/profile';
import styles from '@/components/ProfileCard/index.module.css';

type Props = {
  age: number;
  facts: ProfileFact[];
  stack: StackEntry[];
  url: string;
};

/** 単独ページ `/card` 版。「入る」= トップページへ遷移 */
export default function CardScreen(props: Props) {
  const router = useRouter();
  const enter = useCallback(() => router.push('/'), [router]);

  return (
    <ProfileCard
      {...props}
      onEnter={enter}
      enterHint="ダブルタップで入る"
      fallback={
        <Link href="/" className={styles.fallback}>
          トップページへ <span aria-hidden="true">→</span>
        </Link>
      }
    />
  );
}
