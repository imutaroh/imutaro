import styles from './page.module.css';

type Entry = {
  hash: string;
  date: string;
  text: string;
};

type Props = {
  entries: Entry[];
};

// 以前は IntersectionObserver でスクロール連動のスタガー表示をしていたが、
// スクロール中に「内容が無い→遅れて浮き出る」動きが“ひっかかり”として
// 知覚されるため廃止し、最初から表示する(Issue #13)。
export default function LearningLog({ entries }: Props) {
  return (
    <ol className={styles.log}>
      {entries.map((entry) => (
        <li className={styles.logEntry} key={entry.hash}>
          <span className={styles.logDot} aria-hidden="true" />
          <span className={styles.logHash}>{entry.hash}</span>
          <span className={styles.logDate}>{entry.date}</span>
          <span className={styles.logText}>{entry.text}</span>
        </li>
      ))}
    </ol>
  );
}
