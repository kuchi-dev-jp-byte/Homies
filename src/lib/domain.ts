import { z } from "zod";
import { Post, Profile } from "../data/types";
export function compatibility(a: Profile, b: Profile) {
  const common = b.interests.filter((t) =>
    a.interests.some((m) => m.label === t.label),
  );
  return {
    common,
    score: Math.min(98, 64 + common.length * 7 + (a.grade === b.grade ? 3 : 0)),
  };
}
export function visibleTo(post: Post, viewer: Profile, author?: Profile) {
  if (post.audience === "school" || post.authorId === viewer.id) return true;
  if (!author || author.grade !== viewer.grade) return false;
  return post.audience === "grade" || author.classroom === viewer.classroom;
}
export const postSchema = z
  .object({
    kind: z.enum(["board", "student"]),
    title: z.string().max(80, "タイトルは80文字以内です"),
    body: z
      .string()
      .trim()
      .min(1, "本文を入力してください")
      .max(2000, "本文は2000文字以内です"),
    category: z.string().min(1),
    audience: z.enum(["school", "grade", "class"]),
    capacity: z.number().int().min(1).max(100).optional(),
    deadline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "board" && !data.title.trim())
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "掲示板のタイトルを入力してください",
      });
    if (
      data.deadline &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(data.deadline) ||
        Number.isNaN(Date.parse(data.deadline)) ||
        new Date(data.deadline).toISOString().slice(0, 10) !== data.deadline)
    )
      ctx.addIssue({
        code: "custom",
        path: ["deadline"],
        message: "締切は実在する日付（YYYY-MM-DD）で入力してください",
      });
  });
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(20, "名前は20文字以内です"),
  bio: z.string().max(250, "自己紹介は250文字以内です"),
  skills: z.string().max(100),
  wishes: z.string().max(100),
});
