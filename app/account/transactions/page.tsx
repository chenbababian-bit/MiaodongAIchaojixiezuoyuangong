'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { History, Download, Filter, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCredits } from "@/lib/credits-context";

interface Transaction {
  id: string;
  transaction_type: 'consumption' | 'recharge' | 'gift' | 'refund' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  template_name?: string;
  description?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
  const { credits } = useCredits();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取交易记录
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/transactions?limit=100');
        const result = await response.json();

        if (result.success) {
          setTransactions(result.data);
        } else {
          setError('获取交易记录失败');
        }
      } catch (err) {
        console.error('获取交易记录错误:', err);
        setError('加载失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // 过滤数据
  const filteredTransactions = transactions.filter(transaction => {
    const searchText = searchQuery.toLowerCase();
    return (
      transaction.template_name?.toLowerCase().includes(searchText) ||
      transaction.description?.toLowerCase().includes(searchText)
    );
  });

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
    alert("导出功能即将上线");
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算统计数据
  const totalConsumed = transactions
    .filter(t => t.transaction_type === 'consumption')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const consumptionCount = transactions.filter(t => t.transaction_type === 'consumption').length;

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
                  setCurrentPage(1);
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
            {loading ? '加载中...' : `共 ${filteredTransactions.length} 条记录，当前显示第 ${startIndex + 1}-${Math.min(endIndex, filteredTransactions.length)} 条`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
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
                          <TableCell className="font-medium">{formatDate(transaction.created_at)}</TableCell>
                          <TableCell>{transaction.template_name || transaction.description || '未知操作'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={transaction.amount < 0 ? "destructive" : "default"}>
                              {transaction.amount > 0 ? "+" : ""}{transaction.amount.toFixed(3)} 积分
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {transaction.balance_after.toFixed(3)} 积分
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
            </>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {totalConsumed.toFixed(3)}
            </div>
            <p className="text-sm text-muted-foreground">累计消耗积分</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {consumptionCount}
            </div>
            <p className="text-sm text-muted-foreground">总消费次数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {credits?.balance.toFixed(3) || "0.000"}
            </div>
            <p className="text-sm text-muted-foreground">当前剩余积分</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
