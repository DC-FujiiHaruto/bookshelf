# CLAUDE.md

## プロジェクト概要

**MyBookshelf** — 読書記録Webアプリ。リアルな木製本棚UIで本を管理し、読書タイマー・統計グラフ・ソーシャル機能を備える。

- **仕様書**: `SPEC.md`（機能要件・データモデル・画面構成の詳細はこちらを参照）
- **場所**: `/home/harutofujii/bookshelf`
- **本番環境**: Vercel（想定）+ Supabase（DB・認証）

### 技術スタック
- Next.js 14 App Router + TypeScript
- Tailwind CSS / lucide-react
- Supabase Auth（Google OAuth）+ Supabase PostgreSQL
- `@supabase/ssr`（NextAuth.js は使わない）
- Recharts（グラフ）/ @dnd-kit（ドラッグ＆ドロップ）

### 開発コマンド
```bash
npm run dev        # 開発サーバー起動（ポート3000）
npx tsc --noEmit   # 型チェック
```

---

## コーディング規約

### ファイル・コンポーネント
- サーバーコンポーネントを基本とし、インタラクションが必要な場合のみ `'use client'` を付ける
- 新規の認証ページには必ず `AppHeader`（`@/components/ui/AppHeader`）を含める
  - 例外: ランディングページ（`/`）・公開プロフィール（`/users/[username]`）
- 新しいコンポーネントを作る前に既存のものを確認し、不要な重複を避ける

### Supabase クライアントの使い分け
| 用途 | インポート元 |
|---|---|
| サーバーコンポーネント・API Route | `@/lib/supabase/server` |
| クライアントコンポーネント | `@/lib/supabase/client` |
| ミドルウェア | `@/lib/supabase/middleware` |

### スタイリング
- カラーパレットは `amber` 系を基本とする（`bg-amber-950` / `bg-amber-900` / `text-amber-100` など）
- アイコンはすべて `lucide-react` を使用する（絵文字は使わない）
- `cn()` ではなく Tailwind のクラス文字列を直接記述する

---

## ドメインルール

### 読書ステータス
- `want_to_read`（積読）/ `reading`（読中）/ `read`（読了）の3種類のみ
- 読了日・評価（★1〜5）は `status === 'read'` のときのみ有効
- 読書タイマー・付箋メモは `status === 'reading'` のときのみUIに表示

### 本の情報
- 本の検索・取得は Google Books API 経由（`/api/books/search`・`/api/books/recommend`）
- ジャンルの表示は必ず `localizeGenre()`（`@/types/book`）で日本語化する
- `google_books_id` が本の同一性判定キー（重複登録チェック・おすすめ除外に使用）
- ジャンルは Google Books から取得できない本も多い（`null` は正常値）

### 認証・RLS
- 全認証ページは `supabase.auth.getUser()` でユーザーを確認し、未認証なら `/` にリダイレクト
- DBアクセスは Supabase RLS で制御されている。`user_id = auth.uid()` が基本ポリシー
- 公開ユーザーの読了本は他ユーザーも閲覧可能（`is_public = true`）

### ソーシャル
- ユーザーの識別は `username`（URL用）と `display_name`（表示名）で分離されている
- フォロー関係は `follows` テーブル（`follower_id` → `following_id`）

---

## やってはいけないこと

- **`GOOGLE_BOOKS_API_KEY` をクライアントサイドに渡さない**（`NEXT_PUBLIC_` を付けない）
- **`NextAuth.js` を導入しない**（Supabase Auth で完結している）
- **`auth.uid()` を使わずに自分でユーザーIDを信頼しない**（RLSがある前提で設計する）
- **コミットは指示なしに行わない**（明示的に依頼があった場合のみ実行する）
- **`SPEC.md` を更新せずに機能を変更しない**（実装と仕様書を常に同期させる）
- **`app/layout.tsx` にヘッダーを入れない**（認証不要のページもあるため、各ページで `AppHeader` を使う）

---

## ブランチ運用

### ブランチ構成
| ブランチ | 役割 |
|---|---|
| `main` | 本番環境（Vercel デプロイ対象） |
| `stg` | ステージング（本番前の動作確認用） |
| `develop` | 開発統合ブランチ（作業ブランチのマージ先） |

### 新機能・修正の手順
```bash
# 1. develop から作業ブランチを切る
git checkout develop
git checkout -b feature/機能名

# 2. 実装・コミット後、リモートにプッシュ
git push -u origin feature/機能名

# 3. GitHub で develop へ PR を作成してマージ
# 4. 動作確認後 develop → stg → main の順でマージ
```

### ブランチ命名規則
| 種類 | 例 |
|---|---|
| 新機能 | `feature/annual-reading-goal` |
| バグ修正 | `fix/header-mobile-layout` |
| 緊急修正 | `hotfix/auth-redirect` |

### やってはいけないこと
- **`main` に直接プッシュしない**
- **`develop` をスキップして `main` にマージしない**

---

## テスト方針

現時点では自動テストは導入していない。実装後は以下を手動で確認する：

1. **型チェック**: `npx tsc --noEmit` がエラーなしで通ること
2. **認証フロー**: 未ログイン状態でのリダイレクト・ログイン後の本棚表示
3. **CRUD**: 本の追加・編集・削除が正しく動作し、削除後はリロードなしで消えること
4. **RLS**: 他ユーザーのデータが見えないこと（非公開本棚は本人のみ）
5. **レスポンシブ**: スマホ幅（375px）でレイアウトが崩れないこと

将来的に自動テストを導入する場合は Vitest + React Testing Library を想定。
