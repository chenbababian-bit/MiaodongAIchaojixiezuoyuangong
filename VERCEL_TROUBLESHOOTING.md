# Vercel 部署问题排查指南

## 问题：部署后网页无法正常显示

### 🔍 诊断步骤

#### 1. 检查部署状态
访问 Vercel Dashboard → 您的项目 → Deployments

**检查项：**
- [ ] 部署状态是否为 "Ready"（绿色）
- [ ] 构建是否成功完成
- [ ] 是否有错误或警告信息

---

#### 2. 检查环境变量（最常见问题）

**必需的环境变量：**
```
DEEPSEEK_API_KEY=sk-a9c052f9a4234c4b9852c66ce9a5776f
```

**配置步骤：**
1. Vercel Dashboard → 项目 → Settings → Environment Variables
2. 添加 `DEEPSEEK_API_KEY`
3. 选择所有环境：Production, Preview, Development
4. 保存后 **重新部署**（Deployments → 最新部署 → 右上角三个点 → Redeploy）

---

#### 3. 检查构建日志

在 Vercel 部署详情页面，查看 **Build Logs**：

**常见错误：**

##### 错误 1：TypeScript 编译错误
```
Type error: ...
```
**解决方案：** 本地已修复，确保推送了最新代码

##### 错误 2：依赖安装失败
```
npm ERR! ...
```
**解决方案：** 检查 package.json，确保所有依赖都正确

##### 错误 3：环境变量未定义
```
DEEPSEEK_API_KEY is not defined
```
**解决方案：** 按步骤 2 配置环境变量

---

#### 4. 检查运行时日志

在 Vercel 部署详情页面，查看 **Runtime Logs**：

**常见错误：**

##### 错误 1：API 调用失败
```
Error: API Key not configured
```
**解决方案：** 配置 DEEPSEEK_API_KEY 环境变量

##### 错误 2：404 Not Found
```
404: NOT_FOUND
```
**解决方案：**
- 检查访问的 URL 是否正确
- 确保路由文件存在
- 检查 next.config.mjs 配置

---

#### 5. 访问部署 URL

**测试步骤：**

1. **访问首页**
   ```
   https://your-project.vercel.app/
   ```
   - 应该看到写作助手主页
   - 如果看到 404，检查路由配置

2. **打开浏览器控制台**（F12）
   - 查看 Console 标签是否有 JavaScript 错误
   - 查看 Network 标签是否有请求失败

3. **测试 API 端点**
   ```
   https://your-project.vercel.app/api/xiaohongshu
   ```
   - 应该返回错误信息（因为是 POST 请求）
   - 如果返回 404，说明 API 路由有问题

---

## 🛠️ 常见问题解决方案

### 问题 1：白屏或空白页面

**可能原因：**
- JavaScript 错误
- 组件渲染失败
- 环境变量未配置

**解决方案：**
1. 打开浏览器控制台（F12）查看错误
2. 检查 Vercel Runtime Logs
3. 确保环境变量已配置

---

### 问题 2：404 Not Found

**可能原因：**
- URL 路径错误
- 路由文件未正确部署
- next.config.mjs 配置问题

**解决方案：**
1. 确认访问的 URL 正确
2. 检查 Vercel 部署的文件列表
3. 重新部署项目

---

### 问题 3：API 调用失败

**可能原因：**
- DEEPSEEK_API_KEY 未配置
- API 端点路径错误
- CORS 问题

**解决方案：**
1. 配置 DEEPSEEK_API_KEY 环境变量
2. 检查 API 路由文件是否存在
3. 查看 Runtime Logs 获取详细错误

---

### 问题 4：样式丢失或显示异常

**可能原因：**
- CSS 文件未正确加载
- Tailwind CSS 配置问题
- 字体文件加载失败

**解决方案：**
1. 检查 Network 标签，确认 CSS 文件加载
2. 清除浏览器缓存
3. 检查 globals.css 是否正确导入

---

## 📊 快速诊断清单

- [ ] Vercel 部署状态为 "Ready"
- [ ] 环境变量 DEEPSEEK_API_KEY 已配置
- [ ] 构建日志无错误
- [ ] 运行时日志无错误
- [ ] 浏览器控制台无 JavaScript 错误
- [ ] 首页可以正常访问
- [ ] API 端点可以响应

---

## 🆘 如果以上都无法解决

### 方案 1：重新部署
1. Vercel Dashboard → Deployments
2. 点击最新部署 → 右上角三个点
3. 选择 "Redeploy"

### 方案 2：检查域名配置
1. 确认使用的是正确的 Vercel 域名
2. 如果使用自定义域名，检查 DNS 配置

### 方案 3：查看详细日志
```bash
# 使用 Vercel CLI 查看日志
vercel logs your-project-url
```

### 方案 4：联系支持
- 提供部署 URL
- 提供错误截图
- 提供 Build Logs 和 Runtime Logs

---

## 📝 需要提供的信息

为了更好地帮助您，请提供：

1. **部署 URL**：`https://your-project.vercel.app`
2. **看到的错误**：
   - 白屏？
   - 404 错误？
   - 其他错误信息？
3. **浏览器控制台错误**（F12 → Console）
4. **Vercel 构建日志**（Build Logs）
5. **Vercel 运行时日志**（Runtime Logs）

---

**最后更新**: 2026-01-26
