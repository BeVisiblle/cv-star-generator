import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  name: string;
  category: string;
  branch: string;
  status_level?: string;
}

export const useSkills = (branch?: string, statusLevel?: string) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('skills')
          .select('id, name, category, branch, status_level')
          .order('name');

        if (branch) {
          // Include skills for the specific branch and universal skills
          query = query.in('branch', [branch, 'universal']);
        }

        const { data, error: primaryError } = await query;

        if (!primaryError) {
          let filteredSkills = data || [];

          // Filter by status level if provided
          if (statusLevel) {
            filteredSkills = filteredSkills.filter((skill) =>
              skill.status_level === 'all' || skill.status_level === statusLevel
            );
          }

          if (filteredSkills.length > 0) {
            setSkills(filteredSkills);
            setError(null);
            return;
          }
        }

        // Fallback to master table if primary fails or returns empty
        const { data: master, error: fallbackError } = await supabase
          .from('skills_master')
          .select('id, name, category')
          .order('name');

        if (fallbackError) {
          setError(primaryError?.message || fallbackError.message);
          setSkills([]);
        } else {
          let mapped = (master || []).map((s: any) => ({
            id: `master-${s.id}`,
            name: s.name,
            category: s.category,
            branch: 'universal',
            status_level: 'all' as const,
          }));

          // Filter by branch if provided (universal is always allowed)
          if (branch) {
            mapped = mapped.filter((s) => ['universal', branch].includes(s.branch));
          }

          // Filter by status level if provided
          if (statusLevel) {
            mapped = mapped.filter((s) => s.status_level === 'all' || s.status_level === statusLevel);
          }

          setSkills(mapped);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [branch, statusLevel]);

  return {
    skills,
    loading,
    error
  };
};