/* 导航核心逻辑测试：node tests/core-nav.test.cjs */
const Core = require('../assets/js/core.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass += 1; } else { fail += 1; console.log('  FAIL: ' + name + (extra ? ' -> ' + extra : '')); }
}
const nav = [
  { title: '数据库', path: 'database', children: [
    { title: 'Oracle', path: 'database/oracle', children: [
      { title: '语法', path: 'database/oracle/syntax' },
      { title: '函数', path: 'database/oracle/functions' }
    ] },
    { title: 'MySQL', path: 'database/mysql', children: [
      { title: '语法', path: 'database/mysql/syntax' }
    ] }
  ] },
  { title: 'JAVA', path: 'java', children: [
    { title: '基础语法', path: 'java/basics' }
  ] }
];
ok('扁平化包含所有概览页', Core.flattenNav(nav).length === 8, String(Core.flattenNav(nav).length));
ok('findChain 定位叶子', Core.findChain(nav, 'database/oracle/syntax').length === 3);
ok('findChain 定位中间分组', Core.findChain(nav, 'database/oracle').length === 2);
ok('findChain 顶层', Core.findChain(nav, 'database').length === 1);
ok('findChain 未命中返回 null', Core.findChain(nav, 'nope') === null);
ok('focusNode 叶子 -> 父分组 Oracle', Core.focusNode(Core.findChain(nav, 'database/oracle/functions')).title === 'Oracle');
ok('focusNode 分组 -> 自身 Oracle', Core.focusNode(Core.findChain(nav, 'database/oracle')).title === 'Oracle');
ok('focusNode 顶层 -> 自身 数据库', Core.focusNode(Core.findChain(nav, 'database')).title === '数据库');
ok('firstPath 有概览页取自身', Core.firstPath(nav[0]) === 'database');
ok('firstPath 无 path 取第一个后代', Core.firstPath({ title: 'X', children: [{ title: 'Y', path: 'x/y' }] }) === 'x/y');
ok('firstPath 空返回 null', Core.firstPath({ title: 'Z', children: [] }) === null);
ok('findNode 命中', Core.findNode(nav, 'java/basics').title === '基础语法');
ok('findTrail 层级', Core.findTrail(nav, 'database/mysql/syntax').length === 3);
ok('链路首节点即分区', Core.findChain(nav, 'database/oracle/syntax')[0].title === '数据库');
console.log('导航测试：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
