import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://traderlar.com';
  const supabase = await createClient();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trading-stratejileri`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  
  // Dynamic forum topics
  const { data: topics } = await supabase
    .from('forum_topics')
    .select('id, slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
    
  const topicPages: MetadataRoute.Sitemap = topics?.map(topic => ({
    url: `${baseUrl}/forum/${topic.slug || topic.id}`,
    lastModified: new Date(topic.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) || [];
  
  // Dynamic articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })
    .limit(100);
    
  const articlePages: MetadataRoute.Sitemap = articles?.map(article => ({
    url: `${baseUrl}/articles/${article.slug || article.id}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  })) || [];
  
  return [...staticPages, ...topicPages, ...articlePages];
}