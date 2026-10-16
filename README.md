# Desafio de QA Funcional e Automação

Testes manuais e automatizados (API + interface) de uma aplicação Web de gerenciamento de tarefas, com defeitos intencionais.

- **Plano de testes manuais:** [docs/plano-de-testes.md](docs/plano-de-testes.md)
- **Defeitos encontrados:** [docs/DEFEITOS.md](docs/DEFEITOS.md)
- **Evidências (prints e saídas):** [docs/evidencias/](docs/evidencias/)
- **Automação (Playwright):** pasta [tests/](tests/)
- **Aplicação testada (original, não alterada):** pasta [aplicacao-teste/](aplicacao-teste/)

## Passo a passo

Os comandos funcionam no terminal do Windows (PowerShell). Execute na ordem.

### 1. Pré-requisito

Node.js 18 ou superior. Para conferir:

```bash
node -v
```

### 2. Iniciar a API (para testes manuais no Postman e na interface)

Abra um terminal na pasta do projeto e execute:

```bash
cd aplicacao-teste/api
npm start
```

A aplicação não tem dependências, então não precisa de `npm install`. Com o servidor no ar:

- Interface: http://localhost:3333
- API: http://localhost:3333/api/tasks

Deixe esse terminal aberto. Para encerrar, use Ctrl+C (os dados em memória são apagados).

> A suíte automatizada **não** usa esse servidor: ela sobe uma instância própria na porta 3334, então não precisa que a API esteja rodando para executar os passos 3 a 5.

### 3. Instalar o Playwright

Abra **outro** terminal na pasta do projeto e execute:

```bash
cd tests
npm install
npx playwright install chromium
```

O segundo comando baixa o navegador usado nos testes de interface (precisa de internet).

### 4. Rodar os testes e ver o resultado no terminal

Todos os testes (API e interface):

```bash
npm test
```

Só os testes de API:

```bash
npm run test:api
```

Só os testes de interface:

```bash
npm run test:e2e
```

Testes de interface com o navegador visível:

```bash
npm run test:headed
```

O resultado de cada teste aparece no terminal (passou ou falhou, com a mensagem do erro).

### 5. Abrir o relatório no navegador

Depois de rodar os testes, execute:

```bash
npm run report
```

O relatório HTML abre no navegador, com o detalhe de cada teste e, nos que falharam, screenshot, vídeo e trace. Para fechar o servidor do relatório, use Ctrl+C no terminal.

## Resultado esperado da automação

Algumas falhas são **esperadas**: os testes seguem os requisitos, e a aplicação tem defeitos intencionais. Na última execução (Node.js v24.11.1, Playwright 1.64.1), 8 testes passaram e 5 falharam. As falhas correspondem a defeitos do produto, descritos em [docs/DEFEITOS.md](docs/DEFEITOS.md):

| Teste que falha | Defeito |
|---|---|
| `R15 - título + vencimento repetidos retornam 409 e não criam registro` | DEF-03 |
| `[NEGATIVO] R13 - R2 data inexistente (30/02) retorna 400 e não cria tarefa` | DEF-01 |
| `[NEGATIVO] R13 - R3 prioridade fora da lista retorna 400 e não cria tarefa` | DEF-02 |
| `[NEGATIVO] R13 - R3 prioridade com outra caixa retorna 400 e não cria tarefa` | DEF-02 |
| `R8/R9 - filtros mostram só o status certo e contadores ignoram o filtro` | DEF-04 e DEF-05 |

## Testes manuais

O plano com os casos executados no Postman e na interface, com resultados e evidências, está em [docs/plano-de-testes.md](docs/plano-de-testes.md).
