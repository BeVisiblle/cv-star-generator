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

        const { data, error } = await query;

        if (error) {
          setError(error.message);
        } else {
          let filteredSkills = data || [];
          
          // Filter by status level if provided
          if (statusLevel) {
            filteredSkills = filteredSkills.filter(skill => 
              skill.status_level === 'all' || 
              skill.status_level === statusLevel
            );
          }
          
          setSkills(filteredSkills);
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