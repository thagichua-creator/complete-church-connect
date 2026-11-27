import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const inputSchema = z.object({
  membershipNo: z.string().trim().min(1).max(40),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  residentialArea: z.string().trim().max(120).optional(),
  membershipStatus: z.enum(["active", "pending", "inactive"]),
});

const EDIT_ROLES = ["super_admin", "church_admin", "pastor"] as const;

export async function handle(request: Request) {
  try {
    const { user, access } = await requireChurchAccess(request, [...EDIT_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const input = inputSchema.parse(superjson.parse(await request.text()));
    const updated = await db.transaction().execute(async trx => {
      const member = await trx.updateTable("members").set({
        firstName: input.firstName,
        lastName: input.lastName,
        ...(input.email !== undefined ? { email: input.email || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.residentialArea !== undefined ? { residentialArea: input.residentialArea || null } : {}),
        membershipStatus: input.membershipStatus,
        updatedBy: user.id,
        updatedAt: new Date(),
      }).where("membershipNo", "=", input.membershipNo)
        .where("branchId", "=", access.branchId)
        .where("archivedAt", "is", null)
        .returning(["membershipNo", "firstName", "lastName", "membershipStatus"])
        .executeTakeFirst();
      if (!member) return null;
      await trx.insertInto("auditLogs").values({ actorUserId: user.id, action: "member.updated", entityType: "member", entityId: input.membershipNo, metadata: { branchId: access.branchId } }).execute();
      return member;
    });
    if (!updated) return new Response(superjson.stringify({ error: "Member not found in your branch, or already archived." }), { status: 404 });
    return new Response(superjson.stringify({ member: updated }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    if (error instanceof Error && error.name === "ZodError") return new Response(superjson.stringify({ error: "Please check the member details and try again." }), { status: 400 });
    console.error("Member update error:", error);
    return new Response(superjson.stringify({ error: "Could not update this member." }), { status: 500 });
  }
}
