'use client';

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { History, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// 模拟消费记录数据
const mockTransactions = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  time: `2024-02-${String(26 - Math.floor(i / 3)).padStart(2, '0')} ${String(10 + (i % 10)).padStart(2, '0')}:${String(30 + (i % 30)).padStart(2, '0')}`,
  function: [
    "小红书爆款文案生成",
    "微信公众号文章撰写",
    "抖音短视频脚本",
    "知乎深度回答",
    "微博热点文案",
    "品牌定位策略",
    "市场分析报告",
    "创意广告文案",
    "产品介绍文案",
    "活动策划方案"
  ][i % 10],
  consumed: -[5, 10, 8, 12, 15, 20, 25, 30, 40, 50][i % 10],
  remaining: 1000 - (i + 1) * [5, 10, 8, 12, 15, 20, 25, 30, 40, 50][i % 10],
}));

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤数据
  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.function.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 分页计算
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    // 模拟导出功能
    alert("导出功能即将上线");
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">积分消费记录</h1>
          <p className="text-muted-foreground">
            查看您的积分消费明细，了解每一笔积分的使用情况
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          导出记录
        </Button>
      </div>

      {/* 搜索和过滤区域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索功能名称..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // 搜索时重置到第一页
                }}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 消费记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            消费明细
          </CardTitle>
          <CardDescription>
            共 {filteredTransactions.length} 条记录，当前显示第 {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} 条
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">时间</TableHead>
                  <TableHead>使用功能</TableHead>
                  <TableHead className="w-[120px] text-right">消耗积分</TableHead>
                  <TableHead className="w-[120px] text-right">剩余积分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.time}</TableCell>
                      <TableCell>{transaction.function}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={transaction.consumed < 0 ? "destructive" : "default"}>
                          {transaction.consumed > 0 ? "+" : ""}{transaction.consumed} 积分
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.remaining.toLocaleString()} 积分
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      暂无消费记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="text-center text-sm text-muted-foreground mt-2">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {Math.abs(mockTransactions.reduce((sum, t) => sum + (t.consumed < 0 ? t.consumed : 0), 0)).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">累计消耗积分</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockTransactions.length}
            </div>
            <p className="text-sm text-muted-foreground">总消费次数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {mockTransactions[mockTransactions.length - 1]?.remaining.toLocaleString() || "0"}
            </div>
            <p className="text-sm text-muted-foreground">当前剩余积分</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}