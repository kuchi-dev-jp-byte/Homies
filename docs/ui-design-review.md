# Homies UI 改善記録

調査と実装は「プロフィール・検索・マッチング」「チャット・コミュニティ・インスタント」「学校・通知・設定」の3担当に分け、ホーム・投稿・トレンドと共通 UI をあわせて調整した。色は Homies の紫を主操作と選択状態に残し、本文・補足・未選択の違いは文字サイズや太さでも伝える。

| 画面 | 参照した既存 UI | Homies での判断 |
| --- | --- | --- |
| ホーム・投稿・掲示板 | [Instagram のフィード切替](https://about.fb.com/ja/news/2022/03/instagram_feed_with_favorites_following/amp/)・[Material のフローティングボタン](https://m2.material.io/components/buttons-floating-action-button) | 投稿・掲示板・匿名の選択を上部にまとめ、右下の投稿ボタンは現在の欄に合ったフォームを開く。投稿では著者と時刻を先に置き、保存を右に揃える。掲示板の返信プレビューはコメントの詳細につなぐ。 |
| プロフィール・編集・検索 | [X のプロフィール](https://help.x.com/en/managing-your-account/how-to-customize-your-profile)・[Apple の検索ガイド](https://developer.apple.com/design/human-interface-guidelines/searching) | カバー・本人情報・操作をまとめ、投稿とメディアと紹介を分ける。他人の参加コミュニティは公開しない。本人の紹介には、参加中の部屋へ移動できる一覧を置く。検索結果は名前と ID、学年・クラスを揃える。 |
| マッチング | [Tinder の公式画面集](https://www.tinderpressroom.com/app-images) | 縦長の写真カードを中心にし、一覧への切り替えとスワイプ方向を上に表示する。マッチの未読は別に示す。 |
| チャット・インスタント | [Instagram ノート](https://about.fb.com/ja/news/2023/01/instagram_notes/amp/)・[Instagram インスタント](https://about.fb.com/ja/news/2026/05/instants/)・[Apple メッセージ](https://support.apple.com/en-euro/guide/iphone/iph17c111fb6/ios) | ノートのない人はノート欄に並べず、DM 一覧では最新の文と時刻を表示。インスタントは撮影から始め、履歴では画像を先に見せず送信者と閲覧状態を示す。 |
| コミュニティ | [LINE オープンチャット](https://guide.line.me/ja/services/openchat.html) | 参加中は最新の会話からトークを開く。未参加のおすすめは概要と人数を確認してから参加を判断できる。 |
| 学校・通知・設定 | [Google Classroom の課題一覧](https://support.google.com/edu/classroom/answer/6020284?hl=en)・[X の通知タイムライン](https://help.x.com/en/managing-your-account/understanding-the-notifications-timeline)・[Apple の通知設定](https://support.apple.com/en-ca/guide/iphone/-iph7c3d96bab/ios) | 宿題の未確認・確認済みを区別し、ベルの通知から対象の宿題へ移動できる。友達申請はハート側で履歴より先に表示し、デモ操作は通常の操作から分ける。 |
| トレンド | [X のトレンドの文脈表示](https://blog.x.com/en/product/adding-more-context-to-trends) | 全体ランキングはタグから関連投稿を開ける。学年・クラス限定、匿名、シークレットの投稿は集計対象外。男子・女子別には集計だけを出す。 |

型チェック、Lint、21件のテスト、Web ビルドが通過。ローカルブラウザでは掲示板の投稿フォームとコメント詳細、検索からの公開プロフィール、自分の所属リンク、コミュニティ・チャット・宿題・通知への画面遷移を確認した。ネイティブ端末の撮影・画面収録防止は未確認。
