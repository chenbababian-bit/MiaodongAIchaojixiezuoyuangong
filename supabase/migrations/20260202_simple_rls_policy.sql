-- 删除所有现有策略（如果存在）
DROP POLICY IF EXISTS "用户只能查看自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "用户只能创建自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "用户只能更新自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "用户只能删除自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON writing_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON writing_history;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON writing_history;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON writing_history;

-- 创建最简单的策略：允许所有已登录用户操作所有记录
-- 注意：这个策略不安全，但可以快速验证功能
CREATE POLICY "Allow all for authenticated users"
ON writing_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
