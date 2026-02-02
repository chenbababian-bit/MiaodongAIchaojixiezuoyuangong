# 数据库迁移说明

## 添加 conversations 字段

### 迁移文件
- `20260202_add_conversations_field.sql`

### 功能说明
为 `writing_history` 表添加 `conversations` 字段，用于存储完整的对话记录。

### 字段详情
- **字段名**: `conversations`
- **类型**: `JSONB`
- **可空**: `YES`（向后兼容）
- **格式**:
  ```json
  [
    {
      "role": "user",
      "content": "用户输入内容",
      "timestamp": "2026-02-02T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "AI回复内容",
      "timestamp": "2026-02-02T10:00:05Z"
    }
  ]
  ```

### 如何应用迁移

#### 方法1：通过 Supabase Dashboard
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目
3. 进入 SQL Editor
4. 复制 `20260202_add_conversations_field.sql` 的内容
5. 执行SQL

#### 方法2：通过 Supabase CLI（如果已安装）
```bash
supabase db push
```

### 验证迁移
执行以下SQL验证字段已添加：
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'writing_history'
AND column_name = 'conversations';
```

### 向后兼容性
- ✅ 现有记录的 `conversations` 字段为 `NULL`
- ✅ 保留 `content` 和 `result` 字段
- ✅ 旧代码可以继续使用 `content` 和 `result`
- ✅ 新代码可以使用 `conversations` 存储完整对话

### 注意事项
1. 迁移是**可选的**，不影响现有功能
2. 如果不应用迁移，系统会继续使用 `content` 和 `result` 字段
3. 应用迁移后，新的对话记录会使用 `conversations` 字段
