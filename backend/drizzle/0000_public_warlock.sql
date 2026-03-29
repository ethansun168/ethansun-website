CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`content` text NOT NULL,
	`created` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text(20) PRIMARY KEY NOT NULL,
	`password` text(256) NOT NULL,
	`created` integer DEFAULT (unixepoch()) NOT NULL,
	`role` text DEFAULT 'user' NOT NULL
);
