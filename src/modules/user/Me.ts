import { Resolver, Query, Ctx } from "type-graphql";

import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";

// resolver to fetch User data based on cookie attached to client's request
@Resolver()
export class MeResolver {
    @Query(() => User, { nullable: true })
    // we expect a User or undefined to be returned.  Graphql should cast undefined to null, 
    // which is what we want to return, but because ctx.req.session.userId could IN THEORY be 
    // undefined, we must catch that potentiality in the 'or' block of the Promise type and
    // throughout the function, where we would  normally return 'null' we return undefined 
    // because the resolver must either return a User or 'undefined'.
    async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
        if (!ctx.req.session!.userId) {
            return undefined;
        }

        return User.findOne(ctx.req.session!.userId);
    }
}