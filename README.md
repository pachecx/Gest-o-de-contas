# Gestão de Contas (React + Tailwind)

Aplicação front-end para **gestão de contas pessoais** (contas e transações), construída com **React** e **Tailwind CSS**.  
O projeto foi feito com foco em **relembrar conceitos**, **aprender boas práticas** e evoluir o app passo a passo.

> ✅ **Sem TypeScript** (para facilitar o entendimento).  
> ✅ **Persistência local** usando `localStorage` (mock de banco de dados).  
> ✅ **Autenticação simulada** (cadastro/login apenas no front).

---

## ✨ Funcionalidades

### Autenticação (mock)
- Cadastro de usuário
- Login e logout
- Rotas protegidas (usuário precisa estar logado)

### Contas
- Listagem de contas com saldo atual
- Criar conta
- Editar conta
- Excluir conta (bloqueado se houver transações vinculadas)

### Transações
- Dashboard com visão geral + criação de transações
- Tela de transações com:
  - filtros (busca, tipo, conta, mês)
  - edição
  - exclusão
- Cálculo de saldo por conta:
  - `saldoAtual = saldoInicial + entradas - saídas`

### Dados por usuário
Os dados são separados por usuário no `localStorage`:
- `gc_users` → lista de usuários cadastrados
- `gc_user` → usuário logado (sessão)
- `gc_accounts:<email>` → contas do usuário
- `gc_transactions:<email>` → transações do usuário

---

## 🧱 Tecnologias
- React (Vite)
- Tailwind CSS
- React Router DOM
- localStorage (persistência)

---

## ▶️ Como rodar localmente

### 1) Clonar e instalar
```bash
git clone <URL_DO_REPOSITORIO>
cd gestao-contas
npm install
