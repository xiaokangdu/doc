/* 站点静态自检：node tests/check-site.cjs */
const fs = require('fs');
const path = require('path');
const Markdown = require('../assets/js/markdown.js');
const Core = require('../assets/js/core.js');

const root = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass += 1; }
  else { fail += 1; console.log('  FAIL: ' + name + (extra ? ' -> ' + extra : '')); }
}

console.log('[1] 菜单配置');
const config = JSON.parse(fs.readFileSync(path.join(root, 'content/nav.json'), 'utf8'));
const flat = Core.flattenNav(config.nav);
ok('nav.json 可解析', true);
ok('菜单条目 >= 6', flat.length >= 6, String(flat.length));
ok('站点标题存在', !!config.site && !!config.site.title);

const missing = [];
const seen = {};
const dup = [];
flat.forEach(function (item) {
  if (!fs.existsSync(path.join(root, 'content', item.path + '.md'))) { missing.push(item.path); }
  if (seen[item.path]) { dup.push(item.path); }
  seen[item.path] = true;
});
ok('所有菜单路径都有对应 md', missing.length === 0, missing.join(', '));
ok('菜单路径唯一', dup.length === 0, dup.join(', '));

console.log('[2] 逐篇渲染');
let headings = 0;
flat.forEach(function (item) {
  const md = fs.readFileSync(path.join(root, 'content', item.path + '.md'), 'utf8');
  let result;
  try { result = Markdown.parse(md); }
  catch (err) { ok('渲染 ' + item.path, false, err.message); return; }
  ok('渲染非空 ' + item.path, result.html.length > 60, String(result.html.length));
  ok('无 undefined ' + item.path, result.html.indexOf('undefined') === -1);
  ok('含一级标题 ' + item.path, result.html.indexOf('<h1') !== -1);
  headings += result.toc.length;
});
ok('目录条目总数 > 0', headings > 0, String(headings));

console.log('[3] 站内链接');
const badLinks = [];
flat.forEach(function (item) {
  const md = fs.readFileSync(path.join(root, 'content', item.path + '.md'), 'utf8');
  const re = /\]\(([^)\s]+)\)/g;
  let m;
  while ((m = re.exec(md))) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(href)) { continue; }
    if (/\.(png|jpe?g|gif|svg|webp|pdf)$/i.test(href)) { continue; }
    const clean = href.replace(/\.md$/, '').replace(/^\.?\//, '');
    if (!Core.findNode(config.nav, clean)) { badLinks.push(item.path + ' -> ' + href); }
  }
});
ok('站内链接均可解析', badLinks.length === 0, badLinks.join('; '));

console.log('[4] 页面骨架');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
['assets/css/style.css', 'assets/js/markdown.js', 'assets/js/core.js', 'assets/js/app.js'].forEach(function (asset) {
  ok('引用存在 ' + asset, html.indexOf(asset) !== -1 && fs.existsSync(path.join(root, asset)));
});
['navTree', 'contentInner', 'searchInput', 'tocPanel', 'siteFooter', 'progressBar', 'sidebar', 'backTop'].forEach(function (id) {
  ok('含 #' + id, html.indexOf('id="' + id + '"') !== -1);
});

console.log('[5] 源码卫生');
['assets/js/markdown.js', 'assets/js/core.js', 'assets/js/app.js', 'assets/css/style.css'].forEach(function (file) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  ok(file + ' 无模板残留反引号', src.indexOf(String.fromCharCode(96)) === -1);
  ok(file + ' 无调试残留', src.indexOf('console.log(') === -1 || file.indexOf('app.js') !== -1);
});

console.log('\n自检结果：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
