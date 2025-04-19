import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPassword1745082731051 implements MigrationInterface {
  name = 'UserPassword1745082731051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }
}
