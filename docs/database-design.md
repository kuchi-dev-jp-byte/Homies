# Supabase データモデル案（Phase 2 / 3）

このアプリは現在ローカルモック専用。以下は次フェーズの設計であり、適用済みスキーマ・検証済みRLSではない。実際の生徒情報を保存する前に、所属確認とすべてのアクセス制御を実装・テストする。

## 共通方針

- 主キーは UUID、作成・更新時刻は timestamptz。auth.users は認証専用、公開情報は profiles に分離。
- 学校を跨いだ参照を防ぐため、school_id と id の複合 UNIQUE と複合外部キーを使用する。クライアントの school_id やユーザー編集可能な JWT metadata を信用しない。
- 各ユーザーの所属・役割は school_memberships で管理し、検証済みの所属がないユーザーはプロフィールも投稿も読み書きできない。
- レコード所有権、所属校、公開範囲、ブロックを全てDBで確認する。アプリ側フィルターはセキュリティ境界ではない。
- デフォルトで全テーブル RLS ON、ポリシー未定義の操作は禁止。anon への公開 SELECT は与えない。
- 一般ユーザーが school_id、role、verification_status を書き換えることは禁止。設定変更は保護されたサーバー処理のみ。

## テーブル

| テーブル | 主要カラム・制約 |
| --- | --- |
| schools | id, name, status, created_at |
| school_memberships | id, school_id, user_id → auth.users, role(student / school_admin), status(pending / verified / revoked), verified_at, grade, classroom。UNIQUE(school_id,user_id)。一般ユーザーの書き込み禁止 |
| school_invitations | id, school_id, token_hash, expires_at, max_uses, uses, issued_by。平文トークンを保存しない。一般ユーザーから SELECT 不可 |
| verification_requests | id, school_id, user_id, status, reviewed_by, reviewed_at。本人・検証担当者だけ閲覧。証明資料は非公開Storage、保存期限を設ける |
| profiles | id → auth.users, school_id, display_name, avatar_path, bio, skills, wishes, club。メール・本名・生年月日などを公開カラムに含めない。所属クラスは検証済み membership を参照 |
| interests | id, school_id, label, kind。UNIQUE(school_id,label) |
| user_interests | school_id, profile_id, interest_id。UNIQUE(profile_id,interest_id)。両参照に同じ school_id の複合FK |
| post_categories | id, school_id, name, kind。学校管理者が管理 |
| posts | id, school_id, author_id, kind(school / board / student), category_id, title, body, image_path, audience(school / grade / class), capacity, deadline, community_id(nullable), created_at。capacity 1〜100、学校連絡は管理者のみ |
| post_reactions | id, school_id, post_id, user_id, reaction。UNIQUE(post_id,user_id,reaction) |
| comments | id, school_id, post_id, author_id, body, created_at。空本文禁止、長さ制限 |
| bookmarks | school_id, user_id, post_id, created_at。UNIQUE(user_id,post_id)。保存した本人だけ SELECT |
| matching_actions | school_id, from_user_id, to_user_id, action(interested / skipped), created_at。UNIQUE(from_user_id,to_user_id)、自己操作禁止。選んだ本人だけ SELECT |
| communities | id, school_id, name, category_id, description, cover_path, owner_id, created_at |
| community_members | school_id, community_id, user_id, role(member / moderator), joined_at。UNIQUE(community_id,user_id)。role の自己昇格禁止 |
| notifications | id, school_id, recipient_id, type, entity_id, read_at, created_at。受信者だけ SELECT と read_at の変更、作成はサーバーのみ |
| reports | id, school_id, reporter_id, target_post_id(nullable), target_user_id(nullable), reason, status, created_at。対象は最低1つ必要。投稿者と学校管理者のみ読み取り、status の変更は管理者のみ |
| blocks | school_id, blocker_id, blocked_id, created_at。UNIQUE(blocker_id,blocked_id)、自己ブロック禁止。作成者だけ変更・閲覧 |
| post_applications | school_id, post_id, applicant_id, status, created_at。UNIQUE(post_id,applicant_id)。応募者と募集者のみ閲覧。定員確定はトランザクションで実施 |

全ての school_id 付きリレーションに `(school_id, referenced_id)` 複合FKを使う。学校をまたぐリアクション、コミュニティ参加、タグ付け、コメントなどを制約でも拒否する。auth.users は全体IDとして持ち、公開プロフィールは一つの確認済み所属校を前提とする。転校時はサーバー側で旧所属を無効化し、公開データとStorageの扱いを明示的に移行する。

## RLS ポリシー仕様

| 対象 | SELECT | INSERT / UPDATE / DELETE |
| --- | --- | --- |
| schools | 確認済み所属校のみ | 運営サーバーのみ |
| school_memberships | 自分、または同じ学校の管理者 | 検証済み管理処理のみ |
| profiles / interests | 同校・所属 verified。プロフィールは相互ブロックを除外 | profiles の公開項目は本人のみ。school_id / id は変更不可。interests の追加は同校、変更は管理者 |
| posts | 同校かつ audience 一致。コミュニティ限定投稿には所属チェック。ブロック対象を除外 | author_id=auth.uid()、確認済み同校。kind=school は school_admin。所有者のみ更新削除、管理者の削除は監査ログ必須 |
| reactions / comments | 参照先投稿が閲覧可能な場合のみ | 自分の行のみ。投稿へのアクセスを再確認 |
| bookmarks | 本人かつ対象投稿を閲覧可能 | 本人のみ、対象投稿の権限を再確認 |
| matching_actions | from_user_id=auth.uid() | 本人→同校ユーザーのみ、ブロックなし。相手からの一方的な「気になる」を公開しない |
| communities / community_members | 同校のコミュニティと、公開可能なメンバー項目 | 一般ユーザーは自分を member として追加・削除。管理権限の更新は禁止 |
| notifications | recipient_id=auth.uid() | 本人は read_at のみ。サーバーが通知を生成 |
| reports | reporter または同校 school_admin | reporter は INSERT のみ、同校の対象に限定。status は管理者のみ |
| blocks | blocker_id=auth.uid() | blocker_id=auth.uid() の行だけ。対象は同校 |

`verified_school_id()`、`can_read_post()` などの補助関数は `SECURITY DEFINER SET search_path = ''` で最小権限化する。RLS 内で同テーブルを再帰参照しない。関数の EXECUTE 権限を制限し、所属情報を関数経由で漏らさない。UPDATE には USING と WITH CHECK の両方を定義し、カラム単位GRANTまたはトリガーで所属・権限カラムを書き換えられないようにする。

## 学校の招待・所属確認

1. 学校管理者がサーバーから期限付き招待を発行する。メールドメインは補助情報にとどめる。
2. Supabase Auth でアカウントを作成。招待コードはサーバーへ渡し、ハッシュ照合・期限・回数・学校状態を検証する。
3. 所属は pending。学校管理者による名簿照合などで verified となるまで学校のデータへアクセスできない。
4. 学年・クラス・role は管理フローで確定する。クライアントが membership を直接更新できないようにする。
5. 招待使用回数の更新と所属作成はトランザクション。退学・卒業・転校時の revoked をすべてのRLSが毎回確認する。

## 相互希望と交流

現Phase 1は自分が選んだ相手の保存のみ。Phase 2以降はサーバーが相互 interested とブロック状態を検証して、両者に「交流を始める」選択肢を提示する。相互希望だけでDMは作成・送信しない。双方の追加同意後にだけ許可する。学校・ユーザー単位のレート制限、通報・ブロック後のアクセス失効を併せて設計する。

## Storage

非公開バケット。パスは `{school_id}/{user_id}/{uuid}`。アップロードは本人のパス、ファイルサイズ・MIMEを検証。読み取りは参照する投稿／プロフィールのRLS相当の検査後に短時間の署名URLを発行する。公開バケットURLを学校認証の代用にしない。プロフィール更新で古い画像を孤立させないクリーンアップを設ける。

## 必須の検証シナリオ

- 学校Aのユーザーが学校Bのすべてのテーブル、Storage、RPC、リアルタイム購読へアクセスできない。
- pending / revoked / 未ログインの全読み書きが拒否される。
- school_id / role / author_id の偽装・更新、別校の外部キー設定が拒否される。
- 学年・クラスの公開範囲がコメント・画像・通知・保存経由でも漏れない。
- 学校連絡を生徒が作成・kind変更できない。
- 気になる相手、保存、通報、ブロックを第三者から閲覧できない。
- 相互希望でも一方の同意・ブロック状態が変われば交流権限が付与されない。
- コミュニティ退会後に限定投稿へ書き込めない。公開範囲を狭めた投稿は既存の保存からも読めない。

## オープンチャット型コミュニティの追加設計

`community_messages`: id, school_id, community_id, author_id, body（1〜1,000文字）, created_at。`(school_id, community_id)` と `(school_id, author_id)` は同一学校への複合FKを持たせる。現在の端末デモでは ChatMessage 型と独立した chatMessages 配列に保存しており、posts と混在させない。既存のコミュニティ投稿はノートとして保持する。

SELECT は確認済み同校・ルーム参加中・ブロック非該当を必須にする。INSERT は同条件に加え author_id=auth.uid() を検証する。school_id / community_id / author_id の書き換えは禁止。退出後はトークの送受信を拒否。Realtime購読も同じ認可条件を適用し、購読時だけでなく権限失効を扱う。配信・再接続・重複防止・送信失敗のUIはバックエンド接続時に実装し、現デモで未実装の既読状態は表示しない。

## 学校生活・日次解放・匿名・ゲームの次フェーズ設計

追加対象は homework_assignments（学校・先生・タイトル・本文・期限）、homework_receipts（宿題・生徒・確認時刻、UNIQUE(assignment_id,student_id)）、daily_activity（school_id,user_id,date_jst,post_count,swipes_used）、notes（公開先・作成時刻・期限）、instants（非公開Storage参照・送信者・expires_at）、instant_views（受信者・インスタント・閲覧開始時刻、UNIQUE(instant_id,viewer_id)）、card_rounds（サーバー管理山札・行動・結果）、daily_scores。

先生権限は学校認証後の管理ロールで確定し、クライアントのrole切替は認可に使用しない。宿題は同校の対象生徒のみ閲覧、receiptは本人のみ追加し先生のみ対象クラスを集計。日次利用回数は日本時間の日付をサーバーで確定し、操作登録と消費を同一トランザクションにする。投稿作成後の解放条件もサーバーで計算する。

流行の学校別集計は閲覧できる公開範囲の投稿のみ。非公開クラス投稿の話題が学校全体に漏れないようにする。匿名投稿は本人特定情報を公開レスポンスから除き、管理用IDを別の保護されたテーブルで扱う。禁止表現はサーバーでも検査し、辞書だけで完全防止と見なさない。

インスタントは受信者確認と一回限りの閲覧開始をトランザクションで記録してから、短時間の署名URLを発行する。期限到来時にStorageを削除し、クライアント時刻・端末内viewedフラグの書換では復活しないようにする。Webは保護できないため画像を配信しない。ノートの期限もサーバー時刻で検証。カードのスコア・順位はサーバーがゲーム行動から算出し、クライアントから得点を直接受け付けない。

現実装は上記のローカルデモであり、ここに記載したサーバーのテーブル・RLS・トランザクションを適用済みという意味ではない。

## 友達・アクティビティ・シークレットの追加設計

friend_requests（school_id,from_user_id,to_user_id,status,created_at）、friendships（school_id,user_a,user_b,accepted_at）、activity_events（school_id,recipient_id,actor_id,type,entity_id,read_at）をサーバー側に追加する想定。申請受信者だけが承認・辞退でき、承認とfriendship作成は同じトランザクション。気になる登録時の申請は一意制約で重複を防ぎ、相互の気になる時は両者の意志とブロック状態を再確認して承認する。チャット作成・送信はfriendship確認後のみ。イベントはサーバーが生成し、受信者だけが閲覧・既読化。未読マッチはマッチイベントの既読状態から導出する。

シークレット投稿のSELECTは、学校・学年・クラスなどの条件に加えて、本人または承認済みの友達であることをDBで検証する。秘密投稿と匿名投稿は学校全体のトレンド集計へ送らない。トレンドの男女属性は任意設定の専用非公開データとして保存し、集計結果から個人を特定させないため実運用時の最小集計人数などを別途定義する。公開プロフィールのレスポンスには集計用属性を含めない。

現在の実装は端末内の状態遷移とUI確認用。上記のテーブル・サーバー認可・他端末への通知配信は未適用。
