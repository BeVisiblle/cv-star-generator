import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, limit = 10 } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters long' });
    }

    const { data, error } = await supabase.rpc('search_autocomplete', {
      query: query.trim(),
      limit_count: Math.min(limit, 20) // Cap at 20 results
    });

    if (error) {
      console.error('Search autocomplete error:', error);
      return res.status(500).json({ error: 'Search failed' });
    }

    return res.status(200).json({ data: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
