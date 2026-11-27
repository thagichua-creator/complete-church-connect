import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const schema = z.object({ eventId: z.string().uuid(), membershipNo: z.string().trim().min(3).max(40), attendanceStatus: z.enum(["present", "absent", "excused"]) });
const MARK_ROLES = ["super_admin", "church_admin", "pastor"] as const;
export async function handle(request: Request) {
  try {
    const { user, access } = await requireChurchAccess(request, [...MARK_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const input = schema.parse(superjson.parse(await request.text()));
    const result = await db.transaction().execute(async trx => {
      const event = await trx.selectFrom("churchEvents").select("id").where("id", "=", input.eventId).where("branchId", "=", access.branchId!).executeTakeFirst();
      if (!event) throw new Error("EVENT_NOT_FOUND");
      const member = await trx.selectFrom("members").select("id").where("membershipNo", "=", input.membershipNo).where("branchId", "=", access.branchId!).where("archivedAt", "is", null).executeTakeFirst();
      if (!member) throw new Error("MEMBER_NOT_FOUND");
      await trx.insertInto("eventAttendance").values({
        eventId: input.eventId, memberId: member.id, attendanceStatus: input.attendanceStatus,
        checkedInAt: input.attendanceStatus === "present" ? new Date() : null, markedBy: user.id,
      }).onConflict(oc => oc.columns(["eventId", "memberId"]).doUpdateSet({
        attendanceStatus: input.attendanceStatus, checkedInAt: input.attendanceStatus === "present" ? new Date() : null, markedBy: user.id,
      })).execute();
      await trx.insertInto("auditLogs").values({ actorUserId: user.id, action: "event.attendance_marked", entityType: "church_event", entityId: input.eventId, metadata: { memberId: member.id, attendanceStatus: input.attendanceStatus, branchId: access.branchId } }).execute();
      return { ok: true };
    });
    return new Response(superjson.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    if (error instanceof Error && error.message === "EVENT_NOT_FOUND") return new Response(superjson.stringify({ error: "Event not found in your branch." }), { status: 404 });
    if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") return new Response(superjson.stringify({ error: "No active member with that membership ID was found in your branch." }), { status: 404 });
    if (error instanceof Error && error.name === "ZodError") return new Response(superjson.stringify({ error: "Enter a valid event, membership ID and attendance status." }), { status: 400 });
    console.error("Attendance recording error:", error);
    return new Response(superjson.stringify({ error: "Could not record attendance." }), { status: 500 });
  }
}
