import { deleteOwnedPost, withoutDeletedPosts } from "../lib/postActions";
import { stickerCaption, type StickerId } from "../data/stickers";
import {
  demoQuickMembers,
  trialDuration,
  type GroupChat,
  type QuickTopic,
} from "../lib/groups";
import type { DirectMessage, Interest } from "../data/types";
import { staffProfile } from "../data/accounts";
import { CARDS_ENABLED } from "../lib/features";
import {
  SocialState,
  requestFriend,
  acceptFriend,
  matchedSocial,
  socialEvent,
} from "../lib/social";
import { dayKey, hasPostedToday, anonymousAllowed } from "../lib/activity";
import { CardGame, newGame, hit, stand, gamePoints } from "../lib/cards";
import { isMutualInterest } from "../lib/matching";
import { initialChatMessages } from "../data/chat";
import { validatedMessage } from "../lib/chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  communities as initialCommunities,
  initialPosts,
  profiles,
} from "../data/mock";
import {
  Homework,
  Instant,
  ChatMessage,
  Comment,
  MatchingAction,
  Post,
  Profile,
} from "../data/types";
const initialProfile = profiles[0];
interface AppState extends SocialState {
  sendFriendRequest: (id: string) => void;
  acceptFriendRequest: (id: string) => void;
  declineFriendRequest: (id: string) => void;
  simulateFriendRequest: (id: string) => void;
  simulateAcceptance: (id: string) => void;
  simulateReaction: () => void;
  readSocial: () => void;
  readMatches: () => void;

  communities: import("../data/types").Community[];
  saveCommunity: (value: import("../data/types").Community) => void;
  updateGroup: (
    id: string,
    patch: { name: string; icon?: string; members: string[] },
  ) => void;
  reposted: string[];
  toggleRepost: (id: string) => void;
  role: "student" | "teacher";
  setDemoRole: (role: "student" | "teacher") => void;
  homework: Homework[];
  homeworkSeen: Record<string, string>;
  publishHomework: (title: string, body: string, due: string) => boolean;
  acknowledgeHomework: (id: string) => void;
  swipeUsage: Record<string, number>;
  instants: Instant[];
  viewedInstants: string[];
  publishInstant: (uri: string, caption?: string) => void;
  receiveDemoInstant: () => void;
  viewInstant: (id: string) => void;
  groups: GroupChat[];
  createGroup: (name: string, members: string[]) => string | undefined;
  createQuickGroup: (topic: QuickTopic) => string | undefined;
  sendGroupMessage: (id: string, body: string, stickerId?: StickerId) => void;
  reactToGroupMessage: (
    id: string,
    messageId: string,
    reaction: string,
  ) => void;
  extendGroup: (id: string) => void;
  leaveGroup: (id: string) => void;
  voteForGroup: (id: string) => void;
  noteLikes: Record<string, string>;
  toggleNoteLike: (authorId: string, note: string) => void;
  ownNoteAt: string | null;
  cardGame: CardGame | null;
  cardScores: Record<string, number>;
  startCardGame: () => void;
  playCard: (action: "hit" | "stand") => void;

  startDirect: (id: string) => void;
  directMessages: Record<string, DirectMessage[]>;
  ownNote: string;
  setOwnNote: (text: string) => void;
  sendDirect: (id: string, body: string, stickerId?: StickerId) => void;
  me: Profile;
  posts: Post[];
  deletedPostIds: string[];
  deletePost: (id: string) => boolean;
  liked: string[];
  saved: string[];
  staffSaved: string[];
  joined: string[];
  comments: Comment[];
  chatMessages: ChatMessage[];
  chatDrafts: Record<string, string>;
  sendMessage: (
    communityId: string,
    body: string,
    stickerId?: StickerId,
  ) => boolean;
  setChatDraft: (communityId: string, body: string) => void;
  actions: Record<string, MatchingAction>;
  incomingInterests: string[];
  setDemoIncomingInterest: (id: string, interested: boolean) => void;
  blocked: string[];
  reported: string[];
  applications: string[];
  completedTasks: string[];
  notificationsRead: boolean;
  toast: string | null;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleJoin: (id: string) => void;
  addPost: (post: Post) => void;
  addComment: (postId: string, body: string) => void;
  customInterests: Interest[];
  addCustomInterest: (tag: Interest) => void;
  teacherProfile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;
  match: (id: string, action: MatchingAction) => void;
  resetMatches: () => void;
  block: (id: string) => void;
  report: (id: string) => void;
  apply: (id: string) => void;
  toggleTask: (id: string) => void;
  readNotifications: () => void;
  notify: (text: string | null) => void;
  reset: () => void;
}
const toggle = (items: string[], id: string) =>
  items.includes(id) ? items.filter((x) => x !== id) : [...items, id];
const defaults = () => ({
  communities: initialCommunities,
  reposted: [] as string[],
  groups: [] as GroupChat[],
  teacherProfile: staffProfile,
  customInterests: [] as Interest[],
  friends: ["mio", "haruka", "yuto"],
  sentRequests: [],
  receivedRequests: [],
  socialEvents: [],
  unreadMatches: [],
  role: "student" as const,
  homework: [
    {
      id: "homework-english",
      title: "英語：教科書 p.24〜25",
      body: "本文を音読し、ワークシートの問1〜3に答えてください。",
      teacher: staffProfile.name,
      due: "2026-11-12",
      createdAt: "2026-11-10T00:00:00Z",
    },
  ],
  homeworkSeen: {},
  swipeUsage: {},
  instants: [],
  viewedInstants: [],
  ownNoteAt: null,
  noteLikes: {} as Record<string, string>,
  cardGame: null,
  cardScores: {},
  directMessages: {},
  ownNote: "",
  me: initialProfile,
  posts: initialPosts,
  deletedPostIds: [] as string[],
  liked: [],
  saved: [],
  staffSaved: [],
  joined: ["art", "code"],
  comments: [],
  chatMessages: initialChatMessages,
  chatDrafts: {},
  actions: {},
  incomingInterests: ["ren", "hina", "itsuki", "mei"],
  blocked: [],
  reported: [],
  applications: [],
  completedTasks: [],
  notificationsRead: false,
  toast: null,
});
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaults(),
      saveCommunity: (value) =>
        set((s) => ({
          communities: [
            ...s.communities.filter((c) => c.id !== value.id),
            value,
          ],
          joined: [...new Set([...s.joined, value.id])],
        })),
      updateGroup: (id, patch) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id && g.ownerId === s.me.id
              ? {
                  ...g,
                  ...patch,
                  members: [...new Set([s.me.id, ...patch.members])],
                }
              : g,
          ),
        })),
      toggleRepost: (id) => set((s) => ({ reposted: toggle(s.reposted, id) })),
      createGroup: (name, members) => {
        const s = get();
        const eligible = [...new Set(members)].filter(
          (id) => s.friends.includes(id) && !s.blocked.includes(id),
        );
        if (s.role !== "student" || eligible.length < 2 || !name.trim()) return;
        const id = `group-${Date.now()}`;
        set({
          groups: [
            {
              id,
              ownerId: s.me.id,
              name: name.trim().slice(0, 40),
              members: [s.me.id, ...eligible],
              messages: [],
            },
            ...s.groups,
          ],
        });
        return id;
      },
      createQuickGroup: (topic) => {
        const s = get();
        if (s.role !== "student") return;
        const current = s.groups.find(
          (group) =>
            group.trial &&
            group.ownerId === s.me.id &&
            !group.members.some((id) => s.blocked.includes(id)),
        );
        if (current) return current.id;
        const people = demoQuickMembers(s.me, profiles, s.blocked, topic);
        if (people.length < 2) return;
        const id = `quick-${Date.now()}`;
        set({
          groups: [
            {
              id,
              ownerId: s.me.id,
              name: `クイックマッチ · ${topic}`,
              members: [s.me.id, ...people.map((person) => person.id)],
              messages: [
                {
                  id: `${id}-hello`,
                  authorId: people[0].id,
                  body: "よろしく！まずはお題から話してみよう 🙌",
                  createdAt: new Date().toISOString(),
                },
              ],
              trial: {
                topic,
                endsAt: Date.now() + trialDuration,
                // Sample participants agree in advance so the local flow can be tried.
                votes: people.map((person) => person.id),
              },
            },
            ...s.groups,
          ],
        });
        return id;
      },
      sendGroupMessage: (id, body, stickerId) => {
        const content = stickerId ? stickerCaption(stickerId) : body;
        const trimmed = content.trim();
        if (!trimmed || trimmed.length > 1000) return;
        set((s) => ({
          groups: s.groups.map((group) =>
            group.id === id &&
            group.ownerId === s.me.id &&
            s.role === "student" &&
            (!group.trial || group.trial.endsAt > Date.now())
              ? {
                  ...group,
                  messages: [
                    ...group.messages,
                    {
                      id: `${Date.now()}-${group.messages.length}`,
                      authorId: s.me.id,
                      body: trimmed,
                      stickerId,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : group,
          ),
        }));
      },
      reactToGroupMessage: (id, messageId, reaction) =>
        set((s) => ({
          groups: s.groups.map((group) =>
            group.id === id &&
            group.ownerId === s.me.id &&
            s.role === "student" &&
            (!group.trial || group.trial.endsAt > Date.now())
              ? {
                  ...group,
                  messages: group.messages.map((message) =>
                    message.id === messageId &&
                    !s.blocked.includes(message.authorId)
                      ? {
                          ...message,
                          reaction:
                            message.reaction === reaction
                              ? undefined
                              : reaction,
                        }
                      : message,
                  ),
                }
              : group,
          ),
        })),
      extendGroup: (id) =>
        set((s) => ({
          groups: s.groups.map((group) =>
            s.role === "student" &&
            group.id === id &&
            group.trial &&
            !group.trial.extended &&
            group.trial.endsAt > Date.now()
              ? {
                  ...group,
                  trial: {
                    ...group.trial,
                    endsAt: group.trial.endsAt + trialDuration,
                    extended: true,
                  },
                }
              : group,
          ),
        })),
      leaveGroup: (id) =>
        set((s) => ({
          groups:
            s.role === "student"
              ? s.groups.filter((group) => group.id !== id)
              : s.groups,
        })),
      voteForGroup: (id) =>
        set((s) => {
          const group = s.groups.find(
            (item) => item.id === id && item.ownerId === s.me.id,
          );
          if (
            s.role !== "student" ||
            !group?.trial ||
            group.trial.endsAt > Date.now() ||
            group.members.some((member) => s.blocked.includes(member))
          )
            return s;
          const votes = [...new Set([...group.trial.votes, s.me.id])];
          if (!group.members.every((member) => votes.includes(member)))
            return s;
          return {
            friends: [
              ...new Set([
                ...s.friends,
                ...group.members.filter((member) => member !== s.me.id),
              ]),
            ],
            groups: s.groups.map((item) =>
              item.id === id
                ? {
                    ...item,
                    name: `いつメン · ${group.trial?.topic}`,
                    trial: undefined,
                  }
                : item,
            ),
          };
        }),
      toggleNoteLike: (authorId, note) =>
        set((s) => {
          const key = `${s.role}:${authorId}`;
          const noteLikes = { ...s.noteLikes };
          if (noteLikes[key] === note) delete noteLikes[key];
          else noteLikes[key] = note;
          return { noteLikes };
        }),
      sendFriendRequest: (id) => {
        const s = get();
        if (s.blocked.includes(id) || !profiles.some((p) => p.id === id))
          return;
        set({
          ...requestFriend(s, id),
          toast: s.friends.includes(id) ? "友達です" : "友達申請を送信しました",
        });
      },
      acceptFriendRequest: (id) => {
        const s = get();
        if (s.blocked.includes(id)) return;
        set({
          ...acceptFriend(s, id),
          toast: "友達になりました。チャットに追加しました。",
        });
      },
      declineFriendRequest: (id) =>
        set((s) => ({
          receivedRequests: s.receivedRequests.filter((x) => x !== id),
        })),
      simulateFriendRequest: (id) =>
        set((s) =>
          s.friends.includes(id) ||
          s.receivedRequests.includes(id) ||
          s.blocked.includes(id) ||
          id === "me"
            ? {}
            : {
                receivedRequests: [...s.receivedRequests, id],
                socialEvents: [socialEvent("request", id), ...s.socialEvents],
              },
        ),
      simulateAcceptance: (id) =>
        set((s) =>
          !s.sentRequests.includes(id) || s.blocked.includes(id)
            ? {}
            : {
                friends: [...new Set([...s.friends, id])],
                sentRequests: s.sentRequests.filter((x) => x !== id),
                socialEvents: [socialEvent("accepted", id), ...s.socialEvents],
                toast: "申請が承認されました。チャットに追加しました。",
              },
        ),
      simulateReaction: () =>
        set((s) => {
          const post = s.posts.find((p) => p.authorId === "me" && !p.anonymous);
          if (!post) return { toast: "まず投稿を作成してください" };
          if (
            s.socialEvents.some(
              (e) => e.type === "reaction" && e.postId === post.id,
            )
          )
            return {};
          return {
            posts: s.posts.map((p) =>
              p.id === post.id ? { ...p, likes: p.likes + 1 } : p,
            ),
            socialEvents: [
              socialEvent("reaction", "haruka", post.id),
              ...s.socialEvents,
            ],
          };
        }),
      readSocial: () =>
        set((s) => ({
          socialEvents: s.socialEvents.map((e) => ({ ...e, read: true })),
        })),
      readMatches: () => set({ unreadMatches: [] }),
      setDemoRole: (role) => set({ role }),
      publishHomework: (title, body, due) => {
        if (
          get().role !== "teacher" ||
          !title.trim() ||
          !body.trim() ||
          !/^\d{4}-\d{2}-\d{2}$/.test(due) ||
          Number.isNaN(Date.parse(due)) ||
          new Date(due).toISOString().slice(0, 10) !== due
        )
          return false;
        set((s) => ({
          homework: [
            {
              id: `hw-${Date.now()}`,
              title: title.trim(),
              body: body.trim(),
              due,
              teacher: staffProfile.name,
              createdAt: new Date().toISOString(),
            },
            ...s.homework,
          ],
          notificationsRead: false,
          toast: "宿題通知を追加しました",
        }));
        return true;
      },
      acknowledgeHomework: (id) => {
        if (get().role === "student" && get().homework.some((h) => h.id === id))
          set((s) => ({
            homeworkSeen: { ...s.homeworkSeen, [id]: new Date().toISOString() },
            toast: "ミマシタヨ！を送信しました",
          }));
      },
      receiveDemoInstant: () =>
        set((s) => ({
          instants: [
            {
              id: `demo-instant-${Date.now()}`,
              authorId: "haruka",
              uri: profiles.find((p) => p.id === "haruka")!.avatar,
              createdAt: new Date().toISOString(),
            },
            ...s.instants,
          ],
        })),
      publishInstant: (uri, caption) => {
        if (!uri || !get().friends.length) return;
        set((s) => ({
          instants: [
            {
              id: `instant-${Date.now()}`,
              authorId: "me",
              uri,
              caption: caption?.trim().slice(0, 80),
              audience: "friends" as const,
              recipientIds: s.friends.filter((id) => !s.blocked.includes(id)),
              createdAt: new Date().toISOString(),
            },
            ...s.instants,
          ],
          toast: "インスタントを公開しました",
        }));
      },
      viewInstant: (id) =>
        set((s) => ({
          viewedInstants: [...new Set([...s.viewedInstants, id])],
        })),
      startCardGame: () => {
        if (!CARDS_ENABLED) return;

        if (get().role === "student" && !hasPostedToday(get().posts)) {
          set({ toast: "今日の投稿でトランプが開きます" });
          return;
        }
        if (get().cardGame?.status === "playing") return;
        set({ cardGame: newGame() });
      },
      playCard: (action) => {
        if (!CARDS_ENABLED) return;

        const s = get();
        if (
          !s.cardGame ||
          s.cardGame.status !== "playing" ||
          (s.role === "student" && !hasPostedToday(s.posts))
        )
          return;
        const cardGame = action === "hit" ? hit(s.cardGame) : stand(s.cardGame);
        set({
          cardGame,
          ...(cardGame.status !== "playing"
            ? {
                cardScores: {
                  ...s.cardScores,
                  [dayKey()]:
                    (s.cardScores[dayKey()] ?? 0) + gamePoints(cardGame),
                },
              }
            : {}),
        });
      },
      setChatDraft: (communityId, body) =>
        set((s) => ({
          chatDrafts: { ...s.chatDrafts, [communityId]: body.slice(0, 1000) },
        })),
      sendMessage: (communityId, body, stickerId) => {
        const content = stickerId ? stickerCaption(stickerId) : body;
        const text = validatedMessage(
          communityId,
          content,
          get().joined,
          get().communities,
        );
        if (text === null) return false;
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              communityId,
              authorId: "me",
              body: text,
              stickerId,
              createdAt: new Date().toISOString(),
            },
          ],
          chatDrafts: stickerId
            ? s.chatDrafts
            : { ...s.chatDrafts, [communityId]: "" },
        }));
        return true;
      },
      setOwnNote: (text) =>
        set({
          ownNote: text.trim().slice(0, 60),
          ownNoteAt: new Date().toISOString(),
        }),
      startDirect: (id) =>
        set((s) =>
          s.friends.includes(id) &&
          !s.blocked.includes(id) &&
          !s.directMessages[id]
            ? { directMessages: { ...s.directMessages, [id]: [] } }
            : {},
        ),
      sendDirect: (id, body, stickerId) => {
        const content = stickerId ? stickerCaption(stickerId) : body;
        if (
          !get().friends.includes(id) ||
          !content.trim() ||
          get().blocked.includes(id)
        )
          return;
        const createdAt = new Date();
        set((s) => ({
          directMessages: {
            ...s.directMessages,
            [id]: [
              ...(s.directMessages[id] ?? []),
              {
                body: content.trim().slice(0, 1000),
                stickerId,
                createdAt: createdAt.toISOString(),
                time: createdAt.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ],
          },
        }));
      },
      toggleLike: (id) => set((s) => ({ liked: toggle(s.liked, id) })),
      toggleSave: (id) =>
        set((s) => {
          const key = s.role === "teacher" ? "staffSaved" : "saved";
          return {
            [key]: toggle(s[key], id),
            toast: s[key].includes(id)
              ? "保存を解除しました"
              : "投稿を保存しました",
          };
        }),
      toggleJoin: (id) =>
        set((s) => ({
          joined: toggle(s.joined, id),
          toast: s.joined.includes(id)
            ? "コミュニティを退出しました"
            : "コミュニティに参加しました！",
        })),
      addPost: (post) => {
        const staff = get().role === "teacher";
        if (post.kind === "school" && !staff) return;
        post = { ...post, authorId: staff ? staffProfile.id : "me" };
        if (staff)
          post = {
            ...post,
            anonymous: false,
            secret: false,
            audience: "school",
          };
        if (
          post.anonymous &&
          !anonymousAllowed([post.body, ...post.tags].join(" "))
        )
          return;
        set((s) => ({
          posts: [{ ...post, createdAt: new Date().toISOString() }, ...s.posts],
          notificationsRead:
            post.kind === "school" ? false : s.notificationsRead,
          toast: "投稿を公開しました！",
        }));
      },
      deletePost: (id) => {
        const state = get();
        const viewerId =
          state.role === "teacher" ? state.teacherProfile.id : state.me.id;
        const next = deleteOwnedPost(state, id, viewerId);
        if (!next) return false;
        set({ ...next, toast: "投稿を削除しました" });
        return true;
      },
      addComment: (postId, body) => {
        if (
          get().posts.find((p) => p.id === postId)?.anonymous &&
          !anonymousAllowed(body)
        ) {
          set({ toast: "相手を傷つける表現は投稿できません" });
          return;
        }
        set((s) => ({
          comments: [
            ...s.comments,
            {
              id: Date.now().toString(),
              postId,
              authorId: s.role === "teacher" ? staffProfile.id : "me",
              body: body.trim(),
            },
          ],
        }));
      },
      addCustomInterest: (tag) =>
        set((s) => ({ customInterests: [...s.customInterests, tag] })),
      updateProfile: (patch) =>
        set((s) => ({
          ...(s.role === "teacher"
            ? { teacherProfile: { ...s.teacherProfile, ...patch } }
            : { me: { ...s.me, ...patch } }),
          toast: "プロフィールを更新しました",
        })),
      match: (id, action) =>
        set((s) => {
          if (
            id === "me" ||
            s.blocked.includes(id) ||
            s.friends.includes(id) ||
            !profiles.some((p) => p.id === id && !p.role) ||
            s.role === "teacher"
          )
            return {};
          const actions = { ...s.actions, [id]: action };
          const newlyMatched =
            isMutualInterest(id, actions, s.incomingInterests, s.blocked) &&
            !isMutualInterest(id, s.actions, s.incomingInterests, s.blocked);
          return {
            ...(action === "interested" ? requestFriend(s, id) : {}),
            ...(newlyMatched ? matchedSocial(s, id) : {}),
            ...(!isMutualInterest(id, actions, s.incomingInterests, s.blocked)
              ? { unreadMatches: s.unreadMatches.filter((x) => x !== id) }
              : {}),
            actions,

            toast: newlyMatched
              ? "マッチしました！「マッチした相手」で確認できます。"
              : action === "interested"
                ? "気になる相手に保存しました。相手も気になるにするとマッチします。"
                : null,
          };
        }),
      setDemoIncomingInterest: (id, interested) =>
        set((s) => {
          if (
            id === "me" ||
            s.blocked.includes(id) ||
            !profiles.some((p) => p.id === id)
          )
            return {};
          const incomingInterests = interested
            ? [...new Set([...s.incomingInterests, id])]
            : s.incomingInterests.filter((x) => x !== id);
          const newlyMatched =
            isMutualInterest(id, s.actions, incomingInterests, s.blocked) &&
            !isMutualInterest(id, s.actions, s.incomingInterests, s.blocked);
          return {
            ...(newlyMatched ? matchedSocial(s, id) : {}),
            ...(!isMutualInterest(id, s.actions, incomingInterests, s.blocked)
              ? { unreadMatches: s.unreadMatches.filter((x) => x !== id) }
              : {}),
            incomingInterests,
            toast: newlyMatched
              ? "マッチしました！「マッチした相手」で確認できます。"
              : "相手側の反応を更新しました",
          };
        }),
      resetMatches: () =>
        set((s) => ({
          actions: Object.fromEntries(
            Object.entries(s.actions).filter(([, a]) => a === "interested"),
          ),
          toast: "スキップした候補をもう一度表示します",
        })),
      block: (id) =>
        set((s) => ({
          blocked: [...s.blocked, id],
          toast: "このユーザーを非表示にしました",
        })),
      report: (id) =>
        set((s) => ({
          reported: [...s.reported, id],
          toast: "通報内容を端末に記録しました",
        })),
      apply: (id) =>
        set((s) => ({
          applications: toggle(s.applications, id),
          toast: s.applications.includes(id)
            ? "参加希望を取り消しました"
            : "参加希望を保存しました",
        })),
      toggleTask: (id) =>
        set((s) => ({ completedTasks: toggle(s.completedTasks, id) })),
      readNotifications: () => set({ notificationsRead: true }),
      notify: (toast) => set({ toast }),
      reset: () => set((s) => ({ ...defaults(), role: s.role })),
    }),
    {
      name: "homies-demo-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ toast, ...state }) => state,
      skipHydration: true,
      merge: (persisted, state) => {
        const current: AppState = { ...state, ...defaults() };
        const old = persisted as Partial<AppState> | undefined;
        const next = { ...current, ...old };
        if (old?.me && old.me.banner === undefined) {
          next.me = { ...old.me, banner: current.me.banner };
        }
        if (old?.posts) {
          const existing = new Set(old.posts.map((post) => post.id));
          next.posts = [
            ...old.posts.map((post) =>
              post.authorId === "school" && post.id === "notice"
                ? { ...post, authorId: staffProfile.id }
                : post,
            ),
            ...current.posts.filter((post) => !existing.has(post.id)),
          ];
        }
        next.posts = withoutDeletedPosts(next.posts, next.deletedPostIds);
        const mutual = Object.keys(next.actions).filter((id) =>
          isMutualInterest(
            id,
            next.actions,
            next.incomingInterests,
            next.blocked,
          ),
        );
        if (
          old?.incomingInterests &&
          !old.posts?.some((p) => p.id === "sample-1")
        )
          next.incomingInterests = [
            ...new Set([
              ...next.incomingInterests,
              ...current.incomingInterests,
            ]),
          ];
        if (!old?.friends)
          next.friends = [...new Set([...next.friends, ...mutual])];
        if (!old?.sentRequests)
          next.sentRequests = Object.keys(next.actions).filter(
            (id) =>
              next.actions[id] === "interested" &&
              !next.friends.includes(id) &&
              !next.blocked.includes(id),
          );
        if (!old?.unreadMatches) next.unreadMatches = mutual;
        return next;
      },
    },
  ),
);
