import type { StickerId } from "./stickers";
export type InterestKind =
  "game" | "music" | "art" | "study" | "club" | "other";
export type Interest = { label: string; kind: InterestKind };
export type Profile = {
  id: string;
  name: string;
  role?: "teacher";
  grade: number;
  classroom: number;
  avatar: string;
  banner?: string | null;
  gender?: "male" | "female" | "unspecified";
  bio: string;
  interests: Interest[];
  skills: string;
  wishes: string;
  club: string;
  online: boolean;
};
export type PostKind = "school" | "board" | "student";
export type Post = {
  quoteId?: string;
  id: string;
  authorId: string;
  createdAt?: string;
  anonymous?: boolean;
  secret?: boolean;
  kind: PostKind;
  category: string;
  title: string;
  body: string;
  image?: string;
  tags: string[];
  time: string;
  audience: "school" | "grade" | "class";
  likes: number;
  commentCount: number;
  capacity?: number;
  deadline?: string;
  communityId?: string;
};
export type Community = {
  ownerId?: string;
  id: string;
  name: string;
  category: string;
  emoji: string;
  color: string;
  description: string;
  count: number;
  memberIds: string[];
};
export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
};
export type MatchingAction = "interested" | "skipped";

export type ChatMessage = {
  stickerId?: StickerId;
  id: string;
  communityId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type Homework = {
  id: string;
  title: string;
  body: string;
  teacher: string;
  due: string;
  createdAt: string;
};
export type Instant = {
  caption?: string;
  audience?: "friends";
  recipientIds?: string[];
  id: string;
  authorId: string;
  uri: string;
  createdAt: string;
};

export type DirectMessage = {
  stickerId?: StickerId;
  body: string;
  time: string;
  authorId?: string;
  createdAt?: string;
};
