import { getTagList } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Header from '@/components/Header';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './layout.module.css';

type Props = {
  children: React.ReactNode;
};

export default async function BlogLayout({ children }: Props) {
  const tags = await getTagList({
    limit: LIMIT,
  });
  return (
    <>
      <Header />
      <Nav tags={tags.contents} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
