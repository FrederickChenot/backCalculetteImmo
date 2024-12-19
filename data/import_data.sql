-- Deploy template-api:1-initialdb to pg

BEGIN;

DROP TABLE IF EXISTS "countercalculette";

CREATE TABLE countercalculette (
    "id" SERIAL PRIMARY KEY,
    "visit_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


COMMIT;
