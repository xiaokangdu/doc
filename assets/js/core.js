/*!
 * core.js — 站点纯逻辑工具（无 DOM 依赖，便于 Node 单元测试）
 * 负责：导航扁平化、面包屑查找、节点检索、搜索高亮片段、Markdown 去除。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  if (root) { root.SiteCore = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function flattenNav(nav, trail) {
    var list = [];
    (nav || []).forEach(function (node) {
      var next = (trail || []).concat([node.title]);
      if (node.path) {
        list.push({ title: node.title, path: node.path, icon: node.icon || '', trail: next });
      }
      if (node.children && node.children.length) {
        list = list.concat(flattenNav(node.children, next));
      }
    });
    return list;
  }

  function findTrail(nav, path, trail) {
    var prefix = trail || [];
    for (var i = 0; i < (nav || []).length; i += 1) {
      var node = nav[i];
      var next = prefix.concat([{ title: node.title, path: node.path || null }]);
      if (node.path === path) { return next; }
      if (node.children) {
        var found = findTrail(node.children, path, next);
        if (found) { return found; }
      }
    }
    return null;
  }

  function findNode(nav, path) {
    for (var i = 0; i < (nav || []).length; i += 1) {
      var node = nav[i];
      if (node.path === path) { return node; }
      if (node.children) {
        var found = findNode(node.children, path);
        if (found) { return found; }
      }
    }
    return null;
  }

  function matchTitle(item, query) {
    return String(item.title).toLowerCase().indexOf(String(query).toLowerCase()) !== -1;
  }

  function stripMarkdown(md) {
    return String(md || '')
      .replace(/~~~[\s\S]*?~~~/g, ' ')
      .replace(/\u0060\u0060\u0060[\s\S]*?\u0060\u0060\u0060/g, ' ')
      .replace(/\u0060([^\u0060]+)\u0060/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[>*_~|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function makeSnippet(text, query, radius) {
    var compact = String(text || '').replace(/\s+/g, ' ').trim();
    var span = radius || 40;
    var index = compact.toLowerCase().indexOf(String(query).toLowerCase());
    if (index === -1) {
      return compact.slice(0, span * 2) + (compact.length > span * 2 ? '…' : '');
    }
    var start = Math.max(0, index - span);
    var end = Math.min(compact.length, index + String(query).length + span);
    return (start > 0 ? '…' : '') + compact.slice(start, end) + (end < compact.length ? '…' : '');
  }

  function readingMinutes(text) {
    var plain = stripMarkdown(text);
    var latin = (plain.match(/[A-Za-z0-9]+/g) || []).length;
    var cjk = (plain.match(/[\u4e00-\u9fa5]/g) || []).length;
    var minutes = Math.ceil((latin / 220) + (cjk / 380));
    return Math.max(1, minutes);
  }

  return {
    flattenNav: flattenNav,
    findTrail: findTrail,
    findNode: findNode,
    matchTitle: matchTitle,
    stripMarkdown: stripMarkdown,
    makeSnippet: makeSnippet,
    readingMinutes: readingMinutes
  };
});
