export function ensureSeedData() {
  const hasAccounts = localStorage.getItem("gc_accounts");
  const hasTransactions = localStorage.getItem("gc_transactions");

  if (hasAccounts && hasTransactions) return;

  const accounts = [
    { id: "acc1", name: "Carteira", type: "carteira", initialBalance: 120 },
    { id: "acc2", name: "Banco", type: "banco", initialBalance: 2500 },
    { id: "acc3", name: "Cartão", type: "cartao", initialBalance: 0 },
  ];

  const transactions = [
    {
      id: "t1",
      date: "2026-02-20",
      description: "Salário",
      amount: 5000,
      kind: "income", // income | expense
      category: "Renda",
      accountId: "acc2",
    },
    {
      id: "t2",
      date: "2026-02-21",
      description: "Mercado",
      amount: 230.45,
      kind: "expense",
      category: "Alimentação",
      accountId: "acc2",
    },
    {
      id: "t3",
      date: "2026-02-22",
      description: "Café",
      amount: 12.5,
      kind: "expense",
      category: "Alimentação",
      accountId: "acc1",
    },
    {
      id: "t4",
      date: "2026-02-23",
      description: "Uber",
      amount: 34.9,
      kind: "expense",
      category: "Transporte",
      accountId: "acc1",
    },
  ];

  localStorage.setItem("gc_accounts", JSON.stringify(accounts));
  localStorage.setItem("gc_transactions", JSON.stringify(transactions));
}