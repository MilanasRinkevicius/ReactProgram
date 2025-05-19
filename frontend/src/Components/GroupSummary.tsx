import React from "react";
import { Group } from "../types/group";
import { Transaction } from "../types/transaction";

type Props = {
  group: Group;
  transactions: Transaction[];
};

export default function GroupSummary({ group, transactions }: Props) {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="mb-6">
      <p><strong>Total Spent:</strong> ${total.toFixed(2)}</p>
      <p><strong>Your Balance:</strong> {group.balance >= 0 
        ? <span className="text-green-600">You are owed ${group.balance}</span>
        : <span className="text-red-600">You owe ${-group.balance}</span>}</p>
    </div>
  );
}
export {}