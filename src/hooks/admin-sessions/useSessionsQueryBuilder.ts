
import { supabase } from "@/integrations/supabase/client";
import { SessionQueryParams, StatusCounts } from "./types";

export async function buildSessionsQuery(params: SessionQueryParams = {}) {
  const {
    statusFilter = "all",
    page = 1,
    pageSize = 10,
    startDate,
    endDate,
    searchTerm,
    sortBy = "scheduled_at",
    sortDirection = "desc",
  } = params;

  // Build the base query
  let query = supabase
    .from("mentor_sessions")
    .select(
      `
      id,
      status,
      scheduled_at,
      notes,
      meeting_link,
      meeting_platform,
      mentor: profiles!mentor_sessions_mentor_id_fkey (
        id, 
        full_name,
        avatar_url
      ),
      mentee: profiles!mentor_sessions_mentee_id_fkey (
        id, 
        full_name,
        avatar_url
      ),
      session_type: mentor_session_types (
        type,
        duration
      )
    `
    );

  // Apply filters
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (startDate) {
    query = query.gte("scheduled_at", startDate);
  }

  if (endDate) {
    query = query.lte("scheduled_at", endDate + "T23:59:59");
  }

  if (searchTerm) {
    // Use Supabase foreign table search for mentor/mentee names
    query = query.or(
      `mentor.full_name.ilike.%${searchTerm}%,mentee.full_name.ilike.%${searchTerm}%`
    );
  }

  // Apply sorting
  if (sortBy && sortDirection) {
    query = query.order(sortBy, { ascending: sortDirection === "asc" });
  }

  // Count total number of pages
  const countQuery = supabase
    .from("mentor_sessions")
    .select("id", { count: "exact" });

  if (statusFilter !== "all") {
    countQuery.eq("status", statusFilter);
  }

  if (startDate) {
    countQuery.gte("scheduled_at", startDate);
  }

  if (endDate) {
    countQuery.lte("scheduled_at", endDate + "T23:59:59");
  }

  if (searchTerm) {
    // For count query, we need a different approach since foreign table filters don't work with count
    const { data: mentorIds } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${searchTerm}%`);

    const { data: menteeIds } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${searchTerm}%`);

    const mentorIdList = mentorIds?.map((m) => m.id) || [];
    const menteeIdList = menteeIds?.map((m) => m.id) || [];

    countQuery.or(
      `mentor_id.in.(${mentorIdList.join(",")}),mentee_id.in.(${menteeIdList.join(
        ","
      )})`
    );
  }

  // Fetch status counts
  const statusCounts = await fetchStatusCounts();

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Execute query
  const { data: sessions, error } = await query;

  if (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }

  const { count } = await countQuery;
  const totalPages = Math.ceil((count || 0) / pageSize);

  return {
    sessions: sessions || [],
    totalPages,
    statusCounts,
  };
}

// Function to fetch status counts
async function fetchStatusCounts(): Promise<StatusCounts> {
  try {
    // Execute separate count queries for each status
    const [
      totalCountResult,
      scheduledCountResult,
      completedCountResult,
      cancelledCountResult,
      noShowCountResult,
    ] = await Promise.all([
      supabase.from("mentor_sessions").select("*", { count: "exact", head: true }),
      supabase
        .from("mentor_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled"),
      supabase
        .from("mentor_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("mentor_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled"),
      supabase
        .from("mentor_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "no_show"),
    ]);

    return {
      total: totalCountResult.count || 0,
      scheduled: scheduledCountResult.count || 0,
      completed: completedCountResult.count || 0,
      cancelled: cancelledCountResult.count || 0,
      no_show: noShowCountResult.count || 0,
    };
  } catch (error) {
    console.error("Error fetching status counts:", error);
    return {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
  }
}
