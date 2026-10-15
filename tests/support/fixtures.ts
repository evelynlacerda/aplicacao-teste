import { test as base, expect } from "@playwright/test";
import { TaskApi } from "./api";
import { TasksPage } from "./tasks-page";

export const test = base.extend<{ api: TaskApi; tasksPage: TasksPage }>({
  api: async ({ request }, use) => {
    const api = new TaskApi(request);
    await use(api);
    await api.cleanup();
  },
  tasksPage: async ({ page }, use) => {
    await use(new TasksPage(page));
  },
});

export { expect };
