import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { resolveDefaultScopesInheritance } from './default-scope-inheritance';
import { ScopedTableMetadata } from './scope-types';

export const GET_QUERY_COPY = '___scope_getQuery_copy___';

export class SelectQB<T extends ObjectLiteral> extends SelectQueryBuilder<T> {
  getQuery(): string {
    this.___patchScopes___();
    return this[GET_QUERY_COPY]();
  }

  protected ___patchScopes___(): void {
    for (const table of this.expressionMap.aliases) {
      if (!table || !table.hasMetadata) continue;
      const metadata = table.metadata
        .tableMetadataArgs as ScopedTableMetadata<T>;
      const defaultScopes = resolveDefaultScopesInheritance(metadata);

      // default scopes functional
      if (defaultScopes) {
        for (const defaultScopeObj of Object.values(defaultScopes)) {
          if (defaultScopeObj.enabled) {
            defaultScopeObj.scopeFunc(this, table.name);
          } else {
            defaultScopeObj.enabled = true;
          }
        }
      }

      // custom scopes functional
      if (metadata.scopes) {
        for (const scopeObj of Object.values(metadata.scopes)) {
          if (scopeObj.enabled) {
            scopeObj.scopeFunc(this, table.name, scopeObj.context || {});
            scopeObj.enabled = false;
          }
        }
      }
    }
  }
}
