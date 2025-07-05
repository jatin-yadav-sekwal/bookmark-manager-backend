import { Elysia, t } from "elysia";
import { jwtPlugin, cookiePlugin } from "../auth/plugin";
import { db } from "../db";
import { Bookmark, Catogory, Users } from "../db/schema";
import { eq, and } from "drizzle-orm";

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

bookmark.get(
  "/:catogory",
  async ({ params: { catogory }, jwt, cookie: { auth } }) => {
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
      const data = await db.query.Catogory.findMany({
        where: (Catogory, { eq, and }) =>
          and(eq(Catogory.userId, userId), eq(Catogory.name, catogory)),
        with: {
          bookmarks: true,
        },
      });
      if (data.length === 0) {
        return {
          message: "No bookmarks in this catogory yet",
        };
      }
      //cleaing the received data and give relevant data
      type BookmarkResult = {
        [key: string]: string[];
      };

      const result: BookmarkResult = {};

      const key = data[0]?.name;
      if (key === undefined) return "ERROR";

      const bookmarkLength = data[0]?.bookmarks.length;
      if (bookmarkLength === undefined) return "ERROR";

      for (let j = 0; j < bookmarkLength; j++) {
        if (!result[key]) {
          result[key] = [];
        }
        const link = data[0]?.bookmarks[j]?.link;
        if (link) {
          result[key].push(link);
        }
      }

      return result;
    } catch (error) {
      console.log(error);
      return {
        message: "error in bookmarking ",
      };
    }
  },
  {
    params: t.Object({
      catogory: t.String(),
    }),
  }
);

bookmark.post(
  "/add",
  async ({ body: { catogory, link }, jwt, cookie: { auth } }) => {
    try {
     // Verify user
      const payload = await jwt.verify(auth?.value);
      const user = await db.query.Users.findFirst({
        where: (Users, { eq }) => eq(Users.email, payload.email),
      });

      if (!user) {
        return { message: "User not found" };
      }

      const userId = user.id;

      // Find or create category
      let findCatogory = await db.query.Catogory.findFirst({
        where: (Catogory, { eq, and }) =>
          and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
      });

      if (!findCatogory) {
        await db.insert(Catogory).values({
          name: catogory,
          userId: userId,
        });

        // Re-fetch the category after insertion
        findCatogory = await db.query.Catogory.findFirst({
          where: (Catogory, { eq, and }) =>
            and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
        });
      }

      if (!findCatogory?.id) {
        return { message: "Category ID not found, cannot add bookmark" };
      }
      //check if link already inserted
      const checkLink = await db
        .select()
        .from(Bookmark)
        .where(
          and(
            eq(Bookmark.userId, userId),
            eq(Bookmark.catogoryId, findCatogory.id),
            eq(Bookmark.link, link)
          )
        );
      if (checkLink.length > 0) {
        return {
          message: "already bookmarked",
        };
      }

      // Insert bookmark
      await db.insert(Bookmark).values({
        link,
        userId,
        catogoryId: findCatogory.id,
      });

      return { message: "Added bookmark successfully" };
    } catch (error) {
      console.error(error);
      return { message: "Error in adding bookmark" };
    }
  },
  {
    body: t.Object({
      catogory: t.String(),
      link: t.String(),
    }),
  }
);

bookmark.post(
  "/add/:catogory",
  async ({ params: { catogory }, jwt, cookie: { auth }, body: { link } }) => {
    try {
       // Verify user
      const payload = await jwt.verify(auth?.value);
      const user = await db.query.Users.findFirst({
        where: (Users, { eq }) => eq(Users.email, payload.email),
      });

      if (!user) {
        return { message: "User not found" };
      }

      const userId = user.id;

      // Find or create category
      let findCatogory = await db.query.Catogory.findFirst({
        where: (Catogory, { eq, and }) =>
          and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
      });

      if (!findCatogory) {
        await db.insert(Catogory).values({
          name: catogory,
          userId: userId,
        });

        // Re-fetch the category after insertion
        findCatogory = await db.query.Catogory.findFirst({
          where: (Catogory, { eq, and }) =>
            and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
        });
      }

      if (!findCatogory?.id) {
        return { message: "Category ID not found, cannot add bookmark" };
      }
      //check if link already inserted
      const checkLink = await db
        .select()
        .from(Bookmark)
        .where(
          and(
            eq(Bookmark.userId, userId),
            eq(Bookmark.catogoryId, findCatogory.id),
            eq(Bookmark.link, link)
          )
        );
      if (checkLink.length > 0) {
        return {
          message: "already bookmarked",
        };
      }

      // Insert bookmark
      await db.insert(Bookmark).values({
        link,
        userId,
        catogoryId: findCatogory.id,
      });

      return { message: "Added bookmark successfully" };
    } catch (error) {
      console.log(error);
      return {
        message: "error in adding bookmark",
      };
    }
  },
  {
    params: t.Object({
      catogory: t.String(),
    }),
    body: t.Object({
      link: t.String(),
    }),
  }
);
bookmark.patch(
  "/update/:catogory",
  async ({ params: { catogory }, jwt, cookie: { auth }, body: { oldLink,newLink } }) => {
    try {
       // Verify user
      const payload = await jwt.verify(auth?.value);
      const user = await db.query.Users.findFirst({
        where: (Users, { eq }) => eq(Users.email, payload.email),
      });

      if (!user) {
        return { message: "User not found" };
      }

      const userId = user.id;

      // Find  category
      let findCatogory = await db.query.Catogory.findFirst({
        where: (Catogory, { eq, and }) =>
          and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
      });

      if (!findCatogory) {
       return{
        message:"catogory dont exists"
       };
      }

      if (!findCatogory?.id) {
        return { message: "Category ID not found, cannot add bookmark" };
      }
      //check if oldLink already present
      const checkLink = await db
        .select()
        .from(Bookmark)
        .where(
          and(
            eq(Bookmark.userId, userId),
            eq(Bookmark.catogoryId, findCatogory.id),
            eq(Bookmark.link, oldLink)
          )
        );
        //if oldLink existed then update that to new link
      if (checkLink.length > 0) {
        const updatedLink = await db.update(Bookmark)
        .set({
            link:newLink
        }).where(
            and(
            eq(Bookmark.userId, userId),
            eq(Bookmark.catogoryId, findCatogory.id),
            eq(Bookmark.link, oldLink)
          )
        );
        return { message: "updated bookmark successfully" };
      }else{
        return{message:"cant update the link because it doesnt belong to catogory"}
      }
      
    } catch (error) {
      console.log(error);
      return {
        message: "error in adding bookmark",
      };
    }
  },
  {
    params: t.Object({
      catogory: t.String(),
    }),
    body: t.Object({
      oldLink: t.String(),
      newLink:t.String()
    }),
  }
);

bookmark.delete(
    "/delete/:catogory",
    async ({params:{catogory},jwt,cookie:{auth},body:{consent}})=>{
        try {
             // Verify user
      const payload = await jwt.verify(auth?.value);
      const user = await db.query.Users.findFirst({
        where: (Users, { eq }) => eq(Users.email, payload.email),
      });

      if (!user) {
        return { message: "User not found" };
      }

      const userId = user.id;

      // Find  category
      let findCatogory = await db.query.Catogory.findFirst({
        where: (Catogory, { eq, and }) =>
          and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
      });

      if (!findCatogory) {
       return{
        message:"catogory dont exists"
       };
      }

      if (!findCatogory?.id) {
        return { message: "Category ID not found, cannot delete catogory" };
      }
      if(consent){
        await db.delete(Bookmark).where(
            and(
                eq(Bookmark.userId,userId),
                eq(Bookmark.catogoryId,findCatogory.id)
            )
        );
        await db.delete(Catogory).where(
            and(
                eq(Catogory.name,catogory),
                eq(Catogory.id,findCatogory.id)

                )
            );
            return{message:"Catogory deleted"};
      }
      return{message:'please give consent to delete catogory'};
            
        } catch (error) {
            console.log(error);
            return{message:"catch error in deleting the catogory"};
        }
    },{
        params:t.Object({
            catogory:t.String()
        }),
        body:t.Object({
            consent:t.Boolean()
        })
    }
)
bookmark.delete(
    "/delete/:catogory",
    async ({params:{catogory},jwt,cookie:{auth},body:{link,consent}})=>{
        try {
             // Verify user
      const payload = await jwt.verify(auth?.value);
      const user = await db.query.Users.findFirst({
        where: (Users, { eq }) => eq(Users.email, payload.email),
      });

      if (!user) {
        return { message: "User not found" };
      }

      const userId = user.id;

      // Find  category
      let findCatogory = await db.query.Catogory.findFirst({
        where: (Catogory, { eq, and }) =>
          and(eq(Catogory.name, catogory), eq(Catogory.userId, userId)),
      });

      if (!findCatogory) {
       return{
        message:"catogory dont exists"
       };
      }

      if (!findCatogory?.id) {
        return { message: "Category ID not found, cannot delete catogory" };
      }
      if(consent){
        await db.delete(Bookmark).where(
            and(
                eq(Bookmark.userId,userId),
                eq(Bookmark.catogoryId,findCatogory.id),
                eq(Bookmark.link,link)
            )
        );
    
            return{message:"link deleted"};
      }
      return{message:'please give consent to delete link'};
            
        } catch (error) {
            console.log(error);
            return{message:"catch error in deleting the catogory"};
        }
    },{
        params:t.Object({
            catogory:t.String()
        }),
        body:t.Object({
            consent:t.Boolean(),
            link:t.String()
        })
    }
)

bookmark.listen(3000);
console.log("😾 connected to port 3000 ");
