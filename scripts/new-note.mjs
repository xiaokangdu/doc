#!/usr/bin/env node
/*
 * 新增笔记小工具
 * 用法：
 *   node scripts/new-note.mjs --title "正则表达式速查" --path "notes/frontend/regex" --group "前端"
 * 作用：
 *   1. 创建 content/<path>.md 并写入起始模板
 *   2. 把菜单项插入 content/nav.json 中名为 <group> 的分组（找不到则放到顶层）
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) { continue; }
    const name = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[name] = next;
      i += 1;
    } else {
      args[name] = '';
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.title || !args.path) {
  console.log('用法: node scripts/new-note.mjs --title "标题" --path "notes/分组/文件名" [--group "分组名"]');
  process.exit(1);
}

const navPath = join(root, 'content', 'nav.json');
const targetPath = args.path.replace(/\.md$/, '').replace(/^\/+/, '');
const filePath = join(root, 'content', targetPath + '.md');

if (existsSync(filePath)) {
  console.error('文件已存在，未做任何修改：' + filePath);
  process.exit(1);
}

const template = [
  '# ' + args.title,
  '',
  '> 在这里写下你的笔记。',
  '',
  '## 小节标题',
  '',
  '- 要点一',
  '- 要点二',
  ''
].join('\n');

mkdirSync(dirname(filePath), { recursive: true });
writeFileSync(filePath, template, 'utf8');

const config = JSON.parse(readFileSync(navPath, 'utf8'));
config.nav = config.nav || [];

function insertIntoGroup(nodes, groupTitle, item) {
  for (const node of nodes) {
    if (node.title === groupTitle && Array.isArray(node.children)) {
      node.children.push(item);
      return true;
    }
    if (Array.isArray(node.children) && insertIntoGroup(node.children, groupTitle, item)) {
      return true;
    }
  }
  return false;
}

const entry = { title: args.title, path: targetPath };
let placed = false;
if (args.group) { placed = insertIntoGroup(config.nav, args.group, entry); }
if (!placed) {
  if (args.group) { console.warn('未找到分组：「' + args.group + '」，已添加到顶层。'); }
  config.nav.push(entry);
}

writeFileSync(navPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log('已创建：content/' + targetPath + '.md');
console.log('已登记菜单：' + (args.group || '顶层') + ' → ' + args.title);
