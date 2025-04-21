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
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'position',
            type: 'int',
            default: 0,
          },
          {
            name: 'boardId',
            type: 'uuid',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_Board',
            referencedTableName: 'boards',
            referencedColumnNames: ['id'],
            columnNames: ['boardId'],
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
        name: 'listId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['listId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lists',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tasks', 'FK_List');
    await queryRunner.dropColumn('tasks', 'listId');
    await queryRunner.dropTable('lists', true, true);
    await queryRunner.dropForeignKey('lists', 'FK_Board');
  }
}
