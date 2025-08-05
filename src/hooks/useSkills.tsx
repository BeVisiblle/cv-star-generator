import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  name: string;
  category: string;
  branch: string;
}

export const useSkills = (branch?: string) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('skills')
          .select('id, name, category, branch')
          .order('name');

        if (branch) {
          query = query.eq('branch', branch);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
        } else {
          setSkills(data || []);
        }
      } catch (err) {
        setError('Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [branch]);

  return {
    skills,
    loading,
    error
  };
};