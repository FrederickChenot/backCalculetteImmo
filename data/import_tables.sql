-- Deploy template-api:2-seeding to pg

BEGIN;

SET client_encoding = 'UTF8';

INSERT INTO "countercalculette"("visit_count") VALUES
(1);



COMMIT;
