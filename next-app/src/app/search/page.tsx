import { Suspense } from 'react';
import SearchContent from '@/components/search/SearchContent';
import SearchFilters from '@/components/search/SearchFilters';
import { Search } from 'lucide-react';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Arama</h1>
        {query && (
          <p className="mt-2 text-muted-foreground">
            "{query}" için arama sonuçları
          </p>
        )}
      </div>
      
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>
        
        {/* Search Results */}
        <div className="lg:col-span-3">
          <Suspense fallback={<SearchLoading />}>
            <SearchContent searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}