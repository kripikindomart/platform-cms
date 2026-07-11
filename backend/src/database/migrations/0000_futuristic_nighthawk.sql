CREATE TABLE "module_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"migration_file" varchar(255) NOT NULL,
	"migration_name" varchar(255) NOT NULL,
	"migration_path" text NOT NULL,
	"snapshot_file" varchar(255),
	"is_applied" boolean DEFAULT false NOT NULL,
	"applied_at" timestamp,
	"can_rollback" boolean DEFAULT true NOT NULL,
	"is_rolled_back" boolean DEFAULT false NOT NULL,
	"rolled_back_at" timestamp,
	"up_sql" text,
	"down_sql" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255),
	"total" numeric(10, 2),
	"order_date" timestamp,
	"status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" integer
);
--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "name" TO "deleted_by";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_by" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_by" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "module_migrations" ADD CONSTRAINT "module_migrations_module_id_generated_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."generated_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "stock";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "active";