'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: string;
  name: string;
  nameEn?: string;
  acronym: string;
  description: string;
  category: string;
  match_score: number;
  items_count: number;
  validation_status: string;
}

interface SearchResponse {
  results: SearchResult[];
  searches_remaining: number;
  is_authenticated: boolean;
  error?: string;
  message?: string;
  requiresAuth?: boolean;
}

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchesRemaining, setSearchesRemaining] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          page: 1,
          limit: 5
        }),
      });

      const data = await response.json() as SearchResponse;

      if (!response.ok) {
        if (data.requiresAuth) {
          setError(data.message || "Please sign in to continue searching.");
        } else {
          setError(data.error || 'Search failed');
        }
        return;
      }

      setResults(data.results || []);
      setSearchesRemaining(data.searches_remaining);
      setIsAuthenticated(data.is_authenticated);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (scaleId: string) => {
    if (isAuthenticated) {
      router.push(`/scales/${scaleId}`)
    } else {
      router.push(`/sign-in?redirect=/scales/${scaleId}`)
    }
  }

  return (
    <section className="bg-linear-to-br from-background to-secondary/20">
      <HeroHighlight>
        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: [20, -5, 0],
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
        >
          {t("landing.hero_title_start")}
          <Highlight className="text-black dark:text-white">
            {t("landing.hero_title_highlight")}
          </Highlight>
          {t("landing.hero_title_end")}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm text-primary">{t("landing.ai_intelligent_search")}</span>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {t("landing.hero_subtitle")}
                </p>
              </div>

              <div className="max-w-3xl mx-auto items-center">
                <div className="bg-background rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex relative items-center border-2 rounded-full bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20">
                    <Input
                      placeholder={t("landing.search_ecoa_scales")}
                      className="flex-1 px-3 h-16 py-5 text-lg rounded-full bg-transparent border-0 focus:ring-0 focus:outline-hidden"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      disabled={loading}
                    />
                    <div className="absolute right-2 -top-2 h-16 transform z-30">
                      <Button
                        size="lg"
                        onClick={handleSearch}
                        variant="outline"
                        className="mr-1 px-8 border-0 rounded-full"
                        disabled={loading}
                      >
                        <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                </div>
                {error && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                {searchesRemaining !== null && searchesRemaining >= 0 && !isAuthenticated && (
                  <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                    {searchesRemaining > 0 
                      ? `You have ${searchesRemaining} searches remaining today.`
                      : "This is your last search for today. Sign in for unlimited searches."}
                  </div>
                )}
                <div className="mt-3 flex justify-center items-center">
                  <div className="flex gap-1.5 text-muted-foreground">
                    <small className="font-sans antialiased text-sm text-current">Try example:</small>
                    <Badge className="ml-2 cursor-pointer" variant="outline" onClick={() => { setQuery("MMSE-2"); handleSearch(); }}>
                      MMSE-2
                    </Badge>
                    <Badge className="ml-2 cursor-pointer" variant="outline" onClick={() => { setQuery("PHQ-9"); handleSearch(); }}>
                      PHQ-9
                    </Badge>
                    <Badge className="ml-2 cursor-pointer" variant="outline" onClick={() => { setQuery("EORTC QLQ-C30"); handleSearch(); }}>
                      EORTC QLQ-C30
                    </Badge>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.h1>
      </HeroHighlight>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results for &ldquo;{query}&rdquo;</DialogTitle>
            <DialogDescription>
              {results.length > 0 
                ? `Found ${results.length} matching scales${!isAuthenticated ? ' (showing limited results - sign in for full access)' : ''}`
                : 'No results found'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {results.map((result) => (
              <Card key={result.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(result.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{result.name}</h3>
                      <Badge variant="outline">{result.acronym}</Badge>
                      {result.match_score && (
                        <Badge variant="secondary">{result.match_score}% match</Badge>
                      )}
                    </div>
                    {result.nameEn && (
                      <p className="text-sm text-muted-foreground italic mb-2">
                        {result.nameEn}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                      <span>{result.category}</span>
                      <span>{result.items_count} items</span>
                      <span>{result.validation_status}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(result.id);
                  }}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
            {results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No scales found matching your search.
              </div>
            )}
            {!isAuthenticated && results.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <p className="text-sm text-blue-900 mb-3">
                  Want to see more results and access full features?
                </p>
                <Button onClick={() => router.push('/sign-in')}>
                  Sign In for Full Access
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}