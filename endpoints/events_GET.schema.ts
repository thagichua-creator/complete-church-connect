import superjson from "superjson";
export type EventItem = { id: string; title: string; description: string | null; startsAt: Date; endsAt: Date | null; location: string | null; eventStatus: string; presentCount: number };
export type OutputType = { events: EventItem[] } | { error: string };
export async function getEvents(): Promise<OutputType> {
  const response = await fetch("/_api/events", { method: "GET", headers: { "Content-Type": "application/json" } });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not load events.");
  return result;
}
