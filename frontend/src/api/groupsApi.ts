import { Group, CreateGroupDto } from "../types/group";
import axios from "axios";
import { Transaction } from "../types/transaction";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

export const fetchGroups = (id: number) => 
  api.get<Group[]>(`/groups/${id}`);

export const createGroup = (data: CreateGroupDto) =>
  api.post<Group>("/groups", data);

export const getGroupById = (id: number) => api.get<Group>(`/groups/${id}`);

export const getTransactionsByGroupId = (id: number) =>
  api.get<Transaction[]>(`/groups/${id}/transactions`);

export const getAllGroups = () => api.get<Group[]>("/groups");

