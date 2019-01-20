import { Length, IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";
import { IsEmailAlreadyExist } from "./isEmailAlreadyExist";

@InputType()
export class RegisterInput {
    @Field()
    @Length(1, 255, {message: "my custom error message for graphql to return in the event this validation constraint is not satisfied"})
    firstName: string;

    @Field()
    @Length(1, 255)
    lastName: string;

    @Field()
    @IsEmail()
    @IsEmailAlreadyExist({ message: "email already in use" }) // this custom decorator necessitates the isEmailAlreadyExiist.ts file adjacent to this file
    email: string;

    @Field()
    password: string;
}