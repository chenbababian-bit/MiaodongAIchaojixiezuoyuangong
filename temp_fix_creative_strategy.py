#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""临时脚本：修改creative-strategy-writing-page.tsx的关键部分"""

import re

# 读取文件
with open('components/creative-strategy-writing-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修改API端点映射函数
api_endpoint_old = r'''  // 获取当前模板对应的API端点
  const getApiEndpoint = \(templateId: string\): string => \{
    switch \(templateId\) \{
      case "1201": return "/api/speeches/onboarding-welcome";
      case "1202": return "/api/speeches/department-intro";
      case "1203": return "/api/speeches/project-kickoff";
      case "1204": return "/api/speeches/team-building-opening";
      case "1205": return "/api/speeches/year-end-summary";
      case "1206": return "/api/speeches/annual-meeting";
      case "1207": return "/api/speeches/award-ceremony";
      case "1208": return "/api/speeches/retirement-farewell";
      case "1209": return "/api/speeches/sales-motivation";
      case "1210": return "/api/speeches/culture-promotion";
      case "1211": return "/api/speeches/onboarding-speech";
      case "1212": return "/api/speeches/probation-review";
      default: return "/api/speeches/onboarding-welcome";
    \}'''

api_endpoint_new = '''  // 获取当前模板对应的API端点
  const getApiEndpoint = (templateId: string): string => {
    switch (templateId) {
      case "11001": return "/api/creative-strategy/brief";
      case "11002": return "/api/creative-strategy/proposal";
      case "11003": return "/api/creative-strategy/brand-positioning";
      case "11004": return "/api/creative-strategy/communication";
      case "11005": return "/api/creative-strategy/concept";
      default: return "/api/creative-strategy/brief";
    }'''

content = re.sub(api_endpoint_old, api_endpoint_new, content, flags=re.MULTILINE)

# 2. 修改默认templateId
content = re.sub(r'const templateId = searchParams\.get\("template"\) \|\| "1101";',
                 'const templateId = searchParams.get("template") || "11001";', content)

# 3. 修改getTemplatesFromSource中的case
content = re.sub(r'case "speeches":', 'case "creative-strategy":', content)
content = re.sub(r'icon: "speeches"', 'icon: "creative-strategy"', content)

# 4. 修改主渲染逻辑的条件判断
content = re.sub(r'\["1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212"\]\.includes\(templateId\)',
                 '["11001", "11002", "11003", "11004", "11005"].includes(templateId)', content)

# 写回文件
with open('components/creative-strategy-writing-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("修改完成！")
