export const entities = [
  {
    key: 'clientes',
    label: 'Clientes',
    singularLabel: 'Cliente',
    routeBase: '/clientes',
    apiBasePath: '/cliente',
    idField: 'idCliente',
    allowDelete: true,
    fields: [
      { name: 'razaoSocial', label: 'Razao Social', type: 'text', required: true },
      { name: 'nomeFantasia', label: 'Nome Fantasia', type: 'text', required: true },
      { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
    ],
  },
  {
    key: 'contatos',
    label: 'Contatos',
    singularLabel: 'Contato',
    routeBase: '/contatos',
    apiBasePath: '/contatos',
    idField: 'idContato',
    allowDelete: false,
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: true },
      { name: 'idCliente', label: 'Cliente', type: 'select', valueType: 'number', required: false },
      { name: 'idDistribuidor', label: 'Distribuidor', type: 'select', valueType: 'number', required: false },
    ],
  },
  {
    key: 'distribuidores',
    label: 'Distribuidores',
    singularLabel: 'Distribuidor',
    routeBase: '/distribuidores',
    apiBasePath: '/distribuidor',
    idField: 'idDistribuidor',
    allowDelete: true,
    fields: [
      { name: 'razaoSocial', label: 'Razao Social', type: 'text', required: true },
      { name: 'nomeFantasia', label: 'Nome Fantasia', type: 'text', required: true },
      { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
    ],
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    singularLabel: 'Usuario',
    routeBase: '/usuarios',
    apiBasePath: '/usuario',
    idField: 'idUsuario',
    allowDelete: true,
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'senha', label: 'Senha', type: 'password', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text', required: true },
    ],
  },
]

export const entityMap = entities.reduce((acc, entity) => {
  acc[entity.key] = entity
  return acc
}, {})
