/**
 * Teste de INTEGRAÇÃO da API (obrigatório) — R4, R12, R13, R14.
 * Faz requisições HTTP reais ao servidor e verifica a colaboração entre
 * rota (POST/GET), validação (campos aceitos) e armazenamento em memória
 * (o que foi criado pode ser lido de volta por id e pela lista).
 */
import { test, expect } from "../support/fixtures";
import { validTask, Task } from "../support/data";

test("[INTEGRAÇÃO] R4/R12/R13/R14 - criar via POST, consultar por id e achar na lista", async ({ api }) => {
  const entrada = validTask();

  const criada = await api.create(entrada);
  expect(criada.status(), "POST válido deve retornar 201").toBe(201);
  const tarefa = (await criada.json()) as Task;
  expect(tarefa.status, "nova tarefa deve começar Pendente (R4)").toBe("Pendente");
  expect(tarefa.title).toBe(entrada.title);
  expect(tarefa.dueDate).toBe(entrada.dueDate);
  expect(tarefa.priority).toBe(entrada.priority);

  const porId = await api.get(tarefa.id);
  expect(porId.status(), "GET /:id de tarefa existente deve retornar 200").toBe(200);
  expect(await porId.json()).toEqual(tarefa);

  const lista = await api.list();
  expect(lista.status()).toBe(200);
  const tarefas = (await lista.json()) as Task[];
  expect(tarefas, "a tarefa criada deve aparecer na lista").toContainEqual(tarefa);
});
