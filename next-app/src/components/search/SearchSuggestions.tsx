'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Tag, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Suggestion {
  suggestion: string;
  type: string;
  data: any;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
}

export default function SearchSuggestions({ suggestions }: SearchSuggestionsProps) {
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
  
  const getSuggestionLink = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case 'tag':
        return `/search?q=${encodeURIComponent(suggestion.suggestion)}&type=all`;
      case 'user':
        return `/profile/${suggestion.data.username}`;
      case 'search':
        return `/search?q=${encodeURIComponent(suggestion.suggestion)}`;
      default:
        return `/search?q=${encodeURIComponent(suggestion.suggestion)}`;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Öneriler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Link
              key={index}
              href={getSuggestionLink(suggestion)}
              className="flex items-center justify-between rounded-lg p-2 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div>
                  <p className="font-medium">{suggestion.suggestion}</p>
                  {suggestion.type === 'tag' && suggestion.data.count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.data.count} kullanım
                    </p>
                  )}
                  {suggestion.type === 'search' && suggestion.data.count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.data.count} kez arandı
                    </p>
                  )}
                </div>
              </div>
              
              {suggestion.type === 'tag' && (
                <Badge variant="secondary">Etiket</Badge>
              )}
              {suggestion.type === 'user' && (
                <Badge variant="secondary">Kullanıcı</Badge>
              )}
              {suggestion.type === 'search' && (
                <Badge variant="secondary">Popüler</Badge>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}