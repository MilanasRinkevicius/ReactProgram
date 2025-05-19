import { useEffect, useState } from "react";
import { getGroupById } from "../api/groupsApi";
import { getTransactionsByGroupId } from "../api/transactionsApi";
import { Group } from "../types/group";
import { Transaction } from "../types/transaction";

export function useGroupDetails(groupId: number | undefined) {
  const [group, setGroup] = useState<Group | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    Promise.all([
      getGroupById(groupId),
      getTransactionsByGroupId(groupId),
    ])
      .then(([groupRes, txRes]) => {
        setGroup(groupRes.data);
        setTransactions(txRes.data);
      })
      .catch((error) => {
        console.error("Failed to fetch group details:", error);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  return {
    group,
    transactions,
    loading,
    setTransactions, // optional: useful to update UI after adding a new transaction
  };
}