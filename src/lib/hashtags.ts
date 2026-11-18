export const hashtagPattern = /([#＃][^\s#＃]+)/g;

export function extractHashtags(text: string) {
  return Array.from(text.matchAll(hashtagPattern), ([tag]) => tag.slice(1));
}
