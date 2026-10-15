# Aplicação local para o desafio

Esta pasta contém uma aplicação Web integrada a uma API HTTP. Cadastro, consulta, mudança de status e exclusão usam o mesmo armazenamento em memória no servidor. A aplicação foi criada exclusivamente para avaliação.

## Iniciar a aplicação

É necessário Node.js 18 ou mais recente. Não há dependências externas nem necessidade de `npm install`. No terminal, dentro de `aplicacao-teste/api`, execute:

```bash
npm start
```

Abra `http://127.0.0.1:3333` para usar a interface. A API usa o mesmo endereço:

```bash
curl http://127.0.0.1:3333/api/tasks
```

O servidor entrega a interface e a API juntos. Abra a interface por esse endereço para que as requisições relativas `/api/tasks` alcancem o backend correto.

Se a porta 3333 estiver ocupada, no macOS ou Linux você pode usar:

```bash
PORT=3334 npm start
```

Nesse caso, use `http://127.0.0.1:3334` tanto para a interface quanto para a API. Encerre com Ctrl+C.

## Dados e isolamento

Recarregar a página preserva as tarefas. Encerrar e iniciar novamente o servidor limpa os dados. Todos os clientes da mesma instância compartilham as tarefas; alterações de outro cliente ficam visíveis ao recarregar a tela.

Para isolar testes, use títulos e dados únicos e exclua os registros criados na finalização, ou reinicie uma instância dedicada por execução. Testes paralelos que compartilham a instância podem afetar contadores e listagens; explique a estratégia escolhida. Evite identificadores fixos e datas que se tornem passadas com o tempo.

## Entrega

Os endpoints, exemplos de JSON e comportamentos esperados estão no enunciado. Os testes e seus arquivos de configuração devem ficar em uma pasta separada para preservar o artefato original.

O teste de integração obrigatório deve fazer requisições HTTP reais. A entrega também deve demonstrar um fluxo com interface e API reais. A aplicação contém defeitos intencionais: mantenha as asserções conforme os requisitos e documente as falhas do produto que os testes detectarem.
