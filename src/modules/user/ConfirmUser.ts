import { Resolver, Mutation, Arg } from "type-graphql";

import { redis } from "../../redis";
import { User } from "../../entity/User";

@Resolver()
export class ConfirmUserResolver {
    // here, we expect this resolver to return true or false, 
    // depending on if it worked.  Might want to consider a 
    // String if you wanted to give an error message. \
    @Mutation(() => Boolean)
    async confirmUser(@Arg("token") token: string): Promise<boolean> {
        // check if the token exists in redis.  If the token 
        // does exist, redis.get() will return the userId was 
        // saved under that key(token) value(userId) pair. 
        const userId = await redis.get(token);

        // if the token doesn't exist or has expired, the
        // resolver will return false back to the client. 
        // In this case, it is planned for our client to be a 
        // React application that will have send the confirmUser() mutation after the user clicked the link in the email
        // nodemailer sent them. 
        if (!userId) {
            return false;
        }

        // if the token exists, we will updated the 
        // corisponding User (via userId), and set confirmed 
        // property to true, parseInt() converts a string into
        // a number.  A number is required because typeof id
        // in entity/User.ts is 'number'.
        await User.update({ id: parseInt(userId, 10) }, { confirmed: true });
        // we delete the redis token
        await redis.del(token);
        
        // confirmation process complete, return true to client
        // so that it can notify the user accordingly. 
        return true;
    }
}