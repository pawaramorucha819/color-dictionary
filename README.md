# Color Dictionary

シンプルなカラーディクショナリーアプリ。プリセットパレット、カラーピッカー、カラーコード入力の3つの方法で色を選択・確認できます。

## Features

- **Preset** — 48色のプリセットカラーパレットからワンクリックで選択
- **Color Picker** — ブラウザ標準カラーピッカーで任意の色を自由に選択
- **Code Input** — HEX (`#FF0000`, `#F00`) や RGB (`rgb(255, 0, 0)`) を直接入力して確認
- **HEX / RGB 同時表示** — 選択した色のコードを両形式で表示
- **コピー** — HEX・RGB それぞれ専用のコピーボタン付き
- **履歴** — 最近選んだ色を最大20件保存（LocalStorage で永続化）
- **レスポンシブ** — モバイルでも快適に使用可能

## Usage

`index.html` をブラウザで開くだけで使えます。ビルドツールやサーバーは不要です。

## File Structure

```
color-dictionary/
├── index.html   # HTML structure
├── style.css    # Styling
├── app.js       # Application logic
├── LICENSE      # MIT License
└── README.md
```

## License

[MIT](LICENSE)
