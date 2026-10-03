#!/usr/bin/env node
/*
 * 零依赖静态文件服务器（用于本地预览，替代 python3 -m http.server）
 * 用法：
 *   node scripts/serve.mjs          # 默认 http://127.0.0.1:8080
 *   node scripts/serve.mjs 9000     # 指定端口
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2]) || 8080;
const host = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, code, body, type) {
  res.writeHead(code, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  res.end(body);
}

createServer(async function (req, res) {
  try {
    const url = new URL(req.url, 'http://' + host + ':' + port);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) { pathname += 'index.html'; }

    let target = resolve(join(root, pathname));
    if (target !== root && !target.startsWith(root + '/')) {
      send(res, 403, 'Forbidden');
      return;
    }

    let info = await stat(target).catch(function () { return null; });
    if (info && info.isDirectory()) {
      target = join(target, 'index.html');
      info = await stat(target).catch(function () { return null; });
    }
    if (!info) {
      send(res, 404, 'Not Found: ' + pathname);
      return;
    }

    const body = await readFile(target);
    send(res, 200, body, MIME[extname(target).toLowerCase()] || 'application/octet-stream');
  } catch (err) {
    send(res, 500, 'Server Error: ' + err.message);
  }
}).listen(port, host, function () {
  console.log('随手记 本地预览已启动: http://' + host + ':' + port + '/');
  console.log('按 Ctrl+C 停止');
});
