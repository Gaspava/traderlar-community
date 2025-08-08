'use client';

import { User, UserStats, TradingPerformance, UserAchievement } from '@/lib/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  Target,
  Activity,
  DollarSign,
  Percent,
  BarChart3,
  Trophy,
  Twitter,
  Github,
  Linkedin
} from 'lucide-react';

interface ProfileStatsProps {
  user: User;
  stats?: UserStats;
  tradingPerformance?: TradingPerformance[];
  achievements?: UserAchievement[];
}

export default function ProfileStats({ 
  user, 
  stats, 
  tradingPerformance = [],
  achievements = []
}: ProfileStatsProps) {
  // Ensure arrays are always arrays
  const safePerformance = Array.isArray(tradingPerformance) ? tradingPerformance : [];
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  
  const latestPerformance = safePerformance.length > 0 ? safePerformance[0] : null;
  const totalPnL = safePerformance.reduce((acc, perf) => acc + (perf.total_pnl || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Trading Performance Card */}
      {latestPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trading Performansı
            </CardTitle>
            <CardDescription>
              Son 6 aylık özet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Toplam P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                <p className="text-2xl font-bold">
                  %{latestPerformance.win_rate || 0}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kazanan İşlemler</span>
                <span className="text-green-600">{latestPerformance.winning_trades}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kaybeden İşlemler</span>
                <span className="text-red-600">{latestPerformance.losing_trades}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ortalama Kazanç</span>
                <span className="text-green-600">
                  +{latestPerformance.average_win?.toLocaleString('tr-TR') || 0} ₺
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ortalama Kayıp</span>
                <span className="text-red-600">
                  -{Math.abs(latestPerformance.average_loss || 0).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
            
            {latestPerformance.profit_factor && (
              <div>
                <div className="flex justify-between text-sm">
                  <span>Profit Factor</span>
                  <span>{latestPerformance.profit_factor.toFixed(2)}</span>
                </div>
                <Progress 
                  value={Math.min(latestPerformance.profit_factor * 20, 100)} 
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Achievements Card */}
      {safeAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Başarılar
            </CardTitle>
            <CardDescription>
              {safeAchievements.length} başarı kazanıldı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeAchievements.slice(0, 5).map((userAchievement) => (
                <div key={userAchievement.id} className="flex items-center gap-3">
                  <div className="text-2xl">{userAchievement.achievement?.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {userAchievement.achievement?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userAchievement.achievement?.description}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    +{userAchievement.achievement?.points} XP
                  </Badge>
                </div>
              ))}
            </div>
            {safeAchievements.length > 5 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                ve {safeAchievements.length - 5} başarı daha...
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Community Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Topluluk İstatistikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Yararlı Oylar</span>
                <span className="font-medium">{stats.helpful_votes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">En İyi Cevaplar</span>
                <span className="font-medium">{stats.best_answers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paylaşılan Stratejiler</span>
                <span className="font-medium">{stats.strategies_shared}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Alınan Beğeniler</span>
                <span className="font-medium">{stats.total_likes_received}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Social Links */}
      {(user.twitter || user.github || user.linkedin) && (
        <Card>
          <CardHeader>
            <CardTitle>Sosyal Medya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.twitter && (
                <a
                  href={`https://twitter.com/${user.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                  <span>@{user.twitter}</span>
                </a>
              )}
              {user.github && (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                >
                  <Github className="h-5 w-5" />
                  <span>{user.github}</span>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={`https://linkedin.com/in/${user.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>{user.linkedin}</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}