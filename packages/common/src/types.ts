import {z} from "zod";

export const signupSchema = z.object({
    email:z.string().min(3).max(30),
    password:z.string(),
    name:z.string()

});

export const siginSchema= z.object({
    email:z.string().min(3).max(30),
    password:z.string()
})


export const createRoomSchema=z.object({
     name:z.string().min(3).max(30)
})