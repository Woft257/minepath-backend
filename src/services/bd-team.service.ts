import { query, queryOne } from '../config/database';
import { BDTeamMember } from '../types';

export class BDTeamService {
  async getAllBDMembers(): Promise<BDTeamMember[]> {
    return query<BDTeamMember>(
      `SELECT 
        p.uuid,
        p.username,
        COUNT(DISTINCT kol.uuid) as managed_kols,
        COALESCE(SUM(kol.total_sol_share), 0) as total_sol_earned
       FROM players p
       LEFT JOIN players kol ON kol.managed_by_uuid = p.uuid AND kol.role = 'KOL'
       WHERE p.role = 'BD'
       GROUP BY p.uuid, p.username
       ORDER BY total_sol_earned DESC`
    );
  }

  async getBDMemberById(uuid: string) {
    return queryOne(
      `SELECT 
        p.uuid,
        p.username,
        p.role,
        COUNT(DISTINCT kol.uuid) as managed_kols,
        COALESCE(SUM(kol.total_sol_share), 0) as total_sol_earned,
        COALESCE(SUM(kol.total_payout), 0) as total_paid_out
       FROM players p
       LEFT JOIN players kol ON kol.managed_by_uuid = p.uuid AND kol.role = 'KOL'
       WHERE p.uuid = $1 AND p.role = 'BD'
       GROUP BY p.uuid, p.username, p.role`,
      [uuid]
    );
  }

  async getManagedKOLs(bdUuid: string) {
    return query(
      `SELECT 
        uuid,
        username,
        total_referred,
        all_referred,
        total_sol_share,
        total_payout,
        commission_rate,
        sol_fee_share,
        last_login
       FROM players
       WHERE managed_by_uuid = $1 AND role = 'KOL'
       ORDER BY total_sol_share DESC`,
      [bdUuid]
    );
  }

  async getBDPerformance(bdUuid: string, startDate?: string, endDate?: string) {
    let sql = `
      SELECT 
        DATE(tl.created_at) as date,
        COUNT(DISTINCT tl.player_uuid) as active_kols,
        SUM(CASE WHEN tl.method = 'SOL_FEE_SHARE' THEN tl.sol_amount ELSE 0 END) as total_sol_earned
      FROM transaction_logs tl
      JOIN players kol ON tl.player_uuid = kol.uuid
      WHERE kol.managed_by_uuid = $1
      AND kol.role = 'KOL'
      AND tl.status = 'SUCCESS'
    `;
    
    const params: any[] = [bdUuid];
    
    if (startDate && endDate) {
      sql += ` AND tl.created_at BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }
    
    sql += ` GROUP BY DATE(tl.created_at) ORDER BY date DESC`;
    
    return query(sql, params);
  }
}

