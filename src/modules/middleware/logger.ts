import { MiddlewareFn } from "type-graphql";

import { MyContext } from "../../types/MyContext";

export const logger: MiddlewareFn<MyContext> = async (stuff, next) => {
    console.log(`
    #####################################
    ############## STUFF ################
    #####################################

    ${Object.keys(stuff.info)}

    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    `);

    return next();
};