import { createClient } from '@/lib/supabase/server';
import { SearchResult } from '@/lib/supabase/types';
import SearchResults from './SearchResults';
import SearchSuggestions from './SearchSuggestions';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SearchContentProps {
  searchParams: {
    q?: string;
    type?: string;
    category?: string;
    sort?: string;
  };
}

async function performSearch(params: SearchContentProps['searchParams']) {
  const supabase = await createClient();
  const { q = '', type = 'all', category, sort = 'relevance' } = params;
  
  if (!q.trim()) {
    return { results: [], totalCount: 0, suggestions: [] };
  }
  
  // Determine which types to search
  const searchTypes = type === 'all' 
    ? ['articles', 'users', 'topics', 'strategies']
    : [type];
    
  // Perform search using the database function
  const { data: results, error } = await supabase.rpc('search_all', {
    p_query: q,
    p_types: searchTypes,
    p_limit: 20,
    p_offset: 0,
    p_filters: category ? { category } : {}
  });
  
  // Get search suggestions
  const { data: suggestions } = await supabase.rpc('get_search_suggestions', {
    p_query: q,
    p_limit: 5
  });
  
  // Update popular searches
  await supabase.rpc('update_popular_search', { p_query: q });
  
  // Save to search history if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('search_history').insert({
      user_id: user.id,
      query: q,
      filters: { type, category },
      results_count: results?.length || 0
    });
  }
  
  return {
    results: results || [],
    totalCount: results?.length || 0,
    suggestions: suggestions || []
  };
}

export default async function SearchContent({ searchParams }: SearchContentProps) {
  const { results, totalCount, suggestions } = await performSearch(searchParams);
  const query = searchParams.q || '';
  
  if (!query.trim()) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Arama yapmak için bir terim girin</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Makale, kullanıcı, konu veya strateji arayabilirsiniz
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Sonuç bulunamadı</p>
            <p className="mt-2 text-sm text-muted-foreground">
              "{query}" için arama sonucu bulunamadı
            </p>
          </CardContent>
        </Card>
        
        {suggestions.length > 0 && (
          <SearchSuggestions suggestions={suggestions} />
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} sonuç bulundu
        </p>
      </div>
      
      <SearchResults results={results} />
      
      {suggestions.length > 0 && (
        <SearchSuggestions suggestions={suggestions} />
      )}
    </div>
  );
}