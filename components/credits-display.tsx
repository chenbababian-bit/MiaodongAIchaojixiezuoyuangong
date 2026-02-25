'use client';

import React from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
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
  const { credits, loading, error } = useCredits();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="text-sm">加载中...</span>
      </div>
    );
  }

  if (error) {
    // 未登录时静默隐藏，不显示错误
    return null;
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
