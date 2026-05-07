import { ObjectLiteral, Repository } from 'typeorm';
import { resolveDefaultScopesInheritance } from './default-scope-inheritance';
import { ScopedTableMetadata } from './scope-types';

export class ScopeRepository<T extends ObjectLiteral> extends Repository<T> {
  scoped(scope: string, context?: Record<string, any>) {
    // scopes = [...new Set(scopes)];
    const metadata = this.metadata.tableMetadataArgs as
      | ScopedTableMetadata<T>
      | undefined;
    if (metadata && metadata.scopes) {
      // for (const scopeName of scopes) {
      //   if (metadata.scopes[scopeName]) {
      //     metadata.scopes[scopeName].enabled = true;
      //   }
      // }
      if (metadata.scopes[scope]) {
        metadata.scopes[scope].enabled = true;
        metadata.scopes[scope].context = context;
      }
    }
    return this;
  }

  unscoped(...defaultScopes: string[]) {
    const metadata = this.metadata.tableMetadataArgs as
      | ScopedTableMetadata<T>
      | undefined;
    const resolvedDefaultScopes = resolveDefaultScopesInheritance(metadata);
    if (resolvedDefaultScopes) {
      for (const key in resolvedDefaultScopes) {
        if (!defaultScopes.length) {
          if (resolvedDefaultScopes[key]) {
            resolvedDefaultScopes[key].enabled = false;
          }
        } else {
          const scopeSet = new Set(defaultScopes);
          // if the key is in the scopeSet, set enabled to false
          if (scopeSet.has(key)) {
            if (resolvedDefaultScopes[key]) {
              resolvedDefaultScopes[key].enabled = false;
            }
          }
        }
      }
    }
    return this;
  }
}
