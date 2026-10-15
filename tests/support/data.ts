/**
 * Geração de dados para os testes
 * As datas são calculadas a partir do relógio local, que é a mesma máquina do servidor
 * 
 * Nunca fixas, assim não viram datas passadas
 */

export type Priority = "Baixa" | "Média" | "Alta";
export type Status = "Pendente" | "Em andamento" | "Concluída";

export interface TaskInput {
  title: string;
  dueDate: string;
  priority: Priority;
}

export interface Task extends TaskInput {
  id: number;
  status: Status;
}

// Retorna a data local no formato YYYY-MM-DD, deslocada em N dias.
export function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const today = () => localDate(0);
export const yesterday = () => localDate(-1);
export const inDays = (n: number) => localDate(n);

// Título único por execução, para que não conflite com outros testes nem com a regra de duplicidade.
export function uniqueTitle(prefix = "QA"): string {
  const randTittle = Math.random().toString(36).slice(2, 7);
  return `${prefix} ${Date.now()}-${randTittle}`;
}

// Payload vãlido com possibilidade de sobrescrita em campos.
export function validTask(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    title: uniqueTitle(),
    dueDate: inDays(7),
    priority: "Alta",
    ...overrides,
  };
}
