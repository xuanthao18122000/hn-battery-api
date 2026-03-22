import { ObjectLiteral } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { pickBy } from 'lodash';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';

//Declaration Merging Of Module.
declare module 'typeorm/query-builder/SelectQueryBuilder' {
  interface SelectQueryBuilder<
    Entity,
    TQuery extends Partial<PaginatedResponseDto<Entity>> = Partial<
      PaginatedResponseDto<Entity>
    >,
  > {
    count: number;
    query: TQuery;
    entityName: string;
    fCreateFilterBuilder(alias: string, query?: TQuery): this;
    fGetParam(): string;
    fLeftJoinAndSelect<EntityRelation = Entity>(
      property: string,
      alias: string,
      selectFields?: (keyof EntityRelation)[],
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    fInnerJoinAndSelect<EntityRelation = Entity>(
      property: string,
      alias: string,
      selectFields?: (keyof EntityRelation)[],
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    fAddSelect<EntityRelation = Entity>(
      alias: string,
      selectFields: (keyof EntityRelation)[],
    ): this;

    fAndWhere<EntityRelation = Entity, ValueType = string>(
      name: keyof EntityRelation,
      cValue?: ValueType,
      entityName?: string,
    ): this;

    fAndWhereNot<EntityRelation = Entity, ValueType = string>(
      name: keyof EntityRelation,
      cValue?: ValueType,
      entityName?: string,
    ): this;
    fAndWhereIn<EntityRelation = Entity, ValueType = string>(
      name: keyof EntityRelation,
      array: ValueType[],
      entityName?: string,
    ): this;

    fAndWhereNotIn<EntityRelation = Entity, ValueType = string>(
      name: keyof EntityRelation,
      array: ValueType[],
      entityName?: string,
    ): this;
    fAndWhereLikeString<EntityRelation = Entity>(
      name: keyof EntityRelation,
      valueString?: string,
      entityName?: string,
    ): this;

    fAndWhereDate<EntityRelation = Entity, ValueType = number>(
      columnName: keyof EntityRelation,
      startValue?: ValueType,
      endValue?: ValueType,
      entityName?: string,
    ): this;

    fAndWhereGt<EntityRelation = Entity, ValueType = number>(
      columnName: keyof EntityRelation,
      startValue?: ValueType,
      entityName?: string,
    ): this;
    fAndWhereLt<EntityRelation = Entity, ValueType = number>(
      columnName: keyof EntityRelation,
      endValue?: ValueType,
      entityName?: string,
    ): this;
    fAndWhereGte<EntityRelation = Entity, ValueType = number>(
      columnName: keyof EntityRelation,
      startValue?: ValueType,
      entityName?: string,
    ): this;
    fAndWhereLte<EntityRelation = Entity, ValueType = number>(
      columnName: keyof EntityRelation,
      startValue?: ValueType,
      entityName?: string,
    ): this;

    fAddPagination(page?: number, limit?: number, getFull?: boolean): this;
    fOrderBy<EntityRelation = Entity>(
      name: keyof EntityRelation,
      order?: 'DESC' | 'ASC',
      entityName?: string,
    ): this;

    fAddOrderBy<EntityRelation = Entity>(
      name: keyof EntityRelation,
      order?: 'DESC' | 'ASC',
      entityName?: string,
    ): this;
    fAndWhereJsonb<EntityRelation = Entity, ValueType = string>(
      name: keyof EntityRelation,
      propertyJsonName: string,
      cValue: ValueType,
      entityName?: string,
    ): this;

    fAndWhereUnAccentStringJsonb<EntityRelation = Entity>(
      name: keyof EntityRelation,
      propertyJsonName: string,
      valueString: string,
      entityName?: string,
    ): this;

    fAndWhereDateJsonb<EntityRelation = Entity, ValueType = number>(
      name: keyof EntityRelation,
      propertyJsonName: string,
      startValue: ValueType,
      endValue: ValueType,
      entityName?: string,
    ): this;

    fAndWhereNull<EntityRelation = Entity>(
      name: keyof EntityRelation,
      cValue: boolean,
      entityName?: string,
    ): this;

    fWhereOrLikeString<EntityRelation = Entity>(
      columns: Partial<Record<keyof EntityRelation, boolean>>,
      searchString: string,
      entityName?: string,
    ): this;
  }
}
SelectQueryBuilder.prototype.fCreateFilterBuilder = function <
  TQuery extends Record<string, unknown>,
>(alias: string, query?: TQuery) {
  this.entityName = alias;
  this.count = 0;
  this.query = query || ({} as TQuery);
  return this;
};
SelectQueryBuilder.prototype.fLeftJoinAndSelect = function (
  property,
  alias,
  selectFields = [],
  condition,
  parameters,
) {
  this.leftJoin(property, alias, condition, parameters);
  this.fAddSelect(alias, selectFields);
  return this;
};

SelectQueryBuilder.prototype.fAddSelect = function (alias, selectFields = []) {
  const selection = selectFields?.length
    ? selectFields.map((field) => `${alias}.${field as string}`)
    : [alias];
  this.addSelect(selection);
  return this;
};
SelectQueryBuilder.prototype.fGetParam = function () {
  return '_' + String(this.count++);
};

SelectQueryBuilder.prototype.fAndWhere = function <
  EntityRelation,
  ValueType = string,
>(name: keyof EntityRelation, cValue?: ValueType, entityName?: string) {
  const propertyName = String(name);
  const paramsName = this.fGetParam();

  const value =
    arguments.length === 1 && this.query
      ? ((this.query as Record<string, unknown>)[propertyName] as ValueType)
      : cValue;

  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (value !== null && value !== undefined) {
    this.andWhere(`${conditionColumn} = :${paramsName}`, {
      [paramsName]: value,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereNot = function <
  EntityRelation,
  ValueType = string,
>(name: keyof EntityRelation, cValue?: ValueType, entityName?: string) {
  const propertyName = String(name);
  const paramsName = this.fGetParam();
  const value =
    arguments.length === 1 && this.query
      ? ((this.query as Record<string, unknown>)[propertyName] as ValueType)
      : cValue;
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (value) {
    this.andWhere(`${conditionColumn} !=  :${paramsName}`, {
      [paramsName]: value,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereIn = function <
  EntityRelation,
  ValueType = string,
>(name: keyof EntityRelation, array?: ValueType[], entityName?: string) {
  const propertyName = String(name);
  const paramsName = this.fGetParam();
  const value =
    arguments.length === 1 && this.query
      ? ((this.query as Record<string, unknown>)[propertyName] as ValueType[])
      : array;
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (array && array.length > 0) {
    this.andWhere(`${conditionColumn} IN (:...${paramsName})`, {
      [paramsName]: value,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereNotIn = function <
  EntityRelation,
  ValueType = string,
>(name: keyof EntityRelation, array: ValueType[], entityName?: string) {
  const propertyName = String(name);
  const paramsName = this.fGetParam();
  const value =
    arguments.length === 1 && this.query
      ? ((this.query as Record<string, unknown>)[propertyName] as ValueType[])
      : array;
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (array && array.length > 0) {
    this.andWhere(`${conditionColumn} NOT IN (:...${paramsName})`, {
      [paramsName]: value,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereLikeString = function <EntityRelation>(
  name: keyof EntityRelation,
  valueString?: string,
  entityName?: string,
) {
  const propertyName = String(name);
  const paramsName = this.fGetParam();
  const value =
    arguments.length === 1 && this.query
      ? ((this.query as Record<string, unknown>)[propertyName] as string)
      : valueString;
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (value) {
    this.andWhere(`${conditionColumn} LIKE :${paramsName}`, {
      [paramsName]: `%${value}%`,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereDate = function <
  EntityRelation,
  ValueType = number,
>(
  columnName: keyof EntityRelation,
  startValue?: ValueType,
  endValue?: ValueType,
  entityName?: string,
) {
  const propertyName = String(columnName);
  const start = startValue;
  const end = endValue;
  const paramStart = this.fGetParam();
  const paramEnd = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (start) {
    this.andWhere(`${conditionColumn} >= :${paramStart}`, {
      [paramStart]: start,
    });
  }
  if (end) {
    this.andWhere(`${conditionColumn} <= :${paramEnd}`, {
      [paramEnd]: end,
    });
  }

  return this;
};

SelectQueryBuilder.prototype.fAndWhereGt = function <
  EntityRelation,
  ValueType = number,
>(
  columnName: keyof EntityRelation,
  startValue?: ValueType,
  entityName?: string,
) {
  const propertyName = String(columnName);
  const start = startValue;
  const paramStart = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (start) {
    this.andWhere(`${conditionColumn} > :${paramStart}`, {
      [paramStart]: start,
    });
  }
  return this;
};
SelectQueryBuilder.prototype.fAndWhereLt = function <
  EntityRelation,
  ValueType = number,
>(columnName: keyof EntityRelation, endValue?: ValueType, entityName?: string) {
  const propertyName = String(columnName);
  const end = endValue;
  const paramEnd = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (end) {
    this.andWhere(`${conditionColumn} < :${paramEnd}`, {
      [paramEnd]: end,
    });
  }
  return this;
};
SelectQueryBuilder.prototype.fAndWhereGte = function <
  EntityRelation,
  ValueType = number,
>(
  columnName: keyof EntityRelation,
  startValue?: ValueType,
  entityName?: string,
) {
  const propertyName = String(columnName);
  const start = startValue;
  const paramStart = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (start) {
    this.andWhere(`${conditionColumn} >= :${paramStart}`, {
      [paramStart]: start,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereLte = function <
  EntityRelation,
  ValueType = number,
>(columnName: keyof EntityRelation, endValue?: ValueType, entityName?: string) {
  const propertyName = String(columnName);
  const end = endValue;
  const paramEnd = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (end) {
    this.andWhere(`${conditionColumn} <= :${paramEnd}`, {
      [paramEnd]: end,
    });
  }
  return this;
};

SelectQueryBuilder.prototype.fAddPagination = function (
  page = 1,
  limit?: number,
  getFull?: boolean,
) {
  const typedQuery = this.query as Record<string, unknown>;
  const take = limit || (typedQuery?.limit as number) || 10;
  const offset = (page - 1 || (typedQuery?.page as number) - 1 || 0) * take;
  const isdPagination = getFull || (typedQuery?.getFull as boolean) || false;

  if (!isdPagination) {
    this.skip(offset).take(take);
  }
  return this;
};
SelectQueryBuilder.prototype.fOrderBy = function <EntityRelation>(
  name: keyof EntityRelation,
  order?: 'DESC' | 'ASC',
  entityName?: string,
) {
  const propertyName = String(name);
  const typedQuery = this.query as Record<string, unknown>;
  const orderValue = order || (typedQuery?.order as 'DESC' | 'ASC') || 'DESC';
  const sortBy = typedQuery?.sortBy as string;

  if (sortBy) {
    this.orderBy(`${entityName || this.entityName}.${sortBy}`, orderValue);
  } else {
    this.orderBy(
      `${entityName || this.entityName}.${propertyName}`,
      orderValue,
    );
  }
  return this;
};
SelectQueryBuilder.prototype.fAddOrderBy = function <EntityRelation>(
  name: keyof EntityRelation,
  order?: 'DESC' | 'ASC',
  entityName?: string,
) {
  const propertyName = String(name);
  const typedQuery = this.query as Record<string, unknown>;
  const orderValue = order || (typedQuery?.order as 'DESC' | 'ASC') || 'DESC';

  this.addOrderBy(
    `${entityName || this.entityName}.${propertyName}`,
    orderValue,
  );
  return this;
};
//filter in jsonb
SelectQueryBuilder.prototype.fAndWhereJsonb = function (
  name,
  propertyJsonName,
  cValue,
  entityName,
) {
  const propertyName = String(name);
  const paramsName = this.fGetParam();
  const value = cValue;
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (value) {
    this.andWhere(
      `${conditionColumn} ->> '${propertyJsonName}' =  :${paramsName}`,
      {
        [paramsName]: value,
      },
    );
  }
  return this;
};

SelectQueryBuilder.prototype.fAndWhereUnAccentStringJsonb = function (
  name,
  propertyJsonName,
  valueString,
  entityName,
) {
  const propertyName = String(name);
  const value = valueString;
  const paramsName = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (value) {
    this.andWhere(
      `unaccent(LOWER(${conditionColumn} ->> '${propertyJsonName}' )) ILIKE unaccent(LOWER(:${paramsName}))`,
      {
        [`${paramsName}`]: `%${value}%`,
      },
    );
  }
  return this;
};
SelectQueryBuilder.prototype.fAndWhereDateJsonb = function (
  name,
  propertyJsonName,
  startValue,
  endValue,
  entityName,
) {
  const propertyName = String(name);
  const start = startValue;
  const end = endValue;
  const paramStart = this.fGetParam();
  const paramEnd = this.fGetParam();
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;

  if (start) {
    this.andWhere(
      `${conditionColumn} ->> '${propertyJsonName}' >= :${paramStart}`,
      {
        [paramStart]: start,
      },
    );
  }
  if (end) {
    this.andWhere(
      `${conditionColumn} ->> '${propertyJsonName}' <= :${paramEnd}`,
      {
        [paramEnd]: end,
      },
    );
  }

  return this;
};

SelectQueryBuilder.prototype.fAndWhereNull = function (
  name,
  cValue,
  entityName,
) {
  const propertyName = String(name);
  const conditionColumn = `${entityName || this.entityName}.${propertyName}`;
  const value = cValue;
  if (value !== undefined) {
    this.andWhere(`${conditionColumn} ${value ? 'IS NULL' : 'IS NOT NULL'}`);
  }
  return this;
};

SelectQueryBuilder.prototype.fWhereOrLikeString = function (
  column,
  searchString,
  entityName,
) {
  const columns = Object.keys(pickBy(column));
  if (!Array.isArray(columns) || columns.length === 0 || !searchString) {
    return this;
  }

  const orConditions = columns.map((column) => {
    const paramName = this.fGetParam();
    const conditionColumn = `${entityName || this.entityName}.${String(column)}`;
    this.setParameter(paramName, `%${searchString}%`);
    return `${conditionColumn} LIKE :${paramName}`;
  });
  if (orConditions.length > 0) {
    this.andWhere(`(${orConditions.join(' OR ')})`);
  }

  return this;
};
