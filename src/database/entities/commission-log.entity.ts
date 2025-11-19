import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('commission_logs')
export class CommissionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'kol_uuid', type: 'varchar', length: 36 })
  kolUuid: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'kol_uuid' })
  kol: Player;

  @Column({ name: 'sol_amount', type: 'decimal', precision: 20, scale: 9 })
  solAmount: number;

  @Column({ name: 'mine_amount', type: 'bigint' })
  mineAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'PAID' })
  status: string;

  @Column({ name: 'transaction_hash', type: 'varchar', length: 255, nullable: true })
  transactionHash: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

