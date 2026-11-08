import assert from "node:assert/strict";
import test from "node:test";
import { validarCamposPedido } from "../src/services/pedidoValidation.js";
import { dadosParaFormData, diasParaExpirar, montarDadosRascunho } from "../src/services/pedidoDrafts.js";

const pedidoValido = () => ({
  cliente: { id: 1, nomeFantasia: "Acme" },
  distribuidor: { id: 2, nomeFantasia: "Dist" },
  produtos: [{ fkProduto: 1, descricao: "Item", quantidade: "2", valorUnitario: "10.00", unitFaturado: "15.00" }],
});

test("aceita valor faturado igual ao do distribuidor", () => {
  const dados = pedidoValido();
  dados.produtos[0].unitFaturado = "10.00";
  assert.equal(validarCamposPedido(dados), "");
});

test("bloqueia valor faturado menor que o do distribuidor, identificando o produto", () => {
  const dados = pedidoValido();
  dados.produtos.push({ fkProduto: 2, descricao: "Outro", quantidade: 1, valorUnitario: 20, unitFaturado: 19.99 });
  assert.equal(
    validarCamposPedido(dados),
    "Produto 2: o valor unitário faturado não pode ser menor que o valor unitário do distribuidor.",
  );
});

test("a margem é comparada em centavos, sem erro de ponto flutuante", () => {
  const dados = pedidoValido();
  dados.produtos[0].valorUnitario = 0.1 + 0.2;
  dados.produtos[0].unitFaturado = 0.3;
  assert.equal(validarCamposPedido(dados), "");
});

test("o rascunho guarda a forma de pagamento e nunca o PDF", () => {
  const dados = montarDadosRascunho(
    { cliente: { id: 1 }, produtos: [{}], pdfBase64: "abc", formaPagamento: "" },
    { formaPagamento: "BOLETO" },
  );
  assert.deepEqual(Object.keys(dados).sort(), ["cliente", "distribuidor", "entrega", "formaPagamento", "produtos"]);
  assert.equal(dados.formaPagamento, "BOLETO");
  assert.deepEqual(dados.distribuidor, {});
});

test("dadosParaFormData completa as chaves ausentes", () => {
  const form = dadosParaFormData({ cliente: { id: 3 } });
  assert.equal(form.cliente.id, 3);
  assert.deepEqual(form.produtos, []);
  assert.equal(form.formaPagamento, "");
  assert.deepEqual(dadosParaFormData(), { cliente: {}, distribuidor: {}, produtos: [], entrega: {}, formaPagamento: "" });
});

test("diasParaExpirar arredonda para cima e nunca é negativo", () => {
  const agora = new Date("2026-10-21T12:00:00Z");
  assert.equal(diasParaExpirar("2026-11-20T12:00:00Z", agora), 30);
  assert.equal(diasParaExpirar("2026-10-21T13:00:00Z", agora), 1);
  assert.equal(diasParaExpirar("2026-10-01T00:00:00Z", agora), 0);
});
