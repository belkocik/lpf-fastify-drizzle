CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" text,
	"lastName" text,
	"username" text,
	"email" text,
	"password" text,
	"hashedRefreshToken" text,
	"createdAt" timestamp DEFAULT now (),
	"updatedAt" timestamp DEFAULT now (),
	CONSTRAINT "users_username_unique" UNIQUE ("username"),
	CONSTRAINT "users_email_unique" UNIQUE ("email")
);
