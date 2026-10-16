# Relatos de defeitos

**Ambiente de todos os relatos:** Windows 11 Pro, Node.js v24.11.1, aplicação original de `aplicacao-teste/api` sem alterações.
Verificações manuais: Postman 12.32.4 (API) e Google Chrome 155.0.8059.40 (interface), em `http://localhost:3333`, em 2026-10-16. Suíte automatizada: Chromium (Playwright 1.64.1) na porta 3334.
Nos exemplos de `curl`, `B=http://localhost:3333`. Todas as evidências estão em `docs/evidencias/`.

Resumo:

| ID | Requisito | Camada | Título | Severidade | Prioridade | Bloqueia? |
|---|---|---|---|---|---|---|
| DEF-01 | R2, R13 | API | POST aceita data inexistente no calendário | Média | Média | Não |
| DEF-02 | R3, R13 | API | POST aceita prioridade fora de Baixa/Média/Alta | Média | Média | Não |
| DEF-03 | R15 | API | POST aceita tarefa duplicada (título + vencimento) | Alta | Alta | **Sim** |
| DEF-04 | R8 | Interface | Filtro "Concluídas" também mostra tarefas "Em andamento" | Alta | Alta | **Sim** |
| DEF-05 | R9 | Interface | Contadores do resumo seguem o filtro selecionado | Alta | Alta | **Sim** |
| DEF-06 | R11 | Interface | Exclusão remove a tarefa sem pedir confirmação | Alta | Alta | **Sim** |
| DEF-07 | R14 | API | GET de id inexistente retorna 200 com corpo `null` | Média | Média | Não |
| DEF-08 | R16 | API | DELETE de id inexistente retorna 204 em vez de 404 | Média | Média | Não |

---

## DEF-01 — POST aceita data inexistente no calendário
- **Requisito violado:** R2 e R13 (vencimento deve ser data válida do calendário; inválido → 400).
- **Ambiente:** ver topo.
- **Pré-condições:** servidor em execução.
- **Passos para reproduzir:**
  1. `curl -s -X POST $B/api/tasks -H "Content-Type: application/json" -d '{"title":"Data inexistente","dueDate":"2099-02-30","priority":"Alta"}' -w "\nHTTP %{http_code}\n"`
- **Resultado esperado:** `400` com `{"error": "..."}` e nenhum registro criado.
- **Resultado obtido:** `201` e tarefa criada com `"dueDate":"2099-02-30"`.
- **Severidade:** Média — grava no armazenamento uma data que não existe; não causa perda de dados nem derruba o sistema.
- **Prioridade:** Média — corrigir na próxima iteração; há contorno (o seletor de data da tela impede o valor).
- **Evidência:** `docs/evidencias/DEF01.png`; teste automatizado `[NEGATIVO] R13 - R2 data inexistente (30/02) retorna 400 e não cria tarefa`.
- **Bloqueia publicação?** Não — impacto limitado a clientes que chamam a API diretamente.

## DEF-02 — POST aceita prioridade fora de Baixa/Média/Alta
- **Requisito violado:** R3 e R13.
- **Ambiente:** ver topo.
- **Pré-condições:** servidor em execução.
- **Passos para reproduzir:**
  1. `curl -s -X POST $B/api/tasks -H "Content-Type: application/json" -d '{"title":"Prioridade Urgente","dueDate":"2099-12-31","priority":"Urgente"}' -w "\nHTTP %{http_code}\n"`
  2. Repetir com `"priority":"alta"` (minúscula).
- **Resultado esperado:** `400` com `{"error": "..."}`, sem criar registro.
- **Resultado obtido:** `201` nos dois casos; tarefas gravadas com `priority` `"Urgente"` e `"alta"`. A validação só verifica se o campo foi enviado.
- **Severidade:** Média — dados fora do domínio persistidos; a tela pode exibir valores inesperados.
- **Prioridade:** Média — a correção é simples (lista fechada de valores).
- **Evidência:** `docs/evidencias/DEF02.png` ("Urgente"), `DEF02-2.png` ("alta"); testes `[NEGATIVO] R13 - R3 prioridade fora da lista retorna 400 e não cria tarefa` e `[NEGATIVO] R13 - R3 prioridade com outra caixa retorna 400 e não cria tarefa`.
- **Bloqueia publicação?** Não — não afeta o uso pela interface, que só oferece as três opções.

## DEF-03 — POST aceita tarefa duplicada (mesmo título + vencimento)
- **Requisito violado:** R15.
- **Ambiente:** ver topo.
- **Pré-condições:** servidor em execução.
- **Passos para reproduzir:**
  1. `curl -s -X POST $B/api/tasks -H "Content-Type: application/json" -d '{"title":"Prioridade X","dueDate":"2099-12-31","priority":"Urgente"}'` (cria a tarefa de id 6).
  2. Repetir exatamente o mesmo comando.
  3. `curl -s -X POST $B/api/tasks -H "Content-Type: application/json" -d '{"title":"Prioridade caixa","dueDate":"2099-12-31","priority":"alta"}'` (cria a tarefa de id 7) e repetir o mesmo comando.
  4. `curl -s $B/api/tasks`.
- **Resultado esperado:** a repetição de cada comando retorna `409` e nenhum registro novo é criado.
- **Resultado obtido:** as duas repetições foram aceitas e criaram os ids 8 e 9. A lista passa a ter os ids 6 e 8 iguais ("Prioridade X", 2099-12-31) e os ids 7 e 9 iguais ("Prioridade caixa", 2099-12-31).
- **Observação:** os dados da evidência usam prioridades inválidas (ver DEF-02). Convém repetir o teste com dados válidos (por exemplo, repetir a tarefa "Tarefa base" do cenário 2.2) para confirmar que a duplicidade não depende da prioridade.
- **Severidade:** Alta — compromete a integridade dos dados; uma regra de negócio explícita não é aplicada.
- **Prioridade:** Alta — duplicatas se acumulam e são difíceis de limpar depois.
- **Evidência:** `docs/evidencias/DEF03.txt` (lista da API com os ids 6 e 8 e os ids 7 e 9 repetidos); teste `R15 - título + vencimento repetidos retornam 409 e não criam registro`.
- **Bloqueia publicação?** Sim — a regra é obrigatória para o negócio e o defeito permite corromper o cadastro em uso normal (clique duplo, reenvio).

## DEF-04 — Filtro "Concluídas" também mostra tarefas "Em andamento"
- **Requisito violado:** R8.
- **Ambiente:** ver topo.
- **Pré-condições:** existe uma tarefa `Em andamento` e uma `Concluída`.
- **Passos para reproduzir:**
  1. Abrir `$B/` no navegador.
  2. Clicar no filtro "Concluídas".
- **Resultado esperado:** somente a tarefa `Concluída` aparece.
- **Resultado obtido:** aparecem a tarefa `Concluída` e a `Em andamento`.
- **Severidade:** Alta — o usuário recebe uma lista errada em uma função central da tela.
- **Prioridade:** Alta — afeta todo usuário que filtra por concluídas.
- **Evidência:** `docs/evidencias/R9-3.png`; teste `R8/R9 - filtros mostram só o status certo e contadores ignoram o filtro`.
- **Bloqueia publicação?** Sim — informação incorreta na funcionalidade principal de consulta.

## DEF-05 — Contadores do resumo seguem o filtro selecionado
- **Requisito violado:** R9.
- **Ambiente:** ver topo.
- **Pré-condições:** três tarefas: uma `Pendente`, uma `Em andamento`, uma `Concluída`.
- **Passos para reproduzir:**
  1. Abrir `$B/` e conferir o Resumo (Total 3, Pendentes 1, Em andamento 1, Concluídas 1).
  2. Clicar no filtro "Pendentes".
- **Resultado esperado:** o Resumo continua com Total 3 / 1 / 1 / 1.
- **Resultado obtido:** com "Pendentes", o Resumo mostra Total 1 / 1 / 0 / 0.
- **Severidade:** Alta — o resumo deixa de representar o total de tarefas.
- **Prioridade:** Alta — qualquer uso de filtro já exibe números incorretos.
- **Evidência:** `docs/evidencias/R9-1.png`, `R9-2.png`, `R9-3.png`, `Interface3.png`, `Interface4.png`; teste `R8/R9 - filtros mostram só o status certo e contadores ignoram o filtro`.
- **Bloqueia publicação?** Sim — o painel apresenta indicadores incorretos.

## DEF-06 — Exclusão remove a tarefa sem pedir confirmação
- **Requisito violado:** R11.
- **Ambiente:** ver topo.
- **Pré-condições:** existe ao menos uma tarefa.
- **Passos para reproduzir:**
  1. Abrir `$B/`.
  2. Clicar em "Excluir" em qualquer tarefa.
- **Resultado esperado:** um pedido de confirmação antes de remover.
- **Resultado obtido:** nenhum diálogo; a tarefa é removida na hora e deixa de existir na API.
- **Severidade:** Alta — perda de dados irreversível por um clique acidental, sem desfazer.
- **Prioridade:** Alta — risco imediato para o usuário final.
- **Evidência:** `docs/evidencias/DEF06.txt` (lista da API depois das exclusões pela tela; comparar com `DEF03.txt`).
- **Bloqueia publicação?** Sim — exclusão destrutiva sem confirmação. Ainda não coberto por teste automatizado.

## DEF-07 — GET de id inexistente retorna 200 com corpo `null`
- **Requisito violado:** R14.
- **Ambiente:** ver topo.
- **Pré-condições:** o id 999999 não existe.
- **Passos para reproduzir:**
  1. `curl -s $B/api/tasks/999999 -w "\nHTTP %{http_code}\n"`
- **Resultado esperado:** `404` com `{"error": "..."}`.
- **Resultado obtido:** `200` e corpo `null`.
- **Severidade:** Média — contrato HTTP incorreto; clientes não distinguem "não existe" de sucesso e podem quebrar ao ler `null`.
- **Prioridade:** Média — corrigir junto com DEF-08.
- **Evidência:** `docs/evidencias/DEF07.png`.
- **Bloqueia publicação?** Não — a interface não usa essa rota; afeta integrações externas.

## DEF-08 — DELETE de id inexistente retorna 204 em vez de 404
- **Requisito violado:** R16.
- **Ambiente:** ver topo.
- **Pré-condições:** o id 999999 não existe.
- **Passos para reproduzir:**
  1. `curl -s -X DELETE $B/api/tasks/999999 -w "\nHTTP %{http_code}\n"`
- **Resultado esperado:** `404` com `{"error": "..."}`.
- **Resultado obtido:** `204` sem corpo, como se tivesse excluído.
- **Severidade:** Média — esconde erros de quem integra (exclusão do id errado parece sucesso).
- **Prioridade:** Média.
- **Evidência:** `docs/evidencias/DEF08.png`.
- **Bloqueia publicação?** Não — não corrompe dados; é falha de contrato.

---

## Defeitos que impedem publicação

| DEF | Justificativa |
|---|---|
| DEF-06 | Exclusão sem confirmação causa perda de dados irreversível com um clique. |
| DEF-03 | Regra de unicidade obrigatória não é aplicada; o cadastro pode ser corrompido em uso normal. |
| DEF-04 | O filtro "Concluídas" mostra tarefas que não estão concluídas, na função principal de consulta. |
| DEF-05 | O resumo mostra números que não representam o total de tarefas assim que um filtro é aplicado. |

DEF-01, DEF-02, DEF-07 e DEF-08 devem ser corrigidos, mas sozinhos não impedem uma publicação: afetam principalmente quem usa a API diretamente e não causam perda de dados.

> Severidade, prioridade e decisão de bloqueio são **propostas** da pessoa que testou; a decisão final cabe a quem responde pelo produto.
