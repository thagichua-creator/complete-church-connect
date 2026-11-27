import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(500).optional() });
export type InputType = z.infer<typeof schema>;
export type OutputType = { ministry: { id: string; name: string; description: string | null; isActive: boolean } } | { error: string };
export async function postMinistry(body: InputType): Promise<OutputType> {
  const response = await fetch("/_api/ministries", { method: "POST", body: superjson.stringify(schema.parse(body)), headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not create ministry.");
  return result;
}
