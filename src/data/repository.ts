import { communities, profiles } from "./mock";
import { Community, Profile } from "./types";
/** Replace this boundary with a school-scoped Supabase repository after verification is implemented. */
export interface DiscoveryRepository {
  getProfiles(): Promise<Profile[]>;
  getCommunities(): Promise<Community[]>;
}
export const repository: DiscoveryRepository = {
  getProfiles: async () => profiles.filter((p) => p.id !== "me"),
  getCommunities: async () => communities,
};
