import { MiddlewareFn } from "type-graphql";

import { MyContext } from "../../types/MyContext";

// the first argument to this function has access to info and root along
// with the context. 
export const isAuth: MiddlewareFn<MyContext> = async ({ context, info, root }, next) => {
    console.log('info', '\n', info, '\n', '\n', 'root', '\n', root);
    
    // in order to use 'context' in this function, we must first import 
    // MyContext, then pass the type into the typescript (i.e. 
    // MiddlewareFn<MyContext> ) as seen above. 
    if (!context.req.session!.userId) {
        // Using thie middlware auth strategy, we must throw our own error
        throw new Error("not authenticated");
    }
    // next calls the resolver. 
    return next();
};