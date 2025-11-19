export interface Player {
  uuid: string;
  username: string;
  password: string;
  fystack_wallet_id?: string;
  solana_address?: string;
  mine_balance: number;
  sol_balance: string;
  last_login?: Date;
  ref_code?: string;
  referred_by?: string;
  total_ref_reward: number;
  total_referred: number;
  all_referred: number;
  role: 'USER' | 'KOL' | 'BD';
  commission_rate: number;
  sol_fee_share: number;
  total_sol_share: string;
  total_payout: string;
  managed_by_uuid?: string;
}

export interface TransactionLog {
  id: number;
  player_uuid: string;
  transaction_type: 'IN' | 'OUT';
  method: 'MINING' | 'PASSIVE_INCOME' | 'REFERRAL_REWARD' | 'CLAIM' | 'SOL_FEE_SHARE';
  amount: number;
  sol_amount?: string;
  transaction_hash?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  source_player_uuid?: string;
  created_at: Date;
}

export interface RefLog {
  id: number;
  referrer_uuid: string;
  referred_uuid: string;
  ref_code: string;
  created_at: Date;
}

export interface MineToEarn {
  player_uuid: string;
  upgrade_speed: number;
  upgrade_inventory: number;
  upgrade_reset_cooldown: number;
  upgrade_passive_income: number;
  upgrade_mining_area: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalClaimFee: string;
  totalTransactions: number;
  totalReferrals: number;
}

export interface KOL {
  uuid: string;
  username: string;
  total_referred: number;
  all_referred: number;
  total_ref_reward: number;
  total_sol_share: string;
  total_payout: string;
  commission_rate: number;
  sol_fee_share: number;
}

export interface BDTeamMember {
  uuid: string;
  username: string;
  managed_kols: number;
  total_sol_earned: string;
}

export interface UserStats {
  uuid: string;
  username: string;
  mine_balance: number;
  sol_balance: string;
  total_ref_reward: number;
  total_referred: number;
  last_login?: Date;
}

