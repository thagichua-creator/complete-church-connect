import superjson from "superjson";
import { sql } from "kysely";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const DIRECTORY_ROLES = ["super_admin", "church_admin", "pastor"] as const;

export async function handle(request: Request) {
  try {
    const { access } = await requireChurchAccess(request, [...DIRECTORY_ROLES]);
    if (!access.branchId) {
      return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    }

    const rows = await db
      .selectFrom("members")
      .leftJoin("memberMinistries", "members.id", "memberMinistries.memberId")
      .leftJoin("ministries", "memberMinistries.ministryId", "ministries.id")
      .select([
        "members.id",
        "members.membershipNo",
        "members.firstName",
        "members.lastName",
        "members.membershipStatus",
        "members.joinedOn",
        sql<string[]>`COALESCE(ARRAY_REMOVE(ARRAY_AGG(ministries.name), NULL), ARRAY[]::text[])`.as("ministryNames"),
      ])
      .where("members.branchId", "=", access.branchId)
      .where("members.archivedAt", "is", null)
      .groupBy(["members.id"])
      .orderBy("members.createdAt", "desc")
      .limit(200)
      .execute();

    return new Response(superjson.stringify({ members: rows }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) {
      return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    }
    console.error("Member directory error:", error);
    return new Response(superjson.stringify({ error: "Could not load the member directory." }), { status: 500 });
  }
}