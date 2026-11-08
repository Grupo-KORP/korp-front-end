export async function fetchEmpresa(cnpjRaw) {
  const res = await fetch(`https://api.opencnpj.org/${cnpjRaw}`);
  if (!res.ok) throw new Error("CNPJ não encontrado.");
  const data = await res.json();
  if (data.situacao_cadastral && data.situacao_cadastral.toLowerCase() !== "ativa") {
    throw new Error(`CNPJ com situação: ${data.situacao_cadastral}.`);
  }
  return {
    razaoSocial: data.razao_social ?? "",
    nomeFantasia: data.nome_fantasia ?? "",
    inscEst: "",
  };
}

export async function fetchCEP(cepRaw) {
  const res = await fetch(`https://viacep.com.br/ws/${cepRaw}/json/`);
  const data = await res.json();
  if (data.erro) throw new Error("CEP não encontrado.");
  return { endereco: data.logradouro, cidade: data.localidade, uf: data.uf };
}
