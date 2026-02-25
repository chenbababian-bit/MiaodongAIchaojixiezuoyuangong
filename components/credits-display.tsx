'use client';

import React from 'react';
import { CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/lib/credits-context';

interface CreditsDisplayProps {
  showIcon?: boolean;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

export function CreditsDisplay({
  showIcon = true,
  showLabel = true,
  compact = false,
  className = '',
}: CreditsDisplayProps) {
  const { credits, loading, error, refreshCredits } = useCredits();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="text-sm">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-red-500">积分加载失败</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshCredits}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">暂无积分</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showIcon && <CreditCard className="h-4 w-4" />}
        <span className="font-medium">{credits.balance.toLocaleString()}</span>
        {showLabel && <span className="text-sm text-muted-foreground">积分</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <CreditCard className="h-4 w-4" />}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="font-semibold">{credits.balance.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">积分</span>
        </div>
        {showLabel && (
          <div className="text-xs text-muted-foreground">
            可用余额
          </div>
        )}
      </div>
    </div>
  );
}
