import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('mine_to_earn')
export class MineToEarn {
  @PrimaryColumn({ name: 'player_uuid', type: 'varchar', length: 36 })
  playerUuid: string;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'player_uuid' })
  player: Player;

  @Column({ name: 'upgrade_speed', type: 'integer', default: 0 })
  upgradeSpeed: number;

  @Column({ name: 'upgrade_inventory', type: 'integer', default: 0 })
  upgradeInventory: number;

  @Column({ name: 'upgrade_reset_cooldown', type: 'integer', default: 0 })
  upgradeResetCooldown: number;

  @Column({ name: 'upgrade_passive_income', type: 'integer', default: 0 })
  upgradePassiveIncome: number;

  @Column({ name: 'upgrade_mining_area', type: 'integer', default: 0 })
  upgradeMiningArea: number;
}

