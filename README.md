# Korp Front-End (CRUD Automatico)

Frontend React + Vite integrado ao backend Spring Boot do projeto korp-comissions-back.

## Stack

- React 19 + Vite
- JavaScript (arquitetura orientada a configuracao)
- Axios para consumo da API
- React Router DOM para rotas dinamicas
- CSS custom (sem framework) com foco em visual limpo, responsivo e escalavel

## Entidades mapeadas (com endpoint REST no backend)

- Clientes: /cliente
- Contatos: /contatos
- Distribuidores: /distribuidor
- Usuarios: /usuario

Observacao: Pedido, Produto e ItemPedido existem como entidades/DTOs no backend, mas ainda nao possuem controllers REST expostos no projeto atual.

## Rotas geradas automaticamente

- /clientes, /clientes/new, /clientes/edit/:id
- /contatos, /contatos/new, /contatos/edit/:id
- /distribuidores, /distribuidores/new, /distribuidores/edit/:id
- /usuarios, /usuarios/new, /usuarios/edit/:id

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Configure a URL da API (opcional):

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

3. Execute o projeto:

```bash
npm run dev
```

4. Build de producao:

```bash
npm run build
```

## Estrutura principal

- src/config/entities.js: metadados das entidades e campos
- src/services/api.js: configuracao global do Axios e tratamento padrao de erro
- src/services/*Service.js: service por entidade
- src/components/crud: tabela, formulario dinamico e banners de status
- src/pages: listagem e formulario genericos
- src/routes/AppRoutes.jsx: definicao de rotas dinamicas

## Como adicionar uma nova entidade

1. Criar service da entidade em src/services.
2. Registrar no mapa src/services/entityServices.js.
3. Adicionar metadados em src/config/entities.js:
	- routeBase
	- apiBasePath
	- idField
	- fields

Com isso, o menu lateral, rotas, tabela e formulario sao gerados automaticamente.
