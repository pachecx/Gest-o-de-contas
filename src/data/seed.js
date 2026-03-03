import { userKey } from "../utils/storage";

export function ensureSeedData(email) {
  const accountsKey = userKey("gc_accounts", email);
  const txKey = userKey("gc_transactions", email);

  // migra dados globais antigos (se existirem), só uma vez por usuário
  const oldAcc = localStorage.getItem("gc_accounts");
  const oldTx = localStorage.getItem("gc_transactions");

  if (!localStorage.getItem(accountsKey) && oldAcc) localStorage.setItem(accountsKey, oldAcc);
  if (!localStorage.getItem(txKey) && oldTx) localStorage.setItem(txKey, oldTx);

  const hasAcc = localStorage.getItem(accountsKey);
  const hasTx = localStorage.getItem(txKey);
  if (hasAcc && hasTx) return;

  const accounts = [
    { id: "acc1", name: "Carteira", type: "carteira", initialBalance: 120 },
    { id: "acc2", name: "Banco", type: "banco", initialBalance: 2500 },
  ];

  const transactions = [
    { id: "t1", date: "2026-02-20", description: "Salário", amount: 5000, kind: "income", category: "Renda", accountId: "acc2" },
    { id: "t2", date: "2026-02-21", description: "Mercado", amount: 230.45, kind: "expense", category: "Alimentação", accountId: "acc2" },
  ];

  localStorage.setItem(accountsKey, JSON.stringify(accounts));
  localStorage.setItem(txKey, JSON.stringify(transactions));
}