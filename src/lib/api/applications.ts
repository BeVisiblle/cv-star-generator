import { supabase } from "@/integrations/supabase/client";
import { ApplicationStatus } from "@/utils/applicationStatus";

export interface SearchCandidatesParams {
  companyId: string;
  jobId?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface UnlockCandidateParams {
  companyId: string;
  candidateId: string;
  jobId?: string;
}

export interface SetApplicationStatusParams {
  applicationId: string;
  newStatus: ApplicationStatus;
  reasonShort?: string;
  reasonCustom?: string;
}

export interface GetApplicationsByStatusParams {
  companyId: string;
  status: ApplicationStatus;
  jobId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search candidates with optional filters
 */
export async function searchCandidates(params: SearchCandidatesParams) {
  const { data, error } = await supabase.rpc("search_candidates", {
    _company_id: params.companyId,
    _job_id: params.jobId || null,
    _search_text: params.searchText || null,
    _limit: params.limit || 20,
    _offset: params.offset || 0,
  });

  if (error) {
    console.error("Error searching candidates:", error);
    throw error;
  }

  return data;
}

/**
 * Unlock a candidate for viewing full details
 */
export async function unlockCandidate(params: UnlockCandidateParams) {
  const { data, error } = await supabase.rpc("unlock_candidate", {
    _company_id: params.companyId,
    _candidate_id: params.candidateId,
    _job_id: params.jobId || null,
  });

  if (error) {
    console.error("Error unlocking candidate:", error);
    throw error;
  }

  return data;
}

/**
 * Update application status
 */
export async function setApplicationStatus(params: SetApplicationStatusParams) {
  const { data, error } = await supabase.rpc("set_application_status", {
    _application_id: params.applicationId,
    _new_status: params.newStatus,
    _reason_short: params.reasonShort || null,
    _reason_custom: params.reasonCustom || null,
  });

  if (error) {
    console.error("Error setting application status:", error);
    throw error;
  }

  return data;
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(params: GetApplicationsByStatusParams) {
  const { data, error } = await supabase.rpc("get_applications_by_status", {
    _company_id: params.companyId,
    _status: params.status,
    _job_id: params.jobId || null,
    _limit: params.limit || 50,
    _offset: params.offset || 0,
  });

  if (error) {
    console.error("Error getting applications by status:", error);
    throw error;
  }

  return data;
}

/**
 * Mark application as viewed (set is_new to false)
 */
export async function markApplicationAsViewed(applicationId: string) {
  const { error } = await supabase
    .from("applications")
    .update({ is_new: false })
    .eq("id", applicationId);

  if (error) {
    console.error("Error marking application as viewed:", error);
    throw error;
  }
}

/**
 * Get application statistics for a company
 */
export async function getApplicationStats(companyId: string, jobId?: string) {
  let query = supabase
    .from("applications")
    .select("status", { count: "exact" })
    .eq("company_id", companyId);

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error getting application stats:", error);
    throw error;
  }

  // Count by status
  const stats = {
    total: count || 0,
    new: 0,
    unlocked: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
    archived: 0,
  };

  data?.forEach((app) => {
    if (app.status && stats.hasOwnProperty(app.status)) {
      stats[app.status as ApplicationStatus]++;
    }
  });

  return stats;
}
