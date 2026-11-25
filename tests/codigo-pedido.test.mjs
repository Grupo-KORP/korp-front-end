// Execute: node --test tests/codigo-pedido.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { sequenciaDoCodigo } from "../src/services/codigoPedido.js";

test("extrai a sequência do código DDMMAA-P01", () => {
  assert.equal(sequenciaDoCodigo("251126-P03"), "P03");
  assert.equal(sequenciaDoCodigo("251126-P100"), "P100");
});

test("sem código devolve vazio e texto sem hífen fica como está", () => {
  assert.equal(sequenciaDoCodigo(null), "");
  assert.equal(sequenciaDoCodigo(undefined), "");
  assert.equal(sequenciaDoCodigo("P03"), "P03");
});
