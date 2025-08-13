'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Eye,
  Heart,
  Calendar,
  ArrowUp,
  ArrowDown,
  Settings,
  Shield,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  articlesChange: number;
  usersChange: number;
  commentsChange: number;
  viewsChange: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
    articlesChange: 0,
    usersChange: 0,
    commentsChange: 0,
    viewsChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Mock data for development
      setStats({
        totalArticles: 234,
        totalUsers: 1567,
        totalComments: 4892,
        totalViews: 234567,
        articlesChange: 12.5,
        usersChange: 8.3,
        commentsChange: 15.7,
        viewsChange: 23.4
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
    datasets: [
      {
        label: 'Görüntülenme',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#000',
        pointBorderWidth: 2,
      },
      {
        label: 'Yeni Üye',
        data: [120, 190, 150, 250, 220, 300],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#000',
        pointBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12
        },
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString('tr-TR')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#374151',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          callback: function(value: any) {
            return value.toLocaleString('tr-TR');
          }
        }
      }
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    change: number; 
    icon: any; 
    color: string;
  }) => (
    <div className="bg-black rounded-xl p-6 border border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-neutral-400 text-sm">{title}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-purple-400"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Yönetim Paneli</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toplam Makale"
          value={stats.totalArticles}
          change={stats.articlesChange}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Toplam Üye"
          value={stats.totalUsers.toLocaleString('tr-TR')}
          change={stats.usersChange}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Toplam Yorum"
          value={stats.totalComments.toLocaleString('tr-TR')}
          change={stats.commentsChange}
          icon={MessageCircle}
          color="bg-purple-500"
        />
        <StatCard
          title="Toplam Görüntülenme"
          value={stats.totalViews.toLocaleString('tr-TR')}
          change={stats.viewsChange}
          icon={Eye}
          color="bg-orange-500"
        />
      </div>

      {/* Chart */}
      <div className="bg-black rounded-xl p-6 border border-neutral-800 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Site İstatistikleri</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Forum Management */}
        <Link
          href="/admin/forum-yonetimi"
          className="bg-black rounded-xl p-6 border border-neutral-800 hover:border-red-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-red-500">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-red-400 transition-colors">
                Forum Yönetimi
              </h3>
              <p className="text-sm text-neutral-400">
                Konuları toplu sil
              </p>
            </div>
          </div>
          <p className="text-neutral-300 text-sm">
            Forum konularını yönetin, spam içerikleri ve kural ihlallerini toplu olarak silin.
          </p>
        </Link>

        {/* User Management */}
        <div className="bg-black rounded-xl p-6 border border-neutral-800 opacity-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Kullanıcı Yönetimi
              </h3>
              <p className="text-sm text-neutral-400">
                Yakında gelecek
              </p>
            </div>
          </div>
          <p className="text-neutral-300 text-sm">
            Kullanıcıları yönetmek için özellikler yakında eklenecek.
          </p>
        </div>

        {/* Settings */}
        <div className="bg-black rounded-xl p-6 border border-neutral-800 opacity-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-purple-500">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Site Ayarları
              </h3>
              <p className="text-sm text-neutral-400">
                Yakında gelecek
              </p>
            </div>
          </div>
          <p className="text-neutral-300 text-sm">
            Site genelinde ayarları düzenlemek için panel yakında eklenecek.
          </p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-black rounded-xl p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-4">Son Makaleler</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Trading Stratejisi {i}</h4>
                  <p className="text-sm text-neutral-400">Ahmet Yılmaz • 2 saat önce</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    234
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    45
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-black rounded-xl p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-4">Yeni Üyeler</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium">Kullanıcı {i}</h4>
                  <p className="text-sm text-neutral-400">kullanici{i}@email.com</p>
                </div>
                <span className="text-xs text-neutral-500">
                  {i} saat önce
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}