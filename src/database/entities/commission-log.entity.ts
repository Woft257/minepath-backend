import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('commission_logs')
export class CommissionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'kol_uuid', type: 'varchar', length: 36, nullable: true })
  kolUuid: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'kol_uuid', referencedColumnName: 'uuid' })
  kol: Player;

  @Column({ type: 'decimal', precision: 38, scale: 18 })
  amount: number;

  @Column({ type: 'varchar', length: 16, default: 'SOL' })
  asset: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  method: string;

  @Column({ name: 'tx_hash', type: 'varchar', length: 255, nullable: true })
  txHash: string;

  @Column({ name: 'paid_by', type: 'varchar', length: 36, nullable: true })
  paidBy: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'varchar', length: 20, default: 'SUCCESS' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

