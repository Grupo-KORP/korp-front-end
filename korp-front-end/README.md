# KORP – TND Brasil

Interface de autenticação para o sistema KORP da TND Brasil.

## Telas implementadas

| Rota        | Descrição                     |
|-------------|-------------------------------|
| `/login`    | Login do vendedor             |
| `/cadastro` | Cadastro de novo colaborador  |

## Como rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL real do backend

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Build para produção

```bash
npm run build
npm run preview   # prévia local do build
```

## Estrutura de pastas

```
src/
├── components/
│   ├── forms/
│   │   ├── LoginForm.jsx       # Formulário de login
│   │   └── CadastroForm.jsx    # Formulário de cadastro
│   └── ui/
│       ├── InputField.jsx      # Input reutilizável com validação
│       ├── Button.jsx          # Botão com variantes e loading
│       └── Alert.jsx           # Alerta de erro/sucesso
├── hooks/
│   ├── useAuth.js              # Hook de autenticação
│   └── useForm.js              # Hook genérico de formulários
├── layouts/
│   └── AuthLayout.jsx          # Layout split-screen compartilhado
├── pages/
│   ├── LoginPage.jsx           # Página /login
│   └── CadastroPage.jsx        # Página /cadastro
├── routes/
│   └── AppRoutes.jsx           # Configuração de rotas
├── services/
│   └── api.js                  # Camada de integração com backend (+ mocks)
├── App.jsx
├── main.jsx
└── index.css
```

## Integração com Backend

Todas as chamadas de API estão centralizadas em `src/services/api.js`.
Cada função tem um comentário `// TODO:` indicando onde substituir o mock pela chamada real.

### Configurar URL base

No arquivo `.env`:
```
VITE_API_URL=https://api.tnd.com.br/v1
```

