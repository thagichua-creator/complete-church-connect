import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({ eventId: z.string().uuid(), membershipNo: z.string().trim().min(3).max(40), attendanceStatus: z.enum(["present", "absent", "excused"]) });
export type InputType = z.infer<typeof schema>;
export type OutputType = { ok: true } | { error: string };
export async function markEventAttendance(body: InputType): Promise<OutputType> {
  const response = await fetch("/_api/event_attendance", { method: "POST", body: superjson.stringify(schema.parse(body)), headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not record attendance.");
  return result;
}
