#!/bin/bash
set -e

# Install necessary tools
apk add --no-cache nodejs npm
npm install -g pnpm@latest prisma@5.22.0

# Create a temporary directory for Prisma files
mkdir -p /tmp/prisma
cp /docker-entrypoint-initdb.d/schema.prisma /tmp/prisma/

# Generate Prisma client and push schema
cd /tmp/prisma
prisma db push --schema=./schema.prisma --skip-generate

# Cleanup
rm -rf /tmp/prisma
