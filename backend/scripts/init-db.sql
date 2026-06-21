-- EcoSphere AI - Database Initialization Script
-- Creates required extensions for PostgreSQL

-- UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgvector for embeddings (RAG/similarity search)
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- Full text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Timestamp functions
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ecosphere_ai TO postgres;
