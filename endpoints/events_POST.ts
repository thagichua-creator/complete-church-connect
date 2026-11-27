import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  location: z.string().trim().max(200).optional(),
});
const CREATE_ROLES = ["super_admin", "church_admin", "pastor"] as const;
export async function handle(request: Request) {
  try {
    const { user, access } = await requireChurchAccess(request, [...CREATE_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const input = schema.parse(superjson.parse(await request.text()));
    if (input.endsAt && new Date(input.endsAt) <= new Date(input.startsAt)) return new Response(superjson.stringify({ error: "Event end time must be after its start time." }), { status: 400 });
    const event = await db.transaction().execute(async trx => {
      const created = await trx.insertInto("churchEvents").values({
        branchId: access.branchId!, title: input.title, description: input.description || null,
        startsAt: new Date(input.startsAt), endsAt: input.endsAt ? new Date(input.endsAt) : null,
        location: input.location || null, eventStatus: "scheduled", createdBy: user.id, updatedAt: new Date(),
      }).returning(["id", "title", "description", "startsAt", "endsAt", "location", "eventStatus"]).executeTakeFirstOrThrow();
      await trx.insertInto("auditLogs").values({ actorUserId: user.id, action: "event.created", entityType: "church_event", entityId: created.id, metadata: { branchId: access.branchId } }).execute();
      return created;
    });
    return new Response(superjson.stringify({ event: { ...event, presentCount: 0 } }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    if (error instanceof Error && error.name === "ZodError") return new Response(superjson.stringify({ error: "Enter a valid event title, date and time." }), { status: 400 });
    console.error("Event creation error:", error);
    return new Response(superjson.stringify({ error: "Could not create event." }), { status: 500 });
  }
}
