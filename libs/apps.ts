/**
 * `/apps`（Dock）に並べる、普段使っているアプリ。並び順がそのまま Dock の並びになる。
 *
 * アイコンは `public/apps/<id>.png`。手元の Mac にインストールされているアプリから
 * 実際の見た目のまま書き出したもの(NSWorkspace の icon(forFile:))。
 * macOS のアイコンは本体の周りに透明な余白(キャンバスの約1割ずつ)を持つので、
 * 320px で書き出してから本体の箱 (31, 31)-(289, 289) で切り抜き、258px にしている。
 * 余白を残すと Dock の枠より絵が2割小さく見える。足すときも同じ手順で揃える。
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
