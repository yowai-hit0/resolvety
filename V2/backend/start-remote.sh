#!/bin/bash
# Start backend with remote database connection
export DATABASE_URL="postgresql://devslab_admin:devslab_secure_password_2024@159.198.65.38:5433/resolveit_db"
export PORT=3000
export NODE_ENV=development
export JWT_SECRET="local-dev-secret-key-change-in-production"
export JWT_EXPIRES_IN="24h"
export CORS_ORIGIN="http://localhost:3001"

npm run start:dev
