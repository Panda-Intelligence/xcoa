CREATE TABLE `report_template` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`nameEn` text(255),
	`scaleId` text,
	`description` text(1000),
	`descriptionEn` text(1000),
	`templateType` text DEFAULT 'standard' NOT NULL,
	`sections` text,
	`styles` text,
	`includeCharts` integer DEFAULT 1,
	`includeInterpretation` integer DEFAULT 1,
	`includeRecommendations` integer DEFAULT 1,
	`includeDimensionScores` integer DEFAULT 1,
	`isDefault` integer DEFAULT 0,
	`isActive` integer DEFAULT 1,
	`sortOrder` integer DEFAULT 0,
	`usageCount` integer DEFAULT 0,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `report_template_scale_id_idx` ON `report_template` (`scaleId`);--> statement-breakpoint
CREATE INDEX `report_template_is_default_idx` ON `report_template` (`isDefault`);--> statement-breakpoint
CREATE INDEX `report_template_is_active_idx` ON `report_template` (`isActive`);--> statement-breakpoint
CREATE INDEX `report_template_sort_order_idx` ON `report_template` (`sortOrder`);--> statement-breakpoint
CREATE TABLE `scale_report` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scaleId` text NOT NULL,
	`sessionId` text(255) NOT NULL,
	`templateId` text,
	`reportType` text DEFAULT 'pdf' NOT NULL,
	`status` text DEFAULT 'generating' NOT NULL,
	`totalScore` real,
	`maxScore` real,
	`completionRate` real,
	`dimensionScores` text,
	`interpretation` text(5000),
	`recommendations` text,
	`reportContent` text,
	`chartData` text,
	`metadata` text,
	`generatedAt` integer,
	`expiresAt` integer,
	`downloadUrl` text(500),
	`fileSize` integer,
	`viewCount` integer DEFAULT 0,
	`downloadCount` integer DEFAULT 0,
	`lastViewedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`templateId`) REFERENCES `report_template`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scale_report_user_id_idx` ON `scale_report` (`userId`);--> statement-breakpoint
CREATE INDEX `scale_report_scale_id_idx` ON `scale_report` (`scaleId`);--> statement-breakpoint
CREATE INDEX `scale_report_session_id_idx` ON `scale_report` (`sessionId`);--> statement-breakpoint
CREATE INDEX `scale_report_template_id_idx` ON `scale_report` (`templateId`);--> statement-breakpoint
CREATE INDEX `scale_report_status_idx` ON `scale_report` (`status`);--> statement-breakpoint
CREATE INDEX `scale_report_created_at_idx` ON `scale_report` (`createdAt`);--> statement-breakpoint
CREATE INDEX `scale_report_generated_at_idx` ON `scale_report` (`generatedAt`);--> statement-breakpoint
CREATE TABLE `scale_response` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scaleId` text NOT NULL,
	`sessionId` text(255) NOT NULL,
	`itemId` text NOT NULL,
	`itemNumber` integer NOT NULL,
	`response` text,
	`responseValue` real,
	`startedAt` integer,
	`completedAt` integer,
	`timeSpentSeconds` integer,
	`isSkipped` integer DEFAULT 0,
	`ipAddress` text(100),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`itemId`) REFERENCES `ecoa_item`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scale_response_user_id_idx` ON `scale_response` (`userId`);--> statement-breakpoint
CREATE INDEX `scale_response_scale_id_idx` ON `scale_response` (`scaleId`);--> statement-breakpoint
CREATE INDEX `scale_response_session_id_idx` ON `scale_response` (`sessionId`);--> statement-breakpoint
CREATE INDEX `scale_response_item_id_idx` ON `scale_response` (`itemId`);--> statement-breakpoint
CREATE INDEX `scale_response_created_at_idx` ON `scale_response` (`createdAt`);