CREATE TABLE "Bookmark" (
	"id" serial PRIMARY KEY NOT NULL,
	"link" text NOT NULL,
	"user_id" integer NOT NULL,
	"catogory_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Catogory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_catogory_id_Catogory_id_fk" FOREIGN KEY ("catogory_id") REFERENCES "public"."Catogory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Catogory" ADD CONSTRAINT "Catogory_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;