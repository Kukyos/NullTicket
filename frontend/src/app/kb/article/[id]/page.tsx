'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ThumbsUp, ThumbsDown, Eye, Clock, Tag, Share2 } from 'lucide-react';
import { fetcher } from '@/lib/utils';

interface KBArticle {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  view_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<KBArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState<'helpful' | 'not_helpful' | null>(null);

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetcher(`/api/kb/${articleId}`);
      setArticle(data);
    } catch (err) {
      console.error('Failed to load article:', err);
      setError('Failed to load article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (rating: 'helpful' | 'not_helpful') => {
    if (!article) return;

    try {
      await fetcher(`/api/kb/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      setUserRating(rating);

      // Update local article data
      setArticle(prev => prev ? {
        ...prev,
        helpful_count: rating === 'helpful' ? prev.helpful_count + 1 : prev.helpful_count
      } : null);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'Article not found'}</div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Knowledge Base</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full">
                  {article.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.view_count} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{article.helpful_count} helpful</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

              {article.summary && (
                <p className="text-xl text-gray-300 mb-6">{article.summary}</p>
              )}
            </div>

            <button
              onClick={shareArticle}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors ml-4"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="prose prose-invert max-w-none">
          <div
            className="text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: article.content.replace(/\n/g, '<br>')
            }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rating Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => submitRating('helpful')}
              disabled={userRating !== null}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                userRating === 'helpful'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>Yes, helpful</span>
            </button>
            <button
              onClick={() => submitRating('not_helpful')}
              disabled={userRating !== null}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                userRating === 'not_helpful'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span>Not helpful</span>
            </button>
          </div>
          {userRating && (
            <p className="text-gray-400 text-sm mt-3">
              Thank you for your feedback!
            </p>
          )}
        </div>

        {/* Related Articles or Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <button
              onClick={() => window.open('/kb', '_blank')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Browse More Articles
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}