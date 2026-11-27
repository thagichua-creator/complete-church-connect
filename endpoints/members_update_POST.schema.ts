import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  membershipNo: z.string().trim().min(1).max(40),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  residentialArea: z.string().trim().max(120).optional(),
  membershipStatus: z.enum(["active", "pending", "inactive"]),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { member: { membershipNo: string; firstName: string; lastName: string; membershipStatus: string } } | { error: string };
export async function updateMember(body: InputType): Promise<OutputType> {
  const response = await fetch("/_api/members_update", { method: "POST", body: superjson.stringify(schema.parse(body)), headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not update member.");
  return result;
}
