-- 为 writing_history 表添加 RLS 策略
-- 允许已登录用户完整的 CRUD 操作

-- 1. 允许已登录用户插入自己的历史记录
CREATE POLICY "Enable insert for authenticated users"
ON writing_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. 允许已登录用户查看自己的历史记录
CREATE POLICY "Enable read for authenticated users"
ON writing_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. 允许已登录用户更新自己的历史记录
CREATE POLICY "Enable update for authenticated users"
ON writing_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. 允许已登录用户删除自己的历史记录
CREATE POLICY "Enable delete for authenticated users"
ON writing_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
