import {SelectQueryBuilder} from 'typeorm';
import {GET_QUERY_COPY, SelectQB} from './select-qb';

export const patchSelectQueryBuilder = (): void => {
  if (SelectQueryBuilder.prototype[GET_QUERY_COPY]) {
    return;
  }
  SelectQueryBuilder.prototype[GET_QUERY_COPY] =
    SelectQueryBuilder.prototype.getQuery;
  for (const property of Object.getOwnPropertyNames(SelectQB.prototype)) {
    Object.defineProperty(
      SelectQueryBuilder.prototype,
      property,
      Object.getOwnPropertyDescriptor(
        SelectQB.prototype,
        property,
      ) as PropertyDescriptor,
    );
  }
};
