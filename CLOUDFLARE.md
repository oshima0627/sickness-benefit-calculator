# Cloudflare へのデプロイ手順

このアプリは Next.js App Router の**完全な静的サイト**（サーバー処理なし）です。
`next build` で `out/` に静的HTMLを書き出し、それを Cloudflare が配信します。

- 出力ディレクトリ: `out/`
- 設定ファイル: `wrangler.jsonc`
- レスポンスヘッダー: `public/_headers`（ビルド時に `out/_headers` へコピーされる）

---

## 1. Wrangler CLI から手動デプロイ

```bash
npm install
npx wrangler login      # 初回のみ（ブラウザで Cloudflare 認証）
npm run deploy          # next build → wrangler deploy
```

ローカルで本番と同じ配信を確認する場合:

```bash
npm run preview         # next build → wrangler dev
```

デプロイ後のURL: `https://sickness-benefit-calculator.<アカウント名>.workers.dev`

---

## 2. GitHub 連携で自動デプロイ（推奨）

### Workers Builds を使う場合

1. Cloudflare ダッシュボード → **Workers & Pages** → **Create** → **Import a repository**
2. `oshima0627/sickness-benefit-calculator` を選択
3. ビルド設定
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
4. 環境変数（下記参照）を設定して保存

### Cloudflare Pages を使う場合

同じ `out/` をそのまま使えます。

- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`

`public/_headers` は Pages でもそのまま有効です。

---

## 3. 環境変数（ビルド時に埋め込まれます）

静的エクスポートのため、`NEXT_PUBLIC_*` はすべて**ビルド時**に値が確定します。
Cloudflare 側では「ビルド用の環境変数」として設定してください。

| 変数名 | 用途 | 例 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | canonical URL / OGP の URL | `https://sickness.nexeed-lab.com` |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Search Console 所有権確認 | （任意） |

どちらも任意です。未設定でもビルドは通ります。

---

## 4. 独自ドメインの設定

1. Cloudflare ダッシュボードで対象の Worker（または Pages プロジェクト）を開く
2. **Settings** → **Domains & Routes** → **Add custom domain**
3. `sickness.nexeed-lab.com` を追加
4. `nexeed-lab.com` が Cloudflare のネームサーバーを使っていれば DNS は自動で作成されます

ドメインを変更した場合は `NEXT_PUBLIC_APP_URL` も合わせて更新してください。

---

## 5. アクセス解析について

現在このサイトはアクセス解析を一切組み込んでいません。

- Vercel にデプロイしていた際の `@vercel/analytics` は Cloudflare 上では動作しない
  （`/_vercel/insights/*` が 404 になる）ため削除しました。
- Google Analytics 4（gtag）も削除しました。

計測を再開する場合は Cloudflare Web Analytics が使えます。ダッシュボードで発行される
beacon スクリプトを `app/layout.tsx` の `<head>` に追加してください（Cookie 不要）。

---

## 6. 注意事項

- `output: 'export'` のため `next start` は使えません。ローカル確認は `npm run dev`
  もしくは `npm run preview` を使ってください。
- 静的エクスポートでは `next.config.ts` の `headers()` / `redirects()` は無視されます。
  ヘッダーを追加する場合は `public/_headers` を編集してください。
- 画像最適化サーバーは使えないため `images.unoptimized: true` を設定しています。
