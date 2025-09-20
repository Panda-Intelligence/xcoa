'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Lock, Star, Download, ExternalLink } from "lucide-react";
import { useLanguage } from '@/hooks/useLanguage';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  match_score: number;
  premium: boolean;
}

export function SearchResults() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results] = useState<SearchResult[]>([]);
  const [isLoading] = useState(false);
  const [user] = useState<null | object>(null);
  const [subscription] = useState("free");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    // Placeholder for user check logic
  };

  const handleSearch = async () => {
    // Placeholder for search logic
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-foreground">{t('search.title')}</h2>
          <p className="text-lg text-muted-foreground">
            {t('search.description')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex space-x-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading || !user}>
            {isLoading ? t('search.searching') : t('search.button')}
          </Button>
        </div>

        {/* Subscription Notice */}
        {user && subscription === "free" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {t('search.free_limitation')}
              </span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('search.results_title')}</h3>
              <span className="text-sm text-muted-foreground">
                {t('search.results_count').replace('{count}', results.length.toString())}
              </span>
            </div>

            <div className="grid gap-4">
              {results.map((result) => (
                <Card key={result.id} className="border border-border hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{result.name}</span>
                          {result.premium && subscription === "free" && (
                            <Lock className="h-4 w-4 text-yellow-600" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {result.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary">{result.category}</Badge>
                        <div className={`text-sm font-medium ${getMatchColor(result.match_score)}`}>
                          {t('search.match_score').replace('{score}', (result.match_score * 100).toFixed(0))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">4.5</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {t('search.used_by').replace('{count}', '1,200')}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('search.view_details')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={result.premium && subscription === "free"}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {result.premium && subscription === "free" ? t('search.need_upgrade') : t('search.download')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No User Prompt */}
        {!user && (
          <div className="text-center py-12 bg-secondary/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{t('search.login_prompt.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('search.login_prompt.description')}
            </p>
          </div>
        )}

        {/* Empty Results */}
        {user && results.length === 0 && query && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">{t('search.no_results.title')}</h3>
            <p className="text-muted-foreground">
              {t('search.no_results.description')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}