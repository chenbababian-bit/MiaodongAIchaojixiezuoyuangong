"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const tabs = [
  { id: "agents", label: "智能体" },
  { id: "avatars", label: "智能体形象" },
  { id: "knowledge", label: "知识库" },
];

export function AgentsPage() {
  const [activeTab, setActiveTab] = useState("agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      {/* Header with Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2 text-sm font-medium rounded-lg transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title and Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">我的智能体</h2>

          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">筛选</span>
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="recent">最近使用</SelectItem>
                  <SelectItem value="favorite">我的收藏</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="请输入"
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Button */}
            <Button>搜索</Button>
          </div>
        </div>

        {/* Empty State with New Agent Card */}
        <div className="flex items-start justify-start pt-8">
          <div
            className="group cursor-pointer"
            onClick={() => {
              // Handle new agent creation
              console.log("Create new agent");
            }}
          >
            <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-foreground">新增智能体</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
