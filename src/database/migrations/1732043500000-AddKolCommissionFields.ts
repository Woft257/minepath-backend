import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class AddKolCommissionFields1732043500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add commission rate columns to players table
    await queryRunner.addColumn(
      'players',
      new TableColumn({
        name: 'sol_commission_rate',
        type: 'double precision',
        default: 0.0,
      }),
    );

    await queryRunner.addColumn(
      'players',
      new TableColumn({
        name: 'mine_commission_rate',
        type: 'double precision',
        default: 0.0,
      }),
    );

    // Create commission_logs table
    await queryRunner.createTable(
      new Table({
        name: 'commission_logs',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'kol_uuid',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'sol_amount',
            type: 'decimal',
            precision: 20,
            scale: 9,
          },
          {
            name: 'mine_amount',
            type: 'bigint',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'PAID'",
          },
          {
            name: 'transaction_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['kol_uuid'],
            referencedTableName: 'players',
            referencedColumnNames: ['uuid'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop commission_logs table
    await queryRunner.dropTable('commission_logs');

    // Remove commission rate columns from players table
    await queryRunner.dropColumn('players', 'mine_commission_rate');
    await queryRunner.dropColumn('players', 'sol_commission_rate');
  }
}

