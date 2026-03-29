import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import JSON5 from 'json5';
import { defineConfig, loadEnv } from 'vite';

interface WranglerConfig {
  vars?: Record<string, unknown>;
}

function readMockAuthFromWrangler(rootDir: string) {
  const wranglerConfigPath = resolve(rootDir, 'wrangler.jsonc');

  if (!existsSync(wranglerConfigPath)) {
    return {};
  }

  try {
    const parsedConfig = JSON5.parse(
      readFileSync(wranglerConfigPath, 'utf-8')
    ) as WranglerConfig;

    return {
      username:
        typeof parsedConfig.vars?.AUTH_USERNAME === 'string' ? parsedConfig.vars.AUTH_USERNAME : '',
      password:
        typeof parsedConfig.vars?.AUTH_PASSWORD === 'string' ? parsedConfig.vars.AUTH_PASSWORD : '',
    };
  } catch {
    return {};
  }
}

// 默认本地开发走 Mock API，不需要 Cloudflare Worker 运行时。
// 只有构建，或显式开启真实 API 开发时，再启用 Cloudflare 插件。
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', '');
  const useRealApi = env.VITE_USE_REAL_API === 'true';
  const shouldUseCloudflare = command !== 'serve' || useRealApi;
  const wranglerMockAuth = !shouldUseCloudflare ? readMockAuthFromWrangler('.') : {};
  const mockAuthUsername = env.VITE_MOCK_AUTH_USERNAME || wranglerMockAuth.username || '';
  const mockAuthPassword = env.VITE_MOCK_AUTH_PASSWORD || wranglerMockAuth.password || '';

  return {
    plugins: shouldUseCloudflare ? [react(), cloudflare()] : [react()],
    define: !shouldUseCloudflare
      ? {
          'import.meta.env.VITE_MOCK_AUTH_USERNAME': JSON.stringify(mockAuthUsername),
          'import.meta.env.VITE_MOCK_AUTH_PASSWORD': JSON.stringify(mockAuthPassword),
        }
      : undefined,
  };
});
