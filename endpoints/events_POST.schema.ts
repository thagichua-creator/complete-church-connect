import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({ title: z.string().trim().min(2).max(150), description: z.string().trim().max(1000).optional(), startsAt: z.string().datetime(), endsAt: z.string().datetime().optional(), location: z.string().trim().max(200).optional() });
export type InputType = z.infer<typeof schema>;
export type OutputType = { event: { id: string; title: string; description: string | null; startsAt: Date; endsAt: Date | null; location: string | null; eventStatus: string; presentCount: number } } | { error: string };
export async function postEvent(body: InputType): Promise<OutputType> {
  const response = await fetch("/_api/events", { method: "POST", body: superjson.stringify(schema.parse(body)), headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not create event.");
  return result;
}
