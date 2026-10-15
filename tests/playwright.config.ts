import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// Porta dedicada para não colidir com a 3333 usada manualmente.
const PORT = 3334;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: '.',
  // Estado em memória é compartilhado: execução serial evita interferência entre testes.
  workers: 1,
  fullyParallel: false,
  // Sem retries: não mascarar defeitos intermitentes ou do produto.
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'node server.js',
    // Aplicação original, sem alterações: apenas apontamos o cwd para ela.
    cwd: path.resolve(__dirname, '../aplicacao-teste/api'),
    url: `${BASE_URL}/api/tasks`,
    // Instância dedicada por execução (dados limpos).
    reuseExistingServer: false,
    env: { PORT: String(PORT) },
    timeout: 15_000,
  },
  projects: [
    { name: 'api', testMatch: 'api/**/*.spec.ts' },
    { name: 'e2e', testMatch: 'e2e/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
  ],
});
