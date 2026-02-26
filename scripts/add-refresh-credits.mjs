import fs from 'fs';
import path from 'path';

const componentsDir = 'components';
const IMPORT_LINE = 'import { useCredits } from "@/lib/credits-context";';
const HOOK_LINE = '  const { refreshCredits } = useCredits();';
const REFRESH_CALL = '      // 刷新积分显示\n      refreshCredits();';

const targetFiles = [
  'market-analysis-writing-page.tsx',
  'media-writing-page.tsx',
  'private-operation-writing-page.tsx',
  'creative-strategy-writing-page.tsx',
  'brand-strategy-writing-page.tsx',
  'publicity-writing-page.tsx',
  'communication-docs-writing-page.tsx',
  'etiquette-writing-page.tsx',
  'government-affairs-writing-page.tsx',
  'administrative-writing-page.tsx',
  'personal-development-writing-page.tsx',
  'project-management-writing-page.tsx',
  'team-management-writing-page.tsx',
  'speeches-writing-page.tsx',
  'report-writing-page.tsx',
  'weibo-writing-page.tsx',
  'zhihu-writing-page.tsx',
  'douyin-writing-page.tsx',
  'data-analysis-writing-page.tsx',
  'communication-writing-page.tsx',
  'toutiao-writing-page.tsx',
  'video-writing-page.tsx',
  'longtext-page.tsx',
];

const success = [], skipped = [], failed = [];

for (const filename of targetFiles) {
  const filepath = path.join(componentsDir, filename);
  if (!fs.existsSync(filepath)) { failed.push(filename + ' - 不存在'); continue; }

  let content = fs.readFileSync(filepath, 'utf8');

  if (content.includes('refreshCredits')) { skipped.push(filename); continue; }

  let modified = content;

  // 1. 添加 import（在最后一个 import 行后）
  if (!modified.includes(IMPORT_LINE)) {
    const importMatches = [...modified.matchAll(/^import .+;/gm)];
    if (importMatches.length > 0) {
      const last = importMatches[importMatches.length - 1];
      const pos = last.index + last[0].length;
      modified = modified.slice(0, pos) + '\n' + IMPORT_LINE + modified.slice(pos);
    }
  }

  // 2. 添加 hook（在 useRouter 或 useSearchParams 后）
  if (!modified.includes(HOOK_LINE)) {
    const hookMatch = modified.match(/(  const (?:router|searchParams) = use(?:Router|SearchParams)\(\);)/);
    if (hookMatch) {
      const pos = modified.indexOf(hookMatch[0]) + hookMatch[0].length;
      modified = modified.slice(0, pos) + '\n' + HOOK_LINE + modified.slice(pos);
    } else {
      const stateMatch = modified.match(/  const \[/);
      if (stateMatch) {
        const pos = modified.indexOf(stateMatch[0]);
        modified = modified.slice(0, pos) + HOOK_LINE + '\n' + modified.slice(pos);
      }
    }
  }

  // 3. 在 setMessages 后添加 refreshCredits()
  const pattern = /      setMessages\(prev => \[\.\.\.prev, aiMessage\]\);/g;
  const replacement = '      setMessages(prev => [...prev, aiMessage]);\n' + REFRESH_CALL;
  const newModified = modified.replace(pattern, replacement);
  if (newModified === modified) { failed.push(filename + ' - 未找到插入点'); continue; }
  modified = newModified;

  fs.writeFileSync(filepath, modified, 'utf8');
  success.push(filename);
}

console.log('✅ 成功:', success.length);
success.forEach(f => console.log('  -', f));
console.log('⏭️  跳过:', skipped.length);
skipped.forEach(f => console.log('  -', f));
if (failed.length) {
  console.log('❌ 失败:', failed.length);
  failed.forEach(f => console.log('  -', f));
}
