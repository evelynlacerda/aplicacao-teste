/**
 * Interface - filtros e contadores — R8, R9.
 * Cria 3 tarefas pela API (Pendente, Em andamento, Concluída) e confere na tela:
 * cada filtro mostra SOMENTE o status correspondente (R8) e os contadores do
 * resumo refletem TODAS as tarefas, independentemente do filtro (R9).
 * Usa asserções "soft" para reportar todas as divergências de uma vez.
 */
import { test, expect } from "../support/fixtures";
import { validTask, uniqueTitle } from "../support/data";

test("R8/R9 - filtros mostram só o status certo e contadores ignoram o filtro", async ({ api, tasksPage, page }) => {
  await tasksPage.open();
  const base = Number(await tasksPage.total.innerText());

  const pendente = await api.createOk(validTask({ title: uniqueTitle("Filtro pend") }));
  const andamento = await api.createOk(validTask({ title: uniqueTitle("Filtro and") }));
  const concluida = await api.createOk(validTask({ title: uniqueTitle("Filtro conc") }));
  await api.patchStatus(andamento.id, "Em andamento");
  await api.patchStatus(concluida.id, "Em andamento");
  await api.patchStatus(concluida.id, "Concluída");

  await page.reload();

  await tasksPage.filterBy("Concluída");
  await expect.soft(tasksPage.taskByTitle(concluida.title), "R8: concluída aparece em Concluídas").toBeVisible();
  await expect.soft(tasksPage.taskByTitle(andamento.title), "R8: em andamento NÃO deve aparecer em Concluídas").toHaveCount(0);
  await expect.soft(tasksPage.taskByTitle(pendente.title)).toHaveCount(0);

  await tasksPage.filterBy("Pendente");
  await expect.soft(tasksPage.taskByTitle(pendente.title), "R8: pendente aparece em Pendentes").toBeVisible();
  await expect.soft(tasksPage.taskByTitle(andamento.title)).toHaveCount(0);
  await expect.soft(tasksPage.taskByTitle(concluida.title)).toHaveCount(0);

  await expect.soft(tasksPage.total, "R9: Total deve contar todas as tarefas com o filtro Pendentes").toHaveText(String(base + 3));
  await expect.soft(tasksPage.inProgress, "R9: contador Em andamento ignora o filtro").toHaveText("1");
  await expect.soft(tasksPage.done, "R9: contador Concluídas ignora o filtro").toHaveText("1");
});
