CREATE TABLE "users" (
	"username" varchar(20) PRIMARY KEY NOT NULL,
	"password" varchar(256) NOT NULL,
	"created" timestamp DEFAULT now()
);
