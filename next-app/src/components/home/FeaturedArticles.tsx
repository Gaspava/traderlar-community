'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, Clock, ArrowRight, Calendar } from 'lucide-react';
// import { createClient } from '@/lib/supabase/client';
// import type { TrendingArticle } from '@/lib/supabase/types';

// Temporary mock type
interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  view_count: number;
  published_at: string;
  author_name: string;
  author_username: string;
  author_avatar?: string;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  like_count: number;
  comment_count: number;
  trend_score: number;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedArticles() {
  const [loading, setLoading] = useState(false);

  // Mock articles data
  const articles: TrendingArticle[] = [
    {
      id: '1',
      title: 'Örnek Makale Başlığı',
      slug: 'ornek-makale-basligi',
      excerpt: 'Bu bir örnek makale özeti. Gerçek veriler bağlandığında buraya gerçek içerik gelecek.',
      cover_image: undefined,
      view_count: 150,
      published_at: '2024-01-15T10:00:00Z',
      author_name: 'Örnek Yazar',
      author_username: 'ornekuser',
      author_avatar: undefined,
      categories: [
        {
          id: '1',
          name: 'Teknoloji',
          slug: 'teknoloji',
          color: '#3b82f6'
        }
      ],
      like_count: 24,
      comment_count: 8,
      trend_score: 150
    },
    {
      id: '2',
      title: 'İkinci Örnek Makale',
      slug: 'ikinci-ornek-makale',
      excerpt: 'Başka bir örnek makale özeti. Bu da mock veri.',
      cover_image: undefined,
      view_count: 89,
      published_at: '2024-01-14T15:30:00Z',
      author_name: 'Başka Yazar',
      author_username: 'baskauser',
      author_avatar: undefined,
      categories: [
        {
          id: '2',
          name: 'Tasarım',
          slug: 'tasarim',
          color: '#10b981'
        }
      ],
      like_count: 15,
      comment_count: 3,
      trend_score: 89
    }
  ];


  if (loading) {
    return (
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Öne Çıkan Makaleler</h2>
            <p className="text-muted-foreground mt-1">En çok okunan ve beğenilen içerikler</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex gap-6 p-6">
                <Skeleton className="h-32 w-48 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Öne Çıkan Makaleler</h2>
          <p className="text-muted-foreground mt-1">En çok okunan ve beğenilen içerikler</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/articles">
            Tüm Makaleler
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/articles/${article.slug}`}>
              <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex flex-col gap-6 p-6 sm:flex-row">
                  {article.cover_image && (
                    <div className="relative h-32 w-full overflow-hidden rounded-lg sm:w-48 flex-shrink-0">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {article.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="secondary"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            borderColor: `${category.color}40`,
                          }}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {article.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={article.author_avatar || undefined}
                            alt={article.author_name}
                          />
                          <AvatarFallback>
                            {article.author_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{article.author_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(article.published_at).toLocaleDateString('tr-TR')}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.view_count}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {article.like_count}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {article.comment_count}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}