PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_songHistory` (
	`user_id` integer NOT NULL,
	`song_link` text NOT NULL,
	`last_listen` text NOT NULL,
	`is_private` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_songHistory`("user_id", "song_link", "last_listen", "is_private") SELECT "user_id", "song_link", "last_listen", "is_private" FROM `songHistory`;--> statement-breakpoint
DROP TABLE `songHistory`;--> statement-breakpoint
ALTER TABLE `__new_songHistory` RENAME TO `songHistory`;--> statement-breakpoint
PRAGMA foreign_keys=ON;