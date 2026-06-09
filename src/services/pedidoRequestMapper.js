export function mapperFormDataToPedidoRequest(formData) {
  const { cliente, distribuidor, produtos } = formData;

  const itens = (produtos || [])
    .filter(p => p.fkProduto && p.quantidade)
    .map(p => ({
      quantidade: parseInt(p.quantidade, 10),
      vlrUnitDistr: parseFloat(p.valorUnitario) || 0,
      vlrTotalDistr: parseFloat(p.valorTotal) || 0,
      vlrUnitCliente: parseFloat(p.unitFaturado) || 0,
      vlrTotalCliente: parseFloat(p.totalFaturado) || 0,
      fkProduto: p.fkProduto,
    }));

  return {
    cliente: {
      id: cliente.id,
      nomeFantasia: cliente.nomeFantasia,
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj,
      inscricaoEstadual: cliente.inscricaoEstadual,
      fone: cliente.fone,
      cep: cliente.cep,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      uf: cliente.uf,
      email: cliente.email,
      contatos: cliente.contatos || [],
    },
    distribuidor: {
      id: distribuidor.id,
      nomeFantasia: distribuidor.nomeFantasia,
      razaoSocial: distribuidor.razaoSocial,
      cnpj: distribuidor.cnpj,
      inscricaoEstadual: distribuidor.inscEst || distribuidor.inscricaoEstadual,
      fone: distribuidor.fone,
      cep: distribuidor.cep,
      endereco: distribuidor.endereco,
      cidade: distribuidor.cidade,
      uf: distribuidor.uf,
      email: distribuidor.email,
      contatos: distribuidor.contatos || [],
    },
    itens,
  };
}
