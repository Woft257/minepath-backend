import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('transaction_logs')
export class TransactionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_uuid', type: 'varchar', length: 36 })
  playerUuid: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_uuid' })
  player: Player;

  @Column({ name: 'transaction_type', type: 'varchar', length: 50 })
  transactionType: string;

  @Column({ type: 'varchar', length: 50 })
  method: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ name: 'sol_amount', type: 'decimal', precision: 20, scale: 9, nullable: true })
  solAmount: number;

  @Column({ name: 'transaction_hash', type: 'varchar', length: 255, nullable: true })
  transactionHash: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ name: 'source_player_uuid', type: 'varchar', length: 36, nullable: true })
  sourcePlayerUuid: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'source_player_uuid' })
  sourcePlayer: Player;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

