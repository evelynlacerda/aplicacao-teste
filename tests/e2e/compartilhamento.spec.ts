/**
 * Interface <-> API (compartilhamento de dados) — R2, R3, R4, R10, R12.
 * Cadastra pela TELA e confirma pela API (mesmo armazenamento no servidor);
 * depois recarrega a página e confirma que a tarefa continua visível.
 */
import { test, expect } from "../support/fixtures";
import { validTask, Task } from "../support/data";

test("tela -> API: tarefa cadastrada na interface existe na API e sobrevive ao reload", async ({ api, tasksPage, page }) => {
  const entrada = validTask();

  await tasksPage.open();
  await tasksPage.addTask(entrada);
  await expect(tasksPage.taskByTitle(entrada.title), "tarefa deve aparecer na lista").toBeVisible();

  const resposta = await api.list();
  const tarefas = (await resposta.json()) as Task[];
  const naApi = tarefas.find((t) => t.title === entrada.title);
  if (naApi) api.track(naApi.id);
  expect(naApi, "a tarefa cadastrada na tela deve existir na API").toBeDefined();
  expect(naApi).toMatchObject({ ...entrada, status: "Pendente" });

  await page.reload();
  await expect(tasksPage.taskByTitle(entrada.title), "R10: tarefa permanece após recarregar").toBeVisible();
});
