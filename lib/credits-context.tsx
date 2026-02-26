'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

interface CreditsData {
  balance: number;
  total_earned: number;
  total_consumed: number;
  updated_at: string;
}

interface CreditsContextType {
  credits: CreditsData | null;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  updateCredits: (newBalance: number, newTotalConsumed?: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

interface CreditsProviderProps {
  children: ReactNode;
}

export function CreditsProvider({ children }: CreditsProviderProps) {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/credits');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('请先登录');
        }
        throw new Error(`获取积分失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCredits(data.data);
      } else {
        throw new Error(data.error || '获取积分数据失败');
      }
    } catch (err) {
      console.error('获取用户积分失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setCredits(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = (newBalance: number, newTotalConsumed?: number) => {
    if (credits) {
      setCredits({
        ...credits,
        balance: newBalance,
        total_consumed: newTotalConsumed || credits.total_consumed,
        updated_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchCredits();

    // 监听登录状态变化，登录后自动刷新积分
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchCredits();
      } else if (event === 'SIGNED_OUT') {
        setCredits(null);
        setError(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <CreditsContext.Provider
      value={{
        credits,
        loading,
        error,
        refreshCredits: fetchCredits,
        updateCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits必须在CreditsProvider内部使用');
  }
  return context;
}