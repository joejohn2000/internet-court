#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment..."

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate

# Optionally seed development data (ignoring errors if it fails)
python manage.py seed_data || true

echo "Starting Gunicorn server..."
# Start the production server
# Render uses the $PORT environment variable, so we bind to it
exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}
