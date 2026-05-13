import CatalogPage from "../components/catalog/CatalogPage";

const rows = [
  {
    id: "C1",
    title: "CLIENTE 1",
    subtitle: "Maria Silva - Microsoft",
    cells: [
      { value: "maria.silva@microsoft", className: "catalog-link" },
      { value: "5", className: "catalog-centered" },
    ],
  },
  {
    id: "C2",
    title: "CLIENTE 2",
    subtitle: "Joao Oliveira - Tech Solutions",
    cells: [
      { value: "joao.oliveira@techsolutions", className: "catalog-link" },
      { value: "2", className: "catalog-centered" },
    ],
  },
  {
    id: "C3",
    title: "CLIENTE 3",
    subtitle: "Ana Costa - Global Corp",
    cells: [
      { value: "ana.costa@global.corp", className: "catalog-link" },
      { value: "4", className: "catalog-centered" },
    ],
  },
  {
    id: "C4",
    title: "CLIENTE 4",
    subtitle: "Rafael Santos - Globan",
    cells: [
      { value: "rafa.santos@globan", className: "catalog-link" },
      { value: "1", className: "catalog-centered" },
    ],
  },
];

const fields = [
  { label: "Raz\u00e3o Social", placeholder: "Ex: Tech Solutions Ltda", span: "full" },
  { label: "CNPJ", placeholder: "00.000.000/0000-00" },
  { label: "Insc. Est.", placeholder: "isento" },
  { label: "Fone", placeholder: "(00) 0000-0000" },
  { label: "CEP", placeholder: "00000-000" },
  { label: "Endere\u00e7o", placeholder: "Rua das inova\u00e7\u00f5es, 104", span: "full" },
  { label: "Cidade", placeholder: "Centro" },
  { label: "UF", type: "select", value: "SP", options: ["SP", "RJ", "MG", "PR"] },
  { label: "Contato", placeholder: "Nome do Respons\u00e1vel", span: "full" },
  { label: "E-mail", placeholder: "contato@empresa.com", span: "full" },
];

export default function ClientePage() {
  return (
    <CatalogPage
      eyebrow="Clientes Cadastrados"
      title="Painel de Leads"
      searchPlaceholder="Pesquisar Clientes"
      tableTitle="Base de Clientes"
      tableColumns={[
        { label: "Identifica\u00e7\u00e3o dos Cadastros", width: "2fr" },
        { label: "E-mail", width: "1.7fr" },
        { label: "Compras Realizadas", width: "1.4fr" },
      ]}
      rows={rows}
      moreLabel="Ver Mais Clientes"
      formTitle="Cadastrar Novo Cliente"
      formFields={fields}
    />
  );
}
