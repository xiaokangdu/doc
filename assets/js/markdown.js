/*!
 * markdown.js — 轻量级、零依赖的 Markdown 渲染器
 * 支持：标题(带锚点)、粗体/斜体/删除线、行内代码、围栏代码块、引用、
 *       有序/无序列表(可嵌套)、表格、分割线、链接、图片、自动链接、硬换行。
 * 同时兼容浏览器(window.Markdown)与 Node(module.exports)，便于单元测试。
 * 备注：正则中的反引号统一用 \u0060 表示，以兼容宿主模板字符串。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  if (root) { root.Markdown = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SAFE_URL = /^(https?:\/\/|mailto:|tel:|#|\/|\.\/|\.\.\/)/i;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUrl(url) {
    var value = String(url || '').trim();
    return SAFE_URL.test(value) ? escapeHtml(value) : '#';
  }

  function plainText(md) {
    return String(md || '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\u0060([^\u0060]+)\u0060/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/[*_]/g, '')
      .trim();
  }

  function slugify(text, used) {
    var base = plainText(text)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
    var id = base;
    var n = 2;
    while (used && used[id]) { id = base + '-' + n; n += 1; }
    if (used) { used[id] = true; }
    return id;
  }

  function inline(text) {
    var html = escapeHtml(text);
    var codes = [];
    html = html.replace(/\u0060([^\u0060]+)\u0060/g, function (_, code) {
      codes.push(code);
      return '\u0000C' + (codes.length - 1) + '\u0000';
    });
    html = html.replace(/ {2,}\n/g, '<br>\n');
    html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, function (_, alt, src, title) {
      return '<img src="' + safeUrl(src) + '" alt="' + alt + '"' + (title ? ' title="' + title + '"' : '') + ' loading="lazy">';
    });
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, function (_, label, href, title) {
      var external = /^https?:\/\//i.test(href);
      return '<a href="' + safeUrl(href) + '"' + (title ? ' title="' + title + '"' : '') +
        (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>';
    });
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^_\w])_([^_\n]+)_(?!\w)/g, '$1<em>$2</em>');
    html = html.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    html = html.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, function (_, pre, url) {
      return pre + '<a href="' + safeUrl(url) + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });
    html = html.replace(/\u0000C(\d+)\u0000/g, function (_, n) { return '<code>' + codes[+n] + '</code>'; });
    return html;
  }

  function isBlank(line) { return /^\s*$/.test(line); }

  function indentOf(line) {
    var match = line.match(/^[ \t]*/);
    return (match ? match[0] : '').replace(/\t/g, '  ').length;
  }

  function isTableSeparator(line) {
    return /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line) && line.indexOf('-') !== -1;
  }

  function isBlockStart(line, lines, i) {
    if (/^\s*(?:\u0060{3,}|~{3,})/.test(line)) { return true; }
    if (/^#{1,6}\s+/.test(line)) { return true; }
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { return true; }
    if (/^\s{0,3}>/.test(line)) { return true; }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) { return true; }
    if (line.indexOf('|') !== -1 && i + 1 < lines.length && lines[i + 1].indexOf('|') !== -1 && isTableSeparator(lines[i + 1])) { return true; }
    return false;
  }

  function splitRow(line) {
    var trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    var cells = [];
    var current = '';
    var escaped = false;
    for (var k = 0; k < trimmed.length; k++) {
      var ch = trimmed.charAt(k);
      if (escaped) { current += ch; escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '|') { cells.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  }

  function dedent(line, amount) {
    var count = 0;
    var result = '';
    for (var k = 0; k < line.length; k++) {
      var ch = line.charAt(k);
      if (ch === ' ' && count < amount) { count += 1; continue; }
      if (ch === '\t' && count < amount) { count += 2; continue; }
      result = line.slice(k);
      break;
    }
    return result;
  }

  function parseList(lines, start, used, toc) {
    var first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    var base = indentOf(lines[start]);
    var ordered = /^\d/.test(first[2]);
    var startNum = ordered ? parseInt(first[2], 10) : 1;
    var items = [];
    var i = start;
    var n = lines.length;

    while (i < n) {
      var line = lines[i];
      if (isBlank(line)) {
        var j = i;
        while (j < n && isBlank(lines[j])) { j += 1; }
        if (j < n && indentOf(lines[j]) > base) {
          if (items.length) { items[items.length - 1].content.push(''); }
          i += 1;
          continue;
        }
        if (j < n && indentOf(lines[j]) === base && /^\s*([-*+]|\d+[.)])\s+/.test(lines[j])) {
          i = j;
          continue;
        }
        break;
      }
      var match = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
      var indent = indentOf(line);
      if (match && indent === base) {
        items.push({ content: [match[3]] });
        i += 1;
        continue;
      }
      if (match && indent > base) {
        if (!items.length) { break; }
        items[items.length - 1].content.push(dedent(line, base + 2));
        i += 1;
        continue;
      }
      if (indent >= base + 2 && items.length) {
        items[items.length - 1].content.push(dedent(line, base + 2));
        i += 1;
        continue;
      }
      break;
    }

    var tag = ordered ? 'ol' : 'ul';
    var html = '<' + tag + (ordered && startNum !== 1 ? ' start="' + startNum + '"' : '') + ' class="md-list">';
    items.forEach(function (item) {
      var inner = parseBlocks(item.content, used, toc);
      var pCount = (inner.match(/<p>/g) || []).length;
      if (pCount === 1 && inner.indexOf('<p>') === 0 && inner.lastIndexOf('</p>') === inner.length - 4) {
        inner = inner.slice(3, inner.length - 4);
      }
      html += '<li>' + inner + '</li>';
    });
    html += '</' + tag + '>';
    return { html: html, next: i };
  }

  function parseBlocks(lines, used, toc) {
    var out = [];
    var i = 0;
    var n = lines.length;

    while (i < n) {
      var line = lines[i];

      if (isBlank(line)) { i += 1; continue; }

      if (/^\s*(?:\u0060{3,}|~{3,})\s*[A-Za-z0-9_+#-]*\s*$/.test(line)) {
        var langMatch = line.match(/^\s*(?:\u0060{3,}|~{3,})\s*([A-Za-z0-9_+#-]*)\s*$/);
        var lang = langMatch ? langMatch[1] : '';
        var buffer = [];
        i += 1;
        while (i < n && !/^\s*(?:\u0060{3,}|~{3,})\s*$/.test(lines[i])) {
          buffer.push(lines[i]);
          i += 1;
        }
        if (i < n) { i += 1; }
        out.push('<div class="code-block"><div class="code-block__bar"><span class="code-block__lang">' +
          escapeHtml(lang || 'text') + '</span><button class="code-copy" type="button" data-copy>复制</button></div>' +
          '<pre><code' + (lang ? ' class="language-' + escapeHtml(lang) + '"' : '') + '>' +
          escapeHtml(buffer.join('\n')) + '</code></pre></div>');
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (heading) {
        var level = heading[1].length;
        var rawTitle = heading[2];
        var id = slugify(rawTitle, used);
        if (level <= 3) { toc.push({ level: level, id: id, text: plainText(rawTitle) }); }
        out.push('<h' + level + ' id="' + id + '" class="md-h md-h' + level + '">' + inline(rawTitle) + '</h' + level + '>');
        i += 1;
        continue;
      }

      if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
        out.push('<hr>');
        i += 1;
        continue;
      }

      if (/^\s{0,3}>/.test(line)) {
        var quote = [];
        while (i < n && /^\s{0,3}>/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s{0,3}>\s?/, ''));
          i += 1;
        }
        out.push('<blockquote class="md-quote">' + parseBlocks(quote, used, toc) + '</blockquote>');
        continue;
      }

      if (line.indexOf('|') !== -1 && i + 1 < n && lines[i + 1].indexOf('|') !== -1 && isTableSeparator(lines[i + 1])) {
        var header = splitRow(line);
        var aligns = splitRow(lines[i + 1]).map(function (cell) {
          var left = cell.charAt(0) === ':';
          var right = cell.charAt(cell.length - 1) === ':';
          if (left && right) { return 'center'; }
          if (right) { return 'right'; }
          if (left) { return 'left'; }
          return '';
        });
        i += 2;
        var rows = [];
        while (i < n && lines[i].indexOf('|') !== -1 && !isBlank(lines[i])) {
          rows.push(splitRow(lines[i]));
          i += 1;
        }
        var table = '<div class="table-wrap"><table class="md-table"><thead><tr>';
        header.forEach(function (cell, index) {
          table += '<th' + (aligns[index] ? ' style="text-align:' + aligns[index] + '"' : '') + '>' + inline(cell) + '</th>';
        });
        table += '</tr></thead><tbody>';
        rows.forEach(function (row) {
          table += '<tr>';
          for (var c = 0; c < header.length; c += 1) {
            table += '<td' + (aligns[c] ? ' style="text-align:' + aligns[c] + '"' : '') + '>' +
              inline(row[c] == null ? '' : row[c]) + '</td>';
          }
          table += '</tr>';
        });
        table += '</tbody></table></div>';
        out.push(table);
        continue;
      }

      if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
        var listResult = parseList(lines, i, used, toc);
        out.push(listResult.html);
        i = listResult.next;
        continue;
      }

      var para = [line];
      i += 1;
      while (i < n && !isBlank(lines[i]) && !isBlockStart(lines[i], lines, i)) {
        para.push(lines[i]);
        i += 1;
      }
      out.push('<p>' + inline(para.join('\n')) + '</p>');
    }

    return out.join('\n');
  }

  function parse(source) {
    var src = String(source == null ? '' : source).replace(/\r\n?/g, '\n');
    var used = {};
    var toc = [];
    var html = parseBlocks(src.split('\n'), used, toc);
    return { html: html, toc: toc };
  }

  function render(source) {
    return parse(source).html;
  }

  return { parse: parse, render: render, escapeHtml: escapeHtml, slugify: slugify, inline: inline };
});
