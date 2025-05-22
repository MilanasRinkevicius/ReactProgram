export type DivisionType = 'equal' | 'percentage' | 'shares';

export interface Participant {
  memberId: number;
  share: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  payerId: number;
  PayerName: string;
  groupId: number;
  divisionType: DivisionType;
  participants: Participant[];
}