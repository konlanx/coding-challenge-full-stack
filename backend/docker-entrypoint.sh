#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma db push

echo "Seeding database..."
yarn db:seed

echo "Starting server..."
exec npx tsx dist/server.js
