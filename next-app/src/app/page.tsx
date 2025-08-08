import MainLayout from '@/components/layout/MainLayout';
import HeroSection from '@/components/home/HeroSection';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedArticles from '@/components/home/FeaturedArticles';
import TrendingSidebar from '@/components/home/TrendingSidebar';
import ActiveUsersSidebar from '@/components/home/ActiveUsersSidebar';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Content - 2 columns */}
          <div className="space-y-12 lg:col-span-2">
            {/* Categories */}
            <CategoriesGrid />

            {/* Featured Articles */}
            <FeaturedArticles />
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Trending Topics */}
            <TrendingSidebar />

            {/* Active Users */}
            <ActiveUsersSidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}