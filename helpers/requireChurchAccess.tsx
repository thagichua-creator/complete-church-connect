import { db } from "./db";
import { getServerUserSession } from "./getServerUserSession";

export type ChurchAppRole =
  | "super_admin"
  | "church_admin"
  | "pastor"
  | "youth_coordinator"
  | "ministry_leader"
  | "member";

export class ChurchAccessError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ChurchAccessError";
    this.status = status;
  }
}

export async function requireChurchAccess(
  request: Request,
  allowedRoles: ChurchAppRole[],
) {
  let session;
  try {
    session = await getServerUserSession(request);
  } catch {
    throw new ChurchAccessError("Sign in to continue.", 401);
  }

  const access = await db
    .selectFrom("userAccessProfiles")
    .select(["appRole", "branchId", "isActive", "memberId"])
    .where("userId", "=", session.user.id)
    .executeTakeFirst();

  if (!access || !access.isActive) {
    throw new ChurchAccessError("Your church account is not active. Contact an administrator.", 403);
  }
  if (!allowedRoles.includes(access.appRole as ChurchAppRole)) {
    throw new ChurchAccessError("You do not have permission to perform this action.", 403);
  }

  return { user: session.user, access: { ...access, appRole: access.appRole as ChurchAppRole } };
}