'use client';

/**
 * 积分显示组件
 * 显示用户当前积分余额，支持实时更新
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Coins, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CreditsDisplayProps {
  className?: string;
  showRefresh?: boolean;
  compact?: boolean;
}

export function CreditsDisplay({
  className,
  showRefresh = true,
  compact = false,
}: CreditsDisplayProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBalance(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // 如果没有记录，显示0（新用户会在首次使用时自动初始化）
        if (error.code === 'PGRST116') {
          setBalance(0);
        } else {
          console.error('获取积分失败:', error);
        }
        return;
      }

      setBalance(data?.balance ?? 0);
    } catch (err) {
      console.error('获取积分异常:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchBalance();
        } else {
          setBalance(null);
        }
      }
    );

    // 监听积分表变化（实时更新）
    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_credits',
        },
        (payload) => {
          // 更新余额
          if (payload.new && typeof payload.new.balance === 'number') {
            setBalance(payload.new.balance);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchBalance]);

  // 未登录或加载中不显示
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-6 w-20 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (balance === null) {
    return null;
  }

  // 紧凑模式
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1 text-sm', className)}>
        <Coins className="h-4 w-4 text-amber-500" />
        <span className="font-medium">{balance.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              'bg-amber-50 dark:bg-amber-950/30',
              'border border-amber-200 dark:border-amber-800',
              'transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/50',
              className
            )}
          >
            <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {balance.toLocaleString()} 积分
            </span>
            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-5 w-5 p-0',
                  'hover:bg-amber-200 dark:hover:bg-amber-900',
                  refreshing && 'animate-spin'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  fetchBalance(true);
                }}
                disabled={refreshing}
              >
                <RefreshCw className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>当前积分余额</p>
          <p className="text-xs text-muted-foreground">
            每次AI生成会根据字数扣除积分
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * 积分消费提示组件
 * 显示本次消费的积分信息
 */
interface CreditsUsageProps {
  used: number;
  remaining: number;
  wordCount: number;
  className?: string;
}

export function CreditsUsage({
  used,
  remaining,
  wordCount,
  className,
}: CreditsUsageProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 text-xs text-muted-foreground',
        'px-3 py-2 rounded-lg bg-muted/50',
        className
      )}
    >
      <span className="flex items-center gap-1">
        <Coins className="h-3 w-3" />
        消费 {used} 积分
      </span>
      <span>|</span>
      <span>生成 {wordCount} 字</span>
      <span>|</span>
      <span>剩余 {remaining} 积分</span>
    </div>
  );
}
