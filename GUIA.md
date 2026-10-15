# Guia passo a passo — Desafio de QA (5 horas)

> Guia para **eu seguir** durante o desafio. O `CLAUDE.md` orienta o CLI; este aqui orienta **a mim**.
> Regra de ouro: **o teste segue o requisito, não a aplicação.** Se a app estiver errada, o teste fica vermelho e vira um defeito.

---

## Cronograma

| Bloco | Tempo | Fase | Entregável |
|---|---|---|---|
| T+0:00 | 15 min | 0. Preparação | pastas, `docs/tempo.md`, app rodando |
| T+0:15 | 20 min | 1. Setup do framework | `tests/` + `readme-skill.md` |
| T+0:35 | 35 min | 2. Exploração | `docs/evidencias/*.txt` + anotações |
| T+1:10 | 60 min | 3. Plano + execução manual | `docs/plano-de-testes.md` |
| T+2:10 | 40 min | 4. Defeitos | `docs/defeitos.md` |
| T+2:50 | 75 min | 5. Automação | `tests/api/*`, `tests/e2e/*` |
| T+4:05 | 35 min | 6. README de entrega | `README.md` |
| T+4:40 | 20 min | 7. Revisão final | entrega |

⏰ **Checkpoints:** em T+2:50 o plano e os defeitos precisam estar prontos (mesmo que imperfeitos). Em T+4:05, pare a automação, mesmo que falte algo. Ao chegar em 5h, encerre e documente o que ficou pendente.

**Se o tempo apertar, priorize nesta ordem:** teste de integração → cenário tela↔API → defeitos que bloqueiam publicação → README com síntese → o resto.

---

## Fase 0 — Preparação (15 min)

### Passos
1. Estrutura da pasta:
   ```
   desafio-qa/
   ├── CLAUDE.md
   ├── GUIA.md
   ├── aplicacao-teste/
   └── docs/
       ├── DESAFIO.md
       ├── tempo.md
       └── evidencias/
   ```
2. Inicie o Git, para provar depois que `aplicacao-teste/` não foi alterada:
   ```bash
   git init
   git add .
   git commit -m "chore: estado inicial do desafio"
   ```
3. Crie o `docs/tempo.md`:
   ```markdown
   # Registro de tempo
   | Fase | Início | Fim | Duração |
   |---|---|---|---|
   | 0. Preparação | 12:30 | | |
   ```
4. Suba a aplicação (terminal 1):
   ```bash
   cd aplicacao-teste/api
   npm start
   ```
   Abra http://127.0.0.1:3333 no navegador.

> 💡 **Windows:** use o terminal **Git Bash** no VS Code para os comandos `curl` deste guia funcionarem como estão. No PowerShell, `curl` é um alias com outra sintaxe.

✅ **Pronto quando:** a tela abre e `curl http://127.0.0.1:3333/api/tasks` retorna `[]`.

---

## Fase 1 — Setup do framework (20 min)

### Passos
1. No CLI, na raiz do projeto:
   ```
   /setup-testes
   ```
2. Leia a decisão que ele mostrar. O esperado é **Playwright**, porque testa a tela e a API com HTTP real numa ferramenta só.
3. Quando terminar, confira:
   ```bash
   cd tests
   npx playwright test --list --pass-with-no-tests
   ```
4. Leia o `tests/readme-skill.md` (5 min). É dele que vêm os esqueletos que você vai copiar na Fase 5.
5. Commit: `git add . && git commit -m "chore: setup Playwright"`

✅ **Pronto quando:** o runner roda sem erro e a config sobe a app numa porta própria (ex.: 3334).

---

## Fase 2 — Exploração (35 min)

Objetivo: **observar cada requisito pelo menos uma vez** e guardar a saída como evidência. Ainda não é hora de escrever relatos.

### Passo 1 — API com curl (20 min)

Com a app rodando na 3333, rode cada bloco e salve a saída com `> docs/evidencias/<nome>.txt`. O `-i` mostra o status HTTP, que é a sua evidência.

```bash
B=http://127.0.0.1:3333/api/tasks
HOJE=$(date +%F)                 # data de hoje, formato YYYY-MM-DD
ONTEM=$(date -d yesterday +%F)   # no Git Bash funciona; no macOS: date -v-1d +%F
```

**Criação válida (R4, R13)**
```bash
curl -i -X POST $B -H "Content-Type: application/json" \
  -d '{"title":"  Tarefa base  ","dueDate":"2099-12-31","priority":"Alta"}' \
  > docs/evidencias/R13-post-valido.txt
```
Confira: status `201`, título **sem espaços**, `status: "Pendente"`, `id` numérico.

**Título (R1)**
```bash
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"ab","dueDate":"2099-12-31","priority":"Alta"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"     ","dueDate":"2099-12-31","priority":"Alta"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"abc","dueDate":"2099-12-31","priority":"Baixa"}'
```
Para os limites de 80/81 caracteres:
```bash
T80=$(printf 'a%.0s' {1..80}); T81=$(printf 'a%.0s' {1..81})
curl -i -X POST $B -H "Content-Type: application/json" -d "{\"title\":\"$T80\",\"dueDate\":\"2099-12-31\",\"priority\":\"Alta\"}"
curl -i -X POST $B -H "Content-Type: application/json" -d "{\"title\":\"$T81\",\"dueDate\":\"2099-12-31\",\"priority\":\"Alta\"}"
```

**Data (R2)**: hoje deve passar; ontem, data impossível e formato errado devem dar 400
```bash
curl -i -X POST $B -H "Content-Type: application/json" -d "{\"title\":\"Data hoje\",\"dueDate\":\"$HOJE\",\"priority\":\"Alta\"}"
curl -i -X POST $B -H "Content-Type: application/json" -d "{\"title\":\"Data ontem\",\"dueDate\":\"$ONTEM\",\"priority\":\"Alta\"}"
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"Data 30 fev","dueDate":"2099-02-30","priority":"Alta"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"Data formato","dueDate":"31/12/2099","priority":"Alta"}'
```

**Prioridade (R3)**
```bash
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"Sem prioridade","dueDate":"2099-12-31"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"Prioridade X","dueDate":"2099-12-31","priority":"Urgente"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"Prioridade caixa","dueDate":"2099-12-31","priority":"alta"}'
```

**Duplicidade (R15)**: o primeiro dá 201; o segundo, igual, deve dar 409; o terceiro, com caixa diferente, deve dar 201
```bash
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"Duplicada","dueDate":"2099-12-31","priority":"Alta"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":" Duplicada ","dueDate":"2099-12-31","priority":"Baixa"}'
curl -i -X POST $B -H "Content-Type: application/json" -d '{"title":"duplicada","dueDate":"2099-12-31","priority":"Alta"}'
curl -s $B   # quantas "Duplicada" existem?
```

**JSON inválido (contrato)**
```bash
curl -i -X POST $B -H "Content-Type: application/json" -d '{title: sem aspas}'
curl -i -X POST $B -H "Content-Type: application/json" -d '[1,2,3]'
curl -i -X POST $B -H "Content-Type: application/json" -d '"texto"'
```

**Consulta e exclusão (R12, R14, R16, R17)**: troque `1` por um id que exista
```bash
curl -i $B
curl -i $B/1
curl -i $B/999999
curl -i -X DELETE $B/999999
curl -i -X DELETE $B/1
curl -i $B/1                       # depois de excluir
curl -i http://127.0.0.1:3333/api/rota-que-nao-existe
curl -i http://127.0.0.1:3333/qualquer-coisa
```

**Status (R6, R7, R18)**: crie uma tarefa nova e use o id dela no lugar de `ID`
```bash
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Concluída"}'      # pular etapa → 409
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Em andamento"}'  # → 200
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Em andamento"}'  # repetida → 409
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Concluída"}'     # → 200
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Pendente"}'      # voltar → 409
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{}'                         # ausente → 400
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Xyz"}'           # inválido → 400
curl -i -X PATCH $B/999999 -H "Content-Type: application/json" -d '{"status":"Em andamento"}' # → 404
curl -i -X PATCH $B/ID -H "Content-Type: application/json" -d '{"status":"Concluída","title":"Hack"}' # só status muda?
```

> 💡 Em vez de redirecionar cada comando, você pode rodar um bloco inteiro e colar a saída num arquivo por requisito (ex.: `docs/evidencias/R18-patch.txt`).

### Passo 2 — Interface (15 min)

Use a tela e anote o que acontece. Tire **prints** (Win+Shift+S) do que parecer errado e salve em `docs/evidencias/`.

| Verificação | Como fazer | Req. |
|---|---|---|
| Cadastro válido | preencher tudo → Adicionar → aparece com "Pendente"? | R4 |
| Título curto/espaços | `ab`, `   abc   `, só espaços. Que mensagem aparece? E pela API, como ficou salvo? | R1, R5 |
| Data passada | escolha ontem no calendário | R2, R5 |
| Sem prioridade | deixe "Selecione" | R3, R5 |
| Avançar status | Iniciar → Concluir; algum botão permite voltar? | R6, R7 |
| Filtros | crie 1 Pendente, 1 Em andamento, 1 Concluída → clique em cada filtro e veja **quais** aparecem | R8 |
| Contadores | com um filtro ativo, os números do Resumo mudam? Deveriam mostrar o total sempre | R9 |
| Recarregar | F5. As tarefas continuam? | R10 |
| Exclusão | clique Excluir. Aparece confirmação? | R11 |
| Tela ↔ API | crie pela tela → `curl $B` mostra? Crie por curl → F5 na tela mostra? | — |

### Passo 3 — Anotar suspeitas (já com o CLI ajudando)
```
/qa-testes Com base em docs/evidencias/ e nas minhas anotações abaixo, monte uma tabela
requisito → comportamento observado → OK/suspeito. Não altere aplicacao-teste/.
<cole suas anotações da tela>
```

✅ **Pronto quando:** cada R1–R18 tem uma observação e as suspeitas estão listadas.

---

## Fase 3 — Plano e execução manual (60 min)

### Passo 1 — Pedir o rascunho ao CLI (10 min)
```
Escreva docs/plano-de-testes.md conforme a Fase 3 do CLAUDE.md, usando os resultados REAIS
de docs/evidencias/. Mínimo de 12 casos, com UI, API e pelo menos 1 fluxo tela↔API.
Status só Passou/Falhou/Bloqueado/Não executado conforme o que foi observado.
```

### Passo 2 — Revisar e completar (50 min)
Confira se o plano tem todas as seções:

```markdown
# Plano de testes — Painel de tarefas

## 1. Escopo e objetivo
Validar cadastro, fluxo de status, filtros/contadores e a API de tarefas contra os requisitos R1–R18,
na interface e na API, priorizando integridade de dados e contrato da API.
Fora do escopo: persistência após reiniciar o servidor, tempo real, desempenho, segurança.

## 2. Riscos e prioridades
| Risco | Impacto | Prob. | Prioridade | Requisitos |
|---|---|---|---|---|
| Dados inválidos aceitos e gravados | Alto | ? | Alta | R1–R3, R13 |
| Registros duplicados | Alto | ? | Alta | R15 |
| Contrato de status HTTP errado quebra clientes | Médio | ? | Alta | R14, R16, R17 |
| Informação enganosa na tela (filtros/contadores) | Médio | ? | Média | R8, R9 |
| Exclusão acidental | Alto | ? | Alta | R11 |

## 3. Tipos de teste
Funcional (positivo/negativo), análise de valor-limite, partição de equivalência, transição de estados,
contrato de API, integração (rota+validação+armazenamento), E2E tela↔API.

## 4. Dados e condições
Node 18+, app em http://127.0.0.1:3333, Chrome, Git Bash. Datas relativas a hoje (data local).
Títulos únicos. Tarefas em cada status para filtros/contadores.

## 5. Critérios de entrada e saída
Entrada: app sobe e GET /api/tasks retorna 200.
Saída: todos os casos executados ou justificados; todo "Falhou" com DEF-xx e evidência.

## 6. Casos de teste
| ID | Req. | Camada | Tipo | Pré-condição | Passos | Esperado | Obtido | Status | Evidência/Defeito |
|---|---|---|---|---|---|---|---|---|---|
```

**Exemplo de um caso bem escrito** (reproduzível por outra pessoa):

| ID | Req. | Camada | Tipo | Pré-condição | Passos | Esperado | Obtido | Status | Evidência/Defeito |
|---|---|---|---|---|---|---|---|---|---|
| CT-03 | R1, R13 | API | Borda | App rodando | 1. `POST /api/tasks` com `{"title":"ab","dueDate":"2099-12-31","priority":"Alta"}` 2. `GET /api/tasks` | 1. `400` + `{"error":...}` 2. nenhuma tarefa "ab" | *(o que você viu)* | Passou/Falhou | `evidencias/R1-titulo.txt` / DEF-0X |

**Lista mínima sugerida** (adapte ao que encontrou):
1. Criar válido pela API (positivo)
2. Título com espaços nas pontas é salvo sem espaços (borda)
3. Título 2 / 3 / 80 / 81 caracteres (borda)
4. Data de hoje aceita / ontem rejeitada (borda)
5. Data inexistente (`2099-02-30`) (negativo)
6. Prioridade fora da lista (negativo)
7. Duplicidade título+data (negativo) e mesma coisa com caixa diferente (positivo)
8. JSON inválido / não-objeto (negativo)
9. GET/DELETE de id inexistente (negativo)
10. Rota desconhecida (negativo)
11. Sequência de status + transições proibidas (estado)
12. Filtros mostram só o status certo (UI)
13. Contadores com filtro ativo (UI)
14. Exclusão pede confirmação (UI)
15. Cadastrar na tela → consultar na API (integração UI↔API)

✅ **Pronto quando:** mais de 12 casos, cada um com passos repetíveis e status real.
Commit: `git commit -am "docs: plano e execução manual"`

---

## Fase 4 — Defeitos (40 min)

### Passo 1 — Rascunho pelo CLI
```
Escreva docs/defeitos.md conforme a Fase 4 do CLAUDE.md, um DEF-xx para cada caso "Falhou"
do plano. Reproduza cada um antes de registrar e salve a evidência em docs/evidencias/.
No fim, a seção "Defeitos que impedem publicação".
```

### Passo 2 — Revisar cada relato
Use este **exemplo de formato** (preencha com os dados reais do que você encontrou):

```markdown
## DEF-0X — POST /api/tasks aceita <campo> inválido e cria a tarefa

- **Requisito violado:** R3, R13
- **Ambiente:** Windows 11, Node 20.x, Chrome 1xx, http://127.0.0.1:3333
- **Pré-condições:** servidor recém-iniciado
- **Passos para reproduzir:**
  1. `curl -i -X POST http://127.0.0.1:3333/api/tasks -H "Content-Type: application/json" -d '{"title":"Teste","dueDate":"2099-12-31","priority":"Urgente"}'`
  2. `curl -s http://127.0.0.1:3333/api/tasks`
- **Resultado esperado:** `400` com `{"error": "..."}` e nenhuma tarefa criada
- **Resultado obtido:** `<status real>` e a tarefa `<aparece/não aparece>` na listagem
- **Severidade:** Alta — dado fora do domínio é persistido e exibido; quebra filtros e relatórios
- **Prioridade:** Alta — fácil de disparar por qualquer cliente da API
- **Evidência:** `docs/evidencias/R3-prioridade.txt`; teste `api/validacoes.spec.ts › R3`
- **Bloqueia publicação?** Sim — compromete a integridade dos dados
```

**Como escolher severidade × prioridade:**

| Severidade (impacto) | Quando |
|---|---|
| Crítica | perda/corrupção de dados, ação destrutiva sem proteção, sistema inutilizável |
| Alta | regra de negócio violada, dado inválido gravado, contrato da API quebrado |
| Média | informação incorreta na tela, mas os dados estão certos |
| Baixa | mensagem confusa, problema cosmético |

Prioridade = urgência de corrigir: frequência, visibilidade, existência de contorno.

**Bloqueia publicação?** Em geral, sim para: perda de dado sem confirmação, dado inválido ou duplicado gravado, regra de negócio central quebrada. Em geral, não para: status HTTP divergente sem efeito no dado, texto de mensagem.

✅ **Pronto quando:** cada relato pode ser reproduzido só com o texto dele.
Commit: `git commit -am "docs: relatos de defeitos"`

---

## Fase 5 — Automação (75 min)

### Escolha dos 5 cenários (critério: risco + exigências do desafio)

| # | Arquivo | Cenário | Camada | Tipo | Por quê |
|---|---|---|---|---|---|
| 1 | `api/integracao.spec.ts` | **[INTEGRAÇÃO]** cria via POST e confere em GET /:id e GET / | API | Positivo | Obrigatório; prova rota+validação+armazenamento |
| 2 | `api/validacoes.spec.ts` | Payloads inválidos → 400 e nada criado | API | Negativo | Maior risco: dado inválido gravado |
| 3 | `api/status.spec.ts` | Sequência de status e transições proibidas → 409 | API | Estado | Regra de negócio central |
| 4 | `e2e/tela-api.spec.ts` | Cadastra na tela e consulta na API | UI+API | Positivo | Obrigatório: compartilhamento de dados |
| 5 | `e2e/exclusao.spec.ts` ou `e2e/filtros.spec.ts` | Exclusão pede confirmação / filtros+contadores | UI | Negativo | Risco de perda de dado / informação errada |

> Troque o 3 ou o 5 por algo mais arriscado que você tenha encontrado na Fase 2.

### Passo 1 — Helper de dados (5 min) → `tests/support/dados.ts`
```ts
// Datas no fuso local (mesma máquina do servidor), nunca fixas.
export function dataLocal(diasAPartirDeHoje = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + diasAPartirDeHoje);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Título único por teste: evita colisão e a regra de duplicidade (R15).
export function tituloUnico(prefixo = 'QA'): string {
  return `${prefixo} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
```

### Passo 2 — Teste de integração (15 min) → `tests/api/integracao.spec.ts`
```ts
import { test, expect } from '@playwright/test';
import { dataLocal, tituloUnico } from '../support/dados';

/**
 * [INTEGRAÇÃO] Componentes integrados, sem mocks:
 * requisição HTTP real → rota POST → validação → armazenamento em memória
 * → leitura pelas rotas GET /:id e GET /.
 * Requisitos: R1, R4, R12, R13, R14.
 */
test('[INTEGRAÇÃO] cria pela API e o registro salvo é o mesmo em GET /:id e GET /', async ({ request }) => {
  const titulo = tituloUnico();
  const entrada = { title: `  ${titulo}  `, dueDate: dataLocal(7), priority: 'Alta' };

  // 1) Criar
  const criar = await request.post('/api/tasks', { data: entrada });
  expect(criar.status(), 'POST válido deve retornar 201 (R13)').toBe(201);
  const criada = await criar.json();
  expect(criada).toMatchObject({
    title: titulo,          // R1: salvo sem espaços nas pontas
    dueDate: entrada.dueDate,
    priority: 'Alta',
    status: 'Pendente',     // R4
  });

  // 2) Consultar pelo id gerado (nunca fixo)
  const buscar = await request.get(`/api/tasks/${criada.id}`);
  expect(buscar.status(), 'GET de tarefa existente deve retornar 200 (R14)').toBe(200);
  expect(await buscar.json()).toEqual(criada);

  // 3) Aparece exatamente uma vez na lista
  const lista = await (await request.get('/api/tasks')).json();
  expect(lista.filter((t: { id: number }) => t.id === criada.id)).toEqual([criada]);

  // Limpeza
  await request.delete(`/api/tasks/${criada.id}`);
});
```

### Passo 3 — Negativo da API, orientado a dados (15 min) → `tests/api/validacoes.spec.ts`
```ts
import { test, expect } from '@playwright/test';
import { dataLocal, tituloUnico } from '../support/dados';

// Cada linha: payload inválido + requisito violado (+ defeito, se o teste falhar).
const invalidos = [
  { caso: 'título com 2 caracteres', req: 'R1', body: { title: 'ab',          dueDate: dataLocal(1),  priority: 'Alta' } },
  { caso: 'título só com espaços',   req: 'R1', body: { title: '     ',       dueDate: dataLocal(1),  priority: 'Alta' } },
  { caso: 'vencimento ontem',        req: 'R2', body: { title: tituloUnico(), dueDate: dataLocal(-1), priority: 'Alta' } },
  { caso: 'prioridade fora da lista',req: 'R3', body: { title: tituloUnico(), dueDate: dataLocal(1),  priority: 'Urgente' } },
  // adicione: data inexistente, formato errado, sem prioridade...
];

test.describe('API — cadastro inválido retorna 400 e não cria registro (R5, R13)', () => {
  for (const { caso, req, body } of invalidos) {
    test(`${req}: ${caso}`, async ({ request }) => {
      const antes = (await (await request.get('/api/tasks')).json()).length;

      const res = await request.post('/api/tasks', { data: body });

      // Se este caso falhar por defeito do produto, vincule ao relato:
      // test.info().annotations.push({ type: 'defeito', description: 'DEF-0X — título' });
      expect(res.status(), `payload: ${JSON.stringify(body)}`).toBe(400);
      expect(await res.json()).toHaveProperty('error');

      const depois = (await (await request.get('/api/tasks')).json()).length;
      expect(depois, 'nenhuma tarefa deve ser criada').toBe(antes);

      // Limpeza defensiva, caso o produto tenha criado indevidamente
      if (res.status() === 201) await request.delete(`/api/tasks/${(await res.json()).id}`);
    });
  }
});
```

> 💡 **Vincular falha a defeito:** a anotação aparece no relatório HTML. Coloque-a só nos casos que falham por defeito conhecido, com o ID do `docs/defeitos.md`. Uma forma prática é adicionar um campo `defeito: 'DEF-03'` no objeto do caso e empurrar a anotação quando ele existir.

### Passo 4 — Tela ↔ API (15 min) → `tests/e2e/tela-api.spec.ts`
```ts
import { test, expect } from '@playwright/test';
import { dataLocal, tituloUnico } from '../support/dados';

test('tarefa cadastrada pela tela é retornada pela API (R4, R12)', async ({ page, request }) => {
  const titulo = tituloUnico('Tela');
  const vencimento = dataLocal(3);

  await page.goto('/');
  await page.getByLabel('Título').fill(titulo);
  await page.getByLabel('Vencimento').fill(vencimento);
  await page.getByLabel('Prioridade').selectOption('Média');
  await page.getByRole('button', { name: 'Adicionar' }).click();

  // Na tela (espera automática, sem sleep)
  const item = page.locator('li.task')
    .filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
  await expect(item).toContainText('Status: Pendente');

  // Na API: o mesmo dado está no armazenamento
  const lista = await (await request.get('/api/tasks')).json();
  const salvas = lista.filter((t: { title: string }) => t.title === titulo);
  expect(salvas, 'exatamente 1 registro com o título cadastrado').toHaveLength(1);
  expect(salvas[0]).toMatchObject({ dueDate: vencimento, priority: 'Média', status: 'Pendente' });

  await request.delete(`/api/tasks/${salvas[0].id}`);
});
```

### Passo 5 — UI negativa (15 min) → `tests/e2e/exclusao.spec.ts`
```ts
import { test, expect } from '@playwright/test';
import { dataLocal, tituloUnico } from '../support/dados';

test('excluir pede confirmação e, se cancelar, a tarefa continua (R11)', async ({ page, request }) => {
  // Arrange pela API: mais rápido e independente da tela
  const titulo = tituloUnico('Excluir');
  const criada = await (await request.post('/api/tasks', {
    data: { title: titulo, dueDate: dataLocal(2), priority: 'Baixa' },
  })).json();

  await page.goto('/');
  const item = page.locator('li.task')
    .filter({ has: page.getByRole('heading', { name: titulo, exact: true }) });
  await expect(item).toBeVisible();

  // Captura a confirmação (window.confirm) e CANCELA
  let pediuConfirmacao = false;
  page.once('dialog', async (dialog) => {
    pediuConfirmacao = true;
    await dialog.dismiss();
  });
  await item.getByRole('button', { name: 'Excluir' }).click();

  expect(pediuConfirmacao, 'a exclusão deve pedir confirmação').toBe(true);
  await expect(item, 'ao cancelar, a tarefa deve continuar na lista').toBeVisible();

  await request.delete(`/api/tasks/${criada.id}`);
});
```

**Alternativa para o cenário 5: filtros e contadores (R8, R9)**, ideia em passos:
1. Pela API, crie 3 tarefas e avance uma para "Em andamento" e outra para "Concluída".
2. Na tela, leia os contadores com o filtro "Todas".
3. Clique em "Concluídas": confira que **só** aparecem itens com `Status: Concluída`, e que os contadores **não mudaram**.

> ⚠️ Os contadores dependem de todas as tarefas do servidor, e outros testes criam tarefas. Por isso compare **antes × depois do filtro** em vez de números absolutos. A config usa `workers: 1`.

### Passo 6 — Rodar e classificar (10 min)
```bash
cd tests
npx playwright test          # tudo
npx playwright test --ui     # modo visual, para depurar
npx playwright show-report   # relatório HTML
```
Para cada teste vermelho, decida:
- **Defeito do produto** → mantenha vermelho, adicione a anotação `DEF-xx` e cite no README.
- **Erro no teste** (seletor, dado, tempo) → corrija o teste.

Salve um print do relatório em `docs/evidencias/relatorio-playwright.png`.

**Prompt para o CLI** (se quiser que ele escreva o cenário 3 ou ajuste os outros):
```
Implemente tests/api/status.spec.ts cobrindo R6, R7 e R18 (sequência válida → 200;
pular etapa, repetir e voltar de Concluída → 409; status ausente/inválido → 400; id inexistente → 404),
no mesmo estilo de tests/api/validacoes.spec.ts. Asserções pelos requisitos. Não altere aplicacao-teste/.
```

✅ **Pronto quando:** `npx playwright test` roda do zero, há 4 a 6 cenários e cada vermelho tem um DEF-xx.
Commit: `git add . && git commit -m "test: automação UI e API"`

---

## Fase 6 — README de entrega (35 min)

### Prompt
```
Escreva o README.md da raiz conforme a Fase 6 do CLAUDE.md, usando o resultado real da última
execução da suíte, docs/plano-de-testes.md, docs/defeitos.md e docs/tempo.md.
```

### Esqueleto que o README precisa ter
```markdown
# Desafio de QA — Painel de tarefas

## Resumo
O que foi entregue e onde está (links para docs/ e tests/).

## Como executar
### Aplicação
### Testes automatizados
(comandos copiáveis: npm install, npx playwright install chromium, npm test, show-report)

## Decisões
- Framework: Playwright — por quê
- Cenários automatizados e critério de escolha
- Isolamento: instância dedicada na porta 3334, títulos únicos, limpeza, workers: 1

## Resultado da automação
| Teste | Camada | Status | Defeito |
|---|---|---|---|
| [INTEGRAÇÃO] cria e consulta | API | ✅ | — |
| ... | | ❌ | DEF-0X |

## Limitações e pendências

## Tempo dedicado
Total: ~X h (detalhe em docs/tempo.md)

## Síntese
1. Três maiores riscos
2. Por que esses cenários
3. O que testaria a seguir
4. Pipeline de entrega
5. Ferramentas, fontes e IA utilizadas, e como validei
```

### Ideias para a síntese (escreva com as suas palavras)
- **Pipeline:** GitHub Actions em cada PR (`npm ci` → `npx playwright install --with-deps chromium` → `npx playwright test`), publicando o relatório HTML como artefato. Testes de API como gate rápido; E2E logo depois; bloquear o merge em falha nova. Defeitos conhecidos ficam visíveis até serem corrigidos, não marcados como "skip".
- **Com mais tempo:** acessibilidade (teclado/leitor de tela), concorrência (duas abas), limites de datas (29/02, virada de dia/fuso), carga simples na API, responsividade, mais combinações de filtro.
- **IA:** "Usei Claude (chat + Claude Code CLI) para converter o enunciado, montar o setup e rascunhar documentos e testes. Validei executando cada curl e cada teste, conferindo cada defeito manualmente e revisando todo o código e os textos."

✅ **Pronto quando:** outra pessoa consegue rodar tudo só lendo o README.

---

## Fase 7 — Revisão final (20 min)

```bash
git status
git diff $(git rev-list --max-parents=0 HEAD) -- aplicacao-teste/   # compara com o 1º commit; não deve mostrar nada
```

- [ ] `aplicacao-teste/` igual ao original
- [ ] Clonar em outra pasta → seguir o README → tudo roda
- [ ] Teste de integração com `[INTEGRAÇÃO]` no nome e um comentário explicando o que integra
- [ ] Todo "Falhou" do plano tem DEF-xx; todo DEF-xx tem evidência
- [ ] Seção "Defeitos que impedem publicação" preenchida
- [ ] Tempo total e uso de IA no README
- [ ] Sem `node_modules/`, `test-results/`, `playwright-report/`, senhas ou dados pessoais
- [ ] Compactar ou subir para o Git, conforme combinado

---

## Cola rápida

| Preciso... | Comando |
|---|---|
| subir a app | `cd aplicacao-teste/api && npm start` |
| listar tarefas | `curl -s http://127.0.0.1:3333/api/tasks` |
| rodar todos os testes | `cd tests && npx playwright test` |
| só API / só tela | `npx playwright test api/` / `npx playwright test e2e/` |
| ver passo a passo | `npx playwright test --ui` |
| relatório | `npx playwright show-report` |
| um teste só | `npx playwright test -g "INTEGRAÇÃO"` |
| ver o navegador | `npx playwright test --headed` |
