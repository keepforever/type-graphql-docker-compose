### project instanciated ~ Node v11.6.0-ish

## links to some dependency documentation

### For sending confirmation emails:
[NodeMailer](http://nodemailer.com/about/)

### Main library behind this server:
[Type-GraphQL Bootstrapping Guide](https://19majkel94.github.io/type-graphql/docs/bootstrap.html)


## Below are some notes I took as I coded along.

[Type-GraphQL Video 1](https://www.youtube.com/watch?v=8yZImm2A1KE)

1. Add initial dependencies:
```
yarn add apollo-server-express express graphql reflect-metadata type-graphql
```
2. Add Dev dependencies
```
yarn add -D @types/express @types/graphql @types/node nodemon ts-node typescript
```
 - `@types/<package_name>` is how we pull necessary typescript definitions for the libs we installed previously.

3. Add a typescript.config to tell typescript how to compile our code.

[Type-GraphQL Bootstrapping Guide](https://19majkel94.github.io/type-graphql/docs/bootstrap.html)

## My annotated Video 1 index.js

```javascript
import "reflect-metadata";
import {ApolloServer} from 'apollo-server-express';
import { buildSchema, Resolver, Query } from 'type-graphql';
import * as Express from 'express';

// @Resolver imported from type
@Resolver()
class HelloResolver {
    @Query(() => String, {
        // the "name" option passed in overrides the "hello" name we give the query below.  Could also
        // just replace "hello" after async below.
        name: 'helloWorld',
        // allow for null to be returned
        nullable: true,
        description:
            "A resolver that returns 'Hello World!'. This will show up in the schema documentation visible in GraphQL Playground.",
        // there are more options but the ones shown
        // are the most commonly used.
    })
    // hello will be overridden by "helloWorld" due to name option.
    async hello() {
        return 'Hello World!';
    }
}
// instanciate server within a main function so we can use async/await
const main = async () => {
    // ApolloServer constructor requires a schema or type definitions.
    // that's where graphql comes in..
    const schema = await buildSchema({
        resolvers: [HelloResolver],
    });
    const apolloServer = new ApolloServer({schema})

    // instantiate application
    const app = Express()
    // pass application to apolloServer via the
    // applyMiddleware function.
    apolloServer.applyMiddleware({app})
    // set server port to listen on.
    app.listen(4000, () => {
        console.log(`
        **************************************

            Server Started on http://localhost:4000/graphql

        **************************************
        `);
    })

}

main()
```
## In Order to start persisting data, we need a database.
## We will use postgreSQL via TypeORM.

TypeORM plays nicely with typescript because they both use decorators and have type definitions.

## Add additional dependencies

```sh
yarn add bcryptjs typeorm pg
```  
Note, pg is postgresql

## Also need types for bcryptjs
```
yarn add -D @types/bcryptjs
```

## Add an `ormconfig.json`
 - this file defines how you connect to your database
### Notes:
 - port 5432 is postgres' default port
 - you need to create 'typegraphql-example' database. If you have postgres installed on your local machine, the following command should do it:
```
createdb 'typegraphql-example'
```
 - "entities" key tells database. we use "src/entity/\*.\*" to tell it to use all the files it finds in the "entity" folder, not just .js or .ts.
 - "synchronize" add different tables to our database


`ormconfig.json`:
```json
{
    "name": "default",
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "postgres",
    "database": "typegraphql-example",
    "synchronize": true,
    "logging": true,
    "entities": ["src/entity/*.*"]
}
```

`ormconfig.json` will get consumed by createConnection() in the main() function of index.ts.

```javascript

const main = async () => {
  import { createConnection } from 'typeorm'  
  ...
  // createConnection will read from ormconfig.json to make the connection to the database.
  await createConnection()
  ...
}
```

## Create a User entity

pulling in User boilerplate from typeorm documentation

```javascript
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    password: boolean;

    @Column("text", {unique: true})
    email: boolean;

}
```
Note, when we 'extend BaseEntity' it allows us to use the `.find()` and `.create()` methods on `User`.

```javascript
User.find()
// and
User.create()
```
# Resolver File Location
We manage our resolver files as follows:
```sh
.
├── entity
│   └── User.ts
├── index.ts
└── modules
    └── user
        └── Register.ts
```
Here, the User entity's resolvers live in the modules/user folder and are labeled according to functionality.

# Login

 - Using express sessions to keep user logged in with a cookie.
 - Using Redis to store sessions.
 - Using 'ioredis' lib as redis client
 - Using "cors" lib so we don't have problems with cookies.

### install dependencies
```sh
yarn add express-session connect-redis ioredis cors
```
### install types for these new dependencies
```sh
yarn add -D @types/express-session @types/connect-redis @types/ioredis @types/cors
```

### session is considered a 'middleware'

# Gotcha (graphql playground settings)
### Make sure to set: "request.credentials": "include" or you will not see your cookie show up in the chrome devtools application/Storage/Cookies/
