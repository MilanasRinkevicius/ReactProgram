import React from "react";
import { Transaction } from "../types/transaction";

type Props = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map(tx => (
            <li key={tx.id} className="border p-3 rounded shadow-sm">
              <strong>{tx.description}</strong> - ${tx.amount.toFixed(2)} paid by {tx.payerName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}