# JS-Timer-Tutorial-PJ

Zenn の本「JavaScript入門 - タイマーアプリを作ってみよう!」の答え合わせ用ソースコードです。

フレームワークを使わない Vanilla JavaScript で、カウントダウンタイマー＆ストップウォッチを3つのフェーズに分けて作ります。

## ブランチ

| ブランチ | 内容 |
|---|---|
| `main` | 完成版 |
| `Chapter03/シンプルなストップウォッチを作る` | 入門03（Phase 1）を終えた時点のコード |
| `Chapter04/カウントダウンとドリフト補正` | 入門04（Phase 2）を終えた時点のコード |
| `Chapter05/完成版の仕上げ` | 入門05（Phase 3）を終えた時点のコード（完成版と同じ） |

## 動かし方

ブラウザだけで動作します。インストールは不要です。

1. このリポジトリを取得します（「Code」→「Download ZIP」でも構いません）
2. VS Code でフォルダを開き、`index.html` を右クリック →「Open with Live Server」で起動します
   - Live Server を使わない場合は、`index.html` をブラウザで直接開いても動作します

## 構成

```
index.html   # マークアップ・タブUI
style.css    # スタイル
script.js    # タイマーロジック・DOM操作
```

## 技術スタック

- HTML5 / CSS3 / JavaScript（ES6+）
- 外部ライブラリ・ビルドツール不使用
- 動作確認ブラウザ: Chrome 最新版
