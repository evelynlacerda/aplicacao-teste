# Plano de Testes

Aplicação de gerenciamento de tarefas (interface Web + API HTTP) com armazenamento em memória, testada manualmente pela API e pela interface.

**Ambiente utilizado:**
- Sistema operacional: Windows 11 Pro
- Node.js: v24.11.1
- Cliente de API: Postman 12.32.4
- Navegador: Google Chrome 155.0.8059.40
- URL da aplicação: `http://localhost:3333`

## 1. Preparação do ambiente

### 1.1 Pré-requisito
- Node.js 18 ou superior (conferir com `node -v`).
- Não há dependências: não é necessário `npm install`.

### 1.2 Iniciar a aplicação
No terminal, dentro de `aplicacao-teste/api`:

```bash
npm start
```

O servidor entrega interface e API juntos. Para encerrar, use Ctrl+C (ao reiniciar, os dados em memória são apagados).

### 1.3 Acessar a interface
Abrir no navegador: http://localhost:3333

Recarregar a página mantém as tarefas.

### 1.4 Endereço para o Postman
- URL base: `http://localhost:3333`
- Listar tarefas (GET): `http://localhost:3333/api/tasks`
- Em POST e PATCH, enviar o cabeçalho `Content-Type: application/json` e o corpo em formato Raw → JSON.
- Sugestão: criar uma variável de ambiente `baseUrl` = `http://localhost:3333` e usar `{{baseUrl}}/api/tasks` nas requisições.

## 2. Exploração manual (Postman)

Cada requisito foi verificado ao menos uma vez e a evidência fica em `docs/evidencias/`.

### 2.1 Listagem com a lista vazia (R12)

- **Requisição:** `GET http://localhost:3333/api/tasks`
- **Esperado:** `200 OK` e array JSON vazio (`[]`).
- **Obtido:** `200 OK` em 6 ms, corpo `[]`.
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R12.png](evidencias/R12.png)

---

### 2.2 Criação válida (R4, R13)

- **Requisição:** `POST http://localhost:3333/api/tasks`, Body → raw → JSON:

  ```json
  {"title": "  Tarefa base  ", "dueDate": "2099-12-31", "priority": "Alta"}
  ```

- **Esperado:** `201 Created` e tarefa com status `Pendente`.
- **Obtido:** `201 Created` em 18 ms, corpo:

  ```json
  {"id": 1, "title": "Tarefa base", "dueDate": "2099-12-31", "priority": "Alta", "status": "Pendente"}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R4-R13.png](evidencias/R4-R13.png)

---

### 2.3 Título: limites de tamanho e espaços (R1)

Todas as requisições: `POST http://localhost:3333/api/tasks`, com `priority` e `dueDate` válidas (hoje ou futura).

#### 2.3.1 Título com 2 caracteres

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "ab", "dueDate": "2099-12-31", "priority": "Alta"}
  ```

- **Esperado:** `400 Bad Request` e mensagem de erro.
- **Obtido:** `400 Bad Request` em 21 ms, corpo:

  ```json
  {"error": "O título deve conter de 3 a 80 caracteres."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R1-1.png](evidencias/R1-1.png)

#### 2.3.2 Título somente com espaços

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "     ", "dueDate": "2026-10-16", "priority": "Alta"}
  ```

- **Esperado:** `400 Bad Request` e mensagem de erro.
- **Obtido:** `400 Bad Request` em 6 ms, corpo:

  ```json
  {"error": "O título deve conter de 3 a 80 caracteres."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R1-2.png](evidencias/R1-2.png)

#### 2.3.3 Título com 3 caracteres (limite mínimo)

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "abc", "dueDate": "2026-10-20", "priority": "Baixa"}
  ```

- **Esperado:** `201 Created` e status `Pendente`.
- **Obtido:** `201 Created` em 5 ms, corpo:

  ```json
  {"id": 2, "title": "abc", "dueDate": "2026-10-20", "priority": "Baixa", "status": "Pendente"}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R1-3.png](evidencias/R1-3.png)

#### 2.3.4 Título com 80 caracteres (limite máximo)

- **Requisição:** Body → raw → JSON, com `title` de 80 caracteres (`a` repetido):

  ```json
  {"title": "<80 × a>", "dueDate": "2026-12-31", "priority": "Alta"}
  ```

- **Esperado:** `201 Created` e status `Pendente`.
- **Obtido:** `201 Created` em 4 ms, `id` 3, título salvo completo e status `Pendente`.
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R1-4.png](evidencias/R1-4.png)

#### 2.3.5 Título com 81 caracteres

- **Requisição:** Body → raw → JSON, com `title` de 81 caracteres (`a` repetido):

  ```json
  {"title": "<81 × a>", "dueDate": "2099-12-31", "priority": "Alta"}
  ```

- **Esperado:** `400 Bad Request` e mensagem de erro.
- **Obtido:** `400 Bad Request` em 4 ms, corpo:

  ```json
  {"error": "O título deve conter de 3 a 80 caracteres."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R1-5.png](evidencias/R1-5.png)

O trim de espaços nas pontas (R1) foi verificado no tópico 2.2.

---

### 2.4 Vencimento: data de hoje, passada, inexistente e formato errado (R2)

Todas as requisições: `POST http://localhost:3333/api/tasks`, com `priority` válida. "Hoje" é 2026-10-16 (data local do teste).

#### 2.4.1 Vencimento igual a hoje

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Data hoje", "dueDate": "2026-10-16", "priority": "Alta"}
  ```

- **Esperado:** `201 Created` (a data pode ser igual a hoje).
- **Obtido:** `201 Created` em 8 ms, `id` 4, status `Pendente`.
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R2-1.png](evidencias/R2-1.png)

#### 2.4.2 Vencimento de ontem

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Data ontem", "dueDate": "2026-10-15", "priority": "Alta"}
  ```

- **Esperado:** `400 Bad Request` e mensagem de erro.
- **Obtido:** `400 Bad Request` em 4 ms, corpo:

  ```json
  {"error": "A data deve ser igual ou posterior à data atual."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R2-2.png](evidencias/R2-2.png)

#### 2.4.3 Data inexistente no calendário (30 de fevereiro)

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Data 30 fev", "dueDate": "2099-02-30", "priority": "Alta"}
  ```

- **Esperado:** `400 Bad Request` e nenhuma tarefa criada.
- **Obtido:** `201 Created` em 6 ms, `id` 5, `dueDate` salvo como `"2099-02-30"`.
- **Resultado:** Falhou.
- **Defeito:** DEF-01
- **Evidência:** [docs/evidencias/DEF01.png](evidencias/DEF01.png)

#### 2.4.4 Formato de data errado

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Data formato", "dueDate": "31/12/2099", "priority": "Alta"}
  ```

- **Esperado:** `400 Bad Request` e mensagem de erro.
- **Obtido:** `400 Bad Request` em 3 ms, corpo:

  ```json
  {"error": "A data deve ser igual ou posterior à data atual."}
  ```

- **Resultado:** Passou.
- **Observação:** a mensagem não informa que o formato está errado (o esperado é `YYYY-MM-DD`). Atende ao R5 (mensagem compreensível), mas poderia ser mais específica.
- **Evidência:** [docs/evidencias/R2-4.png](evidencias/R2-4.png)

---

### 2.5 Prioridade: ausente, fora da lista e outra caixa (R3)

Todas as requisições: `POST http://localhost:3333/api/tasks`, com `title` e `dueDate` válidos.

#### 2.5.1 Prioridade ausente

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Sem prioridade", "dueDate": "2099-12-31"}
  ```

- **Esperado:** `400 Bad Request` e mensagem de erro.
- **Obtido:** `400 Bad Request` em 4 ms, corpo:

  ```json
  {"error": "A prioridade é obrigatória."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R3-1.png](evidencias/R3-1.png)

#### 2.5.2 Prioridade fora da lista ("Urgente")

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Prioridade X", "dueDate": "2099-12-31", "priority": "Urgente"}
  ```

- **Esperado:** `400 Bad Request` e nenhuma tarefa criada.
- **Obtido:** `201 Created` em 2 ms, `id` 6, `priority` salvo como `"Urgente"`.
- **Resultado:** Falhou.
- **Defeito:** DEF-02
- **Evidência:** [docs/evidencias/DEF02.png](evidencias/DEF02.png)

#### 2.5.3 Prioridade com outra caixa ("alta")

- **Requisição:** Body → raw → JSON:

  ```json
  {"title": "Prioridade caixa", "dueDate": "2099-12-31", "priority": "alta"}
  ```

- **Esperado:** `400 Bad Request` (só `Baixa`, `Média` e `Alta` são aceitas) e nenhuma tarefa criada.
- **Obtido:** `201 Created` em 9 ms, `id` 7, `priority` salvo como `"alta"`.
- **Resultado:** Falhou.
- **Defeito:** DEF-02
- **Evidência:** [docs/evidencias/DEF02-2.png](evidencias/DEF02-2.png)

---

### 2.6 Consulta e exclusão de tarefa inexistente (R14, R16)

Os demais casos de consulta e exclusão (GET e DELETE de tarefa existente) passaram. Os defeitos encontrados são os de id inexistente, abaixo.

#### 2.6.1 GET de id inexistente

- **Requisição:** `GET http://localhost:3333/api/tasks/999999`
- **Esperado:** `404 Not Found` e `{"error": "..."}`.
- **Obtido:** `200 OK` em 4 ms, corpo `null`.
- **Resultado:** Falhou.
- **Defeito:** DEF-07
- **Evidência:** [docs/evidencias/DEF07.png](evidencias/DEF07.png)

#### 2.6.2 DELETE de id inexistente

- **Requisição:** `DELETE http://localhost:3333/api/tasks/999999`
- **Esperado:** `404 Not Found` e `{"error": "..."}`.
- **Obtido:** `204 No Content` em 3 ms, sem corpo.
- **Resultado:** Falhou.
- **Defeito:** DEF-08
- **Evidência:** [docs/evidencias/DEF08.png](evidencias/DEF08.png)

---

### 2.7 Status pela API: sequência e transições (R6, R7, R18)

Requisições: `PATCH http://localhost:3333/api/tasks/{id}`, Body → raw → JSON. Os casos 2.7.1 a 2.7.5 usam a tarefa `id` 10 ("Nova tarefa teste", `Alta`, vencimento 2026-10-16), criada com status `Pendente`.

#### 2.7.1 Pendente → Concluída (pulando "Em andamento")

- **Requisição:** `PATCH /api/tasks/10`, corpo `{"status": "Concluída"}`
- **Esperado:** `409 Conflict`.
- **Obtido:** `409 Conflict` em 5 ms, corpo `{"error": "Transição de status não permitida."}`
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-1.png](evidencias/R6-R7-R18-1.png)

#### 2.7.2 Pendente → Em andamento

- **Requisição:** `PATCH /api/tasks/10`, corpo `{"status": "Em andamento"}`
- **Esperado:** `200 OK` e tarefa com status `Em andamento`.
- **Obtido:** `200 OK` em 8 ms, `status` `"Em andamento"`.
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-2.png](evidencias/R6-R7-R18-2.png)

#### 2.7.3 Repetir o status "Em andamento"

- **Requisição:** `PATCH /api/tasks/10`, corpo `{"status": "Em andamento"}`
- **Esperado:** `409 Conflict` (status repetido).
- **Obtido:** `409 Conflict` em 3 ms, corpo `{"error": "Transição de status não permitida."}`
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-3.png](evidencias/R6-R7-R18-3.png)

#### 2.7.4 Em andamento → Concluída

- **Requisição:** `PATCH /api/tasks/10`, corpo `{"status": "Concluída"}`
- **Esperado:** `200 OK` e tarefa com status `Concluída`.
- **Obtido:** `200 OK` em 2 ms, `status` `"Concluída"`.
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-4.png](evidencias/R6-R7-R18-4.png)

#### 2.7.5 Concluída → Pendente (voltar status)

- **Requisição:** `PATCH /api/tasks/10`, corpo `{"status": "Pendente"}`
- **Esperado:** `409 Conflict` (tarefa concluída não volta).
- **Obtido:** `409 Conflict` em 3 ms, corpo `{"error": "Transição de status não permitida."}`
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-5.png](evidencias/R6-R7-R18-5.png)

#### 2.7.6 Status ausente

- **Requisição:** `PATCH /api/tasks/10`, corpo `{}`
- **Esperado:** `400 Bad Request`.
- **Obtido:** `400 Bad Request` em 3 ms, corpo `{"error": "Status inválido."}`
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-6.png](evidencias/R6-R7-R18-6.png)

#### 2.7.7 Status inválido

- **Requisição:** `PATCH /api/tasks/10`, corpo `{"status": "Xyz"}`
- **Esperado:** `400 Bad Request`.
- **Obtido:** `400 Bad Request` em 4 ms, corpo `{"error": "Status inválido."}`
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-7.png](evidencias/R6-R7-R18-7.png)

#### 2.7.8 Status enviado junto com outro campo

- **Pré-condição:** tarefa `id` 2 ("abc") já em `Em andamento`.
- **Requisição:** `PATCH /api/tasks/2`, corpo `{"status": "Concluída", "title": "abc"}`
- **Esperado:** `200 OK` e só o status alterado.
- **Obtido:** `200 OK` em 3 ms, `status` `"Concluída"` e `title` `"abc"`.
- **Resultado:** Passou.
- **Observação:** o `title` enviado é igual ao original, então o caso não prova que o campo extra é ignorado. Repetir com um título diferente para confirmar.
- **Evidência:** [docs/evidencias/R6-R7-R18-8.png](evidencias/R6-R7-R18-8.png)

#### 2.7.9 Tarefa inexistente

- **Requisição:** `PATCH /api/tasks/999999`, corpo `{"status": "Em andamento"}`
- **Esperado:** `404 Not Found`.
- **Obtido:** `404 Not Found` em 3 ms, corpo `{"error": "Tarefa não encontrada."}`
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R6-R7-R18-9.png](evidencias/R6-R7-R18-9.png)

---

### 2.8 Cadastro e status pela interface (R3, R4, R5, R6, R7)

Interface em `http://localhost:3333`. A tarefa criada nos casos abaixo é "Teste Interface", vencimento 16/10/2026, prioridade `Média`.

#### 2.8.1 Cadastro sem prioridade

- **Passos:** preencher o título "Teste Interface" e o vencimento 16/10/2026, deixar a prioridade em "Selecione" e clicar em "Adicionar".
- **Esperado:** tarefa não criada e mensagem compreensível (R5).
- **Obtido:** a tela mostra "Selecione a prioridade."
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/Interface1.png](evidencias/Interface1.png)

#### 2.8.2 Cadastro válido

- **Passos:** repetir o cadastro, agora com prioridade `Média`, e clicar em "Adicionar". Abrir o filtro "Pendentes".
- **Esperado:** a tarefa aparece na lista com status `Pendente` (R4).
- **Obtido:** a tarefa "Teste Interface" aparece com "Prioridade: Média · Status: Pendente" e o botão "Iniciar".
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/Interface2.png](evidencias/Interface2.png)

#### 2.8.3 Pendente → Em andamento

- **Passos:** na tarefa, clicar em "Iniciar". Abrir o filtro "Em andamento".
- **Esperado:** a tarefa passa para `Em andamento` (R6).
- **Obtido:** a tarefa aparece com "Status: Em andamento" e o botão "Concluir".
- **Resultado:** Passou.
- **Observação (DEF-05, R9):** com o filtro "Em andamento" ativo, o Resumo mostra Total 1, Pendentes 0, Em andamento 1, embora existam outras tarefas cadastradas. Os contadores seguem o filtro, e deveriam refletir todas as tarefas.
- **Evidência:** [docs/evidencias/Interface3.png](evidencias/Interface3.png)

#### 2.8.4 Em andamento → Concluída, sem opção de voltar

- **Passos:** clicar em "Concluir". Abrir o filtro "Concluídas".
- **Esperado:** a tarefa passa para `Concluída` (R6) e não há como voltar a um status anterior (R7).
- **Obtido:** a tarefa aparece com "Status: Concluída" e só o botão "Excluir"; não há botão para voltar o status.
- **Resultado:** Passou.
- **Observação (DEF-05, R9):** com o filtro "Concluídas" ativo, o Resumo mostra Total 1, Pendentes 0, Em andamento 0, Concluídas 1, embora existam outras tarefas cadastradas.
- **Evidência:** [docs/evidencias/Interface4.png](evidencias/Interface4.png)

---

### 2.9 Tela ↔ API (compartilhamento de dados)

- **Passos:** com a tarefa "Teste Interface" concluída pela tela (2.8.4), consultar `GET http://localhost:3333/api/tasks/11` no Postman.
- **Esperado:** a API retorna a mesma tarefa com `status` `"Concluída"`.
- **Obtido:** `200 OK` em 3 ms, `id` 11, `title` `"Teste Interface"`, `priority` `"Média"`, `status` `"Concluída"`. O título identifica a tarefa criada pela tela.
- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/InterfaceXAPI.png](evidencias/InterfaceXAPI.png)

---

### 2.10 Duplicidade de título + vencimento (R15)

#### 2.10.1 Duplicatas na lista

- **Requisição:** `GET http://localhost:3333/api/tasks`
- **Esperado:** nenhuma tarefa repetida (título + vencimento).
- **Obtido:** os ids 6 e 8 ("Prioridade X", 2099-12-31) e os ids 7 e 9 ("Prioridade caixa", 2099-12-31) são iguais. Os repetidos foram aceitos por um POST que deveria ter retornado 409.
- **Resultado:** Falhou.
- **Defeito:** DEF-03
- **Evidência:** [docs/evidencias/DEF03.txt](evidencias/DEF03.txt)

---

### 2.11 Exclusão pela interface (R11)

#### 2.11.1 Excluir tarefas pela tela

- **Passos:** na interface, clicar em "Excluir" nas tarefas dos ids 1, 2, 3 e 10. Em seguida, consultar `GET http://localhost:3333/api/tasks`.
- **Esperado:** a tela pede confirmação antes de remover cada tarefa.
- **Obtido:** nenhum diálogo de confirmação apareceu e as tarefas foram removidas na hora. A lista da API passou dos ids 1 a 9 do `DEF03.txt` (mais o 10 e o 11, criados depois) para os ids 4 a 9 e 11, sem os ids 1, 2, 3 e 10.
- **Resultado:** Falhou.
- **Defeito:** DEF-06
- **Evidência:** [docs/evidencias/DEF06.txt](evidencias/DEF06.txt) (lista depois das exclusões; comparar com [DEF03.txt](evidencias/DEF03.txt))

---

### 2.12 Rota desconhecida (R17)

#### 2.12.1 Rota desconhecida na raiz

- **Requisição:** `GET http://localhost:3333/qualquercoisa`
- **Esperado:** `404 Not Found` com corpo JSON.
- **Obtido:** `404 Not Found` em 3 ms, corpo:

  ```json
  {"error": "Rota não encontrada."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R17-1.png](evidencias/R17-1.png)

#### 2.12.2 Rota desconhecida dentro de `/api`

- **Requisição:** `GET http://localhost:3333/api/qualquercoisa`
- **Esperado:** `404 Not Found` com corpo JSON.
- **Obtido:** `404 Not Found` em 2 ms, corpo:

  ```json
  {"error": "Rota não encontrada."}
  ```

- **Resultado:** Passou.
- **Evidência:** [docs/evidencias/R17-2.png](evidencias/R17-2.png)

---

### 2.13 Filtros e contadores pela interface (R8, R9)

- **Pré-condição:** servidor reiniciado (sem tarefas anteriores) e três tarefas criadas pela tela, com vencimento 2026-10-16 e prioridade `Alta`: "abc" (`Pendente`), "def" (`Em andamento`) e "ghi" (`Concluída`).
- **Esperado em todos os filtros:** a lista mostra somente as tarefas do filtro (R8) e o Resumo continua com Total 3, Pendentes 1, Em andamento 1, Concluídas 1 (R9).

#### 2.13.1 Filtro "Todas"

- **Obtido:** a lista mostra as três tarefas. O Resumo mostra Total 3, Pendentes 1, Em andamento 1, Concluídas 1.
- **Resultado (lista, R8):** Passou.
- **Resultado (contadores, R9):** Passou.
- **Evidência:** [docs/evidencias/R8.png](evidencias/R8.png)

#### 2.13.2 Filtro "Pendentes"

- **Obtido:** a lista mostra só "abc". O Resumo mostra Total 1, Pendentes 1, Em andamento 0, Concluídas 0.
- **Resultado (lista, R8):** Passou.
- **Resultado (contadores, R9):** Falhou.
- **Defeito:** DEF-05
- **Evidência:** [docs/evidencias/R9-1.png](evidencias/R9-1.png)

#### 2.13.3 Filtro "Em andamento"

- **Obtido:** a lista mostra só "def". O Resumo mostra Total 1, Pendentes 0, Em andamento 1, Concluídas 0.
- **Resultado (lista, R8):** Passou.
- **Resultado (contadores, R9):** Falhou.
- **Defeito:** DEF-05
- **Evidência:** [docs/evidencias/R9-2.png](evidencias/R9-2.png)

#### 2.13.4 Filtro "Concluídas"

- **Obtido:** a lista mostra "def" (`Em andamento`) e "ghi" (`Concluída`). O Resumo mostra Total 2, Pendentes 0, Em andamento 1, Concluídas 1.
- **Resultado (lista, R8):** Falhou.
- **Resultado (contadores, R9):** Falhou.
- **Defeito:** DEF-04 (lista) e DEF-05 (contadores)
- **Evidência:** [docs/evidencias/R9-3.png](evidencias/R9-3.png)

---

### 2.14 Persistência após recarregar a página (R10)

#### 2.14.1 Recarregar a página com F5

- **Pré-condição:** as três tarefas do 2.13 (abc `Pendente`, def `Em andamento`, ghi `Concluída`) cadastradas, filtro "Todas".
- **Passos:** abrir `http://localhost:3333`, conferir a lista e o Resumo, pressionar F5 e conferir de novo.
- **Esperado:** as tarefas permanecem, com os mesmos status e os mesmos contadores.
- **Obtido:** depois do F5, a tela mostra as mesmas três tarefas com os mesmos status e o Resumo igual (Total 3, Pendentes 1, Em andamento 1, Concluídas 1).
- **Resultado:** Passou.
- **Evidência:** antes do F5: [docs/evidencias/R10-1.png](evidencias/R10-1.png); depois do F5: [docs/evidencias/R10-2.png](evidencias/R10-2.png)

---

## 3. Escopo e objetivo

### 3.1 Objetivo
Verificar se a aplicação de gerenciamento de tarefas (interface Web + API HTTP) atende aos requisitos R1 a R18, registrar os defeitos encontrados e servir de base para a automação.

### 3.2 Dentro do escopo
- **Cadastro (R1 a R5):** título, vencimento, prioridade, status inicial e mensagens de erro.
- **Fluxo e consulta pela interface (R6 a R11):** avanço de status, filtros, contadores, persistência após recarregar e confirmação de exclusão.
- **API HTTP (R12 a R18):** listar, criar, consultar, excluir e alterar status, duplicidade, rota desconhecida e corpo inválido.
- **Integração tela ↔ API:** dados cadastrados em uma camada visíveis na outra.

### 3.3 Fora do escopo
- Atualização em tempo real da tela.
- A limpeza dos dados ao encerrar o servidor (faz parte do ambiente, não é defeito).
- Desempenho, segurança, acessibilidade e compatibilidade entre navegadores.
- Qualquer alteração na aplicação em `aplicacao-teste/`.

---

## 4. Riscos e prioridades

A prioridade de teste combina **impacto** (quanto o defeito prejudica o usuário ou os dados) com **probabilidade** (chance de a regra estar errada, considerando a complexidade e o que a exploração mostrou). Escala: Alta, Média e Baixa.

| # | Risco | Req. | Impacto | Probabilidade | Prioridade | Observado na exploração |
|---|---|---|---|---|---|---|
| 1 | Tarefas duplicadas (mesmo título + vencimento) corrompem o cadastro | R15 | Alto | Alta | **Alta** | Falhou (DEF-03) |
| 2 | Exclusão sem confirmação causa perda de dados | R11 | Alto | Alta | **Alta** | Falhou (DEF-06) |
| 3 | Filtros e contadores mostram informação errada na tela | R8, R9 | Alto | Alta | **Alta** | Falhou (DEF-04, DEF-05) |
| 4 | Status avança fora da sequência ou volta de "Concluída" | R6, R7, R18 | Alto | Média | **Alta** | Passou, sem defeitos |
| 5 | API aceita dados inválidos (data inexistente, prioridade fora da lista) | R2, R3, R13 | Médio | Alta | **Alta** | Falhou (DEF-01, DEF-02) |
| 6 | Contrato HTTP incorreto para id inexistente (200 em vez de 404, 204 em vez de 404) | R14, R16 | Médio | Alta | **Média** | Falhou (DEF-07, DEF-08) |
| 7 | Validação de título (limites 3 e 80, trim) | R1 | Médio | Média | **Média** | Passou, sem defeitos |
| 8 | Tarefas somem ao recarregar a página | R10 | Médio | Baixa | **Baixa** | Passou, sem defeitos |
| 9 | Rota desconhecida e corpo JSON inválido sem resposta em JSON | R17 | Baixo | Baixa | **Baixa** | Rota desconhecida passou; corpo inválido não testado |

**Ordem de execução e automação:** primeiro os riscos de prioridade Alta (1 a 5), depois os de prioridade Média e por último os de prioridade Baixa.
