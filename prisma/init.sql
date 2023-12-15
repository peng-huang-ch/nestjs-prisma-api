/* Create database */
DROP DATABASE IF EXISTS nestjs_api;
CREATE DATABASE nestjs_api;

DO $$
BEGIN
  IF NOT EXISTS(SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN 
    -- Create role with password and grant the appropriate permissions to that role
    CREATE ROLE postgres WITH ENCRYPTED PASSWORD 'postgres' LOGIN;
    ALTER ROLE postgres CREATEDB;
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE nestjs_api to postgres;
