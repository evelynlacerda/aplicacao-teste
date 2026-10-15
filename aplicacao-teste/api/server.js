const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3333);
const priorities = ["Baixa", "Média", "Alta"];
const tasks = [];
let nextId = 1;

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
  });
  response.end(body === undefined ? "" : JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isPastDate(value) {
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const informedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(informedDate.getTime()) || informedDate < currentDate;
}

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

async function handleRequest(request, response) {
  if (request.method === "OPTIONS") {
    sendJson(response, 204);
    return;
  }

  const url = new URL(request.url, "http://localhost");

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = await readFile(path.join(__dirname, "..", "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/tasks") {
    sendJson(response, 200, tasks);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/tasks") {
    try {
      const body = await readJson(request);
      const title = typeof body.title === "string" ? body.title.trim() : "";

      if (title.length < 3 || title.length > 80) {
        sendJson(response, 400, { error: "O título deve conter de 3 a 80 caracteres." });
        return;
      }

      if (!body.dueDate || isPastDate(body.dueDate)) {
        sendJson(response, 400, { error: "A data deve ser igual ou posterior à data atual." });
        return;
      }

      if (!body.priority) {
        sendJson(response, 400, { error: "A prioridade é obrigatória." });
        return;
      }

      const task = {
        id: nextId++,
        title,
        dueDate: body.dueDate,
        priority: body.priority,
        status: "Pendente"
      };

      tasks.push(task);
      sendJson(response, 201, task);
    } catch {
      sendJson(response, 400, { error: "JSON inválido." });
    }
    return;
  }

  const taskMatch = url.pathname.match(/^\/api\/tasks\/(\d+)$/);
  if (taskMatch && request.method === "PATCH") {
    const task = findTask(Number(taskMatch[1]));
    if (!task) {
      sendJson(response, 404, { error: "Tarefa não encontrada." });
      return;
    }
    let body;
    try {
      body = await readJson(request);
    } catch {
      sendJson(response, 400, { error: "JSON inválido." });
      return;
    }
    if (!body || !["Pendente", "Em andamento", "Concluída"].includes(body.status)) {
      sendJson(response, 400, { error: "Status inválido." });
      return;
    }
    const nextStatus = { "Pendente": "Em andamento", "Em andamento": "Concluída" }[task.status];
    if (body.status !== nextStatus) {
      sendJson(response, 409, { error: "Transição de status não permitida." });
      return;
    }
    task.status = body.status;
    sendJson(response, 200, task);
    return;
  }
  if (taskMatch && request.method === "GET") {
    const task = findTask(Number(taskMatch[1]));
    sendJson(response, 200, task || null);
    return;
  }

  if (taskMatch && request.method === "DELETE") {
    const index = tasks.findIndex((task) => task.id === Number(taskMatch[1]));
    if (index >= 0) tasks.splice(index, 1);
    sendJson(response, 204);
    return;
  }

  sendJson(response, 404, { error: "Rota não encontrada." });
}

function createServer() {
  return http.createServer((request, response) => {
    handleRequest(request, response).catch(() => {
      sendJson(response, 500, { error: "Erro interno." });
    });
  });
}

if (require.main === module) {
  createServer().listen(PORT, "127.0.0.1", () => {
    console.log(`API disponível em http://localhost:${PORT}`);
  });
}

module.exports = { createServer, tasks, priorities };
