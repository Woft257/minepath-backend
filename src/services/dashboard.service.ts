import { query, queryOne } from '../config/database';
import { DashboardStats } from '../types';

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    // Get total claim fee (sum of all SOL transactions with method CLAIM)
    const claimFeeResult = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(sol_amount), 0) as total 
       FROM transaction_logs 
       WHERE method = 'CLAIM' AND status = 'SUCCESS'`
    );

    // Get total users
    const totalUsersResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM players'
    );

    // Get total transactions
    const totalTransactionsResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM transaction_logs WHERE status = $1',
      ['SUCCESS']
    );

    // Get total referrals
    const totalReferralsResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM ref_logs'
    );

    return {
      totalUsers: parseInt(totalUsersResult?.count || '0'),
      totalClaimFee: claimFeeResult?.total || '0',
      totalTransactions: parseInt(totalTransactionsResult?.count || '0'),
      totalReferrals: parseInt(totalReferralsResult?.count || '0'),
    };
  }

  async getRecentTransactions(limit: number = 10) {
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
       ORDER BY tl.created_at DESC
       LIMIT $1`,
      [limit]
    );
  }

  async getTransactionsByDateRange(startDate: string, endDate: string) {
    return query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN method = 'CLAIM' THEN sol_amount ELSE 0 END) as total_claim_fee
       FROM transaction_logs
       WHERE created_at BETWEEN $1 AND $2
       AND status = 'SUCCESS'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );
  }

  async getUserGrowth(days: number = 30) {
    return query(
      `SELECT 
        DATE(last_login) as date,
        COUNT(*) as new_users
       FROM players
       WHERE last_login >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(last_login)
       ORDER BY date DESC`
    );
  }
}

