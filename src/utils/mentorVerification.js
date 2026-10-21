// Shared constants/helpers for the mentor qualification & verification
// workflow: a mentor declares a type (PhD student / PhD graduate /
// faculty), satisfies that type's requirement, then an admin approves
// or rejects the application. Mentors aren't publicly listed until
// verificationStatus === "approved".

export const MENTOR_TYPES = [
  {
    value: "phd_student",
    label: "PhD Student",
    blurb: "Currently enrolled in a PhD program",
    requirement: "Upload a current transcript showing your enrollment.",
  },
  {
    value: "phd_graduate",
    label: "PhD Graduate",
    blurb: "Already hold a PhD",
    requirement: "Upload a copy of your degree certificate.",
  },
  {
    value: "faculty",
    label: "Faculty",
    blurb: "A professor or research faculty member",
    requirement:
      "Verify your work email and link your university faculty profile.",
  },
];

export function mentorTypeLabel(value) {
  return MENTOR_TYPES.find((t) => t.value === value)?.label || value;
}

export const VERIFICATION_STATUS = {
  incomplete: { label: "Incomplete", color: "#92400e", bg: "rgba(217,119,6,0.08)" },
  pending_review: { label: "Pending Review", color: "#2f6175", bg: "#e3eff3" },
  approved: { label: "Approved", color: "#14532d", bg: "rgba(22,101,52,0.08)" },
  rejected: { label: "Changes Needed", color: "#a01f13", bg: "rgba(160,31,19,0.08)" },
};

export function statusInfo(status) {
  return VERIFICATION_STATUS[status] || VERIFICATION_STATUS.incomplete;
}

// A random-enough token for the work-email verification link. Doesn't
// need to be cryptographically strong - it just has to be unguessable
// and unique per request, since it's single-use and tied to one uid.
export function generateVerificationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
