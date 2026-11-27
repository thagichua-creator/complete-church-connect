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
