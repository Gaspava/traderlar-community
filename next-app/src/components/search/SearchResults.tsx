'use client';

import { SearchResult } from '@/lib/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  User, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'topic':
        return <MessageSquare className="h-4 w-4" />;
      case 'strategy':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-green-100 text-green-700';
      case 'topic':
        return 'bg-purple-100 text-purple-700';
      case 'strategy':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return 'Makale';
      case 'user':
        return 'Kullanıcı';
      case 'topic':
        return 'Konu';
      case 'strategy':
        return 'Strateji';
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={`${result.type}-${result.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={result.url}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={getTypeBadgeColor(result.type)}>
                      {getTypeIcon(result.type)}
                      <span className="ml-1">{getTypeLabel(result.type)}</span>
                    </Badge>
                    
                    {result.tags.length > 0 && (
                      <>
                        {result.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        {result.tags.length > 3 && (
                          <Badge variant="outline">+{result.tags.length - 3}</Badge>
                        )}
                      </>
                    )}
                  </div>
                  
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {result.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {result.description && (
                <CardDescription className="line-clamp-2 mb-3">
                  {result.description}
                </CardDescription>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {result.type !== 'user' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={result.author.avatar_url} />
                        <AvatarFallback>
                          {result.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{result.author.name}</span>
                    </div>
                    
                    <span>•</span>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(result.created_at), {
                          addSuffix: true,
                          locale: tr
                        })}
                      </span>
                    </div>
                  </div>
                )}
                
                {result.type === 'user' && (
                  <div className="flex items-center gap-4">
                    <span>@{result.author.username}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(result.created_at), {
                          addSuffix: true,
                          locale: tr
                        })} katıldı
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">
                    Eşleşme: %{Math.round(result.relevance * 100)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}