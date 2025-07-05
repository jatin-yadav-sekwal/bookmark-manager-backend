import {jwt} from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

export const jwtPlugin = jwt({
    name:"jwt",
    secret:Bun.env.JWT_SECRET!,
    exp:"1d"
});

export const cookiePlugin = cookie();