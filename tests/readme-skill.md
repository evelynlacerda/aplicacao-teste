# Setup de testes

## Framework escolhido
**Playwright Test 1.64.1** (`@playwright/test`) — [Documentação oficial](https://playwright.dev/docs/intro) · [Testes de API](https://playwright.dev/docs/api-testing)

Ferramentas auxiliares:
- [TypeScript 5.9.3](https://www.typescriptlang.org/docs/) — tipagem estrita dos testes e da config.
- [@types/node 24.19.2](https://www.npmjs.com/package/@types/node) — tipos de `path`, `process` etc.

## Por que esta escolha
- **O que o projeto exige:** testar **interface Web e API HTTP** contra o servidor real, com um teste de integração sem mocks e ao menos um fluxo que cruze tela ↔ API; testes em pasta separada (`tests/`); comandos que funcionem no Windows.
- **Por que Playwright:** uma única ferramenta cobre as duas camadas — fixture `page` para a UI e `request` para HTTP real — e o `webServer` sobe a aplicação original em porta dedicada. Está em TypeScript, no ecossistema que você já usa.
- **Alternativas descartadas:**
  - Vitest + Supertest: cobre só a API e exigiria uma segunda ferramenta para a UI.
  - Jest: sem suporte nativo a navegador; nada pré-existente que justifique.
  - Cypress: só se o projeto já usasse; API HTTP é menos natural.

## Como instalar e rodar
```bash
cd tests
npm install
npx playwright install chromium
npm test
```

| Comando | O que faz |
|---|---|
| `npm test` | Roda todos os projetos (`api` + `e2e`) |
| `npm run test:api` | Só os testes de API (`api/**/*.spec.ts`) |
| `npm run test:e2e` | Só os testes de interface (`e2e/**/*.spec.ts`) |
| `npm run test:headed` | Interface com navegador visível |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run report` | Abre o relatório HTML da última execução |

Configuração relevante (`playwright.config.ts`):
- `webServer`: `node server.js` com `cwd` em `../aplicacao-teste/api` e `env: { PORT: '3334' }` (sem `VAR=valor cmd`, funciona no Windows); `reuseExistingServer: false`.
- `workers: 1`, `fullyParallel: false`, `retries: 0`.
- `trace` / `screenshot` / `video` mantidos só em falha; reporters `list` + `html`.
- `baseURL`: `http://127.0.0.1:3334`.

## Validação da instalação
| Passo | Comando | Resultado |
|---|---|---|
| Versão | `npx playwright --version` | ok — `Version 1.64.1` |
| TypeScript | `npx tsc --noEmit` | ok — saída 0 |
| Config carrega | `npx playwright test --list --pass-with-no-tests` | ok — `Total: 0 tests in 0 files` |
| Runner executa | `npx playwright test --pass-with-no-tests` | ok — saída 0 |
| Navegador | `npx playwright install chromium` | ok — sem erro |
| App sobe | `PORT=3334 node server.js` na pasta `aplicacao-teste/api` | ok — `GET /api/tasks` → 200 e `GET /` → 200; processo encerrado depois |

> Nenhum teste foi escrito por esta skill. A pasta contém apenas config, `package.json`, `.gitignore`, `.gitkeep` e este arquivo.

## Estrutura de pastas
```
tests/
├── package.json / package-lock.json   dependências e scripts
├── playwright.config.ts               projetos api/e2e, webServer, reporters
├── tsconfig.json                      TypeScript estrito
├── api/                               specs de API e integração (vazia)
├── e2e/                               specs de interface e tela↔API (vazia)
├── support/                           helpers: cliente de API, datas, limpeza (vazia)
└── readme-skill.md                    este arquivo
```

## Esqueleto — teste que PASSA (para copiar)
Arquivo sugerido: `tests/api/exemplo-passa.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('[R12] GET /api/tasks retorna 200 e um array JSON', async ({ request }) => {
  // ARRANGE: nada a preparar; a fixture `request` já usa o baseURL da config (porta 3334).

  // ACT: requisição HTTP real ao servidor subido pelo webServer.
  const resposta = await request.get('/api/tasks');

  // ASSERT: status e formato do corpo conforme o requisito R12.
  expect(resposta.status(), 'GET /api/tasks deveria responder 200').toBe(200);
  const corpo = await resposta.json();
  expect(Array.isArray(corpo), 'o corpo deveria ser um array').toBe(true);
});
```

## Esqueleto — teste que FALHA de propósito (para copiar)
Arquivo sugerido: `tests/api/exemplo-falha.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('EXEMPLO: asserção propositalmente errada', async ({ request }) => {
  const resposta = await request.get('/api/tasks');

  // Erro proposital: o requisito diz 200, aqui esperamos 500.
  expect(resposta.status()).toBe(500);
});
```

Exemplo **ilustrativo** (não é saída real) do erro:

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 500
Received: 200

  > 7 |   expect(resposta.status()).toBe(500);
```

Como ler: `Expected` é o que a asserção pede, `Received` é o que a aplicação devolveu, e a seta `>` aponta a linha. Em falhas de UI, abra o trace/print/vídeo em `test-results/` ou com `npm run report`.

## Como ler uma falha
- **Defeito do produto:** o requisito diz X, a app faz Y → manter o teste vermelho e registrar o `DEF-xx`.
- **Problema no teste:** seletor, timing, dado colidindo → corrigir o teste.
- **Bloqueio de ambiente:** porta ocupada, navegador ausente → documentar.
- Nunca ajustar o esperado para "ficar verde".

## Boas práticas para os próximos testes
- Títulos únicos por teste (ex.: sufixo com timestamp/aleatório) e limpeza via `DELETE` no teardown.
- Sem IDs fixos; use o `id` devolvido pelo `POST`.
- Datas calculadas a partir de hoje (data local), nunca literais que envelhecem.
- Sem `waitForTimeout`; use asserções com auto-wait (`expect(locator)...`).
- Testes independentes, sem depender da ordem.
- Contadores e filtros dependem de todas as tarefas: compare por delta ou isole a instância.
- Asserções derivadas dos requisitos R1–R18, com mensagem de falha clara.
- Marque falhas de defeito com anotação ligada ao `DEF-xx`.
