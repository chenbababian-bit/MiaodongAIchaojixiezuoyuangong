"use client";

import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Zap, Target, Users, TrendingUp } from "lucide-react";

export function AssistantPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-12">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">AI助理</h1>
            <p className="text-xl font-medium mb-2">CUSTOMIZATION</p>
            <h2 className="text-3xl font-bold mb-6">定制专家级AI助理</h2>
          </div>

          <p className="text-lg leading-relaxed mb-8 text-white/90">
            秒懂AI超级员工助理通过订阅定义的训练，构建专家级职业技能体系。搭建私人专属知识库，精准对接工作与业务场景，帮助您提升AI时代的职场竞争力。
          </p>

          <Button
            size="lg"
            className="w-full h-14 text-lg bg-white text-purple-600 hover:bg-white/90 font-medium"
          >
            立即定制
          </Button>

          {/* Decorative Character */}
          <div className="mt-12 flex justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 blur-2xl" />
              <div className="relative flex items-center justify-center h-full">
                <Bot className="w-32 h-32 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex items-center justify-center bg-background p-12">
        <div className="max-w-md text-center">
          {/* Illustration */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 blur-3xl" />
              <div className="relative flex items-center justify-center h-full">
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="w-24 h-24 text-white" />
                  </div>
                  {/* Floating Icons */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-4">
            你还没有AI助理哦
          </h3>
          <p className="text-muted-foreground mb-8">
            请从左侧制定制您的私人AI助理
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-card border border-border rounded-lg">
              <Target className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">精准定制</h4>
              <p className="text-xs text-muted-foreground">
                根据您的需求定制专属AI助理
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <Users className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">专业团队</h4>
              <p className="text-xs text-muted-foreground">
                专家级职业技能体系支持
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <Sparkles className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">智能学习</h4>
              <p className="text-xs text-muted-foreground">
                持续学习优化服务质量
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium text-sm mb-1">效率提升</h4>
              <p className="text-xs text-muted-foreground">
                大幅提升工作效率和质量
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
