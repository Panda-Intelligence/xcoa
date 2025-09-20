'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowLeft, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/hooks/useLanguage';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  match_score: number;
  items_count: number;
  languages: string[];
  validation_status: string;
}

interface GoogleStyleSearchProps {
  user: object | null;
  accessToken: string;
  onBack: () => void;
}

export function GoogleStyleSearch({ onBack }: GoogleStyleSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchesRemaining, setSearchesRemaining] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          category: filterCategory,
          sortBy,
          page: 1,
          limit: 20
        }),
      });

      const data = await response.json() as { error?: string; results: SearchResult[]; searches_remaining: number };

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results);
      setSearchesRemaining(data.searches_remaining);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedResults = results
    .filter(result => filterCategory === "all" || result.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return b.match_score - a.match_score;
        case "name":
          return a.name.localeCompare(b.name);
        case "items":
          return b.items_count - a.items_count;
        default:
          return 0;
      }
    });

  const categories = [...new Set(results.map(r => r.category))];

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Google-style search interface */}
      {!hasSearched && (
        <div className="min-h-screen flex flex-col">
          {/* Header with back button and search remaining */}
          <div className="flex items-center justify-between p-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('search.go_back')}
            </Button>

            {searchesRemaining !== null && searchesRemaining !== -1 && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {t('search.searches_remaining').replace('{count}', searchesRemaining.toString())}
              </div>
            )}
          </div>

          {/* Main search area */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 -mt-20">
            {/* Logo */}
            <div className="mb-8 text-center">
              <h1 className="text-6xl md:text-7xl font-normal text-gray-800 mb-2 tracking-tight">
                eCOA Pro
              </h1>
            </div>

            {/* Search form */}
            <div className="w-full max-w-xl mb-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 focus-within:shadow-xl">
                    <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder={t('search.placeholder')}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-12 pr-12 h-14 text-base bg-transparent border-0 rounded-full focus:ring-0 focus:outline-none"
                      disabled={loading}
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-16 h-5 w-5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <div className="pr-3">
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                variant="outline"
                className="h-9 px-5 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                onClick={() => {
                  if (query.trim()) {
                    handleSearch();
                  }
                }}
                disabled={loading || !query.trim()}
              >
                {t('search.ecoa_search')}
              </Button>
              <Button
                variant="outline"
                className="h-9 px-5 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                onClick={() => {
                  setQuery("抑郁症筛查工具");
                  handleSearch();
                }}
                disabled={loading}
              >
                {t('search.feeling_lucky')}
              </Button>
            </div>

            {/* Quick suggestions */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3">{t('search.quick_search')}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "MMSE-2",
                  "PHQ-9",
                  "GAD-7",
                  "EORTC QLQ-C30",
                  "SF-36",
                  "EQ-5D-5L"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch();
                    }}
                    className="text-sm text-blue-600 hover:underline px-2 py-1"
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results section with clean Google-style layout */}
      {hasSearched && (
        <div className="bg-white min-h-screen">
          {/* Google-style search header */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-6 py-3">
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => setHasSearched(false)} className="text-gray-600">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl text-blue-600 cursor-pointer">eCOA Pro</h1>
                </div>

                {/* Search bar */}
                <div className="flex-1 max-w-2xl">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder={t('search.placeholder')}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="pl-10 pr-10 h-10 text-sm bg-transparent border-0 rounded-full focus:ring-0 focus:outline-none"
                          disabled={loading}
                        />
                        {query && (
                          <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="absolute right-10 h-4 w-4 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <div className="pr-3">
                          <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Search className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Search remaining indicator */}
                {searchesRemaining !== null && searchesRemaining !== -1 && (
                  <div className="text-xs text-gray-500">
                    {t('search.searches_remaining').replace('{count}', searchesRemaining.toString()).replace(': ', ' ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-6 py-4">

            {/* Error Alert */}
            {error && (
              <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            {/* Google-style search stats */}
            <div className="text-sm text-gray-600 mb-6">
              {loading ? (
                t('search.searching')
              ) : (
                t('search.results_stats').replace('{count}', filteredAndSortedResults.length.toString()).replace('{time}', `0.${Math.floor(Math.random() * 50) + 10}`)
              )}
            </div>

            {/* Google-style results list */}
            {filteredAndSortedResults.length > 0 ? (
              <div className="space-y-8">
                {filteredAndSortedResults.map((result) => (
                  <div key={result.id} className="max-w-2xl">
                    {/* URL */}
                    <div className="text-sm text-gray-700 mb-1">
                      ecoa-pro.com › scales › {result.id}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl text-blue-600 hover:underline cursor-pointer mb-2 leading-tight">
                      {result.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-700 leading-normal mb-3">
                      {result.description}
                    </p>

                    {/* Meta information in a cleaner format */}
                    <div className="text-xs text-gray-600 flex flex-wrap gap-4">
                      <span>{t('search.category')}: {result.category}</span>
                      <span>{t('search.items')}: {result.items_count}</span>
                      <span>{t('search.language')}: {result.languages.join(', ')}</span>
                      <span>{t('search.status')}: {result.validation_status}</span>
                      <span>{t('search.match_score')}: {result.match_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div className="py-20 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">
                  {t('search.no_results_query').replace('{query}', query)}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{t('search.suggestions_title')}:</p>
                  <ul className="list-none space-y-1 text-left max-w-md mx-auto">
                    <li>• {t('search.suggestion_check_spelling')}</li>
                    <li>• {t('search.suggestion_try_different')}</li>
                    <li>• {t('search.suggestion_try_common')}</li>
                    <li>• {t('search.suggestion_reduce_keywords')}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Google-style filters (optional, moved to bottom) */}
            {results.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">{t('search.filter_criteria')}:</span>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('search.all_categories')}</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">{t('search.sort_relevance')}</SelectItem>
                      <SelectItem value="name">{t('search.sort_name')}</SelectItem>
                      <SelectItem value="items">题项数量</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}