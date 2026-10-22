/**
 * `/apps`（Dock）に並べる、普段使っているアプリ。並び順がそのまま Dock の並びになる。
 *
 * アイコンは `public/apps/<id>.png`。手元の Mac にインストールされているアプリから
 * 実際の見た目のまま 256px で書き出したもの(NSWorkspace の icon(forFile:))。
 * 足すときは同じ方法で書き出して置く。
 */
export type DockApp = {
  id: string;
  name: string;
  /** 公式サイト */
  href: string;
};

export const DOCK_APPS: DockApp[] = [
  { id: 'arc', name: 'Arc', href: 'https://arc.net/' },
  { id: 'ghostty', name: 'Ghostty', href: 'https://ghostty.org/' },
  { id: 'obsidian', name: 'Obsidian', href: 'https://obsidian.md/' },
  { id: 'notion', name: 'Notion', href: 'https://www.notion.com/' },
  {
    id: 'notion-calendar',
    name: 'Notion Calendar',
    href: 'https://www.notion.com/product/calendar',
  },
  { id: 'slack', name: 'Slack', href: 'https://slack.com/' },
  { id: 'kindle', name: 'Kindle', href: 'https://www.amazon.com/kindle-dbs/fd/kcp' },
  { id: 'music', name: 'Music', href: 'https://www.apple.com/apple-music/' },
  { id: 'raycast', name: 'Raycast', href: 'https://www.raycast.com/' },
  { id: 'nani', name: 'Nani', href: 'https://nani.now/' },
  { id: 'typeless', name: 'Typeless', href: 'https://www.typeless.com/' },
];
