package profile

// DockApp は /apps と LP の 04 Apps の Dock に並べるアプリ。並び順がそのまま Dock の並びになる。
//
// アイコンは public/apps/<ID>.png(258px)と public/apps/<ID>-176.webp / <ID>-258.webp(表示用の縮小版)。
// 手元の Mac にインストールされているアプリから、実際の見た目のまま書き出したもの。
// macOS のアイコンは本体の周りに透明な余白(キャンバスの約1割ずつ)を持つので、
// 320px で書き出してから本体の箱 (31, 31)-(289, 289) で切り抜いている。
// 余白を残すと Dock の枠より絵が2割小さく見える。足すときも同じ手順で揃え、
// 縮小版は `go run ./cmd/images` で作る。
type DockApp struct {
	ID   string
	Name string
	// Href は公式サイト。
	Href string
}

// DockApps は Dock に並べるアプリ。
var DockApps = []DockApp{
	{ID: "arc", Name: "Arc", Href: "https://arc.net/"},
	{ID: "ghostty", Name: "Ghostty", Href: "https://ghostty.org/"},
	{ID: "obsidian", Name: "Obsidian", Href: "https://obsidian.md/"},
	{ID: "notion", Name: "Notion", Href: "https://www.notion.com/"},
	{ID: "notion-calendar", Name: "Notion Calendar", Href: "https://www.notion.com/product/calendar"},
	{ID: "slack", Name: "Slack", Href: "https://slack.com/"},
	{ID: "kindle", Name: "Kindle", Href: "https://www.amazon.com/kindle-dbs/fd/kcp"},
	{ID: "music", Name: "Music", Href: "https://www.apple.com/apple-music/"},
	{ID: "raycast", Name: "Raycast", Href: "https://www.raycast.com/"},
	{ID: "nani", Name: "Nani", Href: "https://nani.now/"},
	{ID: "typeless", Name: "Typeless", Href: "https://www.typeless.com/"},
}
