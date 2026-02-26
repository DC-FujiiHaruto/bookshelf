現在のブランチから PR を作成します。

以下の手順で実行してください：

1. 現在のブランチ名を確認する（`git branch --show-current`）
2. git log でこのブランチの変更コミットを確認する
3. 変更ファイルを確認する（`git diff develop...HEAD --name-only`）
4. PR のタイトルと本文を以下のテンプレートで作成する：

```
## 指示内容
（ユーザーが Claude に依頼した内容）

## 変更・作成ファイル
| ファイル | 変更種別 | 理由 |
|---|---|---|
| path/to/file | 新規 / 修正 / 削除 | ○○のため |

## 確認事項
- [ ] `npx tsc --noEmit` でエラーなし
- [ ] `npm run lint` でエラーなし
- [ ] `npm run build` でエラーなし
- [ ] ローカルで動作確認済み

## 関連 Issue
Closes #番号
```

5. 以下のコマンドで PR を作成する（base は develop）：

```bash
gh pr create --base develop --title "タイトル" --body "..."
```

6. 作成された PR の URL を表示する
