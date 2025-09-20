CREATE TABLE `ecoa_category` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`nameEn` text(255),
	`description` text(1000),
	`descriptionEn` text(1000),
	`parentId` text,
	`sortOrder` integer DEFAULT 0,
	FOREIGN KEY (`parentId`) REFERENCES `ecoa_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ecoa_category_parent_id_idx` ON `ecoa_category` (`parentId`);--> statement-breakpoint
CREATE INDEX `ecoa_category_sort_order_idx` ON `ecoa_category` (`sortOrder`);--> statement-breakpoint
CREATE TABLE `ecoa_item` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`itemNumber` integer NOT NULL,
	`question` text(1000) NOT NULL,
	`questionEn` text(1000),
	`dimension` text(255),
	`responseType` text(50) NOT NULL,
	`responseOptions` text,
	`scoringInfo` text(500),
	`isRequired` integer DEFAULT 1,
	`sortOrder` integer DEFAULT 0,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ecoa_item_scale_id_idx` ON `ecoa_item` (`scaleId`);--> statement-breakpoint
CREATE INDEX `ecoa_item_dimension_idx` ON `ecoa_item` (`dimension`);--> statement-breakpoint
CREATE INDEX `ecoa_item_sort_order_idx` ON `ecoa_item` (`sortOrder`);--> statement-breakpoint
CREATE TABLE `ecoa_scale` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`nameEn` text(255),
	`acronym` text(50),
	`description` text(2000),
	`descriptionEn` text(2000),
	`categoryId` text,
	`itemsCount` integer DEFAULT 0,
	`dimensionsCount` integer DEFAULT 0,
	`languages` text DEFAULT '[]',
	`validationStatus` text(50) DEFAULT 'draft',
	`copyrightInfo` text(1000),
	`scoringMethod` text(500),
	`administrationTime` integer,
	`targetPopulation` text(500),
	`ageRange` text(100),
	`domains` text DEFAULT '[]',
	`psychometricProperties` text,
	`references` text DEFAULT '[]',
	`downloadUrl` text(500),
	`isPublic` integer DEFAULT 1,
	`usageCount` integer DEFAULT 0,
	`favoriteCount` integer DEFAULT 0,
	`searchVector` text(1536),
	FOREIGN KEY (`categoryId`) REFERENCES `ecoa_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ecoa_scale_category_id_idx` ON `ecoa_scale` (`categoryId`);--> statement-breakpoint
CREATE INDEX `ecoa_scale_validation_status_idx` ON `ecoa_scale` (`validationStatus`);--> statement-breakpoint
CREATE INDEX `ecoa_scale_usage_count_idx` ON `ecoa_scale` (`usageCount`);--> statement-breakpoint
CREATE INDEX `ecoa_scale_is_public_idx` ON `ecoa_scale` (`isPublic`);--> statement-breakpoint
CREATE INDEX `ecoa_scale_acronym_idx` ON `ecoa_scale` (`acronym`);--> statement-breakpoint
CREATE TABLE `scale_usage` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`userId` text,
	`actionType` text(50) NOT NULL,
	`ipAddress` text(100),
	`userAgent` text(500),
	`referrer` text(500),
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scale_usage_scale_id_idx` ON `scale_usage` (`scaleId`);--> statement-breakpoint
CREATE INDEX `scale_usage_user_id_idx` ON `scale_usage` (`userId`);--> statement-breakpoint
CREATE INDEX `scale_usage_action_type_idx` ON `scale_usage` (`actionType`);--> statement-breakpoint
CREATE INDEX `scale_usage_created_at_idx` ON `scale_usage` (`createdAt`);--> statement-breakpoint
CREATE TABLE `user_favorite` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scaleId` text NOT NULL,
	`notes` text(1000),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_favorite_user_id_idx` ON `user_favorite` (`userId`);--> statement-breakpoint
CREATE INDEX `user_favorite_scale_id_idx` ON `user_favorite` (`scaleId`);--> statement-breakpoint
CREATE INDEX `user_favorite_unique_idx` ON `user_favorite` (`userId`,`scaleId`);--> statement-breakpoint
CREATE TABLE `user_search_history` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`query` text(500) NOT NULL,
	`filters` text,
	`resultsCount` integer DEFAULT 0,
	`searchType` text(50) DEFAULT 'general',
	`ipAddress` text(100),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_search_history_user_id_idx` ON `user_search_history` (`userId`);--> statement-breakpoint
CREATE INDEX `user_search_history_created_at_idx` ON `user_search_history` (`createdAt`);