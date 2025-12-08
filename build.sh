#!/usr/bin/env bash
# Build script for Render Web Service

set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Build frontend
cd jira-lite
npm install
npm run build
cd ..

# Copy frontend build to static folder for FastAPI to serve
mkdir -p static
cp -r jira-lite/dist/* static/

# Seed the database with demo data
echo "Seeding database..."
python seed_data.py

echo "Build completed successfully!"
