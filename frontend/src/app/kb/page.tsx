'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, ThumbsUp, Eye, Clock } from 'lucide-react';
import { fetcher } from '@/lib/utils';

interface KBArticle {
  id: number;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  view_count: number;
  helpful_count: number;
  created_at: string;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPopularArticles();
  }, []);

  const loadPopularArticles = async () => {
    try {
      setLoading(true);
      const data = await fetcher('/api/kb/popular');
      setArticles(data);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError('Failed to load knowledge base articles');
    } finally {
      setLoading(false);
    }
  };

  const searchArticles = async () => {
    if (!searchQuery.trim()) {
      loadPopularArticles();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedCategory && { category: selectedCategory })
      });
      const data = await fetcher(`/api/kb/search?${params}`);
      setArticles(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchArticles();
  };

  const categories = [
    'network', 'hardware', 'software', 'password_reset',
    'access_request', 'sap_error', 'printer', 'email', 'vpn'
  ];

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <BookOpen className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Knowledge Base</h1>
              <p className="text-blue-100 text-lg">Find solutions to common IT issues</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for solutions..."
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-8">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Articles'}
          </h2>
          <span className="text-gray-400">
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try different keywords or browse popular articles'
                : 'Check back later for new articles'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
                onClick={() => window.open(`/kb/article/${article.id}`, '_blank')}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full">
                    {article.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {article.title}
                </h3>

                {article.summary && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{article.view_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{article.helpful_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}