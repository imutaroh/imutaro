// Package profile はサイトに出す人物とその道具のデータを持つ。
// LP・/card・/apps・/uses が同じ値を読むよう、ここに集約する。
// 2箇所に書くと、片方だけ直して「ページによって言っていることが違う」が起きる。
package profile

import (
	"fmt"
	"time"
)

// Birthday は生年月日。年齢はここから毎回計算する。
// 数値で書くと、誕生日を跨いだ日から嘘になる。
var Birthday = time.Date(2003, time.December, 1, 0, 0, 0, 0, Tokyo)

// Tokyo は日付の境界に使うタイムゾーン。
// ビルドは GitHub Actions(UTC)で動くので、明示しないと誕生日の切り替わりが日本時間の朝9時になる。
var Tokyo = mustLoadLocation("Asia/Tokyo")

func mustLoadLocation(name string) *time.Location {
	loc, err := time.LoadLocation(name)
	if err != nil {
		panic(fmt.Sprintf("タイムゾーン %s を読めません(time/tzdata を import しているか): %v", name, err))
	}
	return loc
}

// Age は now 時点の満年齢を返す。日付の比較は日本時間で行う。
//
// 「年*10000 + 月*100 + 日」の数値に潰して比べる。
// 経過時間を365.25日で割るより、誕生日当日の扱いが素直になる。
func Age(birthday, now time.Time) int {
	b := birthday.In(Tokyo)
	n := now.In(Tokyo)
	born := b.Year()*10000 + int(b.Month())*100 + b.Day()
	today := n.Year()*10000 + int(n.Month())*100 + n.Day()
	return (today - born) / 10000
}

// Fact はカードの profile 行。
type Fact struct {
	Key   string
	Value string
}

// CardFacts は /card の表に出す行。役割(role)は名前の直下に出すので入れない。
func CardFacts(now time.Time) []Fact {
	return []Fact{
		{Key: "age", Value: fmt.Sprint(Age(Birthday, now))},
		{Key: "base", Value: "福岡"},
		{Key: "focus", Value: "data platform / AI"},
	}
}

// AboutFields は LP の About にある profile.json カードの中身。
var AboutFields = []Fact{
	{Key: "name", Value: "imutaro"},
	{Key: "role", Value: "Data Engineer"},
	{Key: "grade", Value: "2026年卒"},
	{Key: "base", Value: "福岡"},
	{Key: "focus", Value: "data platform / AI"},
}

// StackEntry は使っている技術。LP の 03 Stack と /card が同じ配列を読む。
type StackEntry struct {
	Name string
	// Status は daily(日常的に使う) か learning(学習中)。
	Status string
	// Icon は BrandIcon の名前(simple-icons 由来)。
	Icon string
}

// Stack の「SQL」は言語であってロゴを持たないため、実際に使っている製品名 BigQuery を置く。
var Stack = []StackEntry{
	{Name: "BigQuery", Status: "daily", Icon: "bigquery"},
	{Name: "Go", Status: "learning", Icon: "go"},
	{Name: "Claude Code", Status: "daily", Icon: "claude"},
}

// LogEntry は LP の 02 Learning Log の1行。git のログに見立てる。
type LogEntry struct {
	Hash string
	Date string
	Text string
}

// Log は新しい順。
var Log = []LogEntry{
	{Hash: "e7a2f19", Date: "2026-07", Text: "このブログを公開"},
	{Hash: "c41b8d3", Date: "2026-05", Text: "Goの学習を開始"},
	{Hash: "a09c5e2", Date: "2026-04", Text: "新卒データエンジニアとして入社"},
	{Hash: "1f0d7b4", Date: "2026-03", Text: "大学卒業"},
}

// Link は外部へのリンク。
type Link struct {
	Label string
	// Icon は BrandIcon の名前。空なら出さない。
	Icon string
	Href string
	// External は別タブで開くか。mailto は別タブにしない。
	External bool
}

// Contacts は LP の Contact に並べるリンク。
var Contacts = []Link{
	{Label: "GitHub", Icon: "github", Href: "https://github.com/imutaroh", External: true},
	{Label: "Zenn", Icon: "zenn", Href: "https://zenn.dev/imu_imu", External: true},
	{Label: "note", Icon: "note", Href: "https://note.com/imutaroh", External: true},
	{Label: "X", Icon: "x", Href: "https://x.com/imutaroh", External: true},
	{Label: "Email", Href: "mailto:imutaakihiro3@gmail.com"},
}

// QRTargetLabel はカード裏の QR(public/qr-imutaro-com.svg)が指す先。
// QR は静的ファイルなので、隣に出す文字列も QR の中身と一致させる
// (デコード結果は https://imutaro.com で検証済み)。
const QRTargetLabel = "imutaro.com"
