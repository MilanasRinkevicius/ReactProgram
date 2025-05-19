import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const getMembersByGroupId = (id: number) =>
  axios.get(`${BASE_URL}/groups/${id}/members`);

export const addMemberToGroup = (id: number, name: string) =>
  axios.post(`${BASE_URL}/groups/${id}/members`, { name });

export const deleteMember = (id: number, memberId: number) =>
  axios.delete(`${BASE_URL}/groups/${id}/members/${memberId}`);