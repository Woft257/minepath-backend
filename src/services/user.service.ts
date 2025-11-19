import { query, queryOne } from '../config/database';
import { UserStats } from '../types';

export class UserService {
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<UserStats[]> {
    return query<UserStats>(
      `SELECT 
        uuid,
        username,
        mine_balance,
        sol_balance,
        total_ref_reward,
        total_referred,
        last_login,
        role
       FROM players
       ORDER BY last_login DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  }

  async getUserById(uuid: string) {
    return queryOne(
      `SELECT 
        uuid,
        username,
        mine_balance,
        sol_balance,
        total_ref_reward,
        total_referred,
        all_referred,
        last_login,
        role,
        commission_rate,
        ref_code,
        referred_by
       FROM players
       WHERE uuid = $1`,
      [uuid]
    );
  }

  async getUserTransactions(uuid: string, limit: number = 50) {
    return query(
      `SELECT 
        id,
        transaction_type,
        method,
        amount,
        sol_amount,
        transaction_hash,
        status,
        created_at
       FROM transaction_logs
       WHERE player_uuid = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [uuid, limit]
    );
  }

  async getUserReferrals(uuid: string) {
    return query(
      `SELECT 
        p.uuid,
        p.username,
        p.mine_balance,
        p.last_login,
        rl.created_at as referred_at
       FROM ref_logs rl
       JOIN players p ON rl.referred_uuid = p.uuid
       WHERE rl.referrer_uuid = $1
       ORDER BY rl.created_at DESC`,
      [uuid]
    );
  }

  async searchUsers(searchTerm: string, limit: number = 20) {
    return query(
      `SELECT 
        uuid,
        username,
        mine_balance,
        sol_balance,
        role,
        last_login
       FROM players
       WHERE username ILIKE $1 OR uuid::text ILIKE $1
       ORDER BY last_login DESC NULLS LAST
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
  }

  async getUserStats() {
    return queryOne(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'USER' THEN 1 END) as regular_users,
        COUNT(CASE WHEN role = 'KOL' THEN 1 END) as kols,
        COUNT(CASE WHEN role = 'BD' THEN 1 END) as bd_members,
        SUM(mine_balance) as total_mine_balance,
        SUM(sol_balance::numeric) as total_sol_balance
       FROM players`
    );
  }

  async getActiveUsers(days: number = 7) {
    return query(
      `SELECT 
        uuid,
        username,
        last_login,
        mine_balance
       FROM players
       WHERE last_login >= NOW() - INTERVAL '${days} days'
       ORDER BY last_login DESC`
    );
  }
}

