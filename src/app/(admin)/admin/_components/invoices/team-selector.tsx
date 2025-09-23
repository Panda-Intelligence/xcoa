"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Building, Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  billingEmail?: string;
  legalName?: string;
}

interface TeamSelectorProps {
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
  disabled?: boolean;
}

export function TeamSelector({ selectedTeam, onTeamSelect, disabled }: TeamSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open, searchQuery]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "20");

      const response = await fetch(`/api/admin/teams?${params}`);
      const data = await response.json();

      if (data.success) {
        setTeams(data.teams || []);
      } else {
        console.error("加载团队失败:", data.error);
      }
    } catch (error) {
      console.error("加载团队失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (team: Team) => {
    onTeamSelect(team);
    setOpen(false);
  };

  return (
    <div>
      <Label>选择团队 *</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            disabled={disabled}
          >
            {selectedTeam ? (
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>{selectedTeam.name}</span>
                {selectedTeam.legalName && selectedTeam.legalName !== selectedTeam.name && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedTeam.legalName}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>选择团队...</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择团队</DialogTitle>
            <DialogDescription>
              为发票选择对应的团队客户
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索团队名称、域名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 团队列表 */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTeamSelect(team)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{team.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {team.slug}
                        </Badge>
                      </div>
                      
                      {team.legalName && team.legalName !== team.name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          法定名称: {team.legalName}
                        </p>
                      )}
                      
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      )}
                      
                      {team.billingEmail && (
                        <p className="text-xs text-muted-foreground mt-1">
                          账单邮箱: {team.billingEmail}
                        </p>
                      )}
                    </div>
                    
                    <Button size="sm" variant="outline">
                      选择
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "没有找到匹配的团队" : "暂无团队"}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}