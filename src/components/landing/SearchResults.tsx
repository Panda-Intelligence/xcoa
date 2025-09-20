import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Lock, Star, Download, ExternalLink } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  match_score: number;
  premium: boolean;
}

export function SearchResults() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState("free");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {

  };

  const handleSearch = async () => {

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
          <h2 className="text-3xl font-bold text-foreground">AI 智能搜索</h2>
          <p className="text-lg text-muted-foreground">
            使用自然语言描述您的需求，AI 将为您推荐最适合的量表
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex space-x-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="例如：评估癌症患者生活质量的量表..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading || !user}>
            {isLoading ? "搜索中..." : "搜索"}
          </Button>
        </div>

        {/* Subscription Notice */}
        {user && subscription === "free" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                免费版本限制：仅显示基础量表，升级至专业版获取完整 AI 推荐
              </span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">搜索结果</h3>
              <span className="text-sm text-muted-foreground">
                找到 {results.length} 个相关量表
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
                          匹配度: {(result.match_score * 100).toFixed(0)}%
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
                          已被 1,200+ 研究使用
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          查看详情
                        </Button>
                        <Button
                          size="sm"
                          disabled={result.premium && subscription === "free"}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {result.premium && subscription === "free" ? "需要升级" : "下载"}
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
            <h3 className="text-lg font-semibold mb-2">开始使用 AI 搜索</h3>
            <p className="text-muted-foreground mb-4">
              登录后即可使用 AI 智能搜索功能
            </p>
          </div>
        )}

        {/* Empty Results */}
        {user && results.length === 0 && query && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">未找到相关结果</h3>
            <p className="text-muted-foreground">
              尝试使用不同的关键词或更具体的描述
            </p>
          </div>
        )}
      </div>
    </section>
  );
}