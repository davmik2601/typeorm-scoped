import {BaseEntity, getMetadataArgsStorage} from 'typeorm';
import {ScopedTableMetadata} from "./scope-types";

export class ScopeEntity extends BaseEntity {
  static scoped<T extends typeof BaseEntity>(this: T, ...scopes: string[]): T {
    scopes = [...new Set(scopes)];
    const table = getMetadataArgsStorage().tables.find(
      (table) => table.target === this.target,
    ) as ScopedTableMetadata<T> | undefined;
    if (table?.scopes) {
      for (const scopeName of scopes) {
        if (table.scopes[scopeName]) {
          table.scopes[scopeName].enabled = true;
        }
      }
    }
    return this;
  }

  static unscoped<T extends typeof BaseEntity>(
    this: T,
    ...defaultScopes: string[]
  ): T {
    const table = getMetadataArgsStorage().tables.find(
      (table) => table.target === this.target,
    ) as ScopedTableMetadata<T>;
    if (table.defaultScopes) {
      for (const key in table.defaultScopes) {
        if (!defaultScopes.length) {
          if (table.defaultScopes[key]) {
            table.defaultScopes[key].enabled = false;
          }
        } else {
          const scopeSet = new Set(defaultScopes);
          // if the key is in the scopeSet, set enabled to false
          if (scopeSet.has(key)) {
            if (table.defaultScopes[key]) {
              table.defaultScopes[key].enabled = false;
            }
          }
        }
      }
    }
    return this;
  }
}
