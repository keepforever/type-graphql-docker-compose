import 'reflect-metadata';
import 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, formatArgumentValidationError } from 'type-graphql';
import Express from 'express';
import { createConnection } from 'typeorm';
import session from 'express-session';
// per the docs, we need to pass a function to create the RedisStore
// we will name import connectRedis to signify that function
import connectRedis from 'connect-redis';
// instantiated in a seperate file in the src dir
import { redis } from './redis';
import cors from 'cors';
// Resolvers
import { RegisterResolver } from './modules/user/Register';
import { LoginResolver } from './modules/user/Login';
import { MeResolver } from './modules/user/Me';
import { ConfirmUserResolver } from './modules/user/ConfirmUser';


// instanciate server within a main function so we can use async/await
const main = async () => {
    // createConnection will read from ormconfig.json to make the connection to the database.
    // await createConnection();

    // FOR DOCKER
    // There is a delay between when server starts and postgres
    // container is ready to recieve connections.  
    let retries = 10;
    while (retries) {
        try{
            console.log("before createConnection");
            await createConnection();
            console.log('after createConnection')
            break;
        } catch(err) {
            console.log(err)
            retries -= 1
            console.log(`${retries} retries remaining...`)
            // wait 5 seconds before retrying connection to 
            // postgres
            await new Promise(res => {
                console.log(`
                    test env var 
                    ${process.env.DB_HOST!}
                `);
                setTimeout(res, 5000)
            })
        }
    }
    // ApolloServer constructor requires a schema or type definitions.
    // that's where graphql comes in..
    const schema = await buildSchema({
        resolvers: [
            RegisterResolver, 
            LoginResolver, 
            MeResolver, 
            ConfirmUserResolver
        ],
        authChecker: ({ context: { req } }) => {
            // here you can read user from context
            // and check permission against roles argument
            // that was specified in the @Authorized(['ADMIN']) decorator

            // check request object to see if has a userId on it
            // use '!!' to cast req.session.userId to boolean, which
            // evaluates to 'true' if extant. 
            // if (!!req.session.userId) {
            //     return true;
            // } else {
            //     // typescript would yell if you didn't include the 'else'
            //     // block because 'not all paths return a value', in other
            //     // words, 
            //     return false
            // }
            
            // more concise if check 
             return !!req.session.userId
        },
    });

    const apolloServer = new ApolloServer({
        schema,
        formatError: formatArgumentValidationError,
        // we can pass in a function to the 'context' key.
        // this creates our context which we can access in the resolver
        // for accessing session data
        context: ({ req }: any) => ({ req }),
    });

    // instantiate application
    const app = Express();

    // connnect Redis
    const RedisStore = connectRedis(session);

    // session middleware must be instantiated prior to passing it to
    // applyMiddleware({...})
    app.use(
        cors({
            credentials: true,
            // 'origin' set to host that we expect our frontend to be at
            origin: 'http://localhost:3000',
        }),
    );

    // we want the session to be applied before we hit the resolvers.
    app.use(
        session({
            store: new RedisStore({
                client: redis as any, // 'as any' for typescript
            }),
            // name for our cookie
            name: 'qid',
            // this should be an enviornment variable, hard coded here for
            // simplicity.
            // secret: 'aslkdfjoiq12312',
            secret: process.env.INDEX_SECRET!,
            // 'resave', 'saveUninitialized' set to false so that we don't constantly create a new session for a user unless we change something
            resave: false,
            saveUninitialized: false,
            // cookie config
            cookie: {
                httpOnly: true,
                // this will evaluate to 'true' ONLY in production
                secure: process.env.NODE_ENV === 'production',
                // 7 years
                maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
            },
        }),
    );
    // now that we have the session middleware added we are going to be
    // able to access the request object

    // pass application to apolloServer via the
    // applyMiddleware function.
    console.log('before applyMiddlware');
    apolloServer.applyMiddleware({ app });
    console.log('after applyMiddlware')
    // set server port to listen on.
    app.listen(4000, () => {
        console.log(`
        **************************************

            Server Started on http://localhost:4000/graphql
        
        **************************************
        `);
    });
};

main();
