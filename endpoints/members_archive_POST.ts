import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const inputSchema = z.object({ membershipNo: z.string().trim().min(1).max(40) });
const ARCHIVE_ROLES = ["super_admin", "church_admin"] as const;

export async function handle(request: Request) {
  try {
    const { user, access } = await requireChurchAccess(request, [...ARCHIVE_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const { membershipNo } = inputSchema.parse(superjson.parse(await request.text()));
    const archived = await db.transaction().execute(async trx => {
      const member = await trx.updateTable("members").set({ archivedAt: new Date(), updatedBy: user.id, updatedAt: new Date() })
        .where("membershipNo", "=", membershipNo)
        .where("branchId", "=", access.branchId)
        .where("archivedAt", "is", null)
        .returning(["membershipNo", "firstName", "lastName"])
        .executeTakeFirst();
      if (!member) return null;
      await trx.insertInto("auditLogs").values({ actorUserId: user.id, action: "member.archived", entityType: "member", entityId: membershipNo, metadata: { branchId: access.branchId } }).execute();
      return member;
    });
    if (!archived) return new Response(superjson.stringify({ error: "Member not found in your branch, or already archived." }), { status: 404 });
    return new Response(superjson.stringify({ member: archived }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    if (error instanceof Error && error.name === "ZodError") return new Response(superjson.stringify({ error: "Please provide a valid membership ID." }), { status: 400 });
    console.error("Member archive error:", error);
    return new Response(superjson.stringify({ error: "Could not archive this member." }), { status: 500 });
  }
}
