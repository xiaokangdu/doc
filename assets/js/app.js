/*!
 * app.js — 站点交互逻辑
 * 顶部大类 = 分段控件；左侧 = 钻取式子菜单；点击子主题进入其知识点菜单。
 * 纯静态、无构建：哈希路由 + JSON 菜单 + Markdown 渲染 + 全文搜索。
 */
(function () {
  'use strict';

  var Markdown = window.Markdown;
  var Core = window.SiteCore;
  var DEFAULT_PATH = 'home';

  var state = {
    site: {},
    nav: [],
    flat: [],
    currentPath: '',
    chain: null,
    section: null,
    focus: null,
    contentCache: {},
    textIndex: null,
    searchActive: -1
  };

  var dom = {};
  var tocObserver = null;

  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^$}{()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(value) { return Markdown.escapeHtml(value); }

  function wordCount(text) {
    var plain = Core.stripMarkdown(text);
    var cjk = (plain.match(/[\u4e00-\u9fa5]/g) || []).length;
    var latin = (plain.match(/[A-Za-z0-9]+/g) || []).length;
    return cjk + latin;
  }

  function fetchText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return res.text();
    });
  }

  /* ---------------- 路由 ---------------- */

  function currentPathFromHash() {
    var raw = window.location.hash.replace(/^#\/?/, '');
    if (!raw) { return DEFAULT_PATH; }
    try { return decodeURIComponent(raw); } catch (err) { return raw; }
  }

  function navigate(path) {
    if (!path) { return; }
    var target = '#/' + path;
    if (window.location.hash === target) { route(); return; }
    window.location.hash = target;
  }

  function route() {
    var path = currentPathFromHash();
    state.currentPath = path;
    state.chain = Core.findChain(state.nav, path);
    state.section = state.chain && state.chain.length ? state.chain[0] : null;
    state.focus = state.chain ? Core.focusNode(state.chain) : null;
    closeSidebar();
    renderSegmented();
    renderSidebar();
    loadPage(path);
  }

  /* ---------------- 顶部分段控件 ---------------- */

  function renderSegmented() {
    dom.segmented.innerHTML = '';
    state.nav.forEach(function (top) {
      var btn = el('button', 'segment', top.title);
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      if (state.section === top) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.setAttribute('aria-selected', 'false');
      }
      btn.addEventListener('click', function () { navigate(top.path || Core.firstPath(top)); });
      dom.segmented.appendChild(btn);
    });
  }

  /* ---------------- 左侧钻取菜单 ---------------- */

  function renderSidebar() {
    dom.navTree.innerHTML = '';
    if (!state.section) { renderAllTopics(); return; }
    var top = state.section;
    var focus = state.focus || top;

    var head = el('div', 'side-head');
    if (focus !== top && state.chain) {
      var idx = state.chain.indexOf(focus);
      var parent = idx > 0 ? state.chain[idx - 1] : top;
      var back = el('button', 'side-back');
      back.type = 'button';
      back.appendChild(el('span', 'side-back__arrow', '←'));
      back.appendChild(el('span', null, '返回 ' + parent.title));
      back.addEventListener('click', function () { navigate(parent.path || Core.firstPath(parent)); });
      head.appendChild(back);
    }
    var crumb = el('div', 'side-crumb');
    crumb.appendChild(el('span', 'side-crumb__top', top.title));
    if (focus !== top) {
      crumb.appendChild(el('span', 'side-crumb__sep', '/'));
      crumb.appendChild(el('span', 'side-crumb__current', focus.title));
    }
    head.appendChild(crumb);
    dom.navTree.appendChild(head);

    var list = el('ul', 'side-list');
    (focus.children || []).forEach(function (child) { list.appendChild(sideItem(child)); });
    dom.navTree.appendChild(list);
    appendGuideLink();
  }

  function renderAllTopics() {
    var head = el('div', 'side-head');
    var crumb = el('div', 'side-crumb');
    crumb.appendChild(el('span', 'side-crumb__top', '全部主题'));
    head.appendChild(crumb);
    dom.navTree.appendChild(head);

    var list = el('ul', 'side-list');
    state.nav.forEach(function (top) { list.appendChild(sideItem(top)); });
    dom.navTree.appendChild(list);
    appendGuideLink();
  }

  function appendGuideLink() {
    var guide = el('a', 'side-guide', '使用指南');
    guide.href = '#/guide';
    dom.navTree.appendChild(guide);
  }

  function sideItem(node) {
    var li = el('li', 'side-item');
    var isGroup = !!(node.children && node.children.length);
    var target = node.path || Core.firstPath(node);

    var link = el(isGroup ? 'button' : 'a', 'side-link');
    if (isGroup) { link.type = 'button'; } else { link.href = '#/' + node.path; }
    link.appendChild(el('span', 'side-link__text', node.title));
    if (isGroup) { link.appendChild(el('span', 'side-link__chevron', '›')); }

    var active = isGroup
      ? !!(state.chain && state.chain.indexOf(node) !== -1)
      : state.currentPath === node.path;
    if (active) { li.classList.add('active'); }

    link.addEventListener('click', function (event) {
      if (!isGroup) { event.preventDefault(); }
      navigate(target);
    });
    li.appendChild(link);
    return li;
  }

  /* ---------------- 页面内容 ---------------- */

  function loadPage(path) {
    if (Object.prototype.hasOwnProperty.call(state.contentCache, path)) {
      renderPage(path, state.contentCache[path]);
      return;
    }
    renderLoading();
    fetchText('content/' + path + '.md').then(function (text) {
      state.contentCache[path] = text;
      if (state.currentPath === path) { renderPage(path, text); }
    }).catch(function () {
      if (state.currentPath === path) { renderNotFound(path); }
    });
  }

  function renderPage(path, text) {
    var parsed = Markdown.parse(text);
    var node = Core.findNode(state.nav, path) || {};
    var frag = document.createDocumentFragment();

    var head = el('div', 'page-head');
    head.appendChild(buildBreadcrumb(path));
    var meta = el('div', 'page-meta');
    meta.appendChild(metaChip('阅读约 ' + Core.readingMinutes(text) + ' 分钟'));
    meta.appendChild(metaChip('约 ' + wordCount(text) + ' 字'));
    head.appendChild(meta);
    frag.appendChild(head);

    var article = el('article', 'article');
    article.innerHTML = parsed.html;
    rewriteInternalLinks(article);
    frag.appendChild(article);

    var pager = buildPager(path);
    if (pager) { frag.appendChild(pager); }

    var inlineTop = el('button', 'inline-top');
    inlineTop.type = 'button';
    inlineTop.appendChild(el('span', 'inline-top__icon', '↑'));
    inlineTop.appendChild(el('span', null, '回到顶部'));
    inlineTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    frag.appendChild(inlineTop);

    dom.contentInner.innerHTML = '';
    dom.contentInner.appendChild(frag);

    document.title = (node.title ? node.title + ' · ' : '') + (state.site.title || '晓康的笔记');
    buildToc(parsed.toc);
    window.scrollTo({ top: 0, behavior: 'auto' });
    onScroll();
  }

  function buildBreadcrumb(path) {
    var nav = el('nav', 'breadcrumb');
    nav.setAttribute('aria-label', '面包屑');
    if (path === 'home') {
      nav.appendChild(el('span', 'breadcrumb__current', '首页'));
      return nav;
    }
    var home = el('a', null, '首页');
    home.href = '#/home';
    nav.appendChild(home);

    if (state.chain && state.chain.length) {
      state.chain.forEach(function (node, i) {
        nav.appendChild(el('span', 'breadcrumb__sep', '/'));
        var last = i === state.chain.length - 1;
        if (!last && node.path) {
          var a = el('a', null, node.title);
          a.href = '#/' + node.path;
          nav.appendChild(a);
        } else {
          nav.appendChild(el('span', last ? 'breadcrumb__current' : null, node.title));
        }
      });
    } else {
      nav.appendChild(el('span', 'breadcrumb__sep', '/'));
      nav.appendChild(el('span', 'breadcrumb__current', path === 'guide' ? '站点使用指南' : path));
    }
    return nav;
  }

  function metaChip(text) {
    return el('span', 'meta-chip', text);
  }

  function rewriteInternalLinks(article) {
    var links = article.querySelectorAll('a[href]');
    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#|\/)/i.test(href)) { return; }
      if (/\.(png|jpe?g|gif|svg|webp|pdf|zip)$/i.test(href)) { return; }
      var clean = href.replace(/\.md$/, '').replace(/^\.?\//, '');
      if (Core.findNode(state.nav, clean)) { link.setAttribute('href', '#/' + clean); }
    });
  }

  function buildPager(path) {
    var ordered = state.section ? Core.flattenNav([state.section]) : state.flat;
    var index = -1;
    for (var i = 0; i < ordered.length; i += 1) {
      if (ordered[i].path === path) { index = i; break; }
    }
    if (index === -1) { return null; }
    var prev = ordered[index - 1];
    var next = ordered[index + 1];
    if (!prev && !next) { return null; }
    var pager = el('div', 'pager');
    pager.appendChild(prev ? pagerLink(prev, 'prev') : el('span'));
    pager.appendChild(next ? pagerLink(next, 'next') : el('span'));
    return pager;
  }

  function pagerLink(item, dir) {
    var link = el('a', 'pager__link pager__link--' + dir);
    link.href = '#/' + item.path;
    link.appendChild(el('span', 'pager__hint', dir === 'prev' ? '上一篇' : '下一篇'));
    link.appendChild(el('span', 'pager__title', item.title));
    return link;
  }

  function renderLoading() {
    dom.contentInner.innerHTML = '';
    var box = el('div', 'article skeleton');
    for (var i = 0; i < 7; i += 1) {
      var line = el('div', 'skeleton__line');
      if (i === 0) { line.style.width = '55%'; line.style.height = '26px'; }
      if (i === 5) { line.style.width = '80%'; }
      box.appendChild(line);
    }
    dom.contentInner.appendChild(box);
    dom.tocPanel.hidden = true;
  }

  function renderNotFound(path) {
    var box = el('div', 'state');
    box.appendChild(el('div', 'state__icon', '🔍'));
    box.appendChild(el('h2', 'state__title', '未找到这个知识点'));
    var text = el('p', 'state__text');
    text.appendChild(document.createTextNode('缺少内容文件 '));
    text.appendChild(el('code', null, 'content/' + path + '.md'));
    text.appendChild(document.createTextNode('，或菜单配置 '));
    text.appendChild(el('code', null, 'content/nav.json'));
    text.appendChild(document.createTextNode(' 中未登记该路径。'));
    box.appendChild(text);
    var back = el('a', 'pager__link', '← 返回首页');
    back.href = '#/' + DEFAULT_PATH;
    back.style.display = 'inline-flex';
    back.style.alignItems = 'center';
    back.style.padding = '10px 22px';
    box.appendChild(back);
    dom.contentInner.innerHTML = '';
    dom.contentInner.appendChild(box);
    dom.tocPanel.hidden = true;
    document.title = '未找到 · ' + (state.site.title || '晓康的笔记');
  }

  function renderFileProtocolNotice() {
    dom.contentInner.innerHTML = '';
    var box = el('div', 'state');
    box.appendChild(el('div', 'state__icon', '🔌'));
    box.appendChild(el('h2', 'state__title', '需要通过本地服务器打开'));
    var text = el('p', 'state__text');
    text.appendChild(document.createTextNode('浏览器禁止以 file:// 方式读取笔记文件。请在站点目录运行 '));
    text.appendChild(el('code', null, 'python3 -m http.server 8080'));
    text.appendChild(document.createTextNode('，然后访问 http://localhost:8080 。'));
    box.appendChild(text);
    dom.contentInner.appendChild(box);
  }

  /* ---------------- 本页目录 ---------------- */

  function buildToc(toc) {
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    dom.tocList.innerHTML = '';
    var items = (toc || []).filter(function (item) { return item.level >= 2; });
    if (items.length < 2) { dom.tocPanel.hidden = true; return; }
    dom.tocPanel.hidden = false;

    items.forEach(function (item) {
      var li = el('li', 'toc-depth-' + item.level);
      var link = el('a', null, item.text);
      link.href = '#' + item.id;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.getElementById(item.id);
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
      li.appendChild(link);
      dom.tocList.appendChild(li);
    });

    observeHeadings(items);
  }

  function observeHeadings(items) {
    if (!('IntersectionObserver' in window)) { return; }
    var linkById = {};
    items.forEach(function (item) {
      var link = dom.tocList.querySelector('a[href="#' + item.id + '"]');
      if (link) { linkById[item.id] = link; }
    });
    var visible = {};
    tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { visible[entry.target.id] = entry.boundingClientRect.top; }
        else { delete visible[entry.target.id]; }
      });
      var ids = Object.keys(visible).sort(function (a, b) { return visible[a] - visible[b]; });
      Object.keys(linkById).forEach(function (id) {
        linkById[id].classList.toggle('active', ids.length > 0 && id === ids[0]);
      });
    }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });

    items.forEach(function (item) {
      var heading = document.getElementById(item.id);
      if (heading) { tocObserver.observe(heading); }
    });
  }

  /* ---------------- 搜索 ---------------- */

  function ensureTextIndex() {
    if (state.textIndex) { return Promise.resolve(state.textIndex); }
    var pending = state.flat.map(function (item) {
      return fetchText('content/' + item.path + '.md').catch(function () { return ''; });
    });
    return Promise.all(pending).then(function (texts) {
      state.textIndex = state.flat.map(function (item, index) {
        return { item: item, text: Core.stripMarkdown(texts[index]) };
      });
      return state.textIndex;
    });
  }

  function onSearchInput() {
    var query = dom.searchInput.value.trim();
    window.clearTimeout(onSearchInput.timer);
    if (!query) { hideSearch(); return; }
    onSearchInput.timer = window.setTimeout(function () { runSearch(query); }, 150);
  }

  function runSearch(query) {
    var lower = query.toLowerCase();
    var titleHits = state.flat.filter(function (item) {
      return item.title.toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 7);
    var matched = {};
    titleHits.forEach(function (item) { matched[item.path] = true; });

    ensureTextIndex().then(function (index) {
      var contentHits = index.filter(function (entry) {
        return !matched[entry.item.path] && entry.text.toLowerCase().indexOf(lower) !== -1;
      }).slice(0, 7);
      renderSearchResults(query, titleHits, contentHits);
    });
  }

  function renderSearchResults(query, titleHits, contentHits) {
    dom.searchResults.innerHTML = '';
    state.searchActive = -1;
    if (!titleHits.length && !contentHits.length) {
      dom.searchResults.appendChild(el('div', 'search-empty', '没有找到与 “' + query + '” 相关的内容'));
      dom.searchResults.hidden = false;
      return;
    }
    if (titleHits.length) {
      dom.searchResults.appendChild(el('div', 'search-group', '标题匹配'));
      titleHits.forEach(function (item) { dom.searchResults.appendChild(searchItem(item, null, query)); });
    }
    if (contentHits.length) {
      dom.searchResults.appendChild(el('div', 'search-group', '正文匹配'));
      contentHits.forEach(function (entry) {
        dom.searchResults.appendChild(searchItem(entry.item, Core.makeSnippet(entry.text, query, 34), query));
      });
    }
    dom.searchResults.hidden = false;
  }

  function highlight(text, query) {
    var escaped = escapeHtml(text);
    if (!query) { return escaped; }
    var pattern = new RegExp('(' + escapeRegExp(escapeHtml(query)) + ')', 'ig');
    return escaped.replace(pattern, '<mark>$1</mark>');
  }

  function searchItem(item, snippet, query) {
    var link = el('a', 'search-item');
    link.href = '#/' + item.path;
    var title = el('div', 'search-item__title');
    title.innerHTML = highlight(item.title, query);
    link.appendChild(title);
    if (snippet) {
      var snip = el('div', 'search-item__snippet');
      snip.innerHTML = highlight(snippet, query);
      link.appendChild(snip);
    }
    link.appendChild(el('div', 'search-item__path', item.trail.join(' / ')));
    link.addEventListener('click', function () {
      dom.searchInput.value = '';
      hideSearch();
    });
    return link;
  }

  function hideSearch() {
    dom.searchResults.hidden = true;
    state.searchActive = -1;
  }

  function onSearchKeydown(event) {
    var items = Array.prototype.slice.call(dom.searchResults.querySelectorAll('.search-item'));
    if (!items.length) { return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      state.searchActive += (event.key === 'ArrowDown' ? 1 : -1);
      if (state.searchActive < 0) { state.searchActive = items.length - 1; }
      if (state.searchActive >= items.length) { state.searchActive = 0; }
      items.forEach(function (item, index) {
        item.classList.toggle('is-active', index === state.searchActive);
      });
      items[state.searchActive].scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && state.searchActive >= 0 && items[state.searchActive]) {
      items[state.searchActive].click();
    } else if (event.key === 'Escape') {
      hideSearch();
      dom.searchInput.blur();
    }
  }

  /* ---------------- 其它交互 ---------------- */

  function openSidebar() { document.body.classList.add('nav-open'); }
  function closeSidebar() { document.body.classList.remove('nav-open'); }

  function onScroll() {
    var doc = document.documentElement;
    var top = window.scrollY || doc.scrollTop || 0;
    var max = doc.scrollHeight - doc.clientHeight;
    var ratio = max > 0 ? top / max : 0;
    if (dom.progressBar) {
      dom.progressBar.style.width = (Math.min(1, Math.max(0, ratio)) * 100).toFixed(2) + '%';
    }
    dom.backTop.classList.toggle('show', top > 80);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        resolve();
      } catch (err) { reject(err); }
    });
  }

  function renderFooter() {
    var title = state.site.title || '晓康的笔记';
    dom.siteFooter.textContent = '© ' + new Date().getFullYear() + ' ' + title + ' · 共 ' + state.flat.length + ' 个页面';
    if (state.site.lastUpdated) {
      dom.siteFooter.appendChild(el('span', null, ' · 更新于 ' + state.site.lastUpdated));
    }
    if (dom.sidebarFooter) {
      dom.sidebarFooter.innerHTML = '';
      dom.sidebarFooter.appendChild(el('div', 'sidebar__hint', '按 / 可快速搜索'));
    }
  }

  function bindEvents() {
    dom.menuToggle.addEventListener('click', openSidebar);
    dom.scrim.addEventListener('click', closeSidebar);
    dom.backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    dom.searchInput.addEventListener('input', onSearchInput);
    dom.searchInput.addEventListener('keydown', onSearchKeydown);
    dom.searchInput.addEventListener('focus', onSearchInput);
    dom.randomBtn.addEventListener('click', function () {
      if (!state.flat.length) { return; }
      navigate(state.flat[Math.floor(Math.random() * state.flat.length)].path);
    });
    document.addEventListener('click', function (event) {
      if (!dom.search.contains(event.target)) { hideSearch(); }
    });
    document.addEventListener('keydown', function (event) {
      var tag = (event.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || event.target.isContentEditable;
      if (event.key === '/' && !typing) { event.preventDefault(); dom.searchInput.focus(); }
    });
    dom.contentInner.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-copy]') : null;
      if (!button) { return; }
      var block = button.closest('.code-block');
      var code = block ? block.querySelector('code') : null;
      if (!code) { return; }
      copyText(code.innerText).then(function () {
        button.textContent = '已复制';
        button.classList.add('done');
        window.setTimeout(function () {
          button.textContent = '复制';
          button.classList.remove('done');
        }, 1600);
      });
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) { closeSidebar(); }
    });
  }

  function init() {
    dom.navTree = $('navTree');
    dom.sidebar = $('sidebar');
    dom.contentInner = $('contentInner');
    dom.searchInput = $('searchInput');
    dom.searchResults = $('searchResults');
    dom.search = document.querySelector('.search');
    dom.segmented = $('segmented');
    dom.tocPanel = $('tocPanel');
    dom.tocList = $('tocList');
    dom.menuToggle = $('menuToggle');
    dom.scrim = $('scrim');
    dom.backTop = $('backTop');
    dom.brandText = $('brandText');
    dom.progressBar = $('progressBar');
    dom.sidebarFooter = $('sidebarFooter');
    dom.siteFooter = $('siteFooter');
    dom.randomBtn = $('randomBtn');

    bindEvents();

    if (window.location.protocol === 'file:') { renderFileProtocolNotice(); return; }

    fetchText('content/nav.json').then(function (text) {
      var config = JSON.parse(text);
      state.site = config.site || {};
      state.nav = config.nav || [];
      state.flat = Core.flattenNav(state.nav);
      if (dom.brandText) { dom.brandText.textContent = state.site.title || '晓康的笔记'; }
      document.title = state.site.title || '晓康的笔记';
      renderFooter();
      route();
    }).catch(function (err) {
      dom.contentInner.innerHTML = '';
      var box = el('div', 'state');
      box.appendChild(el('h2', 'state__title', '菜单加载失败'));
      box.appendChild(el('p', 'state__text', '请确认 content/nav.json 存在且格式正确。（' + err.message + '）'));
      dom.contentInner.appendChild(box);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
