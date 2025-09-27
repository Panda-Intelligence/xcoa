CREATE TABLE `invoice` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`teamId` text NOT NULL,
	`invoiceNumber` text(50) NOT NULL,
	`issueDate` integer NOT NULL,
	`dueDate` integer NOT NULL,
	`status` text(20) DEFAULT 'draft' NOT NULL,
	`subtotal` real NOT NULL,
	`taxAmount` real DEFAULT 0,
	`totalAmount` real NOT NULL,
	`currency` text(10) DEFAULT 'USD' NOT NULL,
	`customerName` text(255) NOT NULL,
	`customerEmail` text(255) NOT NULL,
	`customerOrganization` text(255),
	`customerAddress` text(1000),
	`customerVatNumber` text(50),
	`customerCountry` text(100),
	`paymentMethod` text(50),
	`paidAt` integer,
	`paymentReference` text(255),
	`description` text(1000),
	`items` text,
	`notes` text(2000),
	`internalNotes` text(2000),
	FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_invoiceNumber_unique` ON `invoice` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `invoice_team_id_idx` ON `invoice` (`teamId`);--> statement-breakpoint
CREATE INDEX `invoice_number_idx` ON `invoice` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `invoice_status_idx` ON `invoice` (`status`);--> statement-breakpoint
CREATE INDEX `invoice_issue_date_idx` ON `invoice` (`issueDate`);--> statement-breakpoint
ALTER TABLE `team` ADD `legalName` text(255);--> statement-breakpoint
ALTER TABLE `team` ADD `address` text(1000);--> statement-breakpoint
ALTER TABLE `team` ADD `city` text(100);--> statement-breakpoint
ALTER TABLE `team` ADD `state` text(100);--> statement-breakpoint
ALTER TABLE `team` ADD `postalCode` text(20);--> statement-breakpoint
ALTER TABLE `team` ADD `country` text(100);--> statement-breakpoint
ALTER TABLE `team` ADD `vatNumber` text(50);--> statement-breakpoint
ALTER TABLE `team` ADD `taxId` text(50);--> statement-breakpoint
ALTER TABLE `team` ADD `registrationNumber` text(100);--> statement-breakpoint
ALTER TABLE `team` ADD `billingContact` text(255);--> statement-breakpoint
ALTER TABLE `team` ADD `billingPhone` text(50);--> statement-breakpoint
ALTER TABLE `team` ADD `invoicePrefix` text(10) DEFAULT 'INV';--> statement-breakpoint
ALTER TABLE `team` ADD `nextInvoiceNumber` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `team` ADD `defaultCurrency` text(10) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE `team` ADD `taxRate` real DEFAULT 0.1;--> statement-breakpoint
CREATE INDEX `team_country_idx` ON `team` (`country`);--> statement-breakpoint
CREATE INDEX `team_vat_idx` ON `team` (`vatNumber`);