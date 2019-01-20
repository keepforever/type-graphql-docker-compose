import { v4 } from "uuid";
import { redis } from "../../redis";

export const createConfirmationUrl = async (userId: number) => {
    // use uuid to create a unique token (typeof: string)
    const token = v4();
    // use unique token to ack as a Key in the {token: userId} Key/Value pair saved to redis. args 3 and 4 serve as another key/value pair {"ex": seconds_until_expiration}, which tells redis when to delete this item from it's database. thus if a user waits too long to confirm their email, it won't work, and a new email should be triggered. (perhaps, that too is triggered by the client upon login failure due to failing the 'confirmed' true/false User check)
    await redis.set(token, userId, "ex", 60 * 60 * 24); // 1 day expiration

    // all this function does is compose a url and append the token to the end of it, and returns that in a string to be used to build the <a></a> tag for the body of the email. 
    return `http://localhost:3000/user/confirm/${token}`;
}; 