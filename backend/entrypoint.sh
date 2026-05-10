#!/bin/bash

set -e

echo "Starting deployment..."

python manage.py collectstatic --no-input
python manage.py migrate --no-input

python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', '@Ab12345')
    print('Admin created')
else:
    print('Admin already exists')
"

echo "Starting Gunicorn server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}