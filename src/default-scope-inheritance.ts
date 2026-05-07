import { getMetadataArgsStorage } from 'typeorm';
import {
  ScopedTableMetadata,
  ScopeObject,
  ScopesObjectData,
} from './scope-types';

const INHERITED_DEFAULT_SCOPES_RESOLVED = Symbol(
  'typeorm-scoped:inherited-default-scopes-resolved',
);

type ScopedTableMetadataAny = ScopedTableMetadata<any> & {
  [INHERITED_DEFAULT_SCOPES_RESOLVED]?: boolean;
};

function cloneScope<T>(scope: ScopeObject<T>): ScopeObject<T> {
  return {
    scopeFunc: scope.scopeFunc,
    enabled: scope.enabled,
    context: scope.context,
  };
}

export function resolveDefaultScopesInheritance<T>(
  table: ScopedTableMetadata<T> | undefined,
): ScopesObjectData<T> | undefined {
  if (!table) {
    return undefined;
  }

  const mutableTable = table as ScopedTableMetadataAny;

  if (mutableTable[INHERITED_DEFAULT_SCOPES_RESOLVED]) {
    return mutableTable.defaultScopes;
  }

  const mergedScopes: ScopesObjectData<T> = {};
  const target = mutableTable.target;

  if (typeof target === 'function') {
    const inheritedTables: ScopedTableMetadataAny[] = [];
    let currentPrototype = Object.getPrototypeOf(target);

    while (currentPrototype && currentPrototype !== Function.prototype) {
      const inheritedTable = getMetadataArgsStorage().tables.find(
        (tableArg) => tableArg.target === currentPrototype,
      ) as ScopedTableMetadataAny | undefined;

      if (inheritedTable) {
        inheritedTables.unshift(inheritedTable);
      }

      currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    for (const inheritedTable of inheritedTables) {
      if (!inheritedTable.defaultScopes) {
        continue;
      }

      for (const [scopeName, scope] of Object.entries(
        inheritedTable.defaultScopes,
      )) {
        mergedScopes[scopeName] = cloneScope(scope as ScopeObject<T>);
      }
    }
  }

  if (mutableTable.defaultScopes) {
    for (const [scopeName, scope] of Object.entries(
      mutableTable.defaultScopes,
    )) {
      mergedScopes[scopeName] = cloneScope(scope as ScopeObject<T>);
    }
  }

  mutableTable.defaultScopes =
    Object.keys(mergedScopes).length > 0 ? mergedScopes : undefined;
  mutableTable[INHERITED_DEFAULT_SCOPES_RESOLVED] = true;

  return mutableTable.defaultScopes;
}
