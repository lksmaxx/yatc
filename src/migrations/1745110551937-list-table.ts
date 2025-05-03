import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class ListTable1745110551937 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'position',
            type: 'int',
            default: 0,
          },
          {
            name: 'board_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_Board',
            referencedTableName: 'boards',
            referencedColumnNames: ['id'],
            columnNames: ['board_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
      true,
    );

    //create fk on takss table

    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'list_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['list_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lists',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tasks', 'FK_List');
    await queryRunner.dropColumn('tasks', 'list_id');
    await queryRunner.dropTable('lists', true, true);
    await queryRunner.dropForeignKey('lists', 'FK_Board');
  }
}
