# typeorm-scoped

## Description

✅ This lib supports Scopes and for both `Active Record pattern` (working with Entitiies), and `Data Mapper pattern` (working with Repositories).

It's very easy to use this lib. 
You can define scopes and default scopes for entities.

## Installation

```shell
yarn add typeorm-scoped
# or
npm install typeorm-scoped --save
```

## Initialization (Global Setup for Project)

Before usage you need to patch TypeORM before calling any database method.

```typescript
import { patchSelectQueryBuilder } from 'typeorm-scope'
...
patchSelectQueryBuilder()  // <-- call this function
...
const app = new Koa() // or const app = express() ...
```

In `NestJS` you can call this function in `main.ts`, in `bootstrap()` function before creating app.

```typescript
import { patchSelectQueryBuilder } from 'typeorm-scoped'
...
async function bootstrap() {
  patchSelectQueryBuilder() // <-- call
  ...
  const app = await NestFactory.create(AppModule, {...})
  ...
```

## Default Scopes

you can define a default scope(scopes) for an entity adding the `@DefaultScopes({ ... })` decorator before the `@Entity()`.

```typescript
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm"
import {Scopes, DefaultScopes} from "typeorm-scoped"

@DefaultScopes<User>({
  existed: (qb, alias) => qb.andWhere(`${alias}.deletedAt IS NULL`),
  ...
})
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({nullable: true})
  deletedAt?: Date
}
```

### Querying

`DefaultScopes` will work automatically and there shouldn't be any changes in your services or repositories. You can use the `EntityManager` or any `Repository` or `CustomRepository` and the `default scopes` will automatically be added to the resulting query. It will also work with queries created using the `QueryBuilder`. For example, the following snippet

```typescript
User.find({ where: { name: "John" } })

// or

userRepository.find({ where: { name: "John" } })

// or with createQueryBuilder() ...
```

will produce an SQL query like

```sql
SELECT "User"."id" AS "User_id", "User"."name" AS "User_name" 
FROM "user" "User" 
WHERE "User"."name" = ? AND "User"."deletedAt" IS NULL
-- PARAMETERS: ["John"]
```

## Custom Scopes

To define a scope(scopes) for an entity you need to add the `@Scopes({ ... })` decorator before the `@Entity()`.

```typescript
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm"
import {Scopes, DefaultScopes} from "typeorm-scoped"
import {ScopeEntity} from "./scope.entity";

@Scopes<User>({
  females: (qb, alias) => qb.andWhere(`${alias}.gender = :g`, {g: "Female"}),
  adultUsers: (qb, alias) => qb.andWhere(`${alias}.age > :adultAge`, {adultAge: 17}),
  ...
})
// You can also use @Scopes(...) and @DefaultScopes(...) together !
@Entity()
export class User extends ScopeEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  age: number

  @Column()
  gender: string // or GenderEnum -> "Male", "Female", ...

  @Column({ nullable: true })
  deletedAt?: Date
}
```

### Data Mapper (Repository) Pattern

If you use `Data Mapper(Repository)` pattern, then for custom scopes you should use Custom Repositories, which should be `extends` from `ScopeRepository`:

#### Typeorm version 2.x
```typescript
@EntityRepository(User)
export class UserRepository extends ScopeRepository<User> { // <-- our ScopeRepository already extends from Repository<Entity>
  ...
}
```

#### Typeorm version 3.x
```typescript
// @Injectable()  // <-- If you use NestJS
export class UserRepository extends ScopeRepository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
}
```

#### For NestJS
__*Important!*__*** &nbsp;&nbsp In NestJS you will add `@Injectable()` on your custom repository `UserRepository`.
And then add it in your `UserModule` (if typeorm v2.x -> add into TypeOrmModule.forFeature function, if typeorm v3.x, add into providers).
After that use it in services:

```typescript
constructor(
  ...
  private readonly userRepository: UserRepository
) {}
```


### Active Record Pattern

If you use `Active Record` pattern, you need to extend from `ScopeEntity`:

```typescript
@Scopes<User>({ 
  ...
})
@Entity()
export class User extends ScopeEntity { // <-- our ScopeEntity already extends from BaseEntity
  ...
}
```

### Querying

You will use custom scopes like this:

```typescript
userRepository.scoped("females", "adultUsers").find({ where: { name: "John" } })

// or

User.scoped("females", "adultUsers").find({ where: { name: "John" } })

// or with createQueryBuilder() ...
```

will produce an SQL query like

```sql
SELECT "User"."id" AS "User_id", "User"."name" AS "User_name", "User"."age" AS "User_age", "User"."gender" AS "User_gender" 
FROM "user" "User" 
WHERE "User"."gender" = ? AND "User"."age" > ? AND "User"."name" = ?
-- PARAMETERS: ["Female", 17, "John"]
```


## Disabling Default Scopes

You are able to disable `default scopes` by calling a method `unscoped`.

```typescript
// if you dont send parametrs to unscoped method, it unscoped all default scopes  !!!
userRepository.unscoped().find({ where: { name: "John" } })

// or unscope only specific default scopes
userRepository.unscoped("existed").find({ where: { name: "John" } })

// or

User.unscoped().find({ where: { name: "John" } })
...

// or with createQueryBuilder() ...
...
```

You can also continue with scoped() method, like this:

```typescript
userRepository.unscoped("existed").scoped("females").find({ where: { name: "John" } })
```

---

