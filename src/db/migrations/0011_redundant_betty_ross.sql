CREATE TABLE `clinical_cases` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`caseTitle` text(255) NOT NULL,
	`patientBackground` text(1000),
	`scaleScores` text,
	`interpretation` text(2000),
	`clinicalDecision` text(1000),
	`outcome` text(1000),
	`learningPoints` text(1000),
	`difficultyLevel` text(20),
	`specialty` text(100),
	`author` text(255),
	`reviewStatus` text(20) DEFAULT 'draft',
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `clinical_cases_scale_id_idx` ON `clinical_cases` (`scaleId`);--> statement-breakpoint
CREATE INDEX `clinical_cases_specialty_idx` ON `clinical_cases` (`specialty`);--> statement-breakpoint
CREATE INDEX `clinical_cases_difficulty_idx` ON `clinical_cases` (`difficultyLevel`);--> statement-breakpoint
CREATE TABLE `copyright_licenses` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`licenseType` text(50),
	`copyrightHolder` text(255),
	`contactEmail` text(255),
	`contactPhone` text(50),
	`website` text(500),
	`licenseTerms` text(2000),
	`commercialCost` text(255),
	`academicCost` text(255),
	`usageRestrictions` text(1000),
	`applicationProcess` text(1000),
	`responseTime` text(100),
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `copyright_licenses_scale_id_idx` ON `copyright_licenses` (`scaleId`);--> statement-breakpoint
CREATE INDEX `copyright_licenses_type_idx` ON `copyright_licenses` (`licenseType`);--> statement-breakpoint
CREATE TABLE `scale_comparisons` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scale1Id` text NOT NULL,
	`scale2Id` text NOT NULL,
	`comparisonAspects` text,
	`similarities` text(2000),
	`differences` text(2000),
	`usageRecommendations` text(1000),
	FOREIGN KEY (`scale1Id`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scale2Id`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comparisons_scales_idx` ON `scale_comparisons` (`scale1Id`,`scale2Id`);--> statement-breakpoint
CREATE TABLE `scale_favorite_stats` (
	`scaleId` text PRIMARY KEY NOT NULL,
	`totalFavorites` integer DEFAULT 0,
	`recentFavorites` integer DEFAULT 0,
	`monthlyFavorites` integer DEFAULT 0,
	`trendingScore` real DEFAULT 0,
	`lastUpdated` integer NOT NULL,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `favorite_stats_trending_idx` ON `scale_favorite_stats` (`trendingScore`);--> statement-breakpoint
CREATE INDEX `favorite_stats_total_idx` ON `scale_favorite_stats` (`totalFavorites`);--> statement-breakpoint
CREATE TABLE `scale_guidelines` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`guidelineType` text(50),
	`title` text(255) NOT NULL,
	`content` text(5000),
	`targetAudience` text(100),
	`evidenceLevel` text(5),
	`lastUpdated` integer,
	`version` text(20),
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `guidelines_scale_id_idx` ON `scale_guidelines` (`scaleId`);--> statement-breakpoint
CREATE INDEX `guidelines_type_idx` ON `scale_guidelines` (`guidelineType`);--> statement-breakpoint
CREATE TABLE `scale_interpretations` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`scoreRangeMin` integer,
	`scoreRangeMax` integer,
	`severityLevel` text(50),
	`interpretationZh` text(1000),
	`interpretationEn` text(1000),
	`clinicalSignificance` text(1000),
	`recommendations` text(1000),
	`followUpGuidance` text(1000),
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `interpretations_scale_id_idx` ON `scale_interpretations` (`scaleId`);--> statement-breakpoint
CREATE INDEX `interpretations_score_range_idx` ON `scale_interpretations` (`scoreRangeMin`,`scoreRangeMax`);--> statement-breakpoint
CREATE TABLE `scale_norms` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`scaleId` text NOT NULL,
	`populationType` text(100) NOT NULL,
	`sampleSize` integer,
	`meanScore` real,
	`stdDeviation` real,
	`minScore` real,
	`maxScore` real,
	`percentiles` text,
	`ageRange` text(50),
	`gender` text(20),
	`educationLevel` text(100),
	`culturalBackground` text(100),
	`studyReference` text(500),
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scale_norms_scale_id_idx` ON `scale_norms` (`scaleId`);--> statement-breakpoint
CREATE INDEX `scale_norms_population_idx` ON `scale_norms` (`populationType`);--> statement-breakpoint
CREATE TABLE `user_collections` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text(255) NOT NULL,
	`description` text(1000),
	`color` text(50) DEFAULT 'blue',
	`icon` text(50) DEFAULT 'folder',
	`isPublic` integer DEFAULT 0,
	`isDefault` integer DEFAULT 0,
	`sortOrder` integer DEFAULT 0,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `collections_user_id_idx` ON `user_collections` (`userId`);--> statement-breakpoint
CREATE INDEX `collections_sort_order_idx` ON `user_collections` (`sortOrder`);--> statement-breakpoint
CREATE INDEX `collections_public_idx` ON `user_collections` (`isPublic`);--> statement-breakpoint
CREATE TABLE `user_scale_favorites` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scaleId` text NOT NULL,
	`collectionId` text,
	`personalNotes` text(1000),
	`tags` text DEFAULT '[]',
	`priority` integer DEFAULT 0,
	`isPinned` integer DEFAULT 0,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collectionId`) REFERENCES `user_collections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `favorites_user_id_idx` ON `user_scale_favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `favorites_scale_id_idx` ON `user_scale_favorites` (`scaleId`);--> statement-breakpoint
CREATE INDEX `favorites_collection_idx` ON `user_scale_favorites` (`collectionId`);--> statement-breakpoint
CREATE INDEX `favorites_pinned_idx` ON `user_scale_favorites` (`isPinned`);