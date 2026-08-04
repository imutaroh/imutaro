# imutaro lab

imutaro.com の**モーション実験場**。本体（main）とは独立した orphan ブランチ `lab`。

## ルール

- **main に絶対マージしない**。本体へ還元するときはパターンを本体の制約（常時アニメ禁止・スクロール連動禁止・mask 禁止）に合わせて移植し直す
- 実験場では常時アニメ・スクロール連動・WebGL すべて解禁。ただし文化として持ち込むもの:
  - `prefers-reduced-motion` の尊重
  - 性能計測（Chrome トレース。rAF 計測はコンポジタ jank を見逃す）
- 素材は Codex CLI（image_generation）で生成する。透過が必要な素材はクロマキー生成 → `remove_chroma_key.py` でアルファ抜き

## 実験一覧

1. `/`（進行中）: ブランドスプラッシュ再現 — Shakky 参照（巨大タイポマーキー・浮遊オブジェクト・フレーバー切替）

## 参照研究

`docs/ux-reference-study.md` — 16サイト・35モーションパターンの語彙カタログと本体還元可否の分類
