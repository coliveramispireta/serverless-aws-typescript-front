import { coachEmails } from "@/app/global";

/**
 * Determina si un correo corresponde al Coach.
 * La lista se configura por entorno en NEXT_PUBLIC_COACH_EMAILS_*.
 */
export function isCoachEmail(email?: string | null): boolean {
  if (!email) return false;
  return coachEmails.includes(email.trim().toLowerCase());
}
