# Minecraft Vanilla Recipe Randomizer

Minecraft Java Edition および Bedrock Edition（統合版）向けのバニラレシピランダム化データパック／ビヘイビアパック生成ツールです。

## 概要

このWebアプリケーションでは、バニラMinecraftのレシピ（作業台、精錬、高炉、燻製、焚き火、切石機、鍛冶など）のクラフト結果をランダム化するデータパック（Java版）およびビヘイビアパック（統合版）を作成・ダウンロードできます。

## 元となったプログラム（謝意・クレジット）

本プログラムは、**destruc7i0n** 氏によるオープンソースプロジェクト **[Crafting Generator](https://github.com/destruc7i0n/crafting)** をベースに作成・カスタマイズされています。

- 元リポジトリ: [https://github.com/destruc7i0n/crafting](https://github.com/destruc7i0n/crafting)
- ライセンス: MIT License

素晴らしい元プロジェクトの開発者様に心より感謝申し上げます。

---

## ローカルでの開発・動作確認

### 前提条件

- Node.js (v22 以上推奨)
- pnpm

### インストール & 開発用サーバーの起動

```sh
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

### ビルド & テスト

```sh
# プロダクションビルドの実行
pnpm run build

# テストの実行
pnpm test

# 型チェック
pnpm type-check
```

ビルド成果物は `dist/client/` ディレクトリに生成されます。

---

## GitHub Pages でのデプロイ

リポジトリの `main` ブランチに変更がプッシュされると、GitHub Actions ワークフロー (`.github/workflows/deploy.yml`) が自動的に起動し、`dist/client/` の静的ファイルを GitHub Pages にデプロイします。

### 初回設定手順

1. GitHub リポジトリの **Settings** > **Pages** を開きます。
2. **Build and deployment** の **Source** を **GitHub Actions** に設定します。
3. `main` ブランチに変更をプッシュすると自動デプロイされます。

---

## マインクラフトのアップデート時のマージ手順

マインクラフトの新しいバージョンがリリースされ、元となるプログラム（`https://github.com/destruc7i0n/crafting`）がアップデートされた際は、以下の手順でアップストリーム（元リポジトリ）の最新変更を取り込むことができます。

### 1. アップストリーム（元リポジトリ）をリモートに追加する（初回のみ）

```sh
git remote add upstream https://github.com/destruc7i0n/crafting.git
```

### 2. アップストリームの最新情報を取得してマージする

```sh
# 最新情報の取得
git fetch upstream

# main ブランチにアップストリームの main をマージ
git checkout main
git merge upstream/main
```

### 3. レシピデータ等の更新と確認

必要に応じてレシピデータ生成スクリプトを実行し、ビルド・テストが正常に通ることを確認します。

```sh
# レシピデータの再生成（必要な場合）
pnpm run generate:data

# 動作確認・テスト
pnpm run type-check
pnpm test
pnpm run build
```

### 4. 変更をプッシュする

```sh
git push origin main
```

これで新しいマインクラフトバージョンのレシピデータを取り込んだ状態更新が完了し、GitHub Pages に再デプロイされます。

---

## ライセンス

[MIT License](LICENSE)
