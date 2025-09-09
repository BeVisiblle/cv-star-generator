import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      query, 
      search_type = 'all', 
      page_offset = 0, 
      page_limit = 20 
    } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters long' });
    }

    const { data, error } = await supabase.rpc('search_all', {
      query: query.trim(),
      search_type,
      page_offset: Math.max(0, page_offset),
      page_limit: Math.min(page_limit, 50) // Cap at 50 results per page
    });

    if (error) {
      console.error('Search all error:', error);
      return res.status(500).json({ error: 'Search failed' });
    }

    return res.status(200).json({ data: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
