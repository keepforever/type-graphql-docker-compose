import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import bcrypt from 'bcryptjs';

import { User } from '../../entity/User';
import { MyContext } from '../../types/MyContext';

@Resolver()
export class LoginResolver {
    // nullable to 'true' because we want to return null if login credentials don't check out
    @Mutation(() => User, { nullable: true })
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        // pass in Ctx as an argument because we need to 
        // access it in resolver to create a cookie.
        @Ctx() ctx: MyContext,
    ): Promise<User | null> { // we retun null if user logs in incorreclty
        
        // check if user exists in database
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return null;
        }
        
        // compare password against database.
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return null;
        }

        // check to see if user has confirmed their email
        // a user cannot login if they're not confirmed. 
        if(!user.confirmed){
            // could potentially throw back an error saying something like
            // "User has not confirmed their emai"
            return null
        }

        // create a cookie. setting the 'userId' on the session to 
        // the id of the user found above. 
        // we add bang '!' after session to specify we assume 
        // session to always be defined. 
        ctx.req.session!.userId = user.id;

        return user;
    }
}
