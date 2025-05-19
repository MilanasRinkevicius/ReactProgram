export interface Group {
  id: number;
  title: string;
  balance: number;
}

export interface CreateGroupDto {
  title: string;
  userId: number;
}

export {}