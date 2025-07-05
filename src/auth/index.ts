import { Elysia, t } from "elysia";
import { jwtPlugin, cookiePlugin } from "./plugin";
import { db } from "../db";
import { Users } from "../db/schema";
import { eq } from "drizzle-orm";
// const checkEmail = async ()=> {const a =await db.select().from(Users).where(eq(Users.email, "jatinyadav")).limit(1);
// console.log(a[0]?.email);
// }
// checkEmail();

export const auth = new Elysia({ prefix: "/user" });

auth.use(jwtPlugin);
auth.use(cookiePlugin);

auth.post(
  "/signup",
  async ({ body: { email, password }, jwt, cookie: { auth } }) => {
    const hashPassword = await Bun.password.hash(password);
    try {
      //check if email is already registered
      const checkEmail = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email))
        .limit(1);
        if(checkEmail.length>0) return{
            message:"email already registerd"
        }

        //if not registerd then register
        const register = await db.insert(Users).values({
            email: email,
            password: hashPassword
        });
        const token = await jwt.sign({email});
        if(auth){
        auth.value = token;
        auth.httpOnly = true;
        auth.maxAge = 86400;
        auth.path = "/user";
        }

        return {
            message:"yay you have signed up"
        };
        
    } catch (error) {
      console.log(error);
      return {
        message: "error occured while signup",
      };
    }
  },
  {
    body: t.Object({
      password: t.String({
        //password with alphanumeric  and min length of 8 chars
        minLength: 8,
        pattern: "^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$",
      }),
      email: t.String({
        //email should contain @ with correct domain
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      }),
    }),
  }
);

auth.post(
  "/login",
  async ({ body: { email, password }, jwt, cookie: { auth } }) => {
    const hashPassword = await Bun.password.hash(password);
    try {

        //check if email is not  registered & verify credentials
        const passwordFromServer = await  db
        .select()
        .from(Users)
        .where(eq(Users.email, email))
        .limit(1);
        //verfy the password
        const serverPassword = passwordFromServer[0]?.password;
        if (!serverPassword) {
          return {
            message: "Error in password fetching"
          };
        }
        const checkPassword = await Bun.password.verify(password, serverPassword);
        if (!checkPassword) {
          return {
            message: "Invalid credentials"
          };
        }
        const token = await jwt.sign({email});
        if(auth){
        auth.value = token;
        auth.httpOnly = true;
        auth.maxAge = 86400;
        auth.path = "/user";
        }

        return {
            message:"successful login"
        };
        
    } catch (error) {
      console.log(error);
      return {
        message: "error occured while signup",
      };
    }
  },
  {
    body: t.Object({
      password: t.String({
        //password with alphanumeric  and min length of 8 chars
        minLength: 8,
        pattern: "^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$",
      }),
      email: t.String({
        //email should contain @ with correct domain
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      }),
    }),
  }
);

