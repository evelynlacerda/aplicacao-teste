/**
 * API - cadastro inválido (fluxo negativo) — R1, R2, R3, R5, R13.
 * Cada payload inválido deve retornar 400 com {"error": "..."} e
 * NÃO pode criar nenhuma tarefa (a lista mantém o mesmo tamanho).
 */
import { test, expect } from "../support/fixtures";
import { validTask, yesterday, Task } from "../support/data";

const casosInvalidos = [
  { nome: "R1 título com 2 caracteres", dados: () => validTask({ title: "ab" }) },
  { nome: "R1 título com 81 caracteres", dados: () => validTask({ title: "a".repeat(81) }) },
  { nome: "R1 título só com espaços", dados: () => validTask({ title: "     " }) },
  { nome: "R2 vencimento ontem", dados: () => validTask({ dueDate: yesterday() }) },
  { nome: "R2 data inexistente (30/02)", dados: () => validTask({ dueDate: "2099-02-30" }) },
  { nome: "R3 prioridade fora da lista", dados: () => validTask({ priority: "Urgente" as never }) },
  { nome: "R3 prioridade com outra caixa", dados: () => validTask({ priority: "alta" as never }) },
];

for (const caso of casosInvalidos) {
  test(`[NEGATIVO] R13 - ${caso.nome} retorna 400 e não cria tarefa`, async ({ api }) => {
    const antes = ((await (await api.list()).json()) as Task[]).length;

    const resposta = await api.create(caso.dados());

    expect(resposta.status(), `corpo: ${await resposta.text()}`).toBe(400);
    const corpo = await resposta.json();
    expect(typeof corpo.error, "deve vir {error: string}").toBe("string");

    const depois = ((await (await api.list()).json()) as Task[]).length;
    expect(depois, "nenhuma tarefa deve ser criada").toBe(antes);
  });
}
