export class CommissionHistoryDto {
  id: number;
  amount: string; // NUMERIC(38, 18) - use string to preserve precision
  asset: string;
  method: string;
  txHash: string;
  paidBy: string;
  note: string;
  status: string;
  createdAt: Date;
}

export class CommissionHistoryResponseDto {
  data: CommissionHistoryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

