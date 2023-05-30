import "typeorm"

declare module "typeorm" {
	export interface SelectQueryBuilder<Entity> {
		___scope_getQuery_copy___: () => string
	}
}
