CREATE TABLE `interpretation_feedback` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`interpretationId` text NOT NULL,
	`expertId` text,
	`expertName` text(100),
	`expertEmail` text(255),
	`expertCredentials` text(500),
	`expertAffiliation` text(200),
	`section` text(50),
	`feedbackType` text(20) NOT NULL,
	`severity` text(20),
	`content` text(5000) NOT NULL,
	`suggestedChange` text(5000),
	`references` text(1000),
	`status` text(20) DEFAULT 'pending' NOT NULL,
	`resolvedBy` text,
	`resolvedAt` integer,
	`resolutionNotes` text(1000),
	`helpfulnessRating` integer,
	FOREIGN KEY (`interpretationId`) REFERENCES `scale_interpretation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`expertId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resolvedBy`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `interpretation_feedback_interpretation_id_idx` ON `interpretation_feedback` (`interpretationId`);--> statement-breakpoint
CREATE INDEX `interpretation_feedback_expert_id_idx` ON `interpretation_feedback` (`expertId`);--> statement-breakpoint
CREATE INDEX `interpretation_feedback_status_idx` ON `interpretation_feedback` (`status`);--> statement-breakpoint
CREATE INDEX `interpretation_feedback_feedback_type_idx` ON `interpretation_feedback` (`feedbackType`);--> statement-breakpoint
CREATE TABLE `interpretation_history` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`interpretationId` text NOT NULL,
	`version` integer NOT NULL,
	`changes` text(10000) NOT NULL,
	`changeType` text(20) NOT NULL,
	`changeSummary` text(500),
	`changedBy` text NOT NULL,
	`changeReason` text(1000),
	FOREIGN KEY (`interpretationId`) REFERENCES `scale_interpretation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`changedBy`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `interpretation_history_interpretation_id_idx` ON `interpretation_history` (`interpretationId`);--> statement-breakpoint
CREATE INDEX `interpretation_history_version_idx` ON `interpretation_history` (`version`);--> statement-breakpoint
CREATE INDEX `interpretation_history_changed_by_idx` ON `interpretation_history` (`changedBy`);--> statement-breakpoint
CREATE TABLE `interpretation_reference` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`interpretationId` text NOT NULL,
	`title` text(500) NOT NULL,
	`authors` text(500),
	`year` integer,
	`journal` text(200),
	`volume` text(50),
	`issue` text(50),
	`pages` text(50),
	`doi` text(200),
	`pmid` text(50),
	`url` text(500),
	`referenceType` text(50) NOT NULL,
	`section` text(50),
	`displayOrder` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`interpretationId`) REFERENCES `scale_interpretation`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `interpretation_reference_interpretation_id_idx` ON `interpretation_reference` (`interpretationId`);--> statement-breakpoint
CREATE INDEX `interpretation_reference_doi_idx` ON `interpretation_reference` (`doi`);--> statement-breakpoint
CREATE TABLE `interpretation_user_feedback` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`interpretationId` text NOT NULL,
	`userId` text NOT NULL,
	`isHelpful` integer NOT NULL,
	`rating` integer,
	`comment` text(1000),
	`issueType` text(50),
	`issueDescription` text(2000),
	FOREIGN KEY (`interpretationId`) REFERENCES `scale_interpretation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `interpretation_user_feedback_interpretation_id_idx` ON `interpretation_user_feedback` (`interpretationId`);--> statement-breakpoint
CREATE INDEX `interpretation_user_feedback_user_id_idx` ON `interpretation_user_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `interpretation_user_feedback_unique_idx` ON `interpretation_user_feedback` (`interpretationId`,`userId`);--> statement-breakpoint
CREATE TABLE `scale_interpretation` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`overview` text(5000),
	`structure` text(5000),
	`psychometricProperties` text(5000),
	`interpretation` text(5000),
	`usageGuidelines` text(5000),
	`clinicalApplications` text(5000),
	`rawContent` text(30000),
	`generationMethod` text(20) NOT NULL,
	`status` text(20) DEFAULT 'draft' NOT NULL,
	`language` text(2) DEFAULT 'zh' NOT NULL,
	`aiModel` text(100),
	`aiPromptVersion` text(50),
	`aiTokensUsed` integer,
	`aiGeneratedAt` integer,
	`aiConfidence` real,
	`needsVerification` integer DEFAULT 1 NOT NULL,
	`reviewedBy` text,
	`reviewedAt` integer,
	`reviewNotes` text(2000),
	`publishedAt` integer,
	`publishedBy` text,
	`version` integer DEFAULT 1 NOT NULL,
	`qualityScore` real,
	`completenessScore` real,
	`accuracyScore` real,
	`viewCount` integer DEFAULT 0 NOT NULL,
	`helpfulCount` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewedBy`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publishedBy`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scale_interpretation_scale_id_idx` ON `scale_interpretation` (`scaleId`);--> statement-breakpoint
CREATE INDEX `scale_interpretation_status_idx` ON `scale_interpretation` (`status`);--> statement-breakpoint
CREATE INDEX `scale_interpretation_language_idx` ON `scale_interpretation` (`language`);--> statement-breakpoint
CREATE INDEX `scale_interpretation_reviewed_by_idx` ON `scale_interpretation` (`reviewedBy`);