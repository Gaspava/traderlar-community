'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, MessageCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingTopic {
  id: string;
  title: string;
  slug: string;
  category: string;
  category_color: string;
  reply_count: number;
}

export default function TrendingSidebar() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      // Mock data for now - replace with actual Supabase query
      const mockTopics: TrendingTopic[] = [
        {
          id: '1',
          title: 'Bitcoin Analizi',
          slug: 'bitcoin-analizi',
          category: 'Kripto Analiz',
          category_color: '#f97316',
          reply_count: 234
        },
        {
          id: '2',
          title: 'EURUSD Scalping',
          slug: 'eurusd-scalping',
          category: 'Forex',
          category_color: '#3b82f6',
          reply_count: 189
        },
        {
          id: '3',
          title: 'BIST100 Teknik Analiz',
          slug: 'bist100-teknik-analiz',
          category: 'Borsa',
          category_color: '#10b981',
          reply_count: 156
        },
        {
          id: '4',
          title: 'Sharpe Ratio Hesaplama',
          slug: 'sharpe-ratio-hesaplama',
          category: 'Eğitim',
          category_color: '#8b5cf6',
          reply_count: 98
        },
        {
          id: '5',
          title: 'TradingView Webhook',
          slug: 'tradingview-webhook',
          category: 'Otomasyon',
          category_color: '#06b6d4',
          reply_count: 92
        }
      ];

      setTopics(mockTopics);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trend Konular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trend Konular
        </CardTitle>
        <CardDescription>En çok tartışılan konular</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topics.map((topic, index) => (
          <Link
            key={topic.id}
            href={`/forum/topic/${topic.slug}`}
            className="group block space-y-2 rounded-lg p-3 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between">
              <h4 className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-accent-foreground">
                {topic.title}
              </h4>
              <Badge variant="outline" className="ml-2 shrink-0">
                #{index + 1}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: `${topic.category_color}20`,
                  color: topic.category_color,
                  borderColor: `${topic.category_color}40`,
                }}
              >
                {topic.category}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                {topic.reply_count} yanıt
              </span>
            </div>
          </Link>
        ))}
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/forum">
            Tümünü Gör
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}