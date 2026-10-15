# Guia de execução — Desafio de QA Funcional e Automação

> Este arquivo orienta o Claude CLI (e eu mesma) durante o desafio.
> Enunciado completo: `docs/DESAFIO.md`. Instruções da aplicação: `aplicacao-teste/README.md`.
> Escreva tudo em **português**.

---

## 1. Contexto

Uma aplicação Web + API HTTP de gerenciamento de tarefas, com **defeitos intencionais**. A missão:

1. Planejar e executar testes manuais.
2. Registrar os defeitos encontrados.
3. Automatizar de 4 a 6 cenários (interface + API), incluindo um **teste de integração da API obrigatório**.
4. Entregar um README com instalação, execução, decisões, limitações e síntese.

**Tempo:** cerca de 4h, com limite de **5h**. Ao chegar a 5h, parar e documentar o que ficou pendente e os próximos passos. Priorização vale mais que volume.

---

## 2. Regras que nunca podem ser quebradas

1. **Nunca alterar nada dentro de `aplicacao-teste/`.** Nem para corrigir defeitos, nem para facilitar testes. Se algo for indispensável para a automação, parar, explicar e preservar o original.
2. **As asserções seguem os requisitos (seção 4), nunca o comportamento atual.** Se a aplicação está errada, o teste **deve falhar**. Proibido ajustar o esperado para a suíte ficar verde.
3. **Toda falha de teste automatizado é classificada:** defeito do produto (vincular a um `DEF-xx`), problema no teste (corrigir) ou bloqueio de ambiente (documentar).
4. **Nada de inventar resultados.** Status "Passou/Falhou" só depois de executar de verdade. Evidência real: saída de curl, print, relatório do teste.
5. **A limpeza dos dados ao encerrar o servidor NÃO é defeito** (faz parte do ambiente). Atualização em tempo real está fora do escopo.
6. **Testes ficam em pasta separada** (`tests/`), fora de `aplicacao-teste/`.
7. **Não incluir senhas, tokens ou dados pessoais** em nenhum arquivo.
8. **Comandos devem funcionar no Windows também** (sem `VAR=valor comando` em scripts; usar `env` no config).

---

## 3. Como executar a aplicação

- Requer Node.js 18+. Sem dependências e sem `npm install`.
- Em `aplicacao-teste/api`: `npm start`, que abre a interface e a API em `http://127.0.0.1:3333`.
- Outra porta: variável `PORT` (ex.: 3334). Nos testes automatizados, usar porta dedicada via `webServer` do framework.
- Dados em memória: recarregar a página mantém os dados; reiniciar o servidor limpa tudo. Todos os clientes compartilham a mesma instância.
- Isolamento nos testes: títulos únicos por teste, limpeza no final, instância dedicada por execução. **Sem IDs fixos e sem datas fixas que envelhecem** (calcular a partir de hoje, data local).

---

## 4. Requisitos (referência para asserções)

Use os IDs `R1`…`R18` em casos de teste, defeitos e nomes de testes.

### Cadastro
| ID | Requisito |
|---|---|
| R1 | Título obrigatório, salvo **sem espaços nas extremidades**, com **3 a 80 caracteres** após o trim |
| R2 | Vencimento obrigatório, **data de calendário válida**, **≥ hoje** (data local do servidor). API usa `YYYY-MM-DD` |
| R3 | Prioridade obrigatória: somente `Baixa`, `Média`, `Alta` |
| R4 | Nova tarefa começa com status `Pendente` |
| R5 | Dado inválido: a tarefa **não é criada** e aparece uma **mensagem compreensível** |

### Fluxo e consulta (interface)
| ID | Requisito |
|---|---|
| R6 | Status avança `Pendente → Em andamento → Concluída` |
| R7 | Tarefa `Concluída` não volta a um status anterior |
| R8 | Filtros Todos / Pendentes / Em andamento / Concluídas mostram **somente** os itens correspondentes |
| R9 | Contadores do resumo refletem **todas** as tarefas, **independentemente do filtro** |
| R10 | Tarefas permanecem após recarregar a página |
| R11 | Exclusão **pede confirmação** antes de remover |

### API HTTP
| ID | Requisito |
|---|---|
| R12 | `GET /api/tasks` → 200 + array JSON com todas as tarefas (`[]` se vazio) |
| R13 | `POST /api/tasks` valida as mesmas regras de R1–R3. Válido → **201** + status `Pendente`; inválido → **400** + `{"error": "..."}` |
| R14 | `GET /api/tasks/:id` → 200 se existe; **404** se não existe |
| R15 | Título (após trim) + vencimento **não pode duplicar** (título diferencia maiúsculas/minúsculas) → **409** e nenhum registro novo |
| R16 | `DELETE /api/tasks/:id` → **204** sem corpo se existe; **404** se não existe |
| R17 | Rota desconhecida → **404 em JSON** |
| R18 | `PATCH /api/tasks/:id` altera **só o status** na sequência. 200 + tarefa atualizada; **400** status ausente/inválido; **404** inexistente; **409** fora da sequência, repetida ou a partir de `Concluída` |

### Contrato
- `POST` e `PATCH` com `Content-Type: application/json`.
- Corpo de criação: `{"title":"Revisar cadastro","dueDate":"2099-12-31","priority":"Alta"}`
- Resposta de tarefa: `{"id": <número gerado>, "title", "dueDate", "priority", "status"}`
- `PATCH` recebe `{"status":"Em andamento"}` ou `{"status":"Concluída"}`.
- Erros: `{"error":"Mensagem compreensível"}` (o texto exato não importa).
- Corpo que não seja um **objeto JSON válido** → **400**.

---

## 5. Estrutura esperada do repositório

```
.
├── CLAUDE.md                 ← este guia
├── README.md                 ← entrega final (Fase 6)
├── aplicacao-teste/          ← original, NÃO alterar
├── docs/
│   ├── DESAFIO.md            ← enunciado
│   ├── tempo.md              ← registro de horas por fase
│   ├── plano-de-testes.md    ← Fase 2/3
│   ├── defeitos.md           ← Fase 4
│   └── evidencias/           ← saídas de curl, prints, relatórios
└── tests/                    ← automação (Fase 1 e 5)
    ├── readme-skill.md       ← gerado pelo /setup-testes
    └── ...
```

---

## 6. Fases de execução

Antes de cada fase, anotar a hora de início em `docs/tempo.md`. Ao terminar, revisar o resultado antes de seguir.

### Fase 1 — Setup do framework (≈20 min) · skill `/setup-testes`
- Analisar o projeto, escolher o framework, instalar em `tests/`, validar e gerar `tests/readme-skill.md`.
- **Não escrever nenhum teste nesta fase.**
- **Pronto quando:** o runner executa sem erro (sem testes), a aplicação sobe na porta configurada e `readme-skill.md` existe.

### Fase 2 — Exploração (≈30 min) · skill `/qa-testes`
- Subir a aplicação e verificar **cada requisito R1–R18** pela API (curl) e pela interface.
- Salvar as saídas em `docs/evidencias/` (ex.: `R13-post-invalido.txt`).
- Montar uma tabela rápida: requisito → comportamento observado → OK / suspeito.
- **Pronto quando:** todos os requisitos foram observados ao menos uma vez.

### Fase 3 — Plano e execução manual (≈1h) → `docs/plano-de-testes.md`
O plano deve conter:
- escopo e objetivo;
- riscos e prioridades (impacto × probabilidade);
- tipos de teste escolhidos (funcional, negativo, borda, integração, E2E);
- dados e condições necessários;
- critérios de entrada e de saída;
- **no mínimo 10 casos** (meta: 12–15), cobrindo positivos, negativos e bordas;
- casos de **interface**, de **API** e pelo menos **1 fluxo que atravesse as duas**;
- **resultado da execução** de cada caso: `Passou`, `Falhou`, `Bloqueado` ou `Não executado`.

Formato da tabela de casos:

| ID | Req. | Camada | Tipo | Pré-condição | Passos (reproduzíveis) | Resultado esperado | Resultado obtido | Status | Evidência / Defeito |
|---|---|---|---|---|---|---|---|---|---|

Bordas a considerar: título com 2/3/80/81 caracteres, só espaços, espaços nas pontas; data de hoje, ontem, inválida (ex.: `2026-02-30`), formato errado; prioridade fora da lista ou com outra caixa; duplicidade com e sem diferença de maiúsculas; JSON malformado ou não-objeto; transições de status inválidas; ID inexistente; filtros combinados com contadores; recarregar a página; confirmação de exclusão.

**Pronto quando:** cada caso tem passos que outra pessoa consegue repetir e um status real.

### Fase 4 — Registro de defeitos (≈45 min) → `docs/defeitos.md`
Um bloco por defeito:

```markdown
## DEF-XX — <título objetivo: o que falha e onde>
- **Requisito violado:** Rn
- **Ambiente:** SO, versão do Node, navegador, URL/porta
- **Pré-condições:**
- **Passos para reproduzir:** (curl ou passos numerados na tela)
- **Resultado esperado:**
- **Resultado obtido:**
- **Severidade:** Crítica/Alta/Média/Baixa — justificativa (impacto)
- **Prioridade:** Alta/Média/Baixa — justificativa (urgência)
- **Evidência:** arquivo em docs/evidencias/, print, nome do teste automatizado
- **Bloqueia publicação?** Sim/Não — por quê
```

No final do arquivo, a seção **"Defeitos que impedem publicação"** lista os DEF-xx com a justificativa.

**Pronto quando:** cada defeito pode ser reproduzido só com o relato.

### Fase 5 — Automação (≈1h15) → `tests/`
Automatizar **4 a 6 cenários** escolhidos pelo risco. Obrigatórios:

- [ ] **Teste de integração da API** — HTTP real ao servidor fornecido, verificando a colaboração **rota + validação + armazenamento em memória**. Sem mocks de API, rota ou storage. Nome com o prefixo `[INTEGRAÇÃO]` e um comentário explicando quais componentes integra. Ex.: criar via POST → consultar via GET /:id → conferir na lista.
- [ ] Pelo menos **1 teste da interface** e **1 da API**.
- [ ] Pelo menos **1 fluxo positivo** e **1 negativo**.
- [ ] **1 cenário de compartilhamento tela ↔ API** (cadastrar na tela e consultar na API, ou criar na API e ver na tela).

Qualidade exigida:
- verificar comportamento (status, corpo, estado salvo, texto visível), não só cliques;
- sem esperas fixas (`waitForTimeout`/`sleep`);
- testes independentes (dados únicos, limpeza, sem depender da ordem);
- mensagens de falha claras;
- código legível e organizado (helpers/fixtures separados dos specs);
- falhas causadas por defeitos ficam **vermelhas** e são ligadas ao `DEF-xx` (anotação no teste + menção no README).

**Pronto quando:** a suíte roda do zero com um único comando, e cada falha está explicada.

### Fase 6 — README de entrega (≈30 min) → `README.md` (raiz)
Seções obrigatórias:
1. **Resumo** do que foi entregue e onde está cada parte.
2. **Instalação e execução** (aplicação + testes), com comandos copiáveis.
3. **Decisões:** framework, cenários escolhidos, estratégia de isolamento de dados.
4. **Resultado da automação:** tabela teste → status → `DEF-xx` relacionado, e qual é o teste de integração.
5. **Limitações e pendências.**
6. **Tempo dedicado** (de `docs/tempo.md`).
7. **Síntese:**
   1. Quais foram os três maiores riscos encontrados?
   2. Por que esses cenários foram automatizados?
   3. O que testaria a seguir com mais tempo?
   4. Como integraria a automação a um pipeline de entrega?
   5. Quais ferramentas, fontes e recursos de IA foram usados, **e como o resultado foi validado**?

### Fase 7 — Revisão final (≈20 min)
- [ ] Clonar/copiar a pasta limpa e seguir o README do zero: tudo roda?
- [ ] `aplicacao-teste/` está idêntica ao original?
- [ ] Todo `Falhou` do plano tem um `DEF-xx`, e todo `DEF-xx` tem evidência.
- [ ] Teste de integração está claramente identificado.
- [ ] Sem `node_modules`, relatórios gerados, senhas ou dados pessoais na entrega.
- [ ] Tempo total registrado.

---

## 7. Como o Claude deve trabalhar neste projeto

- Trabalhar **uma fase por vez** e parar ao final de cada uma com um resumo curto (o que foi feito, o que está pendente).
- Antes de afirmar que algo é defeito, **reproduzir** e salvar a evidência.
- Ao gerar documentos, usar dados e resultados **reais** desta execução.
- Se a aplicação não subir ou algo bloquear, documentar: o bloqueio, o que foi investigado e como prosseguiria.
- Se o tempo estiver acabando, priorizar nesta ordem: teste de integração → defeitos que bloqueiam publicação → cenário tela↔API → README com síntese → o resto.
