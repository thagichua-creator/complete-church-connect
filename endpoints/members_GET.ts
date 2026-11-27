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

endpoints/members_GET.schema.ts — lines 1-24 of 24 (version: 1795785479090, sha256: 0e0f69894c7199dd7d01fc51416e4904e9f6a099cfe13d60083417a6ecb1fddc)
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

pages/login.tsx — lines 1-34 of 34 (version: 1795785479090, sha256: 6bd9e1ab28bdef0cae5fbe54257ea0ef7f114263d96647fc4ac887ae93227aa8)
import React from "react";
import { Church, ShieldCheck } from "lucide-react";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brand}>
          <div className={styles.mark}><Church size={25} /></div>
          <div><strong>CHURCH CONNECT</strong><span>COMMUNITY PLATFORM</span></div>
        </div>
        <div className={styles.brandMessage}>
          <span className={styles.kicker}>ONE CHURCH. ONE COMMUNITY.</span>
          <h1>Bringing your church community closer.</h1>
          <p>A secure place to support membership, ministry and meaningful connections.</p>
        </div>
        <div className={styles.brandFooter}><ShieldCheck size={15}/> Your community. Treated with care.</div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.mobileBrand}><div className={styles.mark}><Church size={22}/></div><strong>CHURCH CONNECT</strong></div>
          <span className={styles.formKicker}>WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p className={styles.formIntro}>Enter your account details to continue.</p>
          <PasswordLoginForm />
          <p className={styles.securityNote}><ShieldCheck size={14}/> Sign-in is protected by secure sessions and password hashing.</p>
        </div>
        <footer>© 2026 Complete Church Connect</footer>
      </section>
    </main>
  );
}

pages/login.module.css — lines 1-1 of 1 (version: 1795785479090, sha256: 1e3dd6450b813e73206df81dad546b257e1f22db3843773803c729670103940b)
.page{min-height:100vh;display:grid;grid-template-columns:minmax(320px,.9fr) minmax(420px,1.1fr);background:var(--background);color:var(--foreground);font-family:var(--font-family-base)}.brandPanel{background:#0b1930;color:#f7f4ec;padding:38px 7%;display:flex;flex-direction:column;justify-content:space-between;min-height:100vh;position:relative;overflow:hidden}.brandPanel:after{content:"";position:absolute;width:480px;height:480px;border:1px solid rgba(212,175,98,.16);border-radius:50%;right:-190px;bottom:-170px;box-shadow:0 0 0 45px rgba(212,175,98,.025),0 0 0 95px rgba(212,175,98,.02)}.brand{display:flex;align-items:center;gap:12px;position:relative;z-index:1}.mark{width:42px;height:42px;border-radius:12px;background:#d4af62;color:#17243a;display:grid;place-items:center}.brand strong{display:block;font-size:12px;letter-spacing:.1em}.brand span{display:block;font-size:9px;letter-spacing:.16em;color:#aab6c4;margin-top:4px}.brandMessage{max-width:510px;position:relative;z-index:1;margin:50px 0}.kicker,.formKicker{font-size:10px;letter-spacing:.18em;font-weight:700;color:#d4af62}.brandMessage h1{font:600 clamp(38px,5vw,62px)/1.05 var(--font-family-display);letter-spacing:-.035em;margin:18px 0}.brandMessage p{font-size:14px;line-height:1.7;color:#bdc7d2;max-width:390px}.brandFooter{font-size:11px;color:#b8c3cf;display:flex;align-items:center;gap:8px;position:relative;z-index:1}.brandFooter svg{color:#d4af62}.formPanel{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:50px 9%;position:relative}.formWrap{width:100%;max-width:390px}.formKicker{color:#9a7839}.formWrap h2{font:600 32px/1.15 var(--font-family-display);letter-spacing:-.025em;margin:12px 0 8px}.formIntro{font-size:13px;color:var(--muted-foreground);margin:0 0 28px}.securityNote{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--muted-foreground);margin-top:24px}.securityNote svg{color:#8a7449}.formPanel footer{position:absolute;bottom:22px;color:#93a0af;font-size:10px}.mobileBrand{display:none;align-items:center;gap:9px;margin-bottom:35px}.mobileBrand .mark{width:35px;height:35px}.mobileBrand strong{font-size:11px;letter-spacing:.08em}@media(max-width:760px){.page{grid-template-columns:1fr}.brandPanel{display:none}.formPanel{min-height:100vh;padding:32px 22px}.mobileBrand{display:flex}.formWrap h2{font-size:29px}}

pages/login.pageLayout.tsx — lines 1-1 of 1 (version: 1795785479090, sha256: 37b82084f43a8e4772665574b64511b6b1c54874c2c3cd66cb85a1fc3958d503)
export default [];
