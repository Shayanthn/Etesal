export type NewsCategory = 'network_censorship' | 'security_privacy' | 'tech_world' | 'ai_dev';

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string[];
  category: NewsCategory;
  categoryLabelFa: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: 'iranian' | 'international';
  author: string;
  publishedAt: string; // ISO 8601 string
  readTimeMinutes: number;
  imageUrl: string;
  tags: string[];
  isBreaking?: boolean;
  viewsCount?: number;
}
