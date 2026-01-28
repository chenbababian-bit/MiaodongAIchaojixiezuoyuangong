"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy, Check, MapPin, Wallet, Users, Calendar, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export function TravelGuidePage() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [companions, setCompanions] = useState("");
  const [days, setDays] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination || !budget || !companions || !days || !style) {
      alert("请填写完整的旅行信息");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/travel-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          budget,
          companions,
          days,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }

      setResult(data.result);
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🌟 小红书旅游攻略生成器</h1>
        <p className="text-muted-foreground">
          填写您的旅行信息，AI 将为您生成专业的小红书爆款旅游攻略
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧表单 */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">📝 旅行信息</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 目的地 */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  目的地
                </Label>
                <Input
                  id="destination"
                  placeholder="例如：成都、大理、三亚"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              {/* 预算 */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  预算
                </Label>
                <Input
                  id="budget"
                  placeholder="例如：3000元、5000-8000元"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>

              {/* 同行者 */}
              <div className="space-y-2">
                <Label htmlFor="companions" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  同行者
                </Label>
                <Select value={companions} onValueChange={setCompanions} required>
                  <SelectTrigger id="companions">
                    <SelectValue placeholder="选择同行者类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="情侣">情侣</SelectItem>
                    <SelectItem value="闺蜜">闺蜜</SelectItem>
                    <SelectItem value="亲子">亲子</SelectItem>
                    <SelectItem value="独狼">独狼（独自旅行）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 天数 */}
              <div className="space-y-2">
                <Label htmlFor="days" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  旅行天数
                </Label>
                <Input
                  id="days"
                  placeholder="例如：3天、5-7天"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  required
                />
              </div>

              {/* 风格偏好 */}
              <div className="space-y-2">
                <Label htmlFor="style" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  风格偏好
                </Label>
                <Select value={style} onValueChange={setStyle} required>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="选择内容风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="极致省钱干货">极致省钱干货</SelectItem>
                    <SelectItem value="氛围感大片文案">氛围感大片文案</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "生成旅游攻略"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* 右侧结果 */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">✨ 生成结果</h2>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制
                    </>
                  )}
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">AI 正在为您生成专业的旅游攻略...</p>
              </div>
            ) : result ? (
              <Textarea
                value={result}
                readOnly
                className="min-h-[500px] font-mono text-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  填写左侧表单，开始生成您的专属旅游攻略
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
