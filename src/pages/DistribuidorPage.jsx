import CatalogPage from "../components/catalog/CatalogPage";

const rows = [
  {
    id: "F1",
    title: "FORNECEDOR 1",
    subtitle: "Maria Silva - Microsoft",
    cells: [
      { value: "maria.silva@microsoft", className: "catalog-link" },
      { value: "softwer" },
    ],
  },
  {
    id: "F2",
    title: "FORNECEDOR 2",
    subtitle: "Joao Oliveira - Tech Solutions",
    cells: [
      { value: "joao.oliveira@techsolutons", className: "catalog-link" },
      { value: "softwer" },
    ],
  },
  {
    id: "F3",
    title: "FORNECEDOR 3",
    subtitle: "Ana Costa - Global Corp",
    cells: [
      { value: "ana.costa@glabal.corp", className: "catalog-link" },
      { value: "softwer" },
    ],
  },
  {
    id: "F4",
    title: "FORNECEDOR 4",
    subtitle: "Rafael Santos - Globan",
    cells: [
      { value: "rafa.santos@globan", className: "catalog-link" },
      { value: "softwer" },
    ],
  },
];

const fields = [
  { label: "Razão Social", placeholder: "Ex: Tech Solutions Ltda", span: "full" },
  { label: "CNPJ", placeholder: "00.000.000/0000-00" },
  { label: "Insc. Est.", placeholder: "isento" },
  { label: "Fone", placeholder: "(00) 0000-0000" },
  { label: "CEP", placeholder: "00000-000" },
  { label: "Endereço", placeholder: "Rua das inovações, 104", span: "full" },
  { label: "Cidade", placeholder: "Centro" },
  { label: "UF", type: "select", value: "SP", options: ["SP", "RJ", "MG", "PR"] },
  { label: "Especialidade", placeholder: "Softwer", span: "full" },
  { label: "Contato", placeholder: "Nome do Responsável", span: "full" },
  { label: "E-mail", placeholder: "contato@empresa.com", span: "full" },
];

export default function DistribuidorPage() {
  return (
    <CatalogPage
      eyebrow="Distribuidores Cadastrados"
      title="Painel de Fornecedores"
      searchPlaceholder="Pesquisar Distribuidor"
      tableTitle="Base de Fornecedores"
      tableColumns={[
        { label: "Identificação dos Cadastros", width: "2fr" },
        { label: "E-mail", width: "1.55fr" },
        { label: "Especialidade", width: "1.25fr" },
      ]}
      rows={rows}
      moreLabel="Ver Mais Fornecedores"
      formTitle="Cadastrar Novo Distribuidor"
      formFields={fields}
    />
  );
}
