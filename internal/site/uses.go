package site

import "github.com/imutaroh/imutaro/internal/profile"

// UsesItem は /uses の1行。
type UsesItem struct {
	Name string
	// Href は公式サイト。無ければ空(リンクにしない)。
	Href string
	// Note は何にどう使っているか。設定ファイル(~/dotfiles)から読み取れる事実だけを書く。
	// 「なぜ選んだか」は本人にしか言えないので、ここでは書かない。
	Note string
}

// UsesGroup は /uses の分類。
type UsesGroup struct {
	Title string
	Items []UsesItem
	// Dock が真なら、行の代わりに Dock(使っているアプリ)を出す。
	Dock bool
}

// UsesData は /uses の中身。
type UsesData struct {
	Groups []UsesGroup
	Apps   []profile.DockApp
}

// usesData は /uses に並べる道具。2026-10-23 に ~/dotfiles の設定とこの Mac の実機から確かめた内容。
func usesData() UsesData {
	return UsesData{
		Apps: profile.DockApps,
		Groups: []UsesGroup{
			{
				Title: "マシン",
				Items: []UsesItem{
					{Name: "MacBook Air(M5 / 32GB)", Note: "メインの1台。Dock は右に置いて自動で隠し、キーリピートは最速。設定は dotfiles のスクリプトで再現できるようにしている。"},
				},
			},
			{
				Title: "アプリ",
				Dock:  true,
			},
			{
				Title: "ターミナルとシェル",
				Items: []UsesItem{
					{Name: "Ghostty", Href: "https://ghostty.org/", Note: "ターミナル。⌘ のショートカットを herdr の操作に割り当てて、Mac の作法のまま画面を分割・移動する。テーマは GitHub Dark、フォントは Moralerspace Argon。"},
					{Name: "zsh + Starship", Href: "https://starship.rs/", Note: "fzf(Ctrl+R の履歴検索)・zoxide・direnv を組み込み、c で Claude Code、v で Neovim を開く。"},
					{Name: "mise", Href: "https://mise.jdx.dev/", Note: "Node と Python のバージョンをそろえる。"},
				},
			},
			{
				Title: "エディタ",
				Items: []UsesItem{
					{Name: "Neovim(AstroNvim)", Href: "https://astronvim.com/", Note: "メインのエディタ。Telescope で検索し、octo.nvim で GitHub の PR を Neovim の中でレビューし、obsidian.nvim でメモのリンクをたどる。"},
				},
			},
			{
				Title: "ターミナルで使う道具",
				Items: []UsesItem{
					{Name: "herdr", Note: "AI エージェント向けのターミナル多重化ツール。tmux と zellij から乗り換えた。自作の desk コマンドで、Claude Code と差分ビューアを並べた作業場を一度に組む。"},
					{Name: "hunk", Note: "レビュー用の差分ビューア。エージェントが書いた変更を、自動で読み込み直しながら確かめる。"},
					{Name: "yazi", Href: "https://yazi-rs.github.io/", Note: "ファイラー。y で開き、Enter で Neovim に渡す。"},
					{Name: "gh-dash", Href: "https://github.com/dlvhdr/gh-dash", Note: "PR と Issue の一覧をターミナルで見る。O で octo.nvim に渡してレビューする。"},
				},
			},
			{
				Title: "キーボード",
				Items: []UsesItem{
					{Name: "Karabiner-Elements", Href: "https://karabiner-elements.pqrs.org/", Note: "左右の ⌘ 単体で英数とかなを切り替え、US 配列のまま JIS の記号を打つ。外付けのキーボードをつなぐと、内蔵キーボードを無効にする。"},
				},
			},
			{
				Title: "AI",
				Items: []UsesItem{
					{Name: "Claude Code", Href: "https://claude.com/product/claude-code", Note: "毎日使うエージェント。自作のスキル(dotfiles の操作・差分のレビュー・図解など)と hooks を dotfiles で管理している。"},
					{Name: "Codex CLI", Href: "https://learn.chatgpt.com/docs/codex/cli", Note: "2つ目のエージェント。権限とフックを Claude Code と揃え、同じスキルを読ませている。"},
				},
			},
			{
				Title: "自作の道具",
				Items: []UsesItem{
					{Name: "vid2text", Note: "動画から音声を抜き出し、whisper で文字起こしするコマンド。"},
					{Name: "dotfiles", Note: "上の設定はすべて1つのリポジトリにまとめ、新しい Mac でも同じ環境を組めるようにしている。"},
				},
			},
		},
	}
}
