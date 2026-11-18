import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Check, Circle } from "lucide-react-native";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  Empty,
  styles,
} from "../src/components/ui";
import { Field } from "../src/components/forms";
import { profiles } from "../src/data/mock";
import { useAppStore } from "../src/store/useAppStore";

export default function CreateGroup() {
  const friends = useAppStore((s) => s.friends);
  const blocked = useAppStore((s) => s.blocked);
  const create = useAppStore((s) => s.createGroup);
  const role = useAppStore((s) => s.role);
  const [icon, setIcon] = useState("👥");
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const people = profiles.filter(
    (person) => friends.includes(person.id) && !blocked.includes(person.id),
  );
  const eligible = members.filter((id) =>
    people.some((person) => person.id === id),
  );
  return (
    <DetailScreen title="グループを作成">
      {role !== "student" || people.length < 2 ? (
        <Empty
          title="グループを作成できません"
          body="生徒アカウントで友達を2人以上選ぶと作成できます。"
        />
      ) : (
        <>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {["👥", "🐶", "🎮", "🎵", "📚", "🌟", "💙"].map((e) => (
              <Pressable
                key={e}
                accessibilityRole="button"
                onPress={() => setIcon(e)}
                style={{
                  padding: 12,
                  borderRadius: 15,
                  backgroundColor: icon === e ? C.lime : C.surface,
                }}
              >
                <Text style={{ fontSize: 28 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="グループ名"
            value={name}
            onChange={setName}
            maxLength={40}
          />
          <Text style={[styles.text, { marginBottom: 8 }]}>
            友達を2人以上選択
          </Text>
          {people.map((person) => {
            const active = eligible.includes(person.id);
            return (
              <Pressable
                key={person.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                onPress={() =>
                  setMembers(
                    active
                      ? members.filter((id) => id !== person.id)
                      : [...members, person.id],
                  )
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: C.line,
                }}
              >
                <Avatar uri={person.avatar} size={42} />
                <Text style={[styles.text, { flex: 1 }]}>{person.name}</Text>
                {active ? (
                  <Check size={20} color={C.accent} />
                ) : (
                  <Circle size={20} color={C.muted} />
                )}
              </Pressable>
            );
          })}
          <View style={{ marginTop: 20 }}>
            <Button
              disabled={!name.trim() || eligible.length < 2}
              onPress={() => {
                const id = create(name, eligible);
                if (id) {
                  useAppStore
                    .getState()
                    .updateGroup(id, { name, icon, members: eligible });
                  router.replace(`/group-chat/${id}`);
                }
              }}
            >
              作成する（{eligible.length}人を選択）
            </Button>
          </View>
        </>
      )}
    </DetailScreen>
  );
}
