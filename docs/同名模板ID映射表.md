# 同名模板ID映射表

## 概述
本文档记录了系统中所有同名模板的ID映射关系，用于统一配置管理。

## 发现的同名模板

### 1. 小红书爆款文案
- **侧边栏ID**: 1
- **media-page.tsx ID**: 102
- **保留ID**: 102（符合小红书类别ID范围101-199）
- **废弃ID**: 1
- **API端点**: `/api/xiaohongshu`
- **路由**: `/writing/xiaohongshu`

### 2. 公众号文章撰写
- **侧边栏ID**: 3
- **media-page.tsx ID**: 201
- **其他ID**: 109, 204
- **保留ID**: 201（符合公众号类别ID范围201-299）
- **废弃ID**: 3, 109, 204
- **API端点**: `/api/official-account-article`（新版，支持对话历史）
- **旧API**: `/api/wechat-article`（待废弃）
- **路由**: `/writing/wechat`（当前错误路由到xiaohongshu）

### 3. 小红书爆款标题
- **侧边栏ID**: 6
- **media-page.tsx ID**: 103
- **保留ID**: 103（符合小红书类别ID范围101-199）
- **废弃ID**: 6
- **API端点**: `/api/xiaohongshu-title`
- **路由**: `/writing/xiaohongshu`

### 4. 短视频爆款文案
- **侧边栏ID**: 4
- **可能的其他ID**: 9（短视频黄金3秒开头，可能是相关模板）
- **需要进一步确认**: 是否为同一模板

## ID分配规则

### 标准ID范围
- **小红书**: 101-199
- **公众号**: 201-299
- **头条**: 301-399
- **微博**: 401-499
- **知乎**: 501-599
- **私域**: 601-699
- **短视频**: 701-799
- **直播**: 801-899

### 侧边栏模板ID（待废弃）
- **ID 1-9**: 侧边栏快捷模板，需要映射到标准ID范围

## 迁移策略

### 阶段一：ID映射
为所有同名模板创建`legacyIds`字段：

```typescript
// 小红书爆款文案
102: {
  id: 102,
  legacyIds: [1],
  title: "小红书爆款文案",
  // ...
}

// 公众号文章撰写
201: {
  id: 201,
  legacyIds: [3, 109, 204],
  title: "公众号文章撰写",
  // ...
}

// 小红书爆款标题
103: {
  id: 103,
  legacyIds: [6],
  title: "小红书爆款标题",
  // ...
}
```

### 阶段二：向后兼容
实现ID解析函数，自动将旧ID映射到新ID：

```typescript
export function getTemplateById(id: number): TemplateConfig | null {
  // 直接查找
  if (TEMPLATE_REGISTRY[id]) return TEMPLATE_REGISTRY[id];

  // 查找legacyIds
  for (const template of Object.values(TEMPLATE_REGISTRY)) {
    if (template.legacyIds?.includes(id)) return template;
  }

  return null;
}
```

### 阶段三：URL重定向
在页面组件中添加自动重定向逻辑：

```typescript
useEffect(() => {
  const templateId = parseInt(searchParams.get("template"));
  const canonicalId = getCanonicalId(templateId);

  if (canonicalId !== templateId) {
    router.replace(`${pathname}?template=${canonicalId}&title=${title}`);
  }
}, [searchParams]);
```

## 验证清单

### 功能测试
- [ ] 旧ID（1）能正常访问并重定向到102
- [ ] 旧ID（3, 109, 204）能正常访问并重定向到201
- [ ] 旧ID（6）能正常访问并重定向到103
- [ ] 所有模板的API调用正常
- [ ] 对话历史功能正常

### 兼容性测试
- [ ] 用户书签仍然有效
- [ ] 历史记录正常显示
- [ ] 分享链接正常工作

## 注意事项

1. **不要立即删除旧ID**：保持向后兼容至少一个版本周期
2. **添加废弃警告**：在使用旧ID时输出console.warn
3. **更新文档**：通知用户使用新的ID
4. **监控日志**：跟踪旧ID的使用情况，确定何时可以安全移除

## 更新日志

- 2026-01-30: 初始版本，记录所有发现的同名模板
