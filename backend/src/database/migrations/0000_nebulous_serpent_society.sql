CREATE TABLE "module_permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"module_id" bigint NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"scope" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"route_prefix" varchar(100) NOT NULL,
	"is_core" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"version" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "modules_name_unique" UNIQUE("name"),
	CONSTRAINT "modules_route_prefix_unique" UNIQUE("route_prefix")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"type" varchar(50) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" bigint,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(255),
	"schema_name" varchar(100) NOT NULL,
	"subscription_tier" varchar(50) DEFAULT 'free' NOT NULL,
	"subscription_expires_at" timestamp with time zone,
	"config" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" bigint,
	"updated_by" bigint,
	"deleted_at" timestamp with time zone,
	"deleted_by" bigint,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_schema_name_unique" UNIQUE("schema_name")
);
--> statement-breakpoint
ALTER TABLE "module_permissions" ADD CONSTRAINT "module_permissions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_module_permissions_unique" ON "module_permissions" USING btree ("module_id","resource","action","scope");--> statement-breakpoint
CREATE INDEX "idx_module_permissions_module_id" ON "module_permissions" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_module_permissions_resource" ON "module_permissions" USING btree ("resource");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_modules_name" ON "modules" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_modules_route_prefix" ON "modules" USING btree ("route_prefix");--> statement-breakpoint
CREATE INDEX "idx_modules_is_active" ON "modules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_modules_is_core" ON "modules" USING btree ("is_core");--> statement-breakpoint
CREATE INDEX "idx_modules_order" ON "modules" USING btree ("order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_system_settings_key" ON "system_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_system_settings_is_public" ON "system_settings" USING btree ("is_public");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tenants_slug" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tenants_domain" ON "tenants" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_tenants_is_active" ON "tenants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_tenants_deleted_at" ON "tenants" USING btree ("deleted_at");