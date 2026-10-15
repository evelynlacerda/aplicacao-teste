import { Locator, Page } from "@playwright/test";
import { TaskInput } from "./data";

export type Filter = "Todas" | "Pendente" | "Em andamento" | "Concluída";

export class TasksPage {
  readonly titleInput: Locator;
  readonly dueDateInput: Locator;
  readonly prioritySelect: Locator;
  readonly submitButton: Locator;
  readonly message: Locator;
  readonly total: Locator;
  readonly pending: Locator;
  readonly inProgress: Locator;
  readonly done: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.locator("#title");
    this.dueDateInput = page.locator("#due-date");
    this.prioritySelect = page.locator("#priority");
    this.submitButton = page.getByRole("button", { name: "Adicionar" });
    this.message = page.locator("#form-message");
    this.total = page.locator("#total-count");
    this.pending = page.locator("#pending-count");
    this.inProgress = page.locator("#progress-count");
    this.done = page.locator("#done-count");
  }

  async open() {
    await this.page.goto("/");
  }

  async fillForm(task: Partial<TaskInput>) {
    if (task.title !== undefined) await this.titleInput.fill(task.title);
    if (task.dueDate !== undefined) await this.dueDateInput.fill(task.dueDate);
    if (task.priority !== undefined) await this.prioritySelect.selectOption(task.priority);
  }

  async addTask(task: Partial<TaskInput>) {
    await this.fillForm(task);
    await this.submitButton.click();
  }

  taskByTitle(title: string): Locator {
    return this.page.locator("li.task").filter({ hasText: title });
  }

  async filterBy(filter: Filter) {
    await this.page.locator(`[data-filter="${filter}"]`).click();
  }

  async advance(title: string) {
    await this.taskByTitle(title).getByRole("button", { name: /Iniciar|Concluir/ }).click();
  }

  async remove(title: string) {
    await this.taskByTitle(title).getByRole("button", { name: "Excluir" }).click();
  }
}
