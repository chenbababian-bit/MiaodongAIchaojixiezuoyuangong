'use client';

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ShoppingCart, Download, Filter, Search, CreditCard, Package, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 模拟订单数据
const mockOrders = Array.from({ length: 35 }, (_, i) => {
  const packages = [
    { name: "体验包", price: 10, credits: 100, content: "100积分" },
    { name: "入门包", price: 30, credits: 330, content: "330积分" },
    { name: "标准包", price: 50, credits: 600, content: "600积分" },
    { name: "进阶包", price: 100, credits: 1300, content: "1300积分" },
    { name: "专业包", price: 200, credits: 2800, content: "2800积分" },
    { name: "旗舰包", price: 500, credits: 7500, content: "7500积分" },
  ];
  const packageIndex = i % 6;
  const packageData = packages[packageIndex];
  
  const paymentMethods = ["微信支付", "支付宝", "银行卡", "Apple Pay"];
  const purchaseMethods = ["网页充值", "APP内购", "扫码支付"];
  const statuses = ["已完成", "处理中", "已取消", "失败"];
  
  return {
    id: `ORD-202402${String(1000 + i).padStart(4, '0')}`,
    packageName: packageData.name,
    packageContent: packageData.content,
    purchaseMethod: purchaseMethods[i % 3],
    paymentMethod: paymentMethods[i % 4],
    amount: packageData.price,
    status: statuses[i % 4],
    time: `2024-02-${String(26 - Math.floor(i / 2)).padStart(2, '0')} ${String(10 + (i % 10)).padStart(2, '0')}:${String(30 + (i % 30)).padStart(2, '0')}`,
    credits: packageData.credits,
  };
});

const ITEMS_PER_PAGE = 20;

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 过滤数据
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    // 模拟导出功能
    alert("订单导出功能即将上线");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "已完成": return "default";
      case "处理中": return "secondary";
      case "已取消": return "outline";
      case "失败": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">充值订单记录</h1>
          <p className="text-muted-foreground">
            查看您的所有充值订单，了解每一笔充值的详细信息
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          导出订单
        </Button>
      </div>

      {/* 搜索和过滤区域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索订单编号或套餐名称..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // 搜索时重置到第一页
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="订单状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="处理中">处理中</SelectItem>
                  <SelectItem value="已取消">已取消</SelectItem>
                  <SelectItem value="失败">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              更多筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 订单记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            订单明细
          </CardTitle>
          <CardDescription>
            共 {filteredOrders.length} 条订单记录，当前显示第 {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} 条
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">订单编号</TableHead>
                  <TableHead className="w-[100px]">套餐名称</TableHead>
                  <TableHead className="w-[120px]">套餐内容</TableHead>
                  <TableHead className="w-[100px]">购买方式</TableHead>
                  <TableHead className="w-[100px]">支付方式</TableHead>
                  <TableHead className="w-[100px] text-right">实付金额</TableHead>
                  <TableHead className="w-[100px]">支付状态</TableHead>
                  <TableHead className="w-[160px]">支付时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {order.packageName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {order.packageContent}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.purchaseMethod}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {order.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ¥{order.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status) as any}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {order.time}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      暂无订单记录
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ¥{mockOrders.filter(o => o.status === "已完成").reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">累计充值金额</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockOrders.filter(o => o.status === "已完成").reduce((sum, o) => sum + o.credits, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">累计获得积分</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockOrders.filter(o => o.status === "已完成").length}
            </div>
            <p className="text-sm text-muted-foreground">成功订单数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockOrders.filter(o => o.status === "处理中").length}
            </div>
            <p className="text-sm text-muted-foreground">处理中订单</p>
          </CardContent>
        </Card>
      </div>

      {/* 订单状态说明 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">订单状态说明</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">已完成</Badge>
              <span className="text-muted-foreground">支付成功，积分已到账</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">处理中</Badge>
              <span className="text-muted-foreground">支付处理中，请稍候</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">已取消</Badge>
              <span className="text-muted-foreground">订单已取消</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">失败</Badge>
              <span className="text-muted-foreground">支付失败，请重试</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}