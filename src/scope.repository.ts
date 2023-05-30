import {ObjectLiteral, Repository} from "typeorm";
import {ScopedTableMetadata} from "./scope-types";

export abstract class ScopeRepository<T extends ObjectLiteral> extends Repository<T> {
  scoped(...scopes: string[]) {
    scopes = [...new Set(scopes)];
    const metadata = this.metadata.tableMetadataArgs as
      | ScopedTableMetadata<T>
      | undefined;
    if (metadata?.scopes) {
      for (const scopeName of scopes) {
        if (metadata.scopes[scopeName]) {
          metadata.scopes[scopeName].enabled = true;
        }
      }
    }
    return this;
  }

  unscoped(...defaultScopes: string[]) {
    const metadata = this.metadata.tableMetadataArgs as
      | ScopedTableMetadata<T>
      | undefined;
    if (metadata?.defaultScopes) {
      for (const key in metadata.defaultScopes) {
        if (!defaultScopes.length) {
          if (metadata.defaultScopes[key]) {
            metadata.defaultScopes[key].enabled = false;
          }
        } else {
          const scopeSet = new Set(defaultScopes);
          // if the key is in the scopeSet, set enabled to false
          if (scopeSet.has(key)) {
            if (metadata.defaultScopes[key]) {
              metadata.defaultScopes[key].enabled = false;
            }
          }
        }
      }
    }
    return this;
  }
}
