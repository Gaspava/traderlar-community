'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MessageCircle, 
  Bot, 
  TrendingUp, 
  LineChart, 
  GraduationCap, 
  Code, 
  PieChart, 
  Bitcoin,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categories = [
  {
    name: 'Genel Tartışma',
    slug: 'genel-tartisma',
    description: 'Trading dünyasıyla ilgili genel konular',
    icon: MessageCircle,
    color: 'emerald',
    stats: { topics: 245, posts: 1823 }
  },
  {
    name: 'Algoritmik Ticaret',
    slug: 'algoritmik-ticaret',
    description: 'Algoritmik trading stratejileri ve bot geliştirme',
    icon: Bot,
    color: 'blue',
    stats: { topics: 189, posts: 2341 }
  },
  {
    name: 'Strateji Paylaşımı',
    slug: 'strateji-paylasimi',
    description: 'Trading stratejilerini paylaşın ve tartışın',
    icon: TrendingUp,
    color: 'yellow',
    stats: { topics: 156, posts: 987 }
  },
  {
    name: 'Piyasa Analizleri',
    slug: 'piyasa-analizleri',
    description: 'Güncel piyasa analizleri ve tahminler',
    icon: LineChart,
    color: 'red',
    stats: { topics: 312, posts: 2145 }
  },
  {
    name: 'Eğitim Kaynakları',
    slug: 'egitim-kaynaklari',
    description: 'Trading eğitimi, kitaplar ve kurslar',
    icon: GraduationCap,
    color: 'purple',
    stats: { topics: 145, posts: 876 }
  },
  {
    name: 'Yazılım ve Otomasyon',
    slug: 'yazilim-ve-otomasyon',
    description: 'Trading yazılımları, API entegrasyonları',
    icon: Code,
    color: 'cyan',
    stats: { topics: 234, posts: 1567 }
  },
];

const colorVariants = {
  emerald: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
  red: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
  purple: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20',
};

export default function CategoriesGrid() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kategoriler</h2>
          <p className="text-muted-foreground mt-1">Topluluğumuzda en aktif tartışma alanları</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/forum">
            Tümünü Gör
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          const colorClass = colorVariants[category.color as keyof typeof colorVariants];
          
          return (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/forum/${category.slug}`}>
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg p-2.5 transition-colors ${colorClass}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="font-normal">
                        <span className="font-medium">{category.stats.topics}</span>
                        <span className="ml-1 text-muted-foreground">Konu</span>
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        <span className="font-medium">{category.stats.posts}</span>
                        <span className="ml-1 text-muted-foreground">Mesaj</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}