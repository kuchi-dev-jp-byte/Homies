import { useQuery } from "@tanstack/react-query";
import { repository } from "../data/repository";
import { profiles } from "../data/mock";
import { useAppStore } from "../store/useAppStore";
import { visibleTo } from "./domain";
export const useProfiles = () =>
  useQuery({
    queryKey: ["profiles"],
    queryFn: repository.getProfiles,
    staleTime: Infinity,
  });
export const useCommunities = () =>
  useQuery({
    queryKey: ["communities"],
    queryFn: repository.getCommunities,
    staleTime: Infinity,
  });
export function useCurrentProfile() {
  return useAppStore((s) => (s.role === "teacher" ? s.teacherProfile : s.me));
}

export function useVisiblePosts() {
  const posts = useAppStore((s) => s.posts),
    me = useCurrentProfile(),
    blocked = useAppStore((s) => s.blocked),
    friends = useAppStore((s) => s.friends);
  return posts.filter(
    (p) =>
      !blocked.includes(p.authorId) &&
      (!p.secret ||
        p.authorId === me.id ||
        (!me.role && friends.includes(p.authorId))) &&
      visibleTo(
        p,
        me,
        profiles.find((a) => a.id === p.authorId),
      ),
  );
}
