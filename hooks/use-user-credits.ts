import { useState, useEffect, useCallback } from 'react';

interface UserCreditsData {
  balance: number;
  total_earned: number;
  total_consumed: number;
  updated_at: string;
}

interface UseUserCreditsReturn {
  credits: UserCreditsData | null;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
}

/**
 * 获取当前用户积分的React Hook
 */
export function useUserCredits(): UseUserCreditsReturn {
  const [credits, setCredits] = useState<UserCreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    refreshCredits: fetchCredits,
  };
}