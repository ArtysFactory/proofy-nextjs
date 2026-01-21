// ============================================
// PROOFY - Email Templates Index
// Multi-language support: FR, EN, ES
// ============================================

import { generateInvitationEmailHTML, InvitationEmailParams } from './invitation';
import { generateInvitationEmailHTML_EN } from './invitation-en';
import { generateInvitationEmailHTML_ES } from './invitation-es';

export type { InvitationEmailParams };

export type SupportedLocale = 'fr' | 'en' | 'es';

/**
 * Generate invitation email HTML based on locale
 */
export function generateInvitationEmail(
  params: InvitationEmailParams,
  locale: SupportedLocale = 'fr'
): string {
  switch (locale) {
    case 'en':
      return generateInvitationEmailHTML_EN(params);
    case 'es':
      return generateInvitationEmailHTML_ES(params);
    case 'fr':
    default:
      return generateInvitationEmailHTML(params);
  }
}

/**
 * Get email subject based on locale
 */
export function getInvitationEmailSubject(
  creationTitle: string,
  locale: SupportedLocale = 'fr'
): string {
  switch (locale) {
    case 'en':
      return `✉️ Invitation to co-sign "${creationTitle}" on UnlmtdProof`;
    case 'es':
      return `✉️ Invitación a co-firmar "${creationTitle}" en UnlmtdProof`;
    case 'fr':
    default:
      return `✉️ Invitation à co-signer "${creationTitle}" sur UnlmtdProof`;
  }
}

// Re-export individual templates for direct use
export { generateInvitationEmailHTML } from './invitation';
export { generateInvitationEmailHTML_EN } from './invitation-en';
export { generateInvitationEmailHTML_ES } from './invitation-es';
