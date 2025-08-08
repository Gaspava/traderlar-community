'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  FileText, 
  User, 
  MessageSquare, 
  TrendingUp,
  SortAsc,
  X
} from 'lucide-react';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentType = searchParams.get('type') || 'all';
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentCategory = searchParams.get('category') || '';
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };
  
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('type');
    params.delete('sort');
    params.delete('category');
    router.push(`/search?${params.toString()}`);
  };
  
  const hasActiveFilters = currentType !== 'all' || currentSort !== 'relevance' || currentCategory;
  
  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Aktif Filtreler</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Temizle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentType !== 'all' && (
                <Badge variant="secondary">
                  Tür: {currentType}
                  <button
                    onClick={() => updateFilter('type', 'all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentSort !== 'relevance' && (
                <Badge variant="secondary">
                  Sıralama: {currentSort === 'date' ? 'Tarih' : 'Popülerlik'}
                  <button
                    onClick={() => updateFilter('sort', 'relevance')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentCategory && (
                <Badge variant="secondary">
                  Kategori: {currentCategory}
                  <button
                    onClick={() => updateFilter('category', '')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Content Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            İçerik Türü
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentType} onValueChange={(value) => updateFilter('type', value)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="type-all" />
                <Label htmlFor="type-all" className="cursor-pointer">
                  Tümü
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="articles" id="type-articles" />
                <Label htmlFor="type-articles" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Makaleler
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="users" id="type-users" />
                <Label htmlFor="type-users" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Kullanıcılar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="topics" id="type-topics" />
                <Label htmlFor="type-topics" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  Forum Konuları
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strategies" id="type-strategies" />
                <Label htmlFor="type-strategies" className="flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="h-4 w-4" />
                  Stratejiler
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Sort Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SortAsc className="h-4 w-4" />
            Sıralama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentSort} onValueChange={(value) => updateFilter('sort', value)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="relevance" id="sort-relevance" />
                <Label htmlFor="sort-relevance" className="cursor-pointer">
                  En Alakalı
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="sort-date" />
                <Label htmlFor="sort-date" className="cursor-pointer">
                  En Yeni
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="popular" id="sort-popular" />
                <Label htmlFor="sort-popular" className="cursor-pointer">
                  En Popüler
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}