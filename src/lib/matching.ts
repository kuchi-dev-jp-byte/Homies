import { MatchingAction, Profile } from "../data/types";
export function isMutualInterest(
  id: string,
  actions: Record<string, MatchingAction>,
  incoming: string[],
  blocked: string[],
) {
  return (
    id !== "me" &&
    !blocked.includes(id) &&
    actions[id] === "interested" &&
    incoming.includes(id)
  );
}
export function matchedProfiles(
  people: Profile[],
  actions: Record<string, MatchingAction>,
  incoming: string[],
  blocked: string[],
) {
  return people.filter((p) =>
    isMutualInterest(p.id, actions, incoming, blocked),
  );
}
