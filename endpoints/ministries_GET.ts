import superjson from "superjson";
import { sql } from "kysely";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";

const VIEW_ROLES = ["super_admin", "church_admin", "pastor"] as const;
export async function handle(request: Request) {
  try {
    const { access } = await requireChurchAccess(request, [...VIEW_ROLES]);
    if (!access.branchId) return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    const ministries = await db.selectFrom("ministries")
      .leftJoin("members as leaders", "ministries.leaderMemberId", "leaders.id")
      .leftJoin("memberMinistries", "ministries.id", "memberMinistries.ministryId")
      .select(["ministries.id", "ministries.name", "ministries.description", "ministries.isActive", "leaders.firstName as leaderFirstName", "leaders.lastName as leaderLastName", sql<number>`COUNT(DISTINCT member_ministries.member_id)::int`.as("memberCount")])
      .where("ministries.branchId", "=", access.branchId)
      .groupBy(["ministries.id", "leaders.firstName", "leaders.lastName"])
      .orderBy("ministries.name", "asc").limit(200).execute();
    return new Response(superjson.stringify({ ministries }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    if (error instanceof ChurchAccessError) return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    console.error("Ministry directory error:", error);
    return new Response(superjson.stringify({ error: "Could not load ministries." }), { status: 500 });
  }
}
