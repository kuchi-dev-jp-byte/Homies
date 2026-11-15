export type ActivityEvent = {
  id: string;
  type: "match" | "request" | "accepted" | "reaction";
  actorId: string;
  postId?: string;
  createdAt: string;
  read: boolean;
};
export type SocialState = {
  friends: string[];
  sentRequests: string[];
  receivedRequests: string[];
  socialEvents: ActivityEvent[];
  unreadMatches: string[];
};
export function socialEvent(
  type: ActivityEvent["type"],
  actorId: string,
  postId?: string,
): ActivityEvent {
  return {
    id: `${type}-${actorId}-${postId ?? ""}-${Date.now()}-${Math.random()}`,
    type,
    actorId,
    postId,
    createdAt: new Date().toISOString(),
    read: false,
  };
}
export function requestFriend(
  s: SocialState,
  id: string,
): Partial<SocialState> {
  if (id === "me" || s.friends.includes(id) || s.sentRequests.includes(id))
    return {};
  if (s.receivedRequests.includes(id)) return acceptFriend(s, id);
  return { sentRequests: [...s.sentRequests, id] };
}
export function acceptFriend(s: SocialState, id: string): Partial<SocialState> {
  if (!s.receivedRequests.includes(id)) return {};
  return {
    friends: [...new Set([...s.friends, id])],
    sentRequests: s.sentRequests.filter((x) => x !== id),
    receivedRequests: s.receivedRequests.filter((x) => x !== id),
    socialEvents: [socialEvent("accepted", id), ...s.socialEvents],
  };
}
export function matchedSocial(
  s: SocialState,
  id: string,
): Partial<SocialState> {
  return {
    friends: [...new Set([...s.friends, id])],
    sentRequests: s.sentRequests.filter((x) => x !== id),
    receivedRequests: s.receivedRequests.filter((x) => x !== id),
    unreadMatches: [...new Set([...s.unreadMatches, id])],
    socialEvents: [socialEvent("match", id), ...s.socialEvents],
  };
}
