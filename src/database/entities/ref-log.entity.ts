import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('ref_logs')
export class RefLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'referrer_uuid', type: 'varchar', length: 36 })
  referrerUuid: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'referrer_uuid' })
  referrer: Player;

  @Column({ name: 'referred_uuid', type: 'varchar', length: 36 })
  referredUuid: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'referred_uuid' })
  referred: Player;

  @Column({ name: 'ref_code', type: 'varchar', length: 6 })
  refCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

