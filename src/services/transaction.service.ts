import { query, queryOne } from '../config/database';
import { TransactionLog } from '../types';

export class TransactionService {
  async getAllTransactions(limit: number = 100, offset: number = 0): Promise<TransactionLog[]> {
    return query<TransactionLog>(
      `SELECT 
        tl.id,
        tl.player_uuid,
        p.username,
        tl.transaction_type,
        tl.method,
        tl.amount,
        tl.sol_amount,
        tl.transaction_hash,
        tl.status,
        tl.source_player_uuid,
        tl.created_at
       FROM transaction_logs tl
       LEFT JOIN players p ON tl.player_uuid = p.uuid
       ORDER BY tl.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  }

  async getTransactionById(id: number) {
    return queryOne(
      `SELECT 
        tl.id,
        tl.player_uuid,
        p.username,
        tl.transaction_type,
        tl.method,
        tl.amount,
        tl.sol_amount,
        tl.transaction_hash,
        tl.status,
        tl.source_player_uuid,
        sp.username as source_username,
        tl.created_at
       FROM transaction_logs tl
       LEFT JOIN players p ON tl.player_uuid = p.uuid
       LEFT JOIN players sp ON tl.source_player_uuid = sp.uuid
       WHERE tl.id = $1`,
      [id]
    );
  }

  async getTransactionsByMethod(method: string, limit: number = 100) {
    return query(
      `SELECT 
        tl.id,
        tl.player_uuid,
        p.username,
        tl.transaction_type,
        tl.method,
        tl.amount,
        tl.sol_amount,
        tl.transaction_hash,
        tl.status,
        tl.created_at
       FROM transaction_logs tl
       LEFT JOIN players p ON tl.player_uuid = p.uuid
       WHERE tl.method = $1
       ORDER BY tl.created_at DESC
       LIMIT $2`,
      [method, limit]
    );
  }

  async getTransactionStats() {
    return queryOne(
      `SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COUNT(CASE WHEN method = 'CLAIM' THEN 1 END) as total_claims,
        COALESCE(SUM(CASE WHEN method = 'CLAIM' AND status = 'SUCCESS' THEN sol_amount ELSE 0 END), 0) as total_claim_fees,
        COUNT(CASE WHEN method = 'REFERRAL_REWARD' THEN 1 END) as total_referral_rewards,
        COALESCE(SUM(CASE WHEN method = 'REFERRAL_REWARD' THEN amount ELSE 0 END), 0) as total_referral_amount
       FROM transaction_logs`
    );
  }

  async getTransactionsByDateRange(startDate: string, endDate: string) {
    return query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN method = 'CLAIM' THEN 1 END) as claims,
        COUNT(CASE WHEN method = 'MINING' THEN 1 END) as mining,
        COUNT(CASE WHEN method = 'REFERRAL_REWARD' THEN 1 END) as referrals,
        COALESCE(SUM(CASE WHEN method = 'CLAIM' THEN sol_amount ELSE 0 END), 0) as total_claim_fees
       FROM transaction_logs
       WHERE created_at BETWEEN $1 AND $2
       AND status = 'SUCCESS'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );
  }

  async getRecentClaims(limit: number = 20) {
    return query(
      `SELECT 
        tl.id,
        tl.player_uuid,
        p.username,
        tl.amount as mine_amount,
        tl.sol_amount,
        tl.transaction_hash,
        tl.status,
        tl.created_at
       FROM transaction_logs tl
       LEFT JOIN players p ON tl.player_uuid = p.uuid
       WHERE tl.method = 'CLAIM'
       ORDER BY tl.created_at DESC
       LIMIT $1`,
      [limit]
    );
  }
}

