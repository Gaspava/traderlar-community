import { sendGAEvent } from '@next/third-parties/google';

// Event tracking fonksiyonları
export const analytics = {
  // Sayfa görüntüleme (otomatik olarak çalışır)
  pageView: (page_title: string, page_location: string) => {
    sendGAEvent({
      event: 'page_view',
      page_title,
      page_location,
    });
  },

  // Kullanıcı etkileşimleri
  trackEvent: (event_name: string, parameters: Record<string, any> = {}) => {
    sendGAEvent({
      event: event_name,
      ...parameters,
    });
  },

  // Makale okuma
  trackArticleRead: (article_title: string, article_id: string) => {
    sendGAEvent({
      event: 'article_read',
      article_title,
      article_id,
    });
  },

  // Forum etkileşimi
  trackForumInteraction: (action: string, topic_id?: string) => {
    sendGAEvent({
      event: 'forum_interaction',
      action,
      topic_id,
    });
  },

  // Strateji görüntüleme
  trackStrategyView: (strategy_id: string, strategy_title: string) => {
    sendGAEvent({
      event: 'strategy_view',
      strategy_id,
      strategy_title,
    });
  },

  // Kullanıcı kaydı
  trackUserSignup: (method: string) => {
    sendGAEvent({
      event: 'sign_up',
      method,
    });
  },

  // Arama yapma
  trackSearch: (search_term: string, results_count: number) => {
    sendGAEvent({
      event: 'search',
      search_term,
      results_count,
    });
  },

  // Sosyal paylaşım
  trackShare: (content_type: string, item_id: string, method: string) => {
    sendGAEvent({
      event: 'share',
      content_type,
      item_id,
      method,
    });
  },

  // Hata takibi
  trackError: (error_message: string, error_location: string) => {
    sendGAEvent({
      event: 'exception',
      description: error_message,
      fatal: false,
      error_location,
    });
  }
};

// TypeScript için tip tanımları
export type AnalyticsEvent = 
  | 'article_read'
  | 'forum_interaction'
  | 'strategy_view'
  | 'sign_up'
  | 'search'
  | 'share'
  | 'exception';

export interface EventParameters {
  [key: string]: string | number | boolean;
}