'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload,
  X,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/supabase/types';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    is_published: false,
    selected_categories: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set mock categories
      setCategories([
        { id: '1', name: 'Trading Stratejileri', slug: 'trading-stratejileri', color: '#10b981', created_at: new Date().toISOString() },
        { id: '2', name: 'Teknik Analiz', slug: 'teknik-analiz', color: '#3b82f6', created_at: new Date().toISOString() },
        { id: '3', name: 'Piyasa Analizi', slug: 'piyasa-analizi', color: '#f59e0b', created_at: new Date().toISOString() },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Makale oluşturulamadı');
      }

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      alert(error instanceof Error ? error.message : 'Makale oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const insertFormatting = (type: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = '';

    switch (type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'list':
        newText = `\n- ${selectedText}`;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        break;
      case 'image':
        newText = `![${selectedText}](image-url)`;
        break;
      default:
        newText = selectedText;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Yeni Makale</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
            {previewMode ? 'Düzenle' : 'Önizle'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Makale başlığını girin"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          {/* Slug */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <label htmlFor="slug" className="block text-sm font-medium text-neutral-300 mb-2">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">/articles/</span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="otomatik-olusturulur"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-300 mb-2">
              Özet *
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Makale özeti (SEO için önemli)"
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              required
            />
          </div>

          {/* Content */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-neutral-300">
                İçerik * (Markdown destekler)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting('bold')}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('italic')}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('list')}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('link')}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('image')}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            {previewMode ? (
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            ) : (
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Makale içeriğini yazın..."
                rows={20}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none font-mono text-sm"
                required
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Yayın Ayarları</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded border-neutral-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-white">Hemen yayınla</span>
              </label>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Kategoriler</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.selected_categories.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          selected_categories: [...prev.selected_categories, category.id]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          selected_categories: prev.selected_categories.filter(id => id !== category.id)
                        }));
                      }
                    }}
                    className="rounded border-neutral-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-white">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-black rounded-xl p-6 border border-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-4">Kapak Görseli</h3>
            <div className="space-y-4">
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                placeholder="Görsel URL'si"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}