ALTER TABLE `playlistTable` ADD `is_private` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `songHistory` DROP COLUMN `is_private`;