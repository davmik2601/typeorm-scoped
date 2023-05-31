import {SelectQueryBuilder} from 'typeorm';
import {TableMetadataArgs} from 'typeorm/metadata-args/TableMetadataArgs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ScopeObjectKeys<T> {
  [key: string]: ScopeQB<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ScopeQB<T> = (
  qb: SelectQueryBuilder<T>,
  alias: string,
) => SelectQueryBuilder<T>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ScopeObject<T> {
  scopeFunc: ScopeQB<T>;
  enabled: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ScopesObjectData<T> {
  [key: string]: ScopeObject<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ScopedTableMetadata<T> extends TableMetadataArgs {
  scopes: ScopesObjectData<T>;
  defaultScopes: ScopesObjectData<T>;
}
