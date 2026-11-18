import { z } from "zod";
import { communities } from "../data/mock";
import { ChatMessage } from "../data/types";
const messageSchema = z.string().trim().min(1).max(1000);
export function validatedMessage(
  communityId: string,
  body: string,
  joined: string[],
  available = communities,
): string | null {
  if (
    !joined.includes(communityId) ||
    !available.some((c) => c.id === communityId)
  )
    return null;
  const result = messageSchema.safeParse(body);
  return result.success ? result.data : null;
}
export function roomMessages(
  messages: ChatMessage[],
  communityId: string,
  blocked: string[],
) {
  return messages.filter(
    (m) => m.communityId === communityId && !blocked.includes(m.authorId),
  );
}
export function messageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function messageDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
  });
}
