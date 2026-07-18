-- Remove the unused database-backed Auth.js path. Back up an existing database
-- before applying this migration if those legacy tables contain data to retain.
DROP TABLE "Account";
DROP TABLE "Session";
DROP TABLE "VerificationToken";
DROP TABLE "User";

-- Existing URL-only image rows are retained and marked as legacy. New application
-- writes always use a server-generated R2 key.
ALTER TABLE "PropertyImage" ADD COLUMN "objectKey" TEXT;
UPDATE "PropertyImage" SET "objectKey" = 'legacy/' || "id" WHERE "objectKey" IS NULL;
ALTER TABLE "PropertyImage" ALTER COLUMN "objectKey" SET NOT NULL;
CREATE UNIQUE INDEX "PropertyImage_objectKey_key" ON "PropertyImage"("objectKey");
