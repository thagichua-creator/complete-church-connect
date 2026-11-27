import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({ membershipNo: z.string().trim().min(1).max(40) });
export type InputType = z.infer<typeof schema>;
export type OutputType = { member: { membershipNo: string; firstName: string; lastName: string } } | { error: string };
export async function archiveMember(body: InputType): Promise<OutputType> {
  const response = await fetch("/_api/members_archive", { method: "POST", body: superjson.stringify(schema.parse(body)), headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not archive member.");
  return result;
}
