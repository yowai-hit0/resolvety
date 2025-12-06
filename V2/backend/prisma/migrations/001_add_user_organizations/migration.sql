-- CreateTable: UserOrganization junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS "public"."user_organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,

    CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_organizations_user_id_idx" ON "public"."user_organizations"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_organizations_organization_id_idx" ON "public"."user_organizations"("organization_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_organizations_is_primary_idx" ON "public"."user_organizations"("is_primary");

-- CreateUniqueConstraint
CREATE UNIQUE INDEX IF NOT EXISTS "user_organizations_user_id_organization_id_key" ON "public"."user_organizations"("user_id", "organization_id");

-- AddForeignKey
ALTER TABLE "public"."user_organizations" ADD CONSTRAINT "user_organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_organizations" ADD CONSTRAINT "user_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (optional - for created_by tracking)
ALTER TABLE "public"."user_organizations" ADD CONSTRAINT "user_organizations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing data: Move organization_id to user_organizations junction table
INSERT INTO "public"."user_organizations" ("user_id", "organization_id", "is_primary", "created_at")
SELECT 
    u.id as user_id,
    u.organization_id as organization_id,
    true as is_primary, -- Mark existing organization as primary
    u.created_at as created_at
FROM "public"."users" u
WHERE u.organization_id IS NOT NULL
ON CONFLICT ("user_id", "organization_id") DO NOTHING;

