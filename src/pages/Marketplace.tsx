
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeaderWithSearch from '@/components/marketplace/HeaderWithSearch';
import LeftFilters, { LeftFiltersState, ItemType, Visibility } from '@/components/marketplace/LeftFilters';
import TopFilterBar from '@/components/marketplace/TopFilterBar';
import ItemCard, { MarketplaceItem } from '@/components/marketplace/ItemCard';
import RightRail from '@/components/marketplace/RightRail';
import MarketplaceComposer from '@/components/marketplace/MarketplaceComposer';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 16;

// Use an untyped Supabase instance to sidestep missing generated types for marketplace tables
const sb: any = supabase;

const defaultFilters: LeftFiltersState = {
  type: 'all',
  location: '',
  tags: [],
  companies: [],
  category: '',
};

const availableTags = [
  'first-year','dual','near-me','full-time','office','admin','it','service','application-tips'
];

export default function Marketplace() {
  const [q, setQ] = React.useState('');
  const [appliedQ, setAppliedQ] = React.useState('');
  const [filters, setFilters] = React.useState<LeftFiltersState>(defaultFilters);
  const [sort, setSort] = React.useState<'Newest' | 'MostRelevant'>('Newest');
  const [visibility, setVisibility] = React.useState<Visibility>('All');
  const [page, setPage] = React.useState(0);
  const [openComposer, setOpenComposer] = React.useState(false);

  // Categories for filter pills (from DB)
  const categoriesQuery = useQuery<{ slug: string; label: string }[]>({
    queryKey: ['marketplace-categories'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('marketplace_categories')
        .select('slug,label')
        .order('label', { ascending: true });
      if (error) throw error;
      return (data || []) as { slug: string; label: string }[];
    },
  });

  // Companies for filters (from DB)
  const companiesQuery = useQuery<{ id: string; name: string }[]>({
    queryKey: ['marketplace-companies-filter'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('companies')
        .select('id,name')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as { id: string; name: string }[];
    },
  });

  const itemsQuery = useQuery<MarketplaceItem[]>({
    queryKey: ['marketplace-items', appliedQ, filters, sort, visibility, page],
    queryFn: async (): Promise<MarketplaceItem[]> => {
      let query = sb
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: sort === 'Newest' ? false : true });

      if (appliedQ.trim()) {
        // Full text search on generated column
        query = query.textSearch('search_tsv', appliedQ);
      }

      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (visibility !== 'All') {
        query = query.eq('visibility', visibility);
      }

      if (filters.tags.length > 0) {
        // tags contains array
        query = query.contains('tags', filters.tags);
      }

      if (filters.category) {
        // categories mapped to tags in seed for demo
        query = query.contains('tags', [filters.category]);
      }

      if (filters.location.trim()) {
        // simple ilike on location
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.companies.length > 0) {
        // filter by company names — fetch IDs first
        const { data: comps, error: compErr } = await sb
          .from('companies')
          .select('id,name')
          .in('name', filters.companies);
        if (compErr) throw compErr;
        const ids = (comps || []).map((c: { id: string }) => c.id);
        if (ids.length > 0) query = query.in('company_id', ids);
      }

      // Pagination
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await query.range(from, to);
      if (error) throw error;
      return (data || []) as MarketplaceItem[];
    },
    // Reset page data on filter changes is handled by key change
  });

  const handleSearch = () => {
    setAppliedQ(q);
    setPage(0);
  };

  const loadMore = () => setPage((p) => p + 1);

  // Combine results across pages for a simple infinite scroll feel
  const [accumulated, setAccumulated] = React.useState<MarketplaceItem[]>([]);
  React.useEffect(() => {
    // Reset when filters/search/sort/visibility changed or page reset to 0
    setAccumulated([]);
  }, [appliedQ, filters, sort, visibility]);
  React.useEffect(() => {
    if (itemsQuery.data) {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        const merged = [...prev];
        for (const it of itemsQuery.data!) {
          if (!ids.has(it.id)) merged.push(it);
        }
        return merged;
      });
    }
  }, [itemsQuery.data, page]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with search next to logo */}
      <HeaderWithSearch value={q} onChange={setQ} onSubmit={handleSearch} />

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-6">
        {/* Left sidebar (filters) */}
        <div className="hidden md:block">
          <LeftFilters
            state={filters}
            onChange={(patch) => {
              setFilters((f) => ({ ...f, ...patch }));
              setPage(0);
            }}
            availableCompanies={companiesQuery.data}
            availableTags={availableTags}
            availableCategories={categoriesQuery.data}
          />
          <div className="mt-4">
            <Button className="w-full" onClick={() => setOpenComposer(true)}>
              <Plus className="h-4 w-4 mr-2" /> Post
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="space-y-4">
          <Card className="p-4 rounded-2xl">
            <div className="space-y-2">
              <div className="text-2xl font-bold">Marketplace</div>
              <div className="text-muted-foreground">
                Discover apprenticeships, groups, and content for your career start.
              </div>
            </div>
            <div className="mt-4">
              <TopFilterBar
                currentType={filters.type as ItemType}
                onTypeChange={(t) => { setFilters((f) => ({ ...f, type: t })); setPage(0); }}
                sort={sort}
                onSortChange={(s) => { setSort(s); setPage(0); }}
                visibility={visibility}
                onVisibilityChange={(v) => { setVisibility(v); setPage(0); }}
              />
            </div>
          </Card>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(accumulated || []).map((item) => (
              <ItemCard key={item.id} item={item} onView={() => { /* optional details */ }} />
            ))}

            {itemsQuery.isLoading && Array.from({ length: 8 }).map((_, i) => (
              <Card key={`sk-${i}`} className="h-64 rounded-2xl animate-pulse bg-muted/40" />
            ))}
          </div>

          {/* Load more */}
          <div className="flex justify-center">
            <Button variant="secondary" onClick={loadMore} disabled={itemsQuery.isLoading}>
              {itemsQuery.isLoading ? "Loading…" : "Load more"}
            </Button>
          </div>
        </div>

        {/* Right rail */}
        <div className="hidden lg:block">
          <RightRail />
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        className="md:hidden fixed bottom-5 right-5 h-12 w-12 rounded-full shadow-lg"
        size="icon"
        onClick={() => setOpenComposer(true)}
      >
        <Plus className="h-5 w-5" />
      </Button>

      {/* Composer */}
      <MarketplaceComposer open={openComposer} onOpenChange={setOpenComposer} />
    </div>
  );
}
