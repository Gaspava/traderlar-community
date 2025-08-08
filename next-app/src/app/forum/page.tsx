'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  Eye,
  ChevronRight,
  Filter,
  Plus,
  Bot,
  LineChart,
  GraduationCap,
  Code,
  PieChart,
  Bitcoin,
  User,
  Building,
  Brain,
  Scale,
  Sparkles,
  Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  topic_count: number;
  post_count: number;
  last_post?: {
    title: string;
    author: string;
    date: string;
  };
}

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    username: string;
  };
  created_at: string;
  reply_count: number;
  view_count: number;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [searchTopics, setSearchTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'popular' | 'recent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchForumTopics();
    } else {
      setSearchTopics([]);
    }
  }, [searchTerm]);

  const searchForumTopics = async () => {
    if (!searchTerm.trim()) {
      setSearchTopics([]);
      return;
    }

    try {
      setSearchLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          slug,
          content,
          created_at,
          reply_count,
          view_count,
          category:categories!forum_topics_category_id_fkey(
            id,
            name,
            slug,
            color
          ),
          author:users!forum_topics_author_id_fkey(
            id,
            name,
            username
          )
        `)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setSearchTopics(data || []);
    } catch (error) {
      console.error('Error searching topics:', error);
      setSearchTopics([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      
      // Get categories with topic and post counts
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!categories) {
        console.error('No categories found');
        return;
      }

      // Get last post for each category and counts
      const categoriesWithLastPost = await Promise.all(
        categories.map(async (category) => {
          // Get topic count
          const { count: topicCount } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          // Get post count for topics in this category
          const { data: topicsInCategory } = await supabase
            .from('forum_topics')
            .select('id')
            .eq('category_id', category.id);
          
          let postCount = 0;
          if (topicsInCategory && topicsInCategory.length > 0) {
            const topicIds = topicsInCategory.map(t => t.id);
            const { count } = await supabase
              .from('forum_posts')
              .select('*', { count: 'exact', head: true })
              .in('topic_id', topicIds);
            postCount = count || 0;
          }

          // Get last topic
          const { data: lastTopic } = await supabase
            .from('forum_topics')
            .select(`
              title,
              created_at,
              last_reply_at,
              author:users!forum_topics_author_id_fkey(name),
              last_reply_user:users!forum_topics_last_reply_user_id_fkey(name)
            `)
            .eq('category_id', category.id)
            .order('last_reply_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon || 'MessageCircle',
            color: category.color || '#10b981',
            topic_count: topicCount || 0,
            post_count: postCount || 0,
            last_post: lastTopic ? {
              title: lastTopic.title,
              author: lastTopic.last_reply_user?.name || lastTopic.author?.name || 'Unknown',
              date: formatDate(lastTopic.last_reply_at || lastTopic.created_at)
            } : null
          };
        })
      );

      setCategories(categoriesWithLastPost);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set some default categories if fetch fails
      setCategories([
        {
          id: '1',
          name: 'Genel Tartışma',
          slug: 'genel-tartisma',
          description: 'Trading dünyasıyla ilgili genel konular ve sohbetler',
          icon: 'MessageCircle',
          color: '#10b981',
          topic_count: 0,
          post_count: 0,
          last_post: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const filteredAndSortedCategories = categories
    .filter(category => 
      searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (filter) {
        case 'popular':
          return b.post_count - a.post_count;
        case 'recent':
          // In real app, sort by last post date
          return b.topic_count - a.topic_count;
        default:
          return 0;
      }
    });

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Filter and Search */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col xl:flex-row items-center justify-between gap-8"
            >
              {/* Page Title & Filter Buttons */}
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Forum</h1>
                  <p className="text-muted-foreground text-sm">
                    Topluluk tartışmalarına katılın
                  </p>
                </div>
                
                {/* Filter Buttons */}
                <div className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-lg rounded-2xl p-1.5 border border-border/40 shadow-xl">
                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={() => setFilter('all')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        filter === 'all'
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Tümü
                      </span>
                    </motion.button>
                    <motion.button
                      onClick={() => setFilter('popular')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        filter === 'popular'
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Popüler
                      </span>
                    </motion.button>
                    <motion.button
                      onClick={() => setFilter('recent')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        filter === 'recent'
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Son Konular
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="pl-6 pr-3 py-4">
                      <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Ana konu ara..."
                      className="flex-1 pr-6 py-4 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground/70 transition-all duration-300 min-w-[300px] lg:min-w-[400px]"
                    />
                    {searchTerm && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchTerm('')}
                        className="mr-4 p-1.5 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="text-lg">×</span>
                      </motion.button>
                    )}
                  </div>
                  {searchTerm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span>Aranıyor...</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Search Header */}
                          <div className="px-4 py-3 bg-muted/30 border-b border-border/30">
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Search className="w-3 h-3" />
                              <span>"{searchTerm}" için sonuçlar</span>
                            </div>
                          </div>

                          {/* Categories Results */}
                          {filteredAndSortedCategories.length > 0 && (
                            <div className="p-2">
                              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
                                Ana Konular ({filteredAndSortedCategories.length})
                              </div>
                              {filteredAndSortedCategories.slice(0, 3).map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/forum/${category.slug}`}
                                  className="block p-3 rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                                      style={{ backgroundColor: `${category.color}20` }}
                                    >
                                      <div style={{ color: category.color }}>
                                        {category.icon === 'MessageCircle' && <MessageCircle className="w-4 h-4" />}
                                        {category.icon === 'Bot' && <Bot className="w-4 h-4" />}
                                        {category.icon === 'TrendingUp' && <TrendingUp className="w-4 h-4" />}
                                        {category.icon === 'LineChart' && <LineChart className="w-4 h-4" />}
                                        {category.icon === 'GraduationCap' && <GraduationCap className="w-4 h-4" />}
                                        {category.icon === 'Code' && <Code className="w-4 h-4" />}
                                        {category.icon === 'PieChart' && <PieChart className="w-4 h-4" />}
                                        {category.icon === 'Bitcoin' && <Bitcoin className="w-4 h-4" />}
                                        {category.icon === 'Building' && <Building className="w-4 h-4" />}
                                        {category.icon === 'Brain' && <Brain className="w-4 h-4" />}
                                        {category.icon === 'Scale' && <Scale className="w-4 h-4" />}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-foreground text-sm">
                                        {category.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {category.description}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* Topics Results */}
                          {searchTopics.length > 0 && (
                            <div className="p-2 border-t border-border/30">
                              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
                                Forum Konuları ({searchTopics.length})
                              </div>
                              {searchTopics.map((topic) => (
                                <Link
                                  key={topic.id}
                                  href={`/forum/${topic.category.slug}/${topic.slug}`}
                                  className="block p-3 rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                  <div className="space-y-2">
                                    {/* Category Badge */}
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{ 
                                          backgroundColor: `${topic.category.color}20`,
                                          color: topic.category.color 
                                        }}
                                      >
                                        {topic.category.name}
                                      </div>
                                    </div>
                                    
                                    {/* Topic Title */}
                                    <div className="font-medium text-foreground text-sm line-clamp-1">
                                      {topic.title}
                                    </div>
                                    
                                    {/* Topic Content Preview */}
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                      {topic.content}
                                    </div>
                                    
                                    {/* Topic Meta */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>{topic.author.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3" />
                                        <span>{topic.reply_count}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        <span>{topic.view_count}</span>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* No Results */}
                          {filteredAndSortedCategories.length === 0 && searchTopics.length === 0 && (
                            <div className="p-6 text-center">
                              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <div className="text-sm text-muted-foreground">
                                "{searchTerm}" için sonuç bulunamadı
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/forum/${category.slug}`} className="block group">
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-card via-card/90 to-card/80 rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 h-full shadow-lg hover:shadow-xl backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-6 mb-6">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="p-4 rounded-xl flex-shrink-0 shadow-lg"
                          style={{ 
                            background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                            borderColor: `${category.color}30`
                          }}
                        >
                          {category.icon === 'MessageCircle' && <MessageCircle className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'Bot' && <Bot className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'TrendingUp' && <TrendingUp className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'LineChart' && <LineChart className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'GraduationCap' && <GraduationCap className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'Code' && <Code className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'PieChart' && <PieChart className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'Bitcoin' && <Bitcoin className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'Building' && <Building className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'Brain' && <Brain className="w-8 h-8" style={{ color: category.color }} />}
                          {category.icon === 'Scale' && <Scale className="w-8 h-8" style={{ color: category.color }} />}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 break-long-words">
                            {category.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                              <MessageCircle className="w-3 h-3 text-primary" />
                              <span className="font-semibold text-primary">{category.topic_count}</span>
                              <span className="text-primary/80">konu</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                              <Users className="w-3 h-3 text-secondary" />
                              <span className="font-semibold text-secondary">{category.post_count}</span>
                              <span className="text-secondary/80">mesaj</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed break-long-words">
                        {category.description}
                      </p>
                      
                      {category.last_post ? (
                        <div className="pt-6 border-t border-border/50">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">Son Aktivite</p>
                              <p className="text-sm font-medium text-foreground line-clamp-1 mb-2 break-long-words group-hover:text-primary transition-colors">
                                {category.last_post.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span className="font-medium">{category.last_post.author}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{category.last_post.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-6 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Sparkles className="w-3 h-3" />
                            <span className="italic">Henüz mesaj yok, ilk sen ol!</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}