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
