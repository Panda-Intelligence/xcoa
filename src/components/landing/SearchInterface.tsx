import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Sparkles, Loader2, FileText, Globe, CheckCircle } from "lucide-react";

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

interface SearchInterfaceProps {
  user: any;
  accessToken: string;
}

export function SearchInterface({ user, accessToken }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchesRemaining, setSearchesRemaining] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9638053d/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results);
      setSearchesRemaining(data.searches_remaining);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">AI 智能量表检索</h2>
        <p className="text-muted-foreground">
          使用自然语言描述您的需求，AI 将为您推荐最适合的量表工具
        </p>
        {searchesRemaining !== null && searchesRemaining !== -1 && (
          <div className="text-sm text-muted-foreground">
            本月剩余搜索次数: <span className="font-medium">{searchesRemaining}</span>
          </div>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="例如：评估癌症患者生活质量的量表、抑郁症筛查工具..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 检索中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              开始 AI 检索
            </>
          )}
        </Button>
      </form>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">搜索结果</h3>
            <div className="text-sm text-muted-foreground">
              找到 {results.length} 个相关量表
            </div>
          </div>

          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      <CardDescription>{result.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      匹配度 {result.match_score}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      {result.category}
                    </Badge>
                    <Badge variant="outline">
                      {result.items_count} 题项
                    </Badge>
                    <Badge variant="outline">
                      <Globe className="w-3 h-3 mr-1" />
                      {result.languages.join(', ')}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {result.validation_status}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">查看详情</Button>
                    <Button size="sm" variant="outline">下载量表</Button>
                    <Button size="sm" variant="outline">使用指南</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto bg-secondary/50 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">未找到相关量表</h3>
            <p className="text-sm text-muted-foreground">
              请尝试使用不同的关键词或描述更具体的需求
            </p>
          </div>
        </div>
      )}
    </div>
  );
}