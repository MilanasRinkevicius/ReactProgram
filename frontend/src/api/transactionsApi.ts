import axios from "axios";
import { DivisionType, Transaction } from "../types/transaction";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Create a new transaction
export const createTransaction = (
  groupId: number,
  data: {
    payerId: number;
    amount: number;
    divisionType: DivisionType;
    participants: {memberId: number; share: number} [];
  }
) => {
  return api.post(`/groups/${groupId}/transactions`, data);
}
// Get all transactions for a group
export const getTransactionsByGroupId = (id: number) =>
  api.get<Transaction[]>(`/groups/${id}/transactions/by-group`);

export const GetTransactions = (id: number) =>
  api.get<Transaction[]>(`/groups/${id}/transactions`);