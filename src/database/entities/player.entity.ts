import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('players')
export class Player {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  uuid: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'fystack_wallet_id', type: 'varchar', length: 255, nullable: true })
  fystackWalletId: string;

  @Column({ name: 'solana_address', type: 'varchar', length: 255, nullable: true })
  solanaAddress: string;

  @Column({ name: 'mine_balance', type: 'bigint', default: 0 })
  mineBalance: number;

  @Column({ name: 'sol_balance', type: 'numeric', precision: 38, scale: 18, default: 0.0 })
  solBalance: number;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin: Date;

  @Column({ name: 'ref_code', type: 'varchar', length: 6, nullable: true })
  refCode: string;

  @Column({ name: 'referred_by', type: 'varchar', length: 36, nullable: true })
  referredBy: string;

  @Column({ name: 'total_ref_reward', type: 'bigint', default: 0 })
  totalRefReward: number;

  @Column({ name: 'total_referred', type: 'integer', default: 0 })
  totalReferred: number;

  @Column({ name: 'all_referred', type: 'integer', default: 0 })
  allReferred: number;

  @Column({ type: 'varchar', length: 10, default: 'USER' })
  role: string;

  @Column({ name: 'commission_rate', type: 'double precision', default: 0.3 })
  commissionRate: number;

  @Column({ name: 'sol_fee_share', type: 'double precision', default: 0.0 })
  solFeeShare: number;

  @Column({ name: 'total_sol_share', type: 'numeric', precision: 38, scale: 18, default: 0.0 })
  totalSolShare: number;

  @Column({ name: 'total_payout', type: 'numeric', precision: 38, scale: 18, default: 0.0 })
  totalPayout: number;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'managed_by_uuid' })
  managedBy: Player;
}

