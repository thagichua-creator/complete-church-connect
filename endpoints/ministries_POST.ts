import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const schema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(500).optional() });
const CREATE_ROLES = ["super_admin", "church_admin", "pastor"] as const;
export async function handle(request: Request) {
  try {
    const { user, access } = await requireChurchAccess(request, [...CREATE_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const input = schema.parse(superjson.parse(await request.text()));
    const created = await db.transaction().execute(async trx => {
      const ministry = await trx.insertInto("ministries").values({ branchId: access.branchId!, name: input.name, description: input.description || null, isActive: true, updatedAt: new Date() }).returning(["id", "name", "description", "isActive"]).executeTakeFirstOrThrow();
      await trx.insertInto("auditLogs").values({ actorUserId: user.id, action: "ministry.created", entityType: "ministry", entityId: ministry.id, metadata: { branchId: access.branchId } }).execute();
      return ministry;
    });
    return new Response(superjson.stringify({ ministry: created }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    if (error instanceof Error && error.name === "ZodError") return new Response(superjson.stringify({ error: "Enter a valid ministry name and description." }), { status: 400 });
    console.error("Ministry creation error:", error);
    return new Response(superjson.stringify({ error: "Could not create ministry." }), { status: 500 });
  }
}
