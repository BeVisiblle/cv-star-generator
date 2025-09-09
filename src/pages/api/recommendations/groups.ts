import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('recommended_groups')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Recommended groups error:', error);
      return res.status(500).json({ error: 'Failed to load recommended groups' });
    }

    return res.status(200).json({ data: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
