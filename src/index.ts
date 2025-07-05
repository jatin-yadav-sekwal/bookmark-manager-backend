import Elysia from "elysia";
import { auth } from "./auth";
import { bookmark } from "./bookmark";
import { db } from "./db";

const app = new Elysia();

app.get("/","welcome to the bookmark manager")

app.use(auth);

app.use(bookmark);


app.get("/db-check", async () => {
  try {
    const result = await db.execute("SELECT NOW()");
    //@ts-ignore
    return { status: "connected ✅", time: result.rows[0].now };
  } catch (err) {
    console.error(err);
    return { status: "failed ❌"};
  }
});


app.listen(3000);
console.log("😾 connected to port 3000 ");