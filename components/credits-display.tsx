'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';
import { useCredits } from '@/lib/credits-context';

interface CreditsDisplayProps {
  className?: string;
}

export function CreditsDisplay({ className = '' }: CreditsDisplayProps) {
  const { credits, loading, error } = useCredits();
  const router = useRouter();

  // 未登录时静默隐藏
  if (error === '请先登录' || (!loading && !credits && error)) {
    return null;
  }

  if (loading) {
    return (
      <div className={`h-8 w-24 animate-pulse rounded-lg bg-muted ${className}`} />
    );
  }

  if (!credits) return null;

  return (
    <button
      onClick={() => router.push('/credits')}
      className={`flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-muted ${className}`}
      title="点击充值积分"
    >
      <Coins className="h-3.5 w-3.5 text-amber-500" />
      <span className="font-medium text-foreground">{Number(credits.balance).toFixed(3)}</span>
      <span className="text-muted-foreground">积分</span>
    </button>
  );
}
