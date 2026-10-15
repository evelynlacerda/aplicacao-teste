/**
 * API - transições de status — R6, R7, R14, R18.
 * Sequência válida: Pendente -> Em andamento -> Concluída.
 * Pular etapa, repetir ou sair de Concluída => 409; status inválido => 400;
 * id inexistente => 404. Rejeições não podem alterar a tarefa.
 */
import { test, expect } from "../support/fixtures";
import { validTask, Task } from "../support/data";

test("R18 - PATCH só aceita a sequência Pendente -> Em andamento -> Concluída", async ({ api }) => {
  const tarefa = await api.createOk(validTask());

  const pulou = await api.patchStatus(tarefa.id, "Concluída");
  expect(pulou.status(), "pular Em andamento deve dar 409").toBe(409);
  const aindaPendente = (await (await api.get(tarefa.id)).json()) as Task;
  expect(aindaPendente.status, "rejeição não pode alterar o status").toBe("Pendente");

  const avancou = await api.patchStatus(tarefa.id, "Em andamento");
  expect(avancou.status()).toBe(200);
  expect(((await avancou.json()) as Task).status).toBe("Em andamento");

  const repetiu = await api.patchStatus(tarefa.id, "Em andamento");
  expect(repetiu.status(), "repetir status deve dar 409").toBe(409);

  const concluiu = await api.patchStatus(tarefa.id, "Concluída");
  expect(concluiu.status()).toBe(200);

  const voltou = await api.patchStatus(tarefa.id, "Em andamento");
  expect(voltou.status(), "a partir de Concluída deve dar 409 (R7)").toBe(409);
  const final = (await (await api.get(tarefa.id)).json()) as Task;
  expect(final.status).toBe("Concluída");
});

test("R18 - PATCH com status inválido ou ausente retorna 400 e id inexistente 404", async ({ api }) => {
  const tarefa = await api.createOk(validTask());

  const invalido = await api.patchStatus(tarefa.id, "Feito");
  expect(invalido.status(), "status inválido").toBe(400);

  const ausente = await api.patchStatus(tarefa.id, undefined);
  expect(ausente.status(), "status ausente").toBe(400);

  const inexistente = await api.patchStatus(999999999, "Em andamento");
  expect(inexistente.status(), "id inexistente").toBe(404);
});
