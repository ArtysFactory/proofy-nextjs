// ============================================
// PROOFY V3 - Music Rights Utilities
// ============================================

import { neon } from '@neondatabase/serverless';
import type {
  MusicWork,
  MusicMaster,
  MusicRelease,
  MusicParty,
  MusicMandate,
  PublicMetadata,
  PublicWorkMetadata,
  PublicMasterMetadata,
  PublicReleaseMetadata,
  PublicPartyMetadata,
  PublicIdentifiersMetadata,
  MetadataQuality,
  MetadataChangeLog,
  ArtysMusicRights,
  MusicRightsUpdatePayload,
  ValidationResult,
  MusicRightsStatus,
  FullMusicRightsStatus,
} from '@/types/music';

// ===== VALIDATION =====

/**
 * Validates the music rights data structure
 * Returns validation result with errors, warnings, and completeness score
 */
export function validateMusicRights(data: MusicRightsUpdatePayload): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let completenessScore = 0;
  const maxScore = 100;
  let earnedPoints = 0;

  // Work validation (30 points)
  if (!data.work) {
    errors.push('Work data is required');
  } else {
    if (!data.work.title) {
      errors.push('Work title is required');
    } else {
      earnedPoints += 10;
    }

    if (!data.work.work_id) {
      errors.push('Work ID is required');
    } else {
      earnedPoints += 5;
    }

    if (data.work.authors && data.work.authors.length > 0) {
      earnedPoints += 5;
      // Validate author shares sum to 100
      const authorShareSum = data.work.authors.reduce((sum, a) => sum + (a.share || 0), 0);
      if (authorShareSum !== 100 && data.work.authors.length > 0) {
        warnings.push(`Author shares sum to ${authorShareSum}%, expected 100%`);
      }
    } else {
      warnings.push('No authors specified for work');
    }

    if (data.work.composers && data.work.composers.length > 0) {
      earnedPoints += 5;
    }

    if (data.work.iswc) {
      earnedPoints += 5;
      // Validate ISWC format: T-123456789-0
      if (!/^T-\d{9}-\d$/.test(data.work.iswc)) {
        warnings.push('ISWC format appears invalid (expected: T-123456789-0)');
      }
    }
  }

  // Parties validation (20 points)
  if (!data.parties || data.parties.length === 0) {
    errors.push('At least one party is required');
  } else {
    earnedPoints += 10;

    const partyIds = new Set(data.parties.map((p) => p.party_id));

    // Check for duplicate party IDs
    if (partyIds.size !== data.parties.length) {
      errors.push('Duplicate party IDs found');
    }

    // Validate party references in work
    if (data.work) {
      const allRefs = [
        ...(data.work.authors || []),
        ...(data.work.composers || []),
        ...(data.work.publishers || []),
      ];

      for (const ref of allRefs) {
        if (!partyIds.has(ref.party_ref)) {
          errors.push(`Party reference "${ref.party_ref}" not found in parties list`);
        }
      }
    }

    // Check for IPI/ISNI
    const partiesWithIpi = data.parties.filter((p) => p.ipi).length;
    if (partiesWithIpi > 0) {
      earnedPoints += 5;
    } else {
      warnings.push('No party has IPI identifier');
    }

    const partiesWithIsni = data.parties.filter((p) => p.isni).length;
    if (partiesWithIsni > 0) {
      earnedPoints += 5;
    }
  }

  // Masters validation (25 points)
  if (!data.masters || data.masters.length === 0) {
    errors.push('At least one master recording is required');
  } else {
    earnedPoints += 10;

    for (const master of data.masters) {
      if (!master.master_id) {
        errors.push('Master ID is required');
      }
      if (!master.title) {
        errors.push('Master title is required');
      }
      if (!master.linked_work_id) {
        errors.push(`Master "${master.title}" must be linked to a work`);
      } else if (data.work && master.linked_work_id !== data.work.work_id) {
        errors.push(`Master "${master.title}" references unknown work ID`);
      }

      // Validate ISRC format
      if (master.isrc) {
        earnedPoints += 5;
        // ISRC format: CC-XXX-YY-NNNNN (e.g., FR-AB1-23-45678)
        if (!/^[A-Z]{2}-?[A-Z0-9]{3}-?\d{2}-?\d{5}$/.test(master.isrc.replace(/-/g, ''))) {
          warnings.push(`ISRC "${master.isrc}" format may be invalid`);
        }
      }

      // Validate performer references
      if (master.performers) {
        for (const perf of master.performers) {
          if (data.parties && !data.parties.some((p) => p.party_id === perf.party_ref)) {
            errors.push(`Performer reference "${perf.party_ref}" not found in parties`);
          }
        }
        earnedPoints += 5;
      }

      // Check neighbouring rights splits
      if (master.neighbouring_rights_splits && master.neighbouring_rights_splits.length > 0) {
        const splitSum = master.neighbouring_rights_splits.reduce((sum, s) => sum + (s.share || 0), 0);
        if (splitSum !== 100) {
          warnings.push(`Neighbouring rights splits for "${master.title}" sum to ${splitSum}%, expected 100%`);
        }
        earnedPoints += 5;
      }
    }
  }

  // Releases validation (15 points)
  if (data.releases && data.releases.length > 0) {
    earnedPoints += 5;

    for (const release of data.releases) {
      if (!release.release_id) {
        errors.push('Release ID is required');
      }
      if (!release.title) {
        errors.push('Release title is required');
      }

      // Validate UPC format (12-13 digits)
      if (release.upc) {
        earnedPoints += 5;
        if (!/^\d{12,13}$/.test(release.upc)) {
          warnings.push(`UPC "${release.upc}" should be 12-13 digits`);
        }
      }

      // Validate tracklist references
      if (release.tracklist) {
        for (const track of release.tracklist) {
          if (data.masters && !data.masters.some((m) => m.master_id === track.master_ref)) {
            errors.push(`Track references unknown master "${track.master_ref}"`);
          }
        }
        earnedPoints += 5;
      }
    }
  } else {
    warnings.push('No releases specified');
  }

  // Mandates validation (10 points)
  if (data.mandates && data.mandates.length > 0) {
    earnedPoints += 10;

    for (const mandate of data.mandates) {
      if (!mandate.mandate_id) {
        errors.push('Mandate ID is required');
      }
      if (!mandate.scope || !mandate.scope.rights_types || mandate.scope.rights_types.length === 0) {
        errors.push('Mandate must specify rights types');
      }
      if (!mandate.financials || mandate.financials.commission_rate_percentage === undefined) {
        errors.push('Mandate must specify commission rate');
      }
    }
  }

  completenessScore = Math.round((earnedPoints / maxScore) * 100);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    completeness_score: completenessScore,
  };
}

// ===== PUBLIC METADATA BUILDER =====

/**
 * Builds Allfeat-compatible public metadata from private rights data
 */
export function buildPublicMetadataFromRights(
  work: MusicWork,
  masters: MusicMaster[],
  releases: MusicRelease[],
  parties: MusicParty[]
): PublicMetadata {
  const findParty = (partyRef: string): MusicParty | undefined =>
    parties.find((p) => p.party_id === partyRef);

  // Build public work
  const mainAuthors: PublicWorkMetadata['main_authors'] = [
    ...(work.authors || []),
    ...(work.composers || []),
  ].map((c) => {
    const party = findParty(c.party_ref);
    return {
      display_name: party?.display_name ?? c.party_ref,
      role: c.role === 'composer' ? 'composer' as const : 'author' as const,
      ipi: party?.ipi || null,
    };
  });

  const publicWork: PublicWorkMetadata = {
    title: work.title,
    iswc: work.iswc || null,
    language: work.language,
    genre: work.genre,
    main_authors: mainAuthors,
  };

  // Build public masters
  const publicMasters: PublicMasterMetadata[] = masters.map((m) => {
    const mainArtists = (m.performers || [])
      .filter((p) => p.role === 'main_artist' || p.role === 'featured_artist')
      .map((ref) => {
        const party = findParty(ref.party_ref);
        return {
          display_name: party?.display_name ?? ref.party_ref,
          isni: party?.isni || null,
        };
      });

    return {
      master_id: m.master_id,
      title: m.title,
      isrc: m.isrc || null,
      duration_ms: m.duration_ms,
      explicit: m.explicit,
      version_type: m.version_type,
      main_artists: mainArtists,
    };
  });

  // Build public releases
  const publicReleases: PublicReleaseMetadata[] = releases.map((r) => {
    const labelParty = r.label_party_ref ? findParty(r.label_party_ref) : undefined;
    return {
      release_id: r.release_id,
      title: r.title,
      release_type: r.release_type,
      upc: r.upc || null,
      release_date: r.release_date,
      label_name: labelParty?.display_name,
    };
  });

  // Build public parties
  const publicParties: PublicPartyMetadata[] = parties.map((p) => ({
    party_id: p.party_id,
    display_name: p.display_name,
    type: p.type,
    role_tags: p.role_tags,
    country: p.country,
  }));

  // Build identifiers
  const mastersIsrc = masters
    .map((m) => m.isrc)
    .filter((v): v is string => !!v);

  const ipiList = parties
    .map((p) => p.ipi)
    .filter((v): v is string => !!v);

  const isniList = parties
    .map((p) => p.isni)
    .filter((v): v is string => !!v);

  const identifiers: PublicIdentifiersMetadata = {
    work_iswc: work.iswc || null,
    masters_isrc: mastersIsrc,
    release_upc: releases[0]?.upc || null,
    ipi_list: ipiList,
    isni_list: isniList,
  };

  return {
    schema_version: '1.0.0',
    last_updated: new Date().toISOString(),
    work: publicWork,
    masters: publicMasters,
    releases: publicReleases,
    parties: publicParties,
    identifiers,
  };
}

// ===== STATUS DETERMINATION =====

/**
 * Determines the music rights status based on data completeness
 */
export function determineMusicRightsStatus(
  data: MusicRightsUpdatePayload,
  mandates: MusicMandate[]
): MusicRightsStatus {
  // If any mandate is active, status is active
  if (mandates.some((m) => m.status === 'active')) {
    return 'active';
  }

  // If any mandate is disputed, status is disputed
  if (mandates.some((m) => m.status === 'revoked')) {
    return 'disputed';
  }

  // Default to draft
  return 'draft';
}

/**
 * Determines the full music rights status
 */
export function determineFullMusicRightsStatus(
  validation: ValidationResult,
  musicRightsStatus: MusicRightsStatus,
  distributionStatus?: string
): FullMusicRightsStatus {
  if (distributionStatus === 'distributed') {
    return 'published';
  }

  if (distributionStatus === 'pending' || distributionStatus === 'processing') {
    return 'publishing';
  }

  if (validation.valid && validation.completeness_score >= 80 && musicRightsStatus === 'active') {
    return 'ready';
  }

  return 'incomplete';
}

// ===== AUDIT LOGGING =====

/**
 * Logs a metadata change to the audit log
 */
export async function logMetadataChange(
  creationId: number | string,
  changedBy: string,
  changeType: string,
  changeSummary: string,
  oldValue: any,
  newValue: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not configured, skipping audit log');
    return;
  }

  try {
    const sql = neon(databaseUrl);
    await sql`
      INSERT INTO metadata_audit_log (
        creation_id, changed_by, change_type, old_value, new_value, 
        change_summary, ip_address, user_agent
      )
      VALUES (
        ${Number(creationId)}, ${changedBy}, ${changeType}, 
        ${JSON.stringify(oldValue)}::jsonb, ${JSON.stringify(newValue)}::jsonb,
        ${changeSummary}, ${ipAddress || null}, ${userAgent || null}
      )
    `;
  } catch (error) {
    console.error('Failed to log metadata change:', error);
  }
}

// ===== ID GENERATORS =====

/**
 * Generates a unique work ID
 */
export function generateWorkId(): string {
  return `wrk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generates a unique master ID
 */
export function generateMasterId(): string {
  return `mst_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generates a unique release ID
 */
export function generateReleaseId(): string {
  return `rel_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generates a unique party ID
 */
export function generatePartyId(): string {
  return `pty_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generates a unique mandate ID
 */
export function generateMandateId(): string {
  return `mnd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// ===== METADATA QUALITY =====

/**
 * Creates initial metadata quality object
 */
export function createInitialMetadataQuality(userId: string): MetadataQuality {
  return {
    status: 'draft',
    completeness_score: 0,
    history: [
      {
        version: 1,
        changed_by: userId,
        changed_at: new Date().toISOString(),
        change_type: 'created',
        change_summary: 'Initial creation',
      },
    ],
  };
}

/**
 * Updates metadata quality with a new change
 */
export function updateMetadataQuality(
  current: MetadataQuality,
  changedBy: string,
  changeType: string,
  changeSummary: string,
  newStatus?: MetadataQuality['status'],
  completenessScore?: number
): MetadataQuality {
  const newEntry: MetadataChangeLog = {
    version: current.history.length + 1,
    changed_by: changedBy,
    changed_at: new Date().toISOString(),
    change_type: changeType,
    change_summary: changeSummary,
  };

  return {
    ...current,
    status: newStatus ?? current.status,
    completeness_score: completenessScore ?? current.completeness_score,
    last_reviewed_by: changedBy,
    last_reviewed_at: new Date().toISOString(),
    history: [...current.history, newEntry],
  };
}
