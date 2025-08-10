'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HeroSection() {
  const stats = [
    { icon: Users, value: '1000+', label: 'Aktif Üye' },
    { icon: TrendingUp, value: '500+', label: 'Trading Stratejisi' },
    { icon: BookOpen, value: '200+', label: 'Eğitici Makale' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-muted/30">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/5 to-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="h1">
              Türkiye&apos;nin en büyük{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                trader
              </span>{' '}
              topluluğu
            </h1>
            
            <p className="mx-auto max-w-3xl body-text text-lg sm:text-xl md:text-2xl text-muted-foreground">
              Stratejiler, analizler, tartışmalar ve profesyonel içerikler için doğru yerdesiniz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" asChild className="btn-text text-base">
              <Link href="/auth/register">
                Hemen Başla
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="btn-text text-base">
              <Link href="/articles">
                Makaleleri Keşfet
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="group relative overflow-hidden border-muted bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 transition-all group-hover:scale-110" />
                    <stat.icon className="relative mx-auto mb-4 h-8 w-8 text-primary transition-all group-hover:scale-110" />
                    <div className="relative">
                      <div className="metric-value text-3xl">{stat.value}</div>
                      <div className="mt-1 text-caption">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}