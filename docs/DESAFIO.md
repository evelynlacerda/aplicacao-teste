# Desafio de QA Funcional e Automação

Você recebeu uma pequena aplicação Web e uma API HTTP para gerenciamento de tarefas. Sua missão é analisar os requisitos, planejar e executar testes manuais, registrar os problemas encontrados e automatizar os cenários que considerar mais valiosos.

Não esperamos que você encontre todos os problemas ou construa uma arquitetura completa. Queremos entender seu raciocínio, sua priorização, a clareza das evidências e a qualidade da automação dentro do tempo disponível.

---

## Tempo e uso de ferramentas

O desafio foi dimensionado para aproximadamente **4 horas** de dedicação. Organize esse tempo como preferir dentro do prazo de entrega informado junto ao envio.

Se chegar a **5 horas**, encerre e entregue o que conseguiu concluir, indicando o que ficou pendente e quais seriam os próximos passos. Valorizamos a priorização e a qualidade do trabalho apresentado.

Informe no README aproximadamente quanto tempo dedicou. Esse dado serve para calibrarmos o desafio e não será usado isoladamente como critério de avaliação.

> Você pode consultar documentação, pesquisar na internet e usar ferramentas de IA.
> Declare no README quais recursos utilizou e como validou o resultado produzido.
> Se algo impedir a execução, documente o bloqueio, a investigação realizada e como você prosseguiria.

---

## Como executar a aplicação

As instruções estão em [`aplicacao-teste/README.md`](aplicacao-teste/README.md). A interface e a API são locais e não exigem cadastro nem acesso a dados da empresa.

A interface consome a API: tarefas criadas pela tela podem ser consultadas pela API, e tarefas criadas pela API aparecem na tela ao recarregá-la. Cadastro, mudança de status e exclusão compartilham o mesmo armazenamento no servidor.

---

## Requisitos do produto

### Cadastro de tarefas

1. O título é obrigatório, deve ser salvo sem espaços no início ou no fim e deve conter de **3 a 80 caracteres** após essa remoção.
2. A data de vencimento é obrigatória, deve representar uma data válida do calendário e deve ser **igual ou posterior à data atual**. Use o formato `YYYY-MM-DD` na API e a data local do servidor como referência.
3. A prioridade é obrigatória e aceita os valores `Baixa`, `Média` e `Alta`.
4. Toda nova tarefa deve iniciar com o status `Pendente`.
5. Ao cadastrar dados inválidos, a tarefa não deve ser criada e uma mensagem compreensível deve indicar o problema.

### Fluxo e consulta

6. Uma tarefa pode avançar de `Pendente` para `Em andamento` e depois para `Concluída`.
7. Uma tarefa concluída não pode voltar a um status anterior.
8. Os filtros **Todos**, **Pendentes**, **Em andamento** e **Concluídas** devem exibir somente os itens correspondentes.
9. Os contadores do resumo devem representar **todas** as tarefas cadastradas, independentemente do filtro selecionado.
10. As tarefas devem permanecer disponíveis após recarregar a página no mesmo navegador.
11. A exclusão deve solicitar **confirmação** antes de remover uma tarefa.

### API HTTP

12. `GET /api/tasks` deve retornar status **200** e uma lista JSON com todas as tarefas cadastradas na API.
13. `POST /api/tasks` deve validar as mesmas regras de título, vencimento e prioridade usadas no cadastro da interface. Uma criação válida deve retornar status **201** e iniciar com status `Pendente`; dados inválidos devem retornar status **400** com uma mensagem compreensível.
14. `GET /api/tasks/:id` deve retornar status **200** para uma tarefa existente e status **404** para um identificador inexistente.
15. A combinação de título sem espaços nas extremidades e data de vencimento **não pode ser duplicada**. A comparação do título diferencia maiúsculas de minúsculas. A tentativa deve retornar status **409** e não criar outro registro.
16. `DELETE /api/tasks/:id` deve retornar status **204** ao excluir uma tarefa existente e status **404** quando o identificador não existir.
17. Rotas desconhecidas devem retornar status **404** em JSON.
18. `PATCH /api/tasks/:id` deve atualizar somente o status, seguindo a sequência `Pendente → Em andamento → Concluída`. Deve retornar **200** com a tarefa atualizada; **400** para status ausente ou inválido; **404** para tarefa inexistente; e **409** para transição fora da sequência, repetida ou a partir de `Concluída`.

### Observações sobre o ambiente

- Os dados da aplicação são mantidos **em memória** no servidor. Recarregar a página preserva os registros; encerrar o servidor limpa os dados. A limpeza ao encerrar o servidor faz parte do ambiente do desafio e **não deve ser registrada como defeito**.
- Todos os navegadores acessando a mesma instância compartilham as tarefas.
- Atualizações feitas por outro cliente aparecem ao recarregar a página; atualização automática em tempo real está **fora do escopo**.

---

## Contrato das requisições e respostas

Envie `Content-Type: application/json` nas requisições `POST` e `PATCH`. Para criar, use esta estrutura com uma data válida igual ou posterior à data atual:

```json
{
  "title": "Revisar cadastro",
  "dueDate": "2099-12-31",
  "priority": "Alta"
}
```

`POST` e `GET` de uma tarefa retornam um objeto com os campos abaixo. O identificador é um número gerado pelo servidor; **não dependa de um valor fixo nos testes**.

```json
{
  "id": 1,
  "title": "Revisar cadastro",
  "dueDate": "2099-12-31",
  "priority": "Alta",
  "status": "Pendente"
}
```

| Operação | Comportamento esperado |
|---|---|
| `GET /api/tasks` | Array de objetos de tarefa, ou `[]` quando não houver tarefas |
| `PATCH /api/tasks/:id` | Recebe `{"status":"Em andamento"}` ou `{"status":"Concluída"}` e retorna o objeto atualizado |
| `DELETE /api/tasks/:id` | Sucesso retorna `204` sem corpo |
| Erros | Retornam `{"error":"Mensagem compreensível"}` — o texto exato da mensagem não faz parte do contrato |
| Corpo inválido | Corpos que não sejam objetos JSON válidos devem retornar `400` |

---

## Parte 1 — Planejamento e execução manual

Crie um plano enxuto que contenha:

- [ ] escopo e objetivo;
- [ ] riscos e prioridades;
- [ ] tipos de teste escolhidos;
- [ ] dados e condições necessários;
- [ ] critérios de entrada e saída;
- [ ] pelo menos **10 casos ou cenários de teste**, incluindo fluxos positivos, negativos e casos de borda;
- [ ] verificações da **interface**, da **API** e de pelo menos **um fluxo que atravesse ambas**;
- [ ] resultado da execução de cada cenário, com status como **Passou**, **Falhou**, **Bloqueado** ou **Não executado**.

Você pode usar Markdown, planilha ou o formato com que trabalha melhor. Evite apenas uma lista genérica: os passos e resultados devem permitir que outra pessoa reproduza a verificação.

---

## Parte 2 — Registro de defeitos

Registre os defeitos relevantes que encontrar. Cada relato deve conter, quando aplicável:

- [ ] título objetivo;
- [ ] ambiente;
- [ ] pré-condições;
- [ ] passos para reprodução;
- [ ] resultado esperado;
- [ ] resultado obtido;
- [ ] severidade e prioridade propostas, com justificativa;
- [ ] evidência, como captura de tela, vídeo, log ou saída do teste.

Também indique **quais defeitos impediriam uma publicação e por quê**.

---

## Parte 3 — Automação de interface e API

Automatize de **4 a 6 cenários** que considere mais valiosos. A entrega deve combinar testes da interface Web e da API. Você pode usar Playwright, Cypress, Selenium, Vitest, Supertest ou outra ferramenta adequada.

### Teste de integração da API (obrigatório)

Pelo menos um dos cenários deve ser um **teste de integração da API**. Esse teste deve fazer uma **requisição HTTP real** ao servidor fornecido e verificar a colaboração entre **rota, validação e armazenamento em memória**. Um teste que substitua a API, a rota ou o armazenamento integralmente por mocks **não atende** a esse requisito.

Um exemplo de fluxo de integração aceitável é criar uma tarefa pela API, consultar o recurso criado e confirmar que os dados armazenados correspondem à criação. Você pode escolher outro fluxo se explicar quais componentes estão sendo integrados.

### A solução deve

- [ ] ser executável por outra pessoa a partir das instruções do README;
- [ ] incluir ao menos um fluxo **positivo** e um **negativo**;
- [ ] incluir pelo menos um teste automatizado da **interface** e um da **API**;
- [ ] incluir um cenário automatizado que comprove o **compartilhamento dos dados entre interface e API** (ex.: cadastrar pela tela e consultar pela API, ou criar pela API e verificar na tela);
- [ ] incluir obrigatoriamente o **teste de integração** descrito acima;
- [ ] usar verificações que comprovem o comportamento, e não apenas cliques;
- [ ] evitar esperas fixas desnecessárias e dependência entre testes;
- [ ] produzir saída clara em caso de falha;
- [ ] manter o código legível e organizado.

### Regras importantes

- **Não altere a aplicação para corrigir os defeitos.** Se precisar mudar algo apenas para viabilizar a automação, explique a mudança e preserve a versão original.
- A aplicação contém **falhas intencionais**. Uma automação correta pode falhar ao detectá-las. Escreva as asserções **conforme os requisitos**, mantenha as falhas visíveis e relacione-as aos relatos de defeito no README.
- **Não ajuste o resultado esperado ao comportamento incorreto** apenas para deixar a suíte verde. Uma falha demonstrada do produto não reduz a nota pela simples ocorrência; serão distinguidos defeitos do produto de problemas no código dos testes.
- O teste de integração e o cenário de compartilhamento entre tela e API podem fazer parte dos mesmos 4 a 6 cenários; não são entregas adicionais.
- A integração é **obrigatória**: sua ausência exige validação técnica adicional antes de uma recomendação de contratação, independentemente da nota total.

---

## Parte 4 — Síntese

No README da entrega, responda brevemente:

1. Quais foram os três maiores riscos encontrados?
2. Por que você escolheu os cenários automatizados?
3. O que testaria a seguir com mais tempo?
4. Como integraria a automação a um pipeline de entrega?
5. Quais ferramentas, fontes e recursos de IA utilizou?

---

## Entregáveis

- [ ] plano e evidências da execução manual;
- [ ] relatos de defeitos;
- [ ] código dos testes automatizados;
- [ ] pelo menos um teste de integração da API **claramente identificado**;
- [ ] README com instalação, execução, decisões, limitações e respostas da síntese.

Envie por repositório Git ou arquivo compactado, conforme combinado. **Não inclua senhas, tokens ou dados pessoais.**

---

## O que será avaliado

- raciocínio de teste e cobertura orientada a risco;
- clareza e reprodutibilidade da execução manual;
- qualidade dos relatos de defeito;
- escolha e qualidade dos testes automatizados;
- organização, comunicação e capacidade de explicar decisões.
