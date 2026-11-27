import superjson from "superjson";
export type MinistryItem = { id: string; name: string; description: string | null; isActive: boolean; leaderFirstName: string | null; leaderLastName: string | null; memberCount: number };
export type OutputType = { ministries: MinistryItem[] } | { error: string };
export async function getMinistries(): Promise<OutputType> {
  const response = await fetch("/_api/ministries", { method: "GET", headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not load ministries.");
  return result;
}
