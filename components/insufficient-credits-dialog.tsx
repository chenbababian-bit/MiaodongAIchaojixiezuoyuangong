'use client';

/**
 * 积分不足弹窗组件
 * 当用户积分不足以完成AI生成时显示
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Coins, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  required?: number;
  onRecharge?: () => void;
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  balance,
  required,
  onRecharge,
}: InsufficientCreditsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            积分不足
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* 积分信息卡片 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">当前余额</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    {balance.toLocaleString()} 积分
                  </span>
                </div>

                {required !== undefined && required > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-sm text-muted-foreground">本次需要</span>
                    <span className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <Coins className="h-4 w-4" />
                      {required.toLocaleString()} 积分
                    </span>
                  </div>
                )}

                {required !== undefined && required > balance && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <span className="text-sm text-muted-foreground">还需充值</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Coins className="h-4 w-4" />
                      {(required - balance).toLocaleString()} 积分
                    </span>
                  </div>
                )}
              </div>

              {/* 提示文字 */}
              <p className="text-sm text-muted-foreground">
                您的积分余额不足以完成本次AI生成，请充值后继续使用。
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          {onRecharge && (
            <AlertDialogAction
              onClick={onRecharge}
              className={cn(
                'bg-amber-500 hover:bg-amber-600',
                'text-white'
              )}
            >
              <Coins className="h-4 w-4 mr-2" />
              去充值
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * 积分不足Toast提示Hook
 * 提供轻量级的积分不足提示
 */
export function useInsufficientCreditsToast() {
  const showToast = (balance: number, required?: number) => {
    // 这里可以集成 sonner 或其他 toast 库
    const message = required
      ? `积分不足：当前 ${balance} 积分，需要 ${required} 积分`
      : `积分不足：当前余额 ${balance} 积分`;

    console.warn(message);
    // 如果项目使用 sonner，可以这样：
    // toast.error(message, { description: '请充值后继续使用' });
  };

  return { showToast };
}
