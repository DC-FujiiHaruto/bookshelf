# 読書記録サイト「MyBookshelf」仕様書

## 概要

全世界のユーザーが自分の読書記録を管理できるWebアプリケーション。
リアルな本棚ビジュアルで、読んだ本を本棚に並べていく体験を提供する。
読書状態の管理・タイマー・感情タグ・統計グラフ・ソーシャル機能・積読リマインダーを備え、他の読書記録サービスと差別化する。

---

## 機能要件

### 1. 認証機能
- Supabase Auth による Google OAuth ログイン / ログアウト
- 未ログインユーザーはランディングページと公開プロフィールのみ閲覧可能
- ログイン後は自分の本棚にアクセス可能

### 2. 本の登録
- タイトルまたは著者名で検索（Google Books API）
- **検索アルゴリズム**（`/api/books/search`）
  - `intitle:` / `inauthor:` / キーワード の3種類 × 各2ページ（startIndex: 0 と 40）= 6リクエストを並列実行
  - 1リクエスト最大40件 × 6 = 最大240件を取得後、`google_books_id` で重複除去
  - 優先順位: タイトル一致 → 著者一致 → キーワード一致 の順にマージ
- 検索結果は **`auto-fill` グリッド**（最小幅80px）で表紙画像付き表示（件数も表示）
  - 画面幅に応じて列数が自動増減し、常に全幅を使い切る
  - 検索入力欄は `max-w-lg` で中央寄せ、結果グリッドはページ全幅に展開
  - 著者名は独立したボタン。クリックするとその著者名で再検索
- URLパラメータ `?q=` があればページ読み込み時に自動で検索実行
- 検索結果から本を選択すると以下が自動入力される
  - 書籍タイトル・著者名・表紙画像URL・ジャンル（Google Booksのカテゴリ）・総ページ数
  - ジャンルは Google Books から取得できない場合は `null`（日本書籍はカテゴリ未設定が多い）
- ユーザーが手動入力する項目
  - 読書状態（積読 / 読中 / 読了）
  - 読了日（読了時のみ・日付ピッカー）
  - 評価（★1〜5・読了時のみ）
  - 感想・メモ（テキストエリア）
  - 感情タグ（複数選択）：泣いた・笑った・感動した・怖かった・学んだ・考えさせられた・ワクワクした・切なかった

### 3. 本棚ビュー（メイン画面）
- リアルな木製本棚風UI
- 登録した本が背表紙として棚に並ぶ
- ステータス別タブで切り替え表示（すべて・積読・読中・読了）
  - タブは URL クエリパラメータ `?status=` で管理（`Link` ナビゲーション）
  - `BookShelf` に `key={activeStatus}` を付与し、タブ切り替え時に確実にリセット・再マウント
- 並び順：`sort_order` が設定されている本は優先表示（ドラッグ＆ドロップ後の順序）、未設定は登録日の降順
- 1段あたり最大10冊。本が増えると自動で段が増える
- 本をクリックすると詳細ポップアップが開く
- 本が0冊の場合は「最初の1冊を登録しましょう」の空状態UIを表示
- 背表紙にステータスに応じたビジュアル差異：読中のみハイライト（発光エフェクト）、積読・読了は通常表示
- 積読状態の本には登録からの経過日数バッジを表示（30日以上で黄色、90日以上で赤）
- 本棚上部に積読警告バナーを表示（例：「3冊の本が90日以上読まれていません」）
- 読中の本の背表紙下部に読書進捗バーを表示（`current_page` / `total_pages`）

### 4. 本の並び替え（ドラッグ＆ドロップ）
- 本棚上の本をドラッグして自由に並び替え可能（`@dnd-kit` 使用）
- 並び替え後の順序は `sort_order` カラムにDBへ保存・次回以降も反映

### 5. 検索・ジャンルフィルター
- 本棚右上の「検索・絞り込み」ボタン（`SlidersHorizontal` アイコン）をタップすると検索パネルが展開
  - 通常時は非表示でUIがすっきりした状態を保つ
  - 絞り込みが有効な場合はボタンがオレンジ色になり「絞り込み中」と表示
  - ボタンの × をクリックすると検索・ジャンル選択を一括クリア
- 展開時にテキスト検索バー（タイトル・著者名）とジャンルフィルターピルを表示
- Google Books のジャンル名（英語）は `GENRE_MAP`（`src/types/book.ts`）で日本語に変換して表示
  - 例: `Fiction` → `小説`、`Mystery & Detective` → `ミステリー`
  - マッピングにない場合は元の文字列を表示
- クライアントサイドでフィルタリング（サーバーへの問い合わせなし）

### 6. 本の詳細表示
- 表紙画像・タイトル・著者・ジャンル
  - 著者名はクリック可能リンク。クリックすると `/bookshelf/add?q=著者名` に遷移しその著者を自動検索
  - ジャンルは `GENRE_MAP` で日本語に変換して表示（`localizeGenre()`）
- 読書状態・読了日・評価（星）・感想・感情タグ
- 総読書時間（タイマーで記録した累計）
- ページ数の進捗（`total_pages` が設定されている場合）
  - 読中の本：現在ページ入力欄 + 進捗バー（フォーカスアウトで自動保存）
  - 読了・積読の本：記録済みページ数と進捗バー
- 読んだ記録（`book_reads`）一覧：複数回読んだ回数分の記録を表示・追加・削除
- 読書中メモ（付箋）一覧
- 編集ボタン・削除ボタン

### 7. 本の編集・削除
- すべての項目の編集が可能
- 削除は確認ダイアログを表示

### 8. 読書タイマー
- 読書状態が「読中」の本に対してタイマーを起動できる
- 右下のFABボタン（BookOpen アイコン）をクリック → 積読/読中の本を選択
- 本を選ぶとフローティングタイマーが画面右下に表示される
  - 展開/最小化ボタン付き
  - 最小化すると経過時間を表示する小さなチップになる
- 「読書開始」ボタンで計測開始、「読書終了」ボタンで計測停止・保存
- 各セッション（開始日時・終了日時・読書時間）を `reading_sessions` テーブルに記録
- 累計読書時間を本の詳細・統計に表示

### 9. 読書中メモ（付箋機能）
- 読書状態が「読中」または「積読」の本にメモを追加できる
- ページ番号・メモ内容を記録
- 本の詳細ポップアップ内でページ番号順に表示
- 読了後もメモは残る

### 10. 複数回読み記録（book_reads）
- 同じ本を複数回読んだ記録を個別に管理できる
- 1回ごとに以下を記録：読了日・評価（★1〜5）・感情タグ・感想
- 本の詳細ポップアップの「読んだ記録」セクションで追加・削除が可能
- 回数は自動でインクリメント（1回目・2回目…）

### 11. 統計・グラフ（/stats）
- サマリーカード：総読了冊数・今年読んだ冊数・総読書時間・総読了ページ数・平均評価
- 月別読了冊数（棒グラフ）
- ジャンル別読書割合（ドーナツグラフ）
- 感情タグランキング（水平バーグラフ）
- 積読ランキング TOP5（登録からの経過日数が長い順）
- 読書ヒートマップ（今年1月1日〜12月31日の日別読書活動カレンダー）← 機能17参照

### 12. 共通ヘッダー（AppHeader）
- 全認証ページ（本棚・本を追加・統計・フィード・設定）に固定ヘッダーを表示
- ロゴ（BookOpen アイコン + "MyBookshelf"）→ `/bookshelf` へのリンク
- ナビゲーション：「本を追加」ボタン・統計・フィード・設定・ログアウト
- **コンポーネント**: `src/components/ui/AppHeader.tsx`（サーバーコンポーネント）

### 13. プロフィール・設定
- 表示名・自己紹介の編集
- 本棚の公開/非公開切り替え
- 積読警告の閾値設定（30日 / 60日 / 90日）

### 14. ソーシャル機能
- プロフィールページは公開（`/users/[username]`）
- 他ユーザーの本棚・統計を閲覧可能（非公開設定も可）
- フォロー / アンフォロー機能
- フォロー中ユーザーの最近の読了をタイムライン形式で表示（/feed）

### 15. 積読リマインダー
- 積読・読中の本に対して「登録からの経過日数」を算出（`created_at` から計算）
- 経過日数の閾値（デフォルト30日・変更可能）を超えた本を警告対象とする
- 警告の表示場所
  - 本棚ビューの背表紙に経過日数バッジ（30日以上: 黄色、90日以上: 赤）
  - 本棚上部に「〇冊の本が△△日以上読まれていません」バナー
  - 統計ページに「積読ランキング TOP5」
- 本の詳細ポップアップにも「登録から〇〇日」を表示

### 16. おすすめ本（レコメンデーション）
- 読了した本の著者・ジャンルを分析し、Google Books API で関連作品を提案する
- 本棚画面（`/bookshelf`）の棚エリア下部に「おすすめの本」セクションを表示
  - セクション右上の「更新」ボタンで再取得可能（押すたびに異なる著者・ジャンルの本が表示される）
  - 既に本棚に登録済みの本（`google_books_id` で照合）は除外して表示
  - 表紙・タイトル・著者を横スクロールカードで最大12件表示
  - カードをタップするとGoogle Books のページを新タブで開く
  - 読了本が0冊の場合は非表示
- **レコメンドロジック**
  - クライアント側で読了本の著者（上位3人）とジャンル（上位2つ）を出現頻度で集計
  - 著者検索（`inauthor:著者名`）とジャンル検索（`subject:ジャンル`）を並行実行
  - 生成された検索クエリの結果を統合し、重複を排除して返す（ジャンル未設定時は著者検索のみ、両方空なら単一フォールバッククエリを実行）
  - `langRestrict=ja` で日本語書籍に絞り込み
- **コンポーネント**: `src/components/bookshelf/BookRecommendations.tsx`
- **API Route**: `GET /api/books/recommend?authors={著者1}&authors={著者2}&genres={ジャンル1}&exclude={id1,id2}`（著者・ジャンルは同名パラメータの繰り返しで送信）

### 17. 読書ヒートマップ（実装済み）
- GitHub のコントリビューショングラフのように、今年1月1日〜12月31日の読書活動をカレンダー形式で可視化する
- 統計ページ（`/stats`）の最下部に表示
- **表示仕様**
  - 横軸: 今年全体（1月1日〜12月31日）、日曜始まりで週ごとに列を並べる
  - 縦軸: 曜日（日〜土）
  - 未来の日付のセルも空セルとして表示（非表示にしない）
  - 各セルは「その日の合計読書時間（秒）」で色の濃さが変わる
    - 0分: 背景色（空白）
    - 1〜14分: 薄いアンバー
    - 15〜29分: やや濃いアンバー
    - 30〜59分: アンバー
    - 60分以上: 明るいゴールド
  - セルにホバー（またはタップ）すると「日付 / 読書時間」のツールチップを表示
  - 月の区切りにラベル（1月・2月…）を表示
- **データ取得**
  - `reading_sessions` テーブルから `started_at` で集計し、日別の合計 `duration_seconds` を算出
  - サーバーコンポーネント（stats/page.tsx）でフェッチし props として渡す
- **コンポーネント**: `src/components/stats/ReadingHeatmap.tsx`
  - props: `sessions: { date: string; totalSeconds: number }[]`

### 18. Amazon アフィリエイト連携（未実装・将来対応）

読者が本を購入するきっかけを提供し、アフィリエイト報酬を得る。

- **対象箇所**
  - おすすめ本セクション（`BookRecommendations`）のカードリンク先を Amazon に変更
  - 本の詳細ポップアップに「Amazon で購入」リンクを追加（任意）
- **実装方針**
  - Amazon アソシエイト・プログラムに登録し、トラッキングID を取得
  - Google Books API の `infoLink`（現在の遷移先）を Amazon 検索リンクに差し替える
    - 例: `https://www.amazon.co.jp/s?k={タイトル}+{著者}&tag={トラッキングID}`
  - 環境変数 `AMAZON_ASSOCIATE_TAG` にトラッキングIDを格納
  - おすすめ本カードのリンク生成を API Route 側で行い、クライアントにトラッキングIDを露出させない
- **注意事項**
  - Amazon アソシエイト規約により、「アフィリエイトリンクを含む」旨をユーザーに開示する必要がある
  - リンク先が Amazon である旨を UI 上（アイコンやラベル）で明示すること
- **収益見込み**
  - 紹介料率: 書籍カテゴリは約3〜4%
  - ユーザーが購入しない限り報酬は発生しないため、ユーザー体験への影響が最小限

---

## 技術スタック

| 項目 | 技術 |
|---|---|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| アイコン | lucide-react |
| 認証 | Supabase Auth（Google OAuth） |
| データベース | Supabase (PostgreSQL) |
| グラフ | Recharts |
| ドラッグ＆ドロップ | @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities |
| 本情報取得 | Google Books API（サーバーサイドのみで呼び出し） |
| デプロイ | Vercel（想定） |

---

## 使用パッケージ

```json
{
  "dependencies": {
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "recharts": "latest",
    "lucide-react": "latest",
    "@dnd-kit/core": "latest",
    "@dnd-kit/sortable": "latest",
    "@dnd-kit/utilities": "latest"
  }
}
```

---

## データモデル

### user_profiles テーブル

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | auth.users の id と同一（PK） |
| username | text | 一意のユーザー名（URLに使用） |
| display_name | text | 表示名 |
| avatar_url | text | プロフィール画像URL（Google OAuth から取得） |
| bio | text | 自己紹介 |
| is_public               | boolean     | 本棚を公開するか（デフォルト: true） |
| tsundoku_threshold_days | integer     | 積読警告の閾値（日数・デフォルト: 30） |
| created_at              | timestamptz | 登録日時 |

### books テーブル

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | プライマリキー |
| user_id | uuid | Supabase Auth のユーザーID |
| title | text | 書籍タイトル |
| author | text | 著者名 |
| cover_image_url | text | 表紙画像URL |
| google_books_id | text | Google Books の ID |
| genre | text | ジャンル（Google Books のカテゴリ） |
| total_pages | integer | 総ページ数 |
| status | text | 読書状態: `want_to_read` / `reading` / `read` |
| read_date | date | 読了日（status が read のみ） |
| rating | integer | 評価（1〜5、status が read のみ） |
| impression | text | 感想・メモ |
| emotion_tags | text[] | 感情タグの配列 |
| sort_order | integer | 本棚の表示順序（ドラッグ＆ドロップで設定） |
| current_page | integer | 現在の読書ページ数（読中のみ） |
| created_at | timestamptz | 登録日時 |
| updated_at | timestamptz | 更新日時（自動更新） |

### reading_sessions テーブル（読書タイマー）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | プライマリキー |
| book_id | uuid | books.id の外部キー |
| user_id | uuid | Supabase Auth のユーザーID |
| started_at | timestamptz | 読書開始日時 |
| ended_at | timestamptz | 読書終了日時 |
| duration_seconds | integer | 読書時間（秒） |
| pages_read | integer | このセッションで読んだページ数（任意） |

### reading_notes テーブル（付箋メモ）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | プライマリキー |
| book_id | uuid | books.id の外部キー |
| user_id | uuid | Supabase Auth のユーザーID |
| page_number | integer | ページ番号（任意） |
| content | text | メモ内容 |
| created_at | timestamptz | 作成日時 |

### book_reads テーブル（複数回読み記録）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | プライマリキー |
| book_id | uuid | books.id の外部キー |
| user_id | uuid | Supabase Auth のユーザーID |
| read_number | integer | 何回目の読み（1回目・2回目…） |
| read_date | date | 読了日 |
| rating | integer | 評価（1〜5） |
| impression | text | 感想 |
| emotion_tags | text[] | 感情タグの配列 |
| created_at | timestamptz | 作成日時 |

### follows テーブル

| カラム | 型 | 説明 |
|---|---|---|
| follower_id | uuid | フォローするユーザーのID |
| following_id | uuid | フォローされるユーザーのID |
| created_at | timestamptz | フォロー日時 |

---

## Supabase マイグレーション SQL

### 初回セットアップ（テーブル作成）

```sql
-- user_profiles テーブル
CREATE TABLE user_profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text        UNIQUE NOT NULL,
  display_name text        NOT NULL,
  avatar_url   text,
  bio          text,
  is_public                boolean     NOT NULL DEFAULT true,
  tsundoku_threshold_days  integer     NOT NULL DEFAULT 30,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- books テーブル
CREATE TABLE books (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            text        NOT NULL,
  author           text        NOT NULL,
  cover_image_url  text,
  google_books_id  text,
  genre            text,
  total_pages      integer,
  status           text        NOT NULL DEFAULT 'want_to_read'
                               CHECK (status IN ('want_to_read', 'reading', 'read')),
  read_date        date,
  rating           integer     CHECK (rating BETWEEN 1 AND 5),
  impression       text,
  emotion_tags     text[]      NOT NULL DEFAULT '{}',
  sort_order       integer,
  current_page     integer,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- reading_sessions テーブル
CREATE TABLE reading_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id          uuid        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at       timestamptz NOT NULL,
  ended_at         timestamptz,
  duration_seconds integer,
  pages_read       integer
);

-- reading_notes テーブル
CREATE TABLE reading_notes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      uuid        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number  integer,
  content      text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- book_reads テーブル（複数回読み記録）
CREATE TABLE book_reads (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      uuid        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_number  integer     NOT NULL,
  read_date    date,
  rating       integer     CHECK (rating BETWEEN 1 AND 5),
  impression   text,
  emotion_tags text[]      NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- follows テーブル
CREATE TABLE follows (
  follower_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- RLS 有効化
ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE books            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows          ENABLE ROW LEVEL SECURITY;

-- user_profiles ポリシー（公開プロフィールは誰でも読める）
CREATE POLICY "profiles_select_public" ON user_profiles
  FOR SELECT USING (is_public = true OR id = auth.uid());
CREATE POLICY "profiles_insert_own"  ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own"  ON user_profiles FOR UPDATE USING (id = auth.uid());

-- books ポリシー（公開ユーザーの読了本は誰でも読める）
CREATE POLICY "books_select" ON books FOR SELECT USING (
  user_id = auth.uid()
  OR (
    status = 'read'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = books.user_id AND user_profiles.is_public = true
    )
  )
);
CREATE POLICY "books_insert_own" ON books FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "books_update_own" ON books FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "books_delete_own" ON books FOR DELETE USING (user_id = auth.uid());

-- reading_sessions ポリシー（自分のみ）
CREATE POLICY "sessions_select_own" ON reading_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sessions_insert_own" ON reading_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions_update_own" ON reading_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "sessions_delete_own" ON reading_sessions FOR DELETE USING (user_id = auth.uid());

-- reading_notes ポリシー（自分のみ）
CREATE POLICY "notes_select_own" ON reading_notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notes_insert_own" ON reading_notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes_update_own" ON reading_notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notes_delete_own" ON reading_notes FOR DELETE USING (user_id = auth.uid());

-- book_reads ポリシー（自分のみ）
CREATE POLICY "reads_select_own" ON book_reads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reads_insert_own" ON book_reads FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reads_update_own" ON book_reads FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reads_delete_own" ON book_reads FOR DELETE USING (user_id = auth.uid());

-- follows ポリシー
CREATE POLICY "follows_select_all"    ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"    ON follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own"    ON follows FOR DELETE USING (follower_id = auth.uid());

-- updated_at 自動更新トリガー（books）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 新規ユーザー登録時に user_profiles を自動生成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    -- username は email の @ 前 + ランダム4桁
    split_part(NEW.email, '@', 1) || floor(random() * 9000 + 1000)::text,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 追加マイグレーション（既存DBへの適用）

初回セットアップ済みの場合は、以下の差分 SQL のみ実行する。

```sql
-- books テーブルに並び替え・現在ページカラムを追加
ALTER TABLE books ADD COLUMN IF NOT EXISTS sort_order integer;
ALTER TABLE books ADD COLUMN IF NOT EXISTS current_page integer;

-- book_reads テーブル（複数回読み記録）
CREATE TABLE IF NOT EXISTS book_reads (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      uuid        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_number  integer     NOT NULL,
  read_date    date,
  rating       integer     CHECK (rating BETWEEN 1 AND 5),
  impression   text,
  emotion_tags text[]      NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE book_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reads_select_own" ON book_reads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reads_insert_own" ON book_reads FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reads_update_own" ON book_reads FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reads_delete_own" ON book_reads FOR DELETE USING (user_id = auth.uid());
```

---

## 画面構成

```
/                          ← ランディングページ（未ログイン時）
/bookshelf                 ← 本棚メイン画面（おすすめ本セクション含む）（ログイン必須）
/bookshelf/add             ← 本を追加する画面
/bookshelf/[id]/edit       ← 本を編集する画面
/stats                     ← 統計・グラフ画面（ヒートマップ含む）（ログイン必須）
/feed                      ← フォロー中ユーザーのタイムライン（ログイン必須）
/users/[username]          ← 公開プロフィール・本棚
/settings/profile          ← プロフィール設定（ログイン必須）
/auth/callback             ← Supabase Auth コールバック
```

---

## APIルート

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/books/search?q={query}` | Google Books API で本を検索して結果を返す |
| GET | `/api/books/recommend?authors={著者1,著者2}&genres={ジャンル1}&exclude={id1,id2}` | 著者×ジャンルの2軸並行検索でおすすめ本を最大12件返す（`inauthor:` + `subject:` 検索・日本語書籍限定） |

> Google Books API キーはサーバーサイドの環境変数 `GOOGLE_BOOKS_API_KEY` から読み込む。クライアントには露出させない。

---

## 認証ミドルウェア

`middleware.ts`（プロジェクトルート）で保護されたルートへのアクセスを制御する。

```
- セッションが存在しない場合 → / にリダイレクト
- セッションが存在する場合  → そのままアクセス許可
- @supabase/ssr の createServerClient を使いセッションをリフレッシュ
- matcher: ['/bookshelf/:path*', '/stats', '/feed', '/settings/:path*']
```

---

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # ランディングページ
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                # OAuth コールバック処理
│   ├── bookshelf/
│   │   ├── page.tsx                    # 本棚メイン（ReadingFAB含む）
│   │   ├── add/
│   │   │   └── page.tsx                # 本を追加
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx            # 本を編集
│   ├── stats/
│   │   └── page.tsx                    # 統計・グラフ
│   ├── feed/
│   │   └── page.tsx                    # タイムライン
│   ├── users/
│   │   └── [username]/
│   │       └── page.tsx                # 公開プロフィール
│   ├── settings/
│   │   └── profile/
│   │       └── page.tsx                # プロフィール設定
│   └── api/
│       └── books/
│           ├── search/
│           │   └── route.ts            # Google Books API 検索ラッパー
│           └── recommend/
│               └── route.ts            # おすすめ本取得（ジャンル・タグ→Google Books）
├── components/
│   ├── bookshelf/
│   │   ├── BookShelf.tsx               # 本棚全体（DnD・検索統合）
│   │   ├── BookSpine.tsx               # 背表紙1冊分（useSortable）
│   │   ├── BookDetail.tsx              # 詳細ポップアップ
│   │   ├── BookDetailWrapper.tsx       # 詳細データフェッチャー
│   │   ├── BookSearch.tsx              # 検索バー＋ジャンルフィルター
│   │   ├── BookReadsHistory.tsx        # 複数回読み記録
│   │   ├── ReadingFAB.tsx              # 読書開始フローティングボタン
│   │   ├── BookRecommendations.tsx     # おすすめ本セクション（ジャンル・タグ分析→API取得）
│   │   ├── AddBookForm.tsx             # 本の登録フォーム
│   │   ├── EditBookForm.tsx            # 本の編集フォーム
│   │   ├── TsundokuBanner.tsx          # 積読警告バナー
│   │   └── EmptyState.tsx             # 0冊時の空状態
│   ├── timer/
│   │   ├── ReadingTimer.tsx            # 読書タイマー（詳細内）
│   │   └── FloatingTimer.tsx          # フローティングタイマー
│   ├── notes/
│   │   └── ReadingNotes.tsx            # 付箋メモ一覧・追加
│   ├── stats/
│   │   ├── MonthlyChart.tsx            # 月別読了冊数グラフ
│   │   ├── GenreChart.tsx              # ジャンル別グラフ
│   │   ├── EmotionTagRanking.tsx       # 感情タグ集計
│   │   ├── TsundokuRanking.tsx         # 積読ランキング
│   │   └── ReadingHeatmap.tsx          # 読書ヒートマップ（GitHub草風カレンダー）
│   ├── social/
│   │   └── FollowButton.tsx            # フォローボタン
│   └── ui/
│       ├── AppHeader.tsx               # 全認証ページ共通ヘッダー
│       ├── LoginButton.tsx             # Googleログインボタン
│       ├── LogoutButton.tsx            # ログアウトボタン
│       └── ProfileSettingsForm.tsx     # プロフィール設定フォーム
├── lib/
│   └── supabase/
│       ├── client.ts                   # ブラウザ用クライアント
│       ├── server.ts                   # サーバーコンポーネント用クライアント
│       └── middleware.ts               # ミドルウェア用クライアント
├── types/
│   ├── book.ts                         # Book 型定義・GENRE_MAP・localizeGenre()
│   ├── book_read.ts                    # BookRead 型定義
│   ├── profile.ts                      # UserProfile 型定義
│   └── session.ts                      # ReadingNote 型定義
└── middleware.ts                        # 認証ガード
```

---

## UI / デザイン方針

- 木製本棚風のデザイン（温かみのある茶色系・amber カラーパレット）
- アイコンはすべて **lucide-react** を使用（絵文字は使用しない）
- 本の背表紙は表紙画像を縦長にクロップして表示
- 表紙画像がない場合はタイトルをカラー背景の背表紙として自動生成（タイトルのハッシュから色決定）
- ステータスによる背表紙の視覚的差異
  - 読中：発光エフェクト（`ring-2 ring-amber-300 drop-shadow`）
  - 積読・読了：通常表示
- 読中の本の背表紙下部に細い進捗バーを表示（`current_page` / `total_pages`）
- 積読日数バッジは背表紙の右上に小さく表示（30日以上: 黄色、90日以上: 赤）
- レスポンシブ対応（スマホでも見られる）

---

## Supabase 設定

### 認証
- Supabase Auth のダッシュボードで Google OAuth プロバイダーを有効化
- Google Cloud Console で OAuth クライアントを作成し、クライアントID・シークレットを Supabase に設定
- リダイレクトURL: `{NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
- ログイン後、`user_profiles` テーブルに自動でレコードを作成する（トリガー）

### RLS（Row Level Security）
- `user_profiles`: 公開プロフィールは誰でも閲覧可能・自分のみ編集可能
- `books`: 自分の全本 + 公開ユーザーの読了本は誰でも閲覧可能・自分のみ編集可能
- `reading_sessions` / `reading_notes` / `book_reads`: 自分のみ
- `follows`: 全員が閲覧可能・自分のフォローのみ追加・削除可能

---

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_BOOKS_API_KEY=
AMAZON_ASSOCIATE_TAG=          # Amazonアフィリエイト トラッキングID（将来実装）
```

> **注意:** `GOOGLE_BOOKS_API_KEY` はサーバーサイド（API Route）からのみ呼び出すため `NEXT_PUBLIC_` を付けない。
