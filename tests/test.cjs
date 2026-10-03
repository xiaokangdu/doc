/* 站点核心逻辑单元测试：node tests/test.cjs */
const Markdown = require('../assets/js/markdown.js');
const Core = require('../assets/js/core.js');

const B = String.fromCharCode(96);        // 反引号
const F = B.repeat(3);                    // 围栏
let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass += 1; } else { fail += 1; console.log('  FAIL: ' + name); }
}
function group(name) { console.log('\n[' + name + ']'); }

group('标题与目录');
(function () {
  const r = Markdown.parse('# 标题 One\n\n## Sub Title\n\n### 第三');
  ok('h1 生成锚点', r.html.indexOf('<h1 id="') !== -1);
  ok('toc 数量为 3', r.toc.length === 3);
  ok('toc 层级正确', r.toc[0].level === 1 && r.toc[2].level === 3);
  ok('标题可点击锚点存在', r.html.indexOf('id="sub-title"') !== -1);
})();

group('行内元素');
(function () {
  const md = 'a **b** and *c* and ' + B + 'x<y' + B + ' and ~~d~~';
  const html = Markdown.render(md);
  ok('粗体', html.indexOf('<strong>b</strong>') !== -1);
  ok('斜体', html.indexOf('<em>c</em>') !== -1);
  ok('行内代码且转义', html.indexOf('<code>x&lt;y</code>') !== -1);
  ok('删除线', html.indexOf('<del>d</del>') !== -1);
})();

group('代码块');
(function () {
  const html = Markdown.render(F + 'js\nvar a = 1;\n' + F);
  ok('语言类名', html.indexOf('language-js') !== -1);
  ok('保留内容', html.indexOf('var a = 1;') !== -1);
  ok('复制按钮', html.indexOf('data-copy') !== -1);
})();

group('列表（含嵌套）');
(function () {
  const html = Markdown.render('- one\n- two\n  - two-a\n  - two-b\n- three');
  ok('两个 ul', (html.match(/<ul/g) || []).length === 2);
  ok('五个 li', (html.match(/<li>/g) || []).length === 5);
  ok('嵌套项存在', html.indexOf('two-a') !== -1);
  const ol = Markdown.render('3. c\n4. d');
  ok('有序列表起始值', ol.indexOf('start="3"') !== -1);
})();

group('表格 / 引用 / 分割线 / 换行');
(function () {
  const table = Markdown.render('| A | B |\n| --- | :--: |\n| 1 | 2 |');
  ok('表格结构', table.indexOf('<table') !== -1 && table.indexOf('<th>A</th>') !== -1 && table.indexOf('<td>1</td>') !== -1);
  ok('居中对齐', table.indexOf('text-align:center') !== -1);
  const quote = Markdown.render('> hello **world**');
  ok('引用块', quote.indexOf('<blockquote') !== -1 && quote.indexOf('<strong>world</strong>') !== -1);
  ok('分割线', Markdown.render('---').indexOf('<hr>') !== -1);
  ok('硬换行', Markdown.render('line1  \nline2').indexOf('<br>') !== -1);
  ok('普通段落保留换行', Markdown.render('a\nb').indexOf('<p>a\nb</p>') !== -1);
})();

group('链接与安全');
(function () {
  const html = Markdown.render('[x](javascript:alert(1)) [y](https://a.com)');
  ok('危险协议被拦截', html.indexOf('href="#"') !== -1 && html.indexOf('javascript:') === -1);
  ok('安全链接保留', html.indexOf('href="https://a.com"') !== -1);
  ok('外链新窗口', html.indexOf('target="_blank"') !== -1);
  const escaped = Markdown.render('<img src=x onerror=alert(1)>');
  ok('原始 HTML 被转义', escaped.indexOf('<img') === -1 && escaped.indexOf('&lt;img') !== -1);
})();

group('core 工具');
(function () {
  const nav = [{ title: 'A', path: 'a' }, { title: 'G', children: [{ title: 'B', path: 'b' }] }];
  ok('扁平化数量', Core.flattenNav(nav).length === 2);
  ok('面包屑层级', Core.findTrail(nav, 'b').length === 2);
  ok('查找节点', Core.findNode(nav, 'a').title === 'A');
  ok('去除 Markdown', Core.stripMarkdown('# H\ntext ' + B + 'code' + B).indexOf('text code') !== -1);
  ok('阅读时长至少 1 分钟', Core.readingMinutes('你好世界') === 1);
  ok('搜索片段高亮上下文', Core.makeSnippet('the quick brown fox', 'quick', 5).indexOf('quick') !== -1);
})();

console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
