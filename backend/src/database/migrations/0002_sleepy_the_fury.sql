CREATE TYPE "public"."field_type" AS ENUM('string', 'text', 'number', 'integer', 'float', 'decimal', 'boolean', 'date', 'datetime', 'timestamp', 'email', 'url', 'uuid', 'json', 'enum', 'relation');--> statement-breakpoint
CREATE TYPE "public"."input_type" AS ENUM('text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'date', 'datetime-local', 'time', 'checkbox', 'radio', 'select', 'multiselect', 'file', 'image', 'color', 'range', 'wysiwyg', 'markdown', 'json-editor', 'relation-select');--> statement-breakpoint
CREATE TYPE "public"."relation_type" AS ENUM('one-to-one', 'one-to-many', 'many-to-one', 'many-to-many');--> statement-breakpoint
CREATE TYPE "public"."validation_type" AS ENUM('required', 'email', 'url', 'minLength', 'maxLength', 'pattern', 'min', 'max', 'integer', 'positive', 'negative', 'arrayMinLength', 'arrayMaxLength', 'custom');--> statement-breakpoint
CREATE TABLE "field_validations" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_id" integer NOT NULL,
	"validation_type" "validation_type" NOT NULL,
	"validation_params" json,
	"error_message" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"description" text,
	"has_tenant_isolation" boolean DEFAULT false NOT NULL,
	"has_soft_delete" boolean DEFAULT false NOT NULL,
	"has_audit" boolean DEFAULT false NOT NULL,
	"generated_files" json NOT NULL,
	"cli_command" text NOT NULL,
	"generator_version" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"deleted_at" timestamp,
	CONSTRAINT "generated_modules_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "generation_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation" varchar(50) NOT NULL,
	"module_id" integer,
	"command" text NOT NULL,
	"options" json,
	"success" boolean NOT NULL,
	"error_message" text,
	"files_created" json,
	"files_modified" json,
	"files_deleted" json,
	"can_rollback" boolean DEFAULT true NOT NULL,
	"rollback_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "module_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"description" text,
	"field_type" "field_type" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_unique" boolean DEFAULT false NOT NULL,
	"is_nullable" boolean DEFAULT true NOT NULL,
	"default_value" text,
	"length" integer,
	"min_value" integer,
	"max_value" integer,
	"precision" integer,
	"scale" integer,
	"enum_values" json,
	"relation_module" varchar(255),
	"relation_type" "relation_type",
	"input_type" "input_type" NOT NULL,
	"placeholder" varchar(255),
	"help_text" text,
	"is_searchable" boolean DEFAULT false NOT NULL,
	"is_sortable" boolean DEFAULT false NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"show_in_list" boolean DEFAULT true NOT NULL,
	"show_in_detail" boolean DEFAULT true NOT NULL,
	"show_in_form" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "field_validations" ADD CONSTRAINT "field_validations_field_id_module_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."module_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_history" ADD CONSTRAINT "generation_history_module_id_generated_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."generated_modules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_fields" ADD CONSTRAINT "module_fields_module_id_generated_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."generated_modules"("id") ON DELETE cascade ON UPDATE no action;