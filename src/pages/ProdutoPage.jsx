import CatalogPage from "../components/catalog/CatalogPage";

const rows = [
  {
    id: "P1",
    title: "PRODUTO 1",
    subtitle: "#000000",
    cells: [
      { value: "Tech Solutis", className: "catalog-link" },
      { value: "R$ 100,00" },
    ],
  },
  {
    id: "P2",
    title: "PRODUTO 2",
    subtitle: "#000000",
    cells: [
      { value: "Global Corp", className: "catalog-link" },
      { value: "R$ 100,00" },
    ],
  },
  {
    id: "P3",
    title: "PRODUTO 3",
    subtitle: "#000000",
    cells: [
      { value: "Inovation", className: "catalog-link" },
      { value: "R$ 100,00" },
    ],
  },
  {
    id: "P4",
    title: "PRODUTO 4",
    subtitle: "#000000",
    cells: [
      { value: "Cyber Ltda", className: "catalog-link" },
      { value: "R$ 100,00" },
    ],
  },
];

const fields = [
  { label: "Descri\u00e7\u00e3o do Produto", placeholder: "Ex: Pacote Office 365", span: "full" },
  { label: "Codigo P/N", placeholder: "#000000" },
  { label: "Valor Unit\u00e1rio", placeholder: "R$ 0,00" },
  { label: "Especialidade", placeholder: "softwer" },
  { label: "CEP", placeholder: "00000-000" },
  { label: "Distribuidor", placeholder: "Ex: Empresa Solution", span: "full" },
  { label: "Contato", placeholder: "Nome do Respons\u00e1vel", span: "full" },
  { label: "E-mail", placeholder: "contato@empresa.com", span: "full" },
];

export default function ProdutoPage() {
  return (
    <CatalogPage
      eyebrow="Produtos Cadastrados"
      title="Painel de Cat\u00e1logo"
      searchPlaceholder="Pesquisar Produto"
      tableTitle="Base de Produtos"
      tableColumns={[
        { label: "Identifica\u00e7\u00e3o dos Cadastros", width: "2fr" },
        { label: "Distribuidor", width: "1.35fr" },
        { label: "Valor Unit\u00e1rio", width: "1.3fr" },
      ]}
      rows={rows}
      moreLabel="Ver Mais Produtos"
      formTitle="Cadastrar Produto"
      formFields={fields}
    />
  );
}
