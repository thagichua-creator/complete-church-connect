import superjson from "superjson";

export type MemberListItem = {
  id: string;
  membershipNo: string;
  firstName: string;
  lastName: string;
  membershipStatus: string;
  joinedOn: Date;
  ministryNames: string[];
};

export type OutputType = { members: MemberListItem[] } | { error: string };

export async function getMembers(init?: RequestInit): Promise<OutputType> {
  const response = await fetch("/_api/members", {
    method: "GET",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not load members.");
  return result;
}

endpoints/members_POST.ts — lines 1-107 of 107 (version: 1795785479090, sha256: 6f0951a5f27cf2bf1956c6ed3b361e7d4bbe07060dc81ad22d1cfab45b139778)
import { randomUUID } from "crypto";
import superjson from "superjson";
import { db } from "../helpers/db";
import { ChurchAccessError, requireChurchAccess } from "../helpers/requireChurchAccess";
import { schema, type OutputType } from "./members_POST.schema";

const CREATE_ROLES = ["super_admin", "church_admin", "pastor"] as const;

export async function handle(request: Request) {
  try {
    const { user, access } = await requireChurchAccess(request, [...CREATE_ROLES]);
    if (!access.branchId) {
      return new Response(superjson.stringify({ error: "Your account is not assigned to a church branch." }), { status: 403 });
    }

    const input = schema.parse(superjson.parse(await request.text()));
    const age = input.ageYears;
    const isMinor = age !== undefined && age < 18;
    const hasYouthDetails = Boolean(
      input.educationLevel || input.areaOfStudy || input.course || input.institution ||
      input.profession || input.employmentStatus || input.skills?.length || input.educationInterests?.length ||
      input.talents?.length || input.careerInterests?.length
    );
    const guardianConsent = input.guardianConsentStatus ?? "pending";

    if (isMinor && hasYouthDetails && guardianConsent !== "granted") {
      return new Response(superjson.stringify({ error: "Youth education, talent and career details can only be recorded after guardian consent has been confirmed." }), { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const membershipNo = `CCC-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const member = await db.transaction().execute(async (trx) => {
      const inserted = await trx
        .insertInto("members")
        .values({
          membershipNo,
          branchId: access.branchId!,
          firstName: input.firstName,
          lastName: input.lastName,
          preferredName: input.preferredName || null,
          ageYears: input.ageYears ?? null,
          gender: input.gender ?? null,
          maritalStatus: input.maritalStatus ?? null,
          email: input.email || null,
          phone: input.phone || null,
          residentialArea: input.residentialArea || null,
          educationLevel: isMinor && guardianConsent !== "granted" ? null : (input.educationLevel || null),
          profession: isMinor && guardianConsent !== "granted" ? null : (input.profession || null),
          areaOfStudy: isMinor && guardianConsent !== "granted" ? null : (input.areaOfStudy || null),
          course: isMinor && guardianConsent !== "granted" ? null : (input.course || null),
          institution: isMinor && guardianConsent !== "granted" ? null : (input.institution || null),
          employmentStatus: isMinor && guardianConsent !== "granted" ? null : (input.employmentStatus || null),
          skills: isMinor && guardianConsent !== "granted" ? [] : (input.skills ?? []),
          careerInterests: isMinor && guardianConsent !== "granted" ? [] : (input.careerInterests ?? []),
          contactConsent: input.contactConsent ?? false,
          privacyNoticeAcceptedAt: now,
          createdBy: user.id,
          updatedBy: user.id,
          joinedOn: now,
          updatedAt: now,
        })
        .returning(["id", "membershipNo", "firstName", "lastName"])
        .executeTakeFirstOrThrow();

      if (age !== undefined && age >= 13 && age <= 35) {
        const canStoreYouthDetails = !isMinor || guardianConsent === "granted";
        await trx.insertInto("youthProfiles").values({
          memberId: inserted.id,
          educationStage: canStoreYouthDetails ? (input.educationLevel || null) : null,
          educationInterests: canStoreYouthDetails ? (input.educationInterests ?? []) : [],
          talents: canStoreYouthDetails ? (input.talents ?? []) : [],
          careerInterests: canStoreYouthDetails ? (input.careerInterests ?? []) : [],
          guardianConsentStatus: isMinor ? guardianConsent : "not_required",
          guardianConsentRecordedAt: isMinor && guardianConsent === "granted" ? now : null,
          guardianConsentRecordedBy: isMinor && guardianConsent === "granted" ? user.id : null,
          updatedAt: now,
        }).execute();
      }

      await trx.insertInto("auditLogs").values({
        actorUserId: user.id,
        action: "member.created",
        entityType: "member",
        entityId: inserted.id,
        metadata: { branchId: access.branchId, hasYouthProfile: age !== undefined && age >= 13 && age <= 35 },
      }).execute();

      return inserted;
    });

    return new Response(superjson.stringify({ member } satisfies OutputType), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ChurchAccessError) {
      return new Response(superjson.stringify({ error: error.message }), { status: error.status });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return new Response(superjson.stringify({ error: "Please check the member details and try again." }), { status: 400 });
    }
    console.error("Member registration error:", error);
    return new Response(superjson.stringify({ error: "Could not register this member. Please try again." }), { status: 500 });
  }
}

endpoints/members_POST.schema.ts — lines 1-42 of 42 (version: 1795785479090, sha256: 07fcf9d94514716ea9ec7dcab525a285fbf479efe0a9fa9c7a0d674cd17ea1f2)
import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  preferredName: z.string().trim().max(80).optional(),
  ageYears: z.number().int().min(0).max(120).optional(),
  gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say"]).optional(),
  maritalStatus: z.enum(["single", "married", "widowed", "divorced", "separated", "prefer_not_to_say"]).optional(),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  residentialArea: z.string().trim().max(120).optional(),
  educationLevel: z.string().trim().max(100).optional(),
  profession: z.string().trim().max(120).optional(),
  areaOfStudy: z.string().trim().max(120).optional(),
  course: z.string().trim().max(120).optional(),
  institution: z.string().trim().max(160).optional(),
  employmentStatus: z.string().trim().max(80).optional(),
  skills: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  careerInterests: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  contactConsent: z.boolean().optional(),
  guardianConsentStatus: z.enum(["pending", "granted", "declined"]).optional(),
  educationInterests: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  talents: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { member: { id: string; membershipNo: string; firstName: string; lastName: string } } | { error: string };

export async function postMember(body: InputType, init?: RequestInit): Promise<OutputType> {
  const payload = schema.parse(body);
  const response = await fetch("/_api/members", {
    method: "POST",
    body: superjson.stringify(payload),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const result = superjson.parse<OutputType>(await response.text());
  if (!response.ok) throw new Error("error" in result ? result.error : "Could not register member.");
  return result;
}
