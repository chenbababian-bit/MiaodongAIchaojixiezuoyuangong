'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  Copy,
  Loader2,
  Filter,
  Calendar,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/app-layout';

interface Document {
  id: string;
  title: string;
  content: string;
  template_name?: string;
  template_category?: string;
  word_count: number;
  credits_consumed: number;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 获取文档列表
  useEffect(() => {
    fetchDocuments();
  }, [searchQuery]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const url = `/api/documents?search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setDocuments(result.data);
      } else {
        toast.error('获取文档列表失败');
      }
    } catch (error) {
      console.error('获取文档列表错误:', error);
      toast.error('加载失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = (doc: Document) => {
    setSelectedDoc(doc);
    setShowDetailDialog(true);
  };

  // 复制内容
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('内容已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文档吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('文档已删除');
        fetchDocuments();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      console.error('删除文档错误:', error);
      toast.error('删除失败，请重试');
    }
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

  // 统计数据
  const totalDocs = documents.length;
  const totalWords = documents.reduce((sum, doc) => sum + doc.word_count, 0);
  const totalCredits = documents.reduce((sum, doc) => sum + doc.credits_consumed, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的文档</h1>
          <p className="text-muted-foreground">
            管理您生成的所有AI文档内容
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalDocs}</div>
                  <p className="text-sm text-muted-foreground">总文档数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <Hash className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalWords.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">总字数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalCredits.toFixed(3)}</div>
                  <p className="text-sm text-muted-foreground">消耗积分</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索文档标题或内容..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 文档列表 */}
        <Card>
          <CardHeader>
            <CardTitle>文档列表</CardTitle>
            <CardDescription>
              {loading ? '加载中...' : `共 ${totalDocs} 篇文档`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">加载中...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">暂无文档</p>
                <p className="text-sm text-muted-foreground mt-2">
                  开始使用AI生成功能创建您的第一篇文档吧
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead className="text-right">字数</TableHead>
                      <TableHead className="text-right">积分</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {doc.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doc.template_name || '未知类型'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.word_count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.credits_consumed.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(doc.content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 查看详情对话框 */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDoc?.title}</DialogTitle>
              <DialogDescription>
                {selectedDoc?.template_name} · {selectedDoc?.word_count} 字 ·
                创建于 {selectedDoc && formatDate(selectedDoc.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans">
                  {selectedDoc?.content}
                </pre>
              </div>
              <div className="mt-6 flex gap-2">
                <Button
                  onClick={() => selectedDoc && handleCopy(selectedDoc.content)}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  复制内容
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
