import superjson from "superjson";
import { sql } from "kysely";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const VIEW_ROLES = ["super_admin", "church_admin", "pastor"] as const;
export async function handle(request: Request) {
  try {
    const { access } = await requireChurchAccess(request, [...VIEW_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const events = await db.selectFrom("churchEvents")
      .leftJoin("eventAttendance", "churchEvents.id", "eventAttendance.eventId")
      .select([
        "churchEvents.id", "churchEvents.title", "churchEvents.description",
        "churchEvents.startsAt", "churchEvents.endsAt", "churchEvents.location",
        "churchEvents.eventStatus",
        sql<number>`COUNT(event_attendance.member_id) FILTER (WHERE event_attendance.attendance_status = 'present')::int`.as("presentCount"),
      ])
      .where("churchEvents.branchId", "=", access.branchId)
      .groupBy("churchEvents.id")
      .orderBy("churchEvents.startsAt", "desc")
      .limit(100).execute();
    return new Response(superjson.stringify({ events }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    console.error("Event listing error:", error);
    return new Response(superjson.stringify({ error: "Could not load events." }), { status: 500 });
  }
}
