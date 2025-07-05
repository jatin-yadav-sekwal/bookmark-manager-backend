import { relations } from "drizzle-orm";
import { PgTable,text,serial,integer,timestamp, pgTable } from "drizzle-orm/pg-core";

export const Users = pgTable("Users",{
    id:serial("id").primaryKey(),
    email:text("email").notNull(),
    password:text("password").notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow()
});

export const Catogory = pgTable("Catogory",{
    id:serial("id").primaryKey(),
    name:text("name").notNull(),
    userId:integer("user_id").notNull()
    .references(()=>Users.id),
    createdAt:timestamp("created_at").notNull().defaultNow()

});

export const Bookmark = pgTable("Bookmark",{
    id:serial("id").primaryKey(),
    link:text('link').notNull(),
    userId:integer("user_id").notNull()
    .references(()=>Users.id),
    catogoryId:integer("catogory_id").notNull()
    .references(()=>Catogory.id),
    createdAt:timestamp("created_at").notNull().defaultNow()
});


export const bookmarkRelations= relations(Bookmark,({one})=>({
    users:one(Users,{fields:[Bookmark.userId],references:[Users.id]}),
    catogory:one(Catogory,{fields:[Bookmark.catogoryId],references:[Catogory.id]}),
}));

export const catogoryRelations = relations(Catogory,({one ,many})=>({
    users:one(Users,{fields:[Catogory.userId],references:[Users.id]}),
    bookmarks:many(Bookmark)
}));

export const userRelations = relations(Users,({many})=>({
    catogory:many(Catogory),
    bookmarks:many(Bookmark)
}));