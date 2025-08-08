'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Tag, User, TrendingUp, Clock, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface Suggestion {
  suggestion: string;
  type: string;
  data: any;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.trim()) {
      loadSuggestions(debouncedQuery);
    } else {
      loadPopularSearches();
    }
  }, [debouncedQuery]);
  
  const loadSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPopularSearches = async () => {
    try {
      const response = await fetch('/api/search/popular');
      const data = await response.json();
      setPopularSearches(data.searches || []);
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };
  
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };
  
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'user') {
      router.push(`/profile/${suggestion.data.username}`);
    } else {
      handleSearch(suggestion.suggestion);
    }
  };
  
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'tag':
        return <Tag className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'search':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="search"
            placeholder="Ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            onFocus={() => setIsOpen(true)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => handleSearch()}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList>
            {query.trim() ? (
              <>
                {isLoading ? (
                  <CommandEmpty>Yükleniyor...</CommandEmpty>
                ) : suggestions.length > 0 ? (
                  <CommandGroup heading="Öneriler">
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="flex-1">{suggestion.suggestion}</span>
                          {suggestion.type === 'tag' && suggestion.data.count > 0 && (
                            <Badge variant="secondary">
                              {suggestion.data.count}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>Öneri bulunamadı</CommandEmpty>
                )}
              </>
            ) : (
              <>
                {popularSearches.length > 0 && (
                  <CommandGroup heading="Popüler Aramalar">
                    {popularSearches.map((search) => (
                      <CommandItem
                        key={search.id}
                        onSelect={() => handleSearch(search.query)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Clock className="h-4 w-4" />
                          <span className="flex-1">{search.query}</span>
                          <Badge variant="secondary">
                            {search.search_count}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}