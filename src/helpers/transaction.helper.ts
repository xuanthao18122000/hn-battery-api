import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionHelper {
  constructor(private readonly dataSource: DataSource) {}

  async executeTransaction<TransactionOutput>(
    executeFunction: (manager: EntityManager) => Promise<TransactionOutput>,
  ): Promise<TransactionOutput> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await executeFunction(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
