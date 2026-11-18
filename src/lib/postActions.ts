import type { Comment, Post } from "../data/types";

type PostState = {
  posts: Post[];
  deletedPostIds: string[];
  comments: Comment[];
  liked: string[];
  saved: string[];
  staffSaved: string[];
  applications: string[];
};

export function withoutDeletedPosts(posts: Post[], deletedPostIds: string[]) {
  const deleted = new Set(deletedPostIds);
  return posts.filter((post) => !deleted.has(post.id));
}

export function deleteOwnedPost(
  state: PostState,
  postId: string,
  viewerId: string,
): PostState | undefined {
  const post = state.posts.find((item) => item.id === postId);
  if (!post || post.authorId !== viewerId) return;
  return {
    posts: state.posts.filter((item) => item.id !== postId),
    // Remember removed sample posts so hydration cannot add them back.
    deletedPostIds: [...new Set([...state.deletedPostIds, postId])],
    comments: state.comments.filter((comment) => comment.postId !== postId),
    liked: state.liked.filter((id) => id !== postId),
    saved: state.saved.filter((id) => id !== postId),
    staffSaved: state.staffSaved.filter((id) => id !== postId),
    applications: state.applications.filter((id) => id !== postId),
  };
}
