// Execute: node --experimental-vm-modules --test tests/api-csrf.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import axios from "axios";

async function setup(cookie = "") {
  const document = { cookie };
  const context = vm.createContext({ document });
  const axiosModule = new vm.SyntheticModule(["default"], function () {
    this.setExport("default", axios);
  }, { context });
  const source = await readFile(new URL("../src/services/api.js", import.meta.url), "utf8");
  const module = new vm.SourceTextModule(source, {
    context,
    initializeImportMeta(meta) { meta.env = { VITE_API_URL: "http://test.local" }; },
  });
  await module.link(() => axiosModule);
  await module.evaluate();
  const calls = [];
  const { api, initializeCsrf } = module.namespace;
  api.defaults.adapter = async (config) => {
    calls.push(config.url);
    if (config.url === "/auth/csrf") document.cookie = "XSRF-TOKEN=test-token";
    else if (!["get", "head", "options"].includes(config.method)) {
      assert.match(document.cookie, /XSRF-TOKEN=.+/, "A escrita precisa aguardar o token");
    }
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  return { api, initializeCsrf, calls, document };
}

test("obtém CSRF antes da primeira escrita e reutiliza o cookie nas seguintes", async () => {
  const { api, calls } = await setup();
  await api.post("/cliente", {});
  await api.put("/cliente/1/contatos", {});
  assert.deepEqual(calls, ["/auth/csrf", "/cliente", "/cliente/1/contatos"]);
});

test("não consulta CSRF em leituras ou quando o cookie já existe", async () => {
  const { api, calls, document } = await setup();
  await api.get("/cliente/listarFiltro");
  document.cookie = "other=value; XSRF-TOKEN=existing-token";
  await api.delete("/contatos/1");
  assert.deepEqual(calls, ["/cliente/listarFiltro", "/contatos/1"]);
});

test("inicializações e escritas simultâneas compartilham a obtenção do token", async () => {
  const { api, initializeCsrf, calls } = await setup();
  await Promise.all([initializeCsrf(), initializeCsrf(), api.post("/cliente", {}), api.patch("/produto/1", {})]);
  assert.equal(calls.filter((url) => url === "/auth/csrf").length, 1);
  assert.equal(calls[0], "/auth/csrf");
  assert.equal(calls.length, 3);
});

test("obtém novo token quando o cookie desaparece", async () => {
  const { api, document, calls } = await setup("XSRF-TOKEN=old-token");
  await api.post("/cliente", {});
  document.cookie = "XSRF-TOKEN=";
  await api.post("/produto", {});
  assert.deepEqual(calls, ["/cliente", "/auth/csrf", "/produto"]);
});

test("falha ao obter CSRF impede a escrita e permite uma nova tentativa", async () => {
  const { api, calls } = await setup();
  const adapter = api.defaults.adapter;
  api.defaults.adapter = async () => { throw new Error("Falha de conexão"); };
  await assert.rejects(api.post("/cliente", {}), /Erro HTTP/);
  assert.equal(calls.length, 0);
  api.defaults.adapter = adapter;
  await api.post("/cliente", {});
  assert.deepEqual(calls, ["/auth/csrf", "/cliente"]);
});

test("não repete gravações que retornam erro do servidor", async () => {
  const { api } = await setup("XSRF-TOKEN=existing-token");
  let attempts = 0;
  api.defaults.adapter = async () => {
    attempts++;
    throw { response: { status: 500, data: { message: "Falha no servidor" } } };
  };
  await assert.rejects(api.post("/cliente", {}), { message: "Falha no servidor", status: 500 });
  assert.equal(attempts, 1);
});
