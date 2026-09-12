import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { createServer } from 'vite';

// Exercise CRXJS's generated worker, where the undefined port was introduced.
// Do not listen or write development artifacts into the user's dist directory.
test('generated extension HMR worker uses a valid URL matching the dev server', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'tobynext-hmr-'));
  let server;
  try {
    server = await createServer({
      configFile: 'vite.config.ts',
      cacheDir: join(temporary, 'cache'),
      build: { outDir: join(temporary, 'extension') },
      server: { watch: null },
    });
    const loaded = await server.pluginContainer.load('/@crx/client-worker');
    const code = typeof loaded === 'string' ? loaded : loaded.code;
    let socketUrl;
    const listener = { addListener() {} };
    runInNewContext(code, {
      chrome: {
        runtime: {
          id: 'test-extension',
          onConnect: listener,
          onConnectExternal: listener,
        },
      },
      self: { addEventListener() {} },
      location: { protocol: 'chrome-extension:', hostname: 'test-extension' },
      console: { log() {} },
      WebSocket: class {
        constructor(url) {
          socketUrl = new URL(url);
        }
        addEventListener() {}
      },
    });
    assert.equal(socketUrl.protocol, 'ws:');
    assert.equal(socketUrl.hostname, 'localhost');
    assert.ok(Number(socketUrl.port) > 0);
    assert.equal(socketUrl.port, String(server.config.server.port));
    assert.equal(server.config.server.strictPort, true);
  } finally {
    await server?.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
