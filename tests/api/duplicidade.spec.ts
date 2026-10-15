/**
 * API - duplicidade — R15.
 * Mesmo título (após trim) + mesmo vencimento => 409 e nenhum registro novo.
 * O título diferencia maiúsculas/minúsculas, então a variação de caixa é aceita.
 */
import { test, expect } from "../support/fixtures";
import { validTask, uniqueTitle, Task } from "../support/data";

test("R15 - título + vencimento repetidos retornam 409 e não criam registro", async ({ api }) => {
  const original = await api.createOk(validTask({ title: uniqueTitle("Dup abc") }));

  const repetida = await api.create({
    title: `  ${original.title}  `,
    dueDate: original.dueDate,
    priority: original.priority,
  });
  expect(repetida.status(), `corpo: ${await repetida.text()}`).toBe(409);

  const tarefas = (await (await api.list()).json()) as Task[];
  const iguais = tarefas.filter((t) => t.title === original.title && t.dueDate === original.dueDate);
  expect(iguais, "só pode existir um registro").toHaveLength(1);

  const outraCaixa = await api.create({
    title: original.title.toUpperCase(),
    dueDate: original.dueDate,
    priority: original.priority,
  });
  expect(outraCaixa.status(), "caixa diferente não é duplicidade").toBe(201);
});
