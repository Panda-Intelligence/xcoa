CREATE TABLE `copyright_contact_request` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`scaleId` text NOT NULL,
	`copyrightHolderId` text NOT NULL,
	`requestType` text(50) NOT NULL,
	`intendedUse` text(500),
	`organizationName` text(255),
	`organizationType` text(100),
	`contactName` text(255) NOT NULL,
	`contactEmail` text(255) NOT NULL,
	`contactPhone` text(50),
	`message` text(2000),
	`status` text(50) DEFAULT 'pending',
	`sentAt` integer,
	`responseReceived` integer,
	`adminNotes` text(1000),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scaleId`) REFERENCES `ecoa_scale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copyrightHolderId`) REFERENCES `copyright_holder`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `copyright_contact_user_id_idx` ON `copyright_contact_request` (`userId`);--> statement-breakpoint
CREATE INDEX `copyright_contact_scale_id_idx` ON `copyright_contact_request` (`scaleId`);--> statement-breakpoint
CREATE INDEX `copyright_contact_holder_id_idx` ON `copyright_contact_request` (`copyrightHolderId`);--> statement-breakpoint
CREATE INDEX `copyright_contact_status_idx` ON `copyright_contact_request` (`status`);--> statement-breakpoint
CREATE INDEX `copyright_contact_created_at_idx` ON `copyright_contact_request` (`createdAt`);--> statement-breakpoint
CREATE TABLE `copyright_holder` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`nameEn` text(255),
	`organizationType` text(100),
	`website` text(500),
	`description` text(1000),
	`descriptionEn` text(1000),
	`contactEmail` text(255),
	`contactPhone` text(50),
	`contactMobile` text(50),
	`contactFax` text(50),
	`contactAddress` text(500),
	`licenseTypes` text DEFAULT '[]',
	`licenseRequirements` text(1000),
	`pricingInfo` text(500),
	`isActive` integer DEFAULT 1,
	`isVerified` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `copyright_holder_name_idx` ON `copyright_holder` (`name`);--> statement-breakpoint
CREATE INDEX `copyright_holder_org_type_idx` ON `copyright_holder` (`organizationType`);--> statement-breakpoint
CREATE INDEX `copyright_holder_active_idx` ON `copyright_holder` (`isActive`);--> statement-breakpoint
ALTER TABLE `ecoa_scale` ADD `copyrightHolderId` text REFERENCES copyright_holder(id);--> statement-breakpoint
ALTER TABLE `ecoa_scale` ADD `licenseType` text DEFAULT 'contact_required';--> statement-breakpoint
ALTER TABLE `ecoa_scale` ADD `copyrightYear` integer;--> statement-breakpoint
ALTER TABLE `ecoa_scale` ADD `licenseTerms` text(2000);--> statement-breakpoint
ALTER TABLE `ecoa_scale` ADD `usageRestrictions` text(1000);--> statement-breakpoint
CREATE INDEX `ecoa_scale_copyright_holder_idx` ON `ecoa_scale` (`copyrightHolderId`);--> statement-breakpoint
CREATE INDEX `ecoa_scale_license_type_idx` ON `ecoa_scale` (`licenseType`);