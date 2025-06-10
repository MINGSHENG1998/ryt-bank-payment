export interface Recipient {
  id: string;
  name: string;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  recipient: Recipient;
  amount: number;
  note?: string;
  date: string;
  status?: string;
}

export interface Account {
  balance: number;
}