'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArticleWithAuthor } from '@/lib/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Heart, MessageCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileArticlesProps {
  userId: string;
}

export default function ProfileArticles({ userId }: ProfileArticlesProps) {
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadArticles();
  }, [userId]);
  
  const loadArticles = async () => {
    try {
      const supabase = createClient();
      
      const { data } = await supabase
        .from('articles')
        .select(`
          *,
          author:users!author_id(name, username, avatar_url, role),
          categories:article_categories(category:categories(*)),
          like_count,
          comment_count
        `)
        .eq('author_id', userId)
        .eq('is_published', true)
        .order('published_at', { ascending: false });
        
      if (data) {
        setArticles(data.map(article => ({
          ...article,
          author_name: article.author.name,
          author_username: article.author.username,
          author_avatar: article.author.avatar_url,
          author_role: article.author.role,
          categories: article.categories?.map((ac: any) => ac.category) || []
        })));
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-40 w-full" />
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Henüz makale yayınlanmamış</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((article) => (
        <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={`/makaleler/${article.slug}`}>
            {article.cover_image && (
              <div className="relative h-48 w-full">
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {article.categories.map((category) => (
                  <Badge 
                    key={category.id}
                    variant="secondary"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
              
              <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                {article.title}
              </CardTitle>
              
              <CardDescription className="line-clamp-3">
                {article.excerpt}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{article.like_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{article.comment_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(article.published_at || article.created_at), { 
                      addSuffix: true,
                      locale: tr 
                    })}
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