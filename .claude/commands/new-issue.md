GitHub に Issue を作成し、自動でブランチが作られるまで待ちます。

以下の手順で実行してください：

1. ユーザーから Issue のタイトルと詳細を確認する（不明な場合は質問する）
2. ラベルは内容に応じて `enhancement`（新機能）または `bug`（バグ）を選ぶ
3. 以下のコマンドで Issue を作成する：

```bash
gh issue create --title "タイトル" --body "詳細" --label "enhancement"
```

4. 作成された Issue の URL を表示する
5. 「GitHub Actions がブランチを自動作成します。数秒後に `git fetch origin` を実行してください」と伝える
