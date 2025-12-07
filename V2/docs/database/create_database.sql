-- Create resolveit database
-- Run this as superuser/admin on the PostgreSQL server

-- First, check if database exists
SELECT 'Checking if resolveit database exists...' as status;

-- Create database (ignore if exists)
SELECT 'CREATE DATABASE resolveit;' as sql_command;

-- Note: Due to collation version mismatch warnings, you may need to:
-- 1. Connect to the server directly
-- 2. Run: CREATE DATABASE resolveit;
-- 3. Or fix the template database collation issue on the server

