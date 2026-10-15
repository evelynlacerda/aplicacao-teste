import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import { Task, TaskInput } from "./data";

export class TaskApi {
  private created = new Set<number>();

  constructor(private readonly request: APIRequestContext) {}

  list(): Promise<APIResponse> {
    return this.request.get("/api/tasks");
  }

  get(id: number | string): Promise<APIResponse> {
    return this.request.get(`/api/tasks/${id}`);
  }

  async create(body: Partial<TaskInput> | unknown) {
    const res = await this.request.post("/api/tasks", { data: body as object });
    if (res.status() === 201) {
      const task = (await res.json()) as Task;
      this.created.add(task.id);
    }
    return res;
  }

  /** Envia um body "cru" para teste inválido */
  createRaw(raw: string): Promise<APIResponse> {
    return this.request.post("/api/tasks", {
      headers: { "Content-Type": "application/json" },
      data: raw,
    });
  }

  patchStatus(id: number | string, status: unknown): Promise<APIResponse> {
    return this.request.patch(`/api/tasks/${id}`, { data: { status } });
  }

  delete(id: number | string): Promise<APIResponse> {
    return this.request.delete(`/api/tasks/${id}`);
  }

  /** Cria uma tarefa e falha com uma mensagem se a condição não for atendida */
  async createOk(body: TaskInput): Promise<Task> {
    const res = await this.create(body);
    expect(
      res.status(),
      `Criação de tarefa válida, retorna 201. Corpo: ${await res.text()}`,
    ).toBe(201);
    return (await res.json()) as Task;
  }

  /** Registra uma tarefa criada fora do cliente para limpeza */
  track(id: number) {
    this.created.add(id);
  }

  /** Remove o que o teste criou. */
  async cleanup() {
    for (const id of this.created) {
      await this.request.delete(`/api/tasks/${id}`).catch(() => undefined);
    }
    this.created.clear();
  }
}
