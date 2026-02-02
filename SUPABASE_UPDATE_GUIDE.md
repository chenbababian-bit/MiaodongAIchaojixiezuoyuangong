# Supabase 数据库更新指南

## 📋 需要执行的操作

由于我们为小红书写作功能添加了历史记录支持，并实现了细粒度的类型区分（旅游攻略、爆款文案、爆款标题等），需要在 Supabase 数据库中更新表结构。

## 🔍 检查数据库状态

首先，请检查您的数据库是否已经创建了 `conversations` 和 `messages` 表：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击左侧菜单的 **Table Editor**
4. 查看是否存在 `conversations` 和 `messages` 表

---

## 情况 A: 数据库表还未创建

如果您还没有创建这些表，请执行以下步骤：

### 步骤 1: 打开 SQL Editor
1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
2. 点击 **New query** 创建新查询

### 步骤 2: 执行完整的迁移脚本
1. 打开文件：`supabase/migrations/20260202_create_conversations.sql`
2. 复制整个文件内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮执行

### 步骤 3: 验证
执行成功后，您应该看到：
- ✅ `conversations` 表已创建（支持8种小红书细粒度类型）
- ✅ `messages` 表已创建
- ✅ 所有索引已创建
- ✅ RLS 策略已创建
- ✅ 触发器已创建

---

## 情况 B: 数据库表已存在，但不支持小红书细粒度类型

如果您之前已经创建了表，但 `conversations` 表的 `type` 字段只支持 `'qa'`、`'role'` 或统一的 `'xiaohongshu'`，需要更新为支持8种小红书细粒度类型：

### 步骤 1: 打开 SQL Editor
1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
2. 点击 **New query** 创建新查询

### 步骤 2: 执行更新脚本
1. 打开文件：`supabase/migrations/20260202_add_xiaohongshu_type.sql`
2. 复制整个文件内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮执行

### 步骤 3: 验证
执行成功后，您应该看到成功提示消息，显示所有支持的类型。

---

## 📊 支持的对话类型

更新后，`conversations` 表的 `type` 字段将支持以下值：

### 基础类型
- `qa` - 问答对话
- `role` - 角色扮演

### 小红书细粒度类型
- `xiaohongshu-travel` - 小红书旅游攻略
- `xiaohongshu-copywriting` - 小红书爆款文案
- `xiaohongshu-title` - 小红书爆款标题
- `xiaohongshu-profile` - 小红书个人简介
- `xiaohongshu-seo` - 小红书SEO优化
- `xiaohongshu-style` - 小红书风格改写
- `xiaohongshu-product` - 小红书产品种草
- `xiaohongshu-recommendation` - 小红书好物推荐

---

## 🧪 测试数据库连接

更新完成后，可以通过以下方式测试：

1. 启动开发服务器：`npm run dev`
2. 访问小红书写作页面
3. 登录您的账号
4. 切换不同的小红书模板（旅游攻略、爆款文案等）
5. 发送测试消息
6. 点击"历史记录"标签，查看是否能正常保存和加载
7. 验证不同模板的历史记录是否正确区分

---

## ⚠️ 常见问题

### Q: 执行 SQL 时报错 "constraint already exists"
**A:** 这是正常的，说明约束已经存在。您可以忽略这个错误，或者先删除旧约束再添加新约束。

### Q: 看不到历史记录
**A:** 请检查：
1. 是否已登录
2. 浏览器控制台是否有错误信息
3. Supabase 的 RLS 策略是否正确配置

### Q: 保存失败，提示 "type 值不合法"
**A:** 说明数据库约束还未更新，请执行情况 B 的更新脚本。

### Q: 旧的 'xiaohongshu' 类型数据怎么办？
**A:** 如果您之前有使用统一的 'xiaohongshu' 类型保存的数据，这些数据在更新后将无法访问（因为新的约束不包含 'xiaohongshu'）。如果需要保留这些数据，请在执行更新脚本前手动迁移：

```sql
-- 将旧的 xiaohongshu 类型数据迁移为 xiaohongshu-copywriting
UPDATE conversations
SET type = 'xiaohongshu-copywriting'
WHERE type = 'xiaohongshu';
```

---

## 📝 相关文件

- 完整迁移脚本：`supabase/migrations/20260202_create_conversations.sql`
- 类型更新脚本：`supabase/migrations/20260202_add_xiaohongshu_type.sql`
- 设置指南：`SUPABASE_SETUP.md`

---

## 🎉 完成

执行完上述步骤后，小红书写作功能的历史记录功能就可以正常使用了！不同的小红书模板（旅游攻略、爆款文案、爆款标题等）的历史记录将被正确区分和存储。
