CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`extracted` text DEFAULT '' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_assets_owner` ON `assets` (`owner`);--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_chats_owner_updated` ON `chats` (`owner`,`updated`);--> statement-breakpoint
CREATE TABLE `limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`created` integer NOT NULL
);
