import { Elysia, t } from "elysia";
import { jwtPlugin, cookiePlugin } from "../auth/plugin";
import { db } from "../db";
import { Users } from "../db/schema";
import { eq } from "drizzle-orm";
import jwt from "@elysiajs/jwt";

const bookmark = new Elysia({ prefix: "/user" });

bookmark.use(jwtPlugin).use(cookiePlugin);

bookmark.get("/", async ({ jwt, cookie: { auth } }) => {
  try {
    const payload = await jwt.verify(auth?.value);
    const userId = (
      await db.select().from(Users).where(eq(Users.email, payload.email))
    )[0]?.id;

    if (userId === undefined) {
      return {
        message: "User not found",
      };
    }
    //fetching all the data from every catogory
    const data = await db.query.Catogory.findMany({
      where: (Catogory, { eq }) => eq(Catogory.userId, userId),
      with: {
        bookmarks: true,
      },
    });
    if (data === undefined) {
      return {
        message: "No bookmarks yet",
      };
    }
    //format of return
    type BookmarkResult = {
      [key: string]: string[];
    };

    let result: BookmarkResult = {};

    for (let i = 0; i < data.length; i++) {
      const key = data[i]?.name;
      if (key === undefined) return "ERROR";

      const bookmarkLength = data[i]?.bookmarks.length;
      if (bookmarkLength === undefined) return "ERROR";

      for (let j = 0; j < bookmarkLength; j++) {
        if (!result[key]) {
          result[key] = [];
        }
        const link = data[i]?.bookmarks[j]?.link;
        if (link) {
          result[key].push(link);
        }
      }
    }

    return result;
  } catch (error) {
    console.log(error);
    return {
      message: "error in fetching in all bookmarks",
    };
  }
});

bookmark.post(
  "/add",
  async ({ body: { catogory, link }, jwt, cookie: { auth } }) => {
    try {
        //verifying user
      const payload = await jwt.verify(auth?.value);
      const userId = (
        await db.select().from(Users).where(eq(Users.email, payload.email))
      )[0]?.id;

      if (userId === undefined) {
        return {
          message: "User not found",
        };
      }
      //check if catogory already exist
      //if exist then directly add

    } catch (error) {
      console.log(error);
      return {
        message: "error in bookmarking ",
      };
    }
  },
  {
    body: t.Object({
      catogory: t.String(),
      link: t.String(),
    }),
  }
);

bookmark.listen(3000);
console.log("😾 connected to port 3000 ");
