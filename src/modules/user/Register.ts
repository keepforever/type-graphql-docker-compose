import { Resolver, Query, Mutation, Arg, Authorized, UseMiddleware } from "type-graphql";
import bcrypt from "bcryptjs";

import { User } from "../../entity/User";
import { RegisterInput } from "./register/RegisterInput";
import { isAuth } from "../middleware/isAuth";
import { logger } from "../middleware/logger";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmationUrl } from "../utils/createConfirmationUrl";


@Resolver()
export class RegisterResolver {
    // We could pass parameters to Authorized(["ADMIN", "MODERATOR"])
    // Could also be a number Authorized<number>([1, 7, 42])
    // Authorization determination will be made in the function passed
    // to authChecker property in buildSchema (called in index.ts)
    @Authorized()
    @Query(() => String)
    async hello() {
        return 'Hello World!';
    }

    // an alternative way to check if user is authenticted.
    // we pass in the isAuth method we created in the middleware folder. 
    @UseMiddleware(isAuth, logger)
    @Query(() => String)
    async goodbye() {
        return 'Goodbye Cruel World!';
    }

    @Mutation(() => User)
    async register(@Arg('data')
    {
        email,
        firstName,
        lastName,
        password,
    }: RegisterInput): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        }).save();

        // after creating the user in the database we send the
        // confirmation email which, once clicked, will trigger a 
        // mutation to toggle the 'confirmed' property of the User
        // to 'true'.
        await sendEmail(user.email,  await createConfirmationUrl(user.id));

        return user;   
    }
}