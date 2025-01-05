import 'typeorm';

declare module 'typeorm' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface SelectQueryBuilder<Entity> {
    ___scope_getQuery_copy___: () => string;
  }
}
