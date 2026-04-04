#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment..."

# Collect static files
python manage.py collectstatic --no-input

# Ensure migrations are up to date
python manage.py migrate --no-input

# ONLY run seeding if requested or if DB is fresh
# (You can remove the line below once your production PostgreSQL is set up)
python manage.py seed_data || true

echo "Starting Gunicorn server..."
# Start the production server
# Render uses the $PORT environment variable, so we bind to it
exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}
