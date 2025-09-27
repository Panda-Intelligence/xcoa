"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Check, X, Plus, Building, User, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyrightHolder {
  id: string;
  name: string;
  nameEn?: string;
  organizationType: string;
  contactEmail?: string;
  scalesCount?: number;
  isActive: number;
  isVerified: number;
}

interface CopyrightHolderSearchProps {
  value?: string;
  onSelect: (holderId: string | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CopyrightHolderSearch({
  value,
  onSelect,
  placeholder = "搜索版权方...",
  label = "版权方",
  required = false,
  disabled = false,
}: CopyrightHolderSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [holders, setHolders] = useState<CopyrightHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHolder, setSelectedHolder] = useState<CopyrightHolder | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 获取选中的版权方信息
  useEffect(() => {
    if (value && !selectedHolder) {
      fetchHolderById(value);
    } else if (!value && selectedHolder) {
      setSelectedHolder(null);
    }
  }, [value]);

  // 搜索版权方
  const searchHolders = async (query: string) => {
    if (!query.trim()) {
      setHolders([]);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("search", query);
      params.append("limit", "20");
      params.append("status", "active"); // 只显示活跃的版权方

      const response = await fetch(`/api/admin/copyright-holders?${params}`);
      const data = await response.json();

      if (data.success) {
        setHolders(data.holders || []);
      } else {
        console.error("搜索版权方失败:", data.error);
      }
    } catch (error) {
      console.error("搜索版权方错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 根据ID获取版权方信息
  const fetchHolderById = async (holderId: string) => {
    try {
      const response = await fetch(`/api/admin/copyright-holders/${holderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedHolder(data.holder);
      }
    } catch (error) {
      console.error("获取版权方信息错误:", error);
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (query: string) => {
    setSearchTerm(query);
    
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的搜索定时器（防抖）
    searchTimeoutRef.current = setTimeout(() => {
      searchHolders(query);
    }, 300);
  };

  // 选择版权方
  const handleSelect = (holder: CopyrightHolder) => {
    setSelectedHolder(holder);
    onSelect(holder.id);
    setOpen(false);
    setSearchTerm("");
    setHolders([]);
  };

  // 清除选择
  const handleClear = () => {
    setSelectedHolder(null);
    onSelect(null);
    setSearchTerm("");
    setHolders([]);
  };

  // 获取组织类型图标
  const getOrgIcon = (type: string) => {
    switch (type) {
      case 'publisher':
        return <BookOpen className="w-3 h-3" />;
      case 'research_institution':
        return <Building className="w-3 h-3" />;
      case 'individual':
        return <User className="w-3 h-3" />;
      case 'foundation':
        return <Users className="w-3 h-3" />;
      default:
        return <Building className="w-3 h-3" />;
    }
  };

  // 获取组织类型标签
  const getOrgLabel = (type: string) => {
    const labels = {
      publisher: "出版商",
      research_institution: "研究机构",
      individual: "个人",
      foundation: "基金会",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {selectedHolder ? (
        // 显示已选择的版权方
        <div className="border rounded-md p-3 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getOrgIcon(selectedHolder.organizationType)}
              <div>
                <div className="font-medium text-sm">{selectedHolder.name}</div>
                {selectedHolder.nameEn && (
                  <div className="text-xs text-muted-foreground">{selectedHolder.nameEn}</div>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getOrgLabel(selectedHolder.organizationType)}
                  </Badge>
                  {selectedHolder.isVerified === 1 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      已验证
                    </Badge>
                  )}
                  {selectedHolder.scalesCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {selectedHolder.scalesCount} 个量表
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // 搜索界面
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                <span className="text-muted-foreground">{placeholder}</span>
              </div>
              <Plus className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="输入版权方名称搜索..."
                value={searchTerm}
                onValueChange={handleSearchChange}
              />
              <CommandList>
                {loading ? (
                  <CommandEmpty>搜索中...</CommandEmpty>
                ) : holders.length === 0 ? (
                  <CommandEmpty>
                    {searchTerm ? "未找到匹配的版权方" : "请输入搜索关键词"}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {holders.map((holder) => (
                      <CommandItem
                        key={holder.id}
                        onSelect={() => handleSelect(holder)}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center space-x-3">
                          {getOrgIcon(holder.organizationType)}
                          <div>
                            <div className="font-medium text-sm">{holder.name}</div>
                            {holder.nameEn && (
                              <div className="text-xs text-muted-foreground">{holder.nameEn}</div>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getOrgLabel(holder.organizationType)}
                              </Badge>
                              {holder.isVerified === 1 && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  已验证
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {holder.scalesCount || 0} 个量表
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      
      {/* 无版权方选项 */}
      {!selectedHolder && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(null)}
          className="w-full text-muted-foreground"
          disabled={disabled}
        >
          <X className="w-3 h-3 mr-2" />
          无版权方
        </Button>
      )}
    </div>
  );
}