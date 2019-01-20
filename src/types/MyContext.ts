import { Request } from "express";

// here we discribe what our MyContext type 'looks like'. 
// i.e. it has a request ('req') property, that is of 
// the type 'Request'. 
export interface MyContext {
    req: Request;
}