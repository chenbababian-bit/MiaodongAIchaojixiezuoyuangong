'use client';

import React, { useState } from 'react';
import { Zap, Star, Crown, Sparkles, Rocket, Diamond } from 'lucide-react';
import { toast } from 'sonner';
import { useCredits } from '@/lib/credits-context';
import { BackButton } from '@/components/ui/back-button';

const packages = [
  {
    id: 'trial',
    name: '体验包',
    price: 10,
    credits: 100,
    discount: null,
    save: 0,
    icon: Zap,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    recommended: false,
  },
  {
    id: 'starter',
    name: '入门包',
    price: 30,
    credits: 330,
    discount: '9.1折',
    save: 3,
    icon: Star,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    recommended: false,
  },
  {
    id: 'standard',
    name: '标准包',
    price: 50,
    credits: 600,
    discount: '8.3折',
    save: 10,
    icon: Sparkles,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    recommended: false,
  },
  {
    id: 'advanced',
    name: '进阶包',
    price: 100,
    credits: 1300,
    discount: '7.7折',
    save: 30,
    icon: Rocket,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary',
    recommended: true,
  },
  {
    id: 'pro',
    name: '专业包',
    price: 200,
    credits: 2800,
    discount: '7.1折',
    save: 80,
    icon: Crown,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    recommended: false,
  },
  {
    id: 'flagship',
    name: '旗舰包',
    price: 500,
    credits: 7500,
    discount: '6.7折',
    save: 250,
    icon: Diamond,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    recommended: false,
  },
];

export function CreditsPackagePage() {
  const { credits } = useCredits();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleRecharge = (pkg: typeof packages[0]) => {
    toast.info('支付功能即将上线', {
      description: `${pkg.name} · ¥${pkg.price} · ${pkg.credits.toLocaleString()} 积分`,
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* 返回按钮 */}
        <BackButton className="mb-6" fallbackPath="/" />

        {/* 页头 */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold text-foreground">积分充值</h1>
          <p className="mt-2 text-sm text-muted-foreground">充值越多，每积分单价越低，最高享 6.7 折优惠</p>
          {credits && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <span className="text-muted-foreground">当前余额</span>
              <span className="font-semibold text-foreground">{Number(credits.balance).toFixed(3)}</span>
              <span className="text-muted-foreground">积分</span>
            </div>
          )}
        </div>

        {/* 套餐网格 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedId === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedId(pkg.id)}
                className={`relative cursor-pointer rounded-2xl border-2 bg-card p-6 transition-all duration-200 hover:shadow-md ${
                  pkg.recommended
                    ? 'border-primary shadow-sm shadow-primary/10'
                    : isSelected
                    ? 'border-primary/60'
                    : 'border-border hover:border-border/80'
                }`}
              >
                {/* 推荐标签 */}
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      推荐
                    </span>
                  </div>
                )}

                {/* 折扣标签 */}
                {pkg.discount && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                      {pkg.discount}
                    </span>
                  </div>
                )}

                {/* 图标 + 套餐名 */}
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pkg.bgColor}`}>
                    <Icon className={`h-5 w-5 ${pkg.color}`} />
                  </div>
                  <span className="text-base font-medium text-foreground">{pkg.name}</span>
                </div>

                {/* 价格 */}
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">¥{pkg.price}</span>
                </div>

                {/* 积分数量 */}
                <div className="mb-1 text-sm text-muted-foreground">
                  获得{' '}
                  <span className="font-semibold text-foreground">
                    {pkg.credits.toLocaleString()}
                  </span>{' '}
                  积分
                </div>

                {/* 节省金额 */}
                {pkg.save > 0 ? (
                  <div className="mb-5 text-xs text-emerald-600">节省 ¥{pkg.save}</div>
                ) : (
                  <div className="mb-5 text-xs text-transparent select-none">—</div>
                )}

                {/* 充值按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecharge(pkg);
                  }}
                  className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    pkg.recommended
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  立即充值
                </button>
              </div>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5">
          <h3 className="mb-3 text-sm font-medium text-foreground">积分使用说明</h3>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>· 每次 AI 生成内容消耗 1 积分起，按实际生成字数计算</li>
            <li>· 积分不设有效期，充值后永久有效</li>
            <li>· 积分不足时将无法生成内容，请及时充值</li>
            <li>· 支付功能即将上线，敬请期待</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
