'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  Star,
  Eye,
  Heart,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface Strategy {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  timeframe: string;
  risk_level: string;
  expected_return: string;
  market_types: string[];
  is_premium: boolean;
  view_count: number;
  like_count: number;
  rating: number;
  created_at: string;
}

interface ProfileStrategiesProps {
  userId: string;
}

export default function ProfileStrategies({ userId }: ProfileStrategiesProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadStrategies();
  }, [userId]);
  
  const loadStrategies = async () => {
    try {
      const supabase = createClient();
      
      const { data } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
        
      if (data) {
        setStrategies(data);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'düşük':
        return 'text-green-600';
      case 'orta':
        return 'text-yellow-600';
      case 'yüksek':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (strategies.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Henüz strateji paylaşılmamış</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {strategies.map((strategy) => (
        <Card key={strategy.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={`/strategies/${strategy.slug}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {strategy.title}
                  </CardTitle>
                  
                  <CardDescription className="mt-2 line-clamp-2">
                    {strategy.description}
                  </CardDescription>
                </div>
                
                {strategy.is_premium && (
                  <Badge variant="default" className="ml-2 bg-gradient-to-r from-amber-500 to-amber-600">
                    <Lock className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Strategy Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{strategy.timeframe}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${getRiskColor(strategy.risk_level)}`} />
                  <span className={getRiskColor(strategy.risk_level)}>
                    {strategy.risk_level} Risk
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{strategy.expected_return}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{strategy.category}</Badge>
                </div>
              </div>
              
              {/* Markets */}
              <div className="flex flex-wrap gap-2">
                {strategy.market_types.map((market) => (
                  <Badge key={market} variant="secondary">
                    {market}
                  </Badge>
                ))}
              </div>
              
              {/* Rating & Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {strategy.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{strategy.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{strategy.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{strategy.like_count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}