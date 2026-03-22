import { QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';

declare module 'typeorm' {
  interface Repository<Entity> {
    fCreateFilterBuilder<TQuery>(
      alias?: string,
      query?: TQuery,
      queryRunner?: QueryRunner,
    ): SelectQueryBuilder<Entity>;
  }
}

Repository.prototype.fCreateFilterBuilder = function (
  alias = 'entity',
  query,
  queryRunner,
) {
  return this.createQueryBuilder(alias, queryRunner).fCreateFilterBuilder(
    alias,
    query as Record<string, unknown>,
  );
};
