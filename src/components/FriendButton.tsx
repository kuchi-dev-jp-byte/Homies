import { router } from "expo-router";
import { Button } from "./ui";
import { useAppStore } from "../store/useAppStore";
export function FriendButton({ id }: { id: string }) {
  const friends = useAppStore((s) => s.friends),
    sent = useAppStore((s) => s.sentRequests),
    received = useAppStore((s) => s.receivedRequests),
    request = useAppStore((s) => s.sendFriendRequest),
    accept = useAppStore((s) => s.acceptFriendRequest);
  const startDirect = useAppStore((s) => s.startDirect);
  return friends.includes(id) ? (
    <Button
      onPress={() => {
        startDirect(id);
        router.push(`/chat/${id}`);
      }}
    >
      チャット
    </Button>
  ) : received.includes(id) ? (
    <Button onPress={() => accept(id)}>友達申請を承認</Button>
  ) : (
    <Button secondary disabled={sent.includes(id)} onPress={() => request(id)}>
      {sent.includes(id) ? "友達申請済み" : "友達申請"}
    </Button>
  );
}
