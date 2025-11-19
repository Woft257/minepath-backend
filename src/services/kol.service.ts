import { query, queryOne } from '../config/database';
import { KOL } from '../types';

export class KOLService {
  async getAllKOLs(): Promise<KOL[]> {
    return query<KOL>(
      `SELECT 
        uuid,
        username,
        total_referred,
        all_referred,
        total_ref_reward,
        total_sol_share,
        total_payout,
        commission_rate,
        sol_fee_share,
        last_login
       FROM players
       WHERE role = 'KOL'
       ORDER BY total_sol_share DESC`
    );
  }

  async getKOLById(uuid: string): Promise<KOL | null> {
    return queryOne<KOL>(
      `SELECT 
        uuid,
        username,
        total_referred,
        all_referred,
        total_ref_reward,
        total_sol_share,
        total_payout,
        commission_rate,
        sol_fee_share,
        last_login
       FROM players
       WHERE uuid = $1 AND role = 'KOL'`,
      [uuid]
    );
  }

  async getKOLReferrals(kolUuid: string) {
    return query(
      `SELECT 
        p.uuid,
        p.username,
        p.mine_balance,
        p.sol_balance,
        p.last_login,
        rl.created_at as referred_at
       FROM ref_logs rl
       JOIN players p ON rl.referred_uuid = p.uuid
       WHERE rl.referrer_uuid = $1
       ORDER BY rl.created_at DESC`,
      [kolUuid]
    );
  }

  async getKOLEarnings(kolUuid: string, startDate?: string, endDate?: string) {
    let sql = `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN method = 'REFERRAL_REWARD' THEN amount ELSE 0 END) as mine_earned,
        SUM(CASE WHEN method = 'SOL_FEE_SHARE' THEN sol_amount ELSE 0 END) as sol_earned
      FROM transaction_logs
      WHERE player_uuid = $1
      AND status = 'SUCCESS'
    `;
    
    const params: any[] = [kolUuid];
    
    if (startDate && endDate) {
      sql += ` AND created_at BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }
    
    sql += ` GROUP BY DATE(created_at) ORDER BY date DESC`;
    
    return query(sql, params);
  }

  async getKOLOverview() {
    return queryOne(
      `SELECT 
        COUNT(*) as total_kols,
        SUM(total_referred) as total_direct_referrals,
        SUM(all_referred) as total_all_referrals,
        SUM(total_sol_share) as total_sol_earned,
        SUM(total_payout) as total_paid_out
       FROM players
       WHERE role = 'KOL'`
    );
  }

  async getTopKOLs(limit: number = 10) {
    return query(
      `SELECT 
        uuid,
        username,
        total_referred,
        all_referred,
        total_sol_share,
        commission_rate,
        sol_fee_share
       FROM players
       WHERE role = 'KOL'
       ORDER BY total_sol_share DESC
       LIMIT $1`,
      [limit]
    );
  }
}

