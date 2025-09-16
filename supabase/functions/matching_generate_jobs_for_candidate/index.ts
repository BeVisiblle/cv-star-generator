import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CandidateData {
  id: string
  embedding: number[]
  home_point: any
  commute_mode: string
  max_commute_minutes: number
  willing_to_relocate: boolean
  relocation_cities: string[]
  stage: string
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
  locations: Array<{
    point: any
    address: string
  }>
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
    const { candidate_id, limit = 20 } = await req.json()

    if (!candidate_id) {
      return new Response(
        JSON.stringify({ error: 'candidate_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get candidate data
    const { data: candidateData, error: candidateError } = await supabaseClient
      .from('candidates')
      .select('*')
      .eq('id', candidate_id)
      .single()

    if (candidateError || !candidateData) {
      return new Response(
        JSON.stringify({ error: 'Candidate not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get active jobs with embeddings
    const { data: jobsData, error: jobsError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        job_locations (location_point, address)
      `)
      .eq('is_active', true)

    if (jobsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch jobs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter and score jobs
    const matches: MatchResult[] = []

    for (const job of jobsData || []) {
      // Eligibility gates
      if (!isJobEligible(job, candidateData)) {
        continue
      }

      // Calculate subscores
      const subscores = calculateSubscores(job, candidateData)
      
      // Calculate final score
      const finalScore = calculateFinalScore(subscores)
      
      if (finalScore >= 0.3) { // Minimum threshold
        matches.push({
          job_id: job.id,
          candidate_id: candidate_id,
          score: finalScore,
          explanation: {
            overall: finalScore,
            skills_match: subscores.skills,
            location_fit: subscores.location,
            experience_level: subscores.experience,
            salary_fit: subscores.salary,
            benefits_fit: subscores.benefits
          }
        })
      }
    }

    // Sort by score and apply MMR diversity
    matches.sort((a, b) => b.score - a.score)
    const diverseMatches = applyMMRDiversity(matches, 0.7)
    
    // Add explore slot (random job with lower score)
    if (diverseMatches.length < limit) {
      const exploreMatch = getExploreMatch(jobsData || [], candidateData, diverseMatches)
      if (exploreMatch) {
        diverseMatches.push(exploreMatch)
      }
    }

    // Limit results
    const finalMatches = diverseMatches.slice(0, limit)

    // Store in candidate_match_cache
    if (finalMatches.length > 0) {
      const { error: cacheError } = await supabaseClient
        .from('candidate_match_cache')
        .upsert(
          finalMatches.map(match => ({
            candidate_id: match.candidate_id,
            job_id: match.job_id,
            score: match.score,
            explanation: match.explanation
          })),
          { onConflict: 'candidate_id,job_id' }
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

function isJobEligible(job: JobData, candidate: CandidateData): boolean {
  // Basic eligibility checks
  if (candidate.stage === 'inactive') return false
  if (job.min_experience_months > 24) return false // Too senior for most candidates
  
  return true
}

function calculateSubscores(job: JobData, candidate: CandidateData): any {
  // Skills match (placeholder - would use embeddings in real implementation)
  const skillsMatch = 0.7 + Math.random() * 0.3
  
  // Location fit
  let locationFit = 0.5
  if (job.is_remote) {
    locationFit = 1.0
  } else if (candidate.home_point && job.locations?.length > 0) {
    // Calculate distance (simplified)
    locationFit = 0.8
  }
  
  // Experience level
  const experienceFit = Math.max(0.3, 1.0 - (job.min_experience_months / 60))
  
  // Salary fit (if candidate has salary expectations)
  const salaryFit = 0.8
  
  // Benefits fit
  const benefitsFit = job.benefits?.length > 0 ? 0.9 : 0.6
  
  return {
    skills: skillsMatch,
    location: locationFit,
    experience: experienceFit,
    salary: salaryFit,
    benefits: benefitsFit
  }
}

function calculateFinalScore(subscores: any): number {
  const weights = {
    skills: 0.3,
    location: 0.25,
    experience: 0.2,
    salary: 0.15,
    benefits: 0.1
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
    
    if (mmrScore > 0.1) { // Diversity threshold
      diverse.push(current)
    }
  }
  
  return diverse
}

function calculateSimilarity(match1: MatchResult, match2: MatchResult): number {
  // Simplified similarity based on score difference
  return 1.0 - Math.abs(match1.score - match2.score)
}

function getExploreMatch(jobs: JobData[], candidate: CandidateData, existingMatches: MatchResult[]): MatchResult | null {
  const existingJobIds = new Set(existingMatches.map(m => m.job_id))
  const availableJobs = jobs.filter(j => !existingJobIds.has(j.id))
  
  if (availableJobs.length === 0) return null
  
  const randomJob = availableJobs[Math.floor(Math.random() * availableJobs.length)]
  const subscores = calculateSubscores(randomJob, candidate)
  const score = calculateFinalScore(subscores) * 0.8 // Slightly lower for explore
  
  return {
    job_id: randomJob.id,
    candidate_id: candidate.id,
    score: score,
    explanation: {
      overall: score,
      skills_match: subscores.skills,
      location_fit: subscores.location,
      experience_level: subscores.experience,
      salary_fit: subscores.salary,
      benefits_fit: subscores.benefits,
      explore: true
    }
  }
}
