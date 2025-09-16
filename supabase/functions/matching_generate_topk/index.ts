import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobData {
  id: string
  company_id: string
  title: string
  description: string
  track: string
  contract_type: string
  is_remote: boolean
  salary_min: number
  salary_max: number
  min_experience_months: number
  benefits: string[]
  embedding: number[]
}

interface CandidateData {
  id: string
  vorname: string
  nachname: string
  stage: string
  bio_short: string
  availability_date: string
  profile_completeness: number
  embedding: number[]
  home_point: any
  commute_mode: string
  max_commute_minutes: number
  willing_to_relocate: boolean
}

interface MatchResult {
  job_id: string
  candidate_id: string
  score: number
  explanation: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_id, k = 10 } = await req.json()

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get job data
    const { data: jobData, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single()

    if (jobError || !jobData) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get available candidates
    const { data: candidatesData, error: candidatesError } = await supabaseClient
      .from('candidates')
      .select('*')
      .eq('stage', 'available')
      .gte('profile_completeness', 0.5) // Minimum profile completeness

    if (candidatesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch candidates' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get existing matches and feedback to avoid duplicates
    const { data: existingMatches } = await supabaseClient
      .from('match_cache')
      .select('candidate_id')
      .eq('job_id', job_id)

    const { data: feedback } = await supabaseClient
      .from('match_feedback')
      .select('candidate_id, feedback_type')
      .eq('job_id', job_id)
      .in('feedback_type', ['rejected', 'suppressed'])

    const excludedCandidateIds = new Set([
      ...(existingMatches?.map(m => m.candidate_id) || []),
      ...(feedback?.filter(f => f.feedback_type === 'rejected' || f.feedback_type === 'suppressed').map(f => f.candidate_id) || [])
    ])

    // Filter and score candidates
    const matches: MatchResult[] = []

    for (const candidate of candidatesData || []) {
      // Skip excluded candidates
      if (excludedCandidateIds.has(candidate.id)) {
        continue
      }

      // Eligibility gates
      if (!isCandidateEligible(candidate, jobData)) {
        continue
      }

      // Calculate subscores
      const subscores = calculateSubscores(candidate, jobData)
      
      // Calculate final score
      const finalScore = calculateFinalScore(subscores)
      
      if (finalScore >= 0.4) { // Minimum threshold for company matches
        matches.push({
          job_id: job_id,
          candidate_id: candidate.id,
          score: finalScore,
          explanation: {
            overall: finalScore,
            profile_completeness: subscores.profile,
            skills_match: subscores.skills,
            location_fit: subscores.location,
            experience_level: subscores.experience,
            availability: subscores.availability
          }
        })
      }
    }

    // Sort by score and apply MMR diversity
    matches.sort((a, b) => b.score - a.score)
    const diverseMatches = applyMMRDiversity(matches, 0.6)
    
    // Add explore slot (random candidate with lower score)
    if (diverseMatches.length < k) {
      const exploreMatch = getExploreMatch(candidatesData || [], jobData, diverseMatches, excludedCandidateIds)
      if (exploreMatch) {
        diverseMatches.push(exploreMatch)
      }
    }

    // Limit results
    const finalMatches = diverseMatches.slice(0, k)

    // Store in match_cache
    if (finalMatches.length > 0) {
      const { error: cacheError } = await supabaseClient
        .from('match_cache')
        .upsert(
          finalMatches.map(match => ({
            job_id: match.job_id,
            candidate_id: match.candidate_id,
            score: match.score,
            explanation: match.explanation
          })),
          { onConflict: 'job_id,candidate_id' }
        )

      if (cacheError) {
        console.error('Cache storage error:', cacheError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: finalMatches,
        total_candidates: matches.length,
        returned: finalMatches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function isCandidateEligible(candidate: CandidateData, job: JobData): boolean {
  // Basic eligibility checks
  if (candidate.stage !== 'available') return false
  if (candidate.profile_completeness < 0.5) return false
  
  // Availability check
  if (job.contract_type === 'vollzeit' && candidate.availability_date) {
    const availabilityDate = new Date(candidate.availability_date)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    
    if (availabilityDate > threeMonthsFromNow) {
      return false
    }
  }
  
  return true
}

function calculateSubscores(candidate: CandidateData, job: JobData): any {
  // Profile completeness
  const profileScore = candidate.profile_completeness || 0.5
  
  // Skills match (placeholder - would use embeddings in real implementation)
  const skillsMatch = 0.6 + Math.random() * 0.4
  
  // Location fit
  let locationFit = 0.7
  if (job.is_remote) {
    locationFit = 1.0
  } else if (candidate.willing_to_relocate) {
    locationFit = 0.9
  }
  
  // Experience level
  const experienceFit = Math.max(0.4, 1.0 - (job.min_experience_months / 48))
  
  // Availability
  let availabilityScore = 0.8
  if (candidate.availability_date) {
    const availabilityDate = new Date(candidate.availability_date)
    const now = new Date()
    const daysUntilAvailable = Math.ceil((availabilityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilAvailable <= 30) {
      availabilityScore = 1.0
    } else if (daysUntilAvailable <= 90) {
      availabilityScore = 0.8
    } else {
      availabilityScore = 0.6
    }
  }
  
  return {
    profile: profileScore,
    skills: skillsMatch,
    location: locationFit,
    experience: experienceFit,
    availability: availabilityScore
  }
}

function calculateFinalScore(subscores: any): number {
  const weights = {
    profile: 0.25,
    skills: 0.3,
    location: 0.2,
    experience: 0.15,
    availability: 0.1
  }
  
  return Object.keys(weights).reduce((total, key) => {
    return total + (subscores[key] * weights[key])
  }, 0)
}

function applyMMRDiversity(matches: MatchResult[], lambda: number): MatchResult[] {
  if (matches.length === 0) return []
  
  const diverse = [matches[0]] // Start with highest scoring
  
  for (let i = 1; i < matches.length; i++) {
    const current = matches[i]
    const maxSimilarity = Math.max(...diverse.map(m => 
      calculateSimilarity(current, m)
    ))
    
    const mmrScore = lambda * current.score - (1 - lambda) * maxSimilarity
    
    if (mmrScore > 0.15) { // Diversity threshold
      diverse.push(current)
    }
  }
  
  return diverse
}

function calculateSimilarity(match1: MatchResult, match2: MatchResult): number {
  // Simplified similarity based on score difference
  return 1.0 - Math.abs(match1.score - match2.score)
}

function getExploreMatch(
  candidates: CandidateData[], 
  job: JobData, 
  existingMatches: MatchResult[],
  excludedIds: Set<string>
): MatchResult | null {
  const existingCandidateIds = new Set(existingMatches.map(m => m.candidate_id))
  const availableCandidates = candidates.filter(c => 
    !existingCandidateIds.has(c.id) && !excludedIds.has(c.id)
  )
  
  if (availableCandidates.length === 0) return null
  
  const randomCandidate = availableCandidates[Math.floor(Math.random() * availableCandidates.length)]
  const subscores = calculateSubscores(randomCandidate, job)
  const score = calculateFinalScore(subscores) * 0.7 // Lower for explore
  
  return {
    job_id: job.id,
    candidate_id: randomCandidate.id,
    score: score,
    explanation: {
      overall: score,
      profile_completeness: subscores.profile,
      skills_match: subscores.skills,
      location_fit: subscores.location,
      experience_level: subscores.experience,
      availability: subscores.availability,
      explore: true
    }
  }
}
