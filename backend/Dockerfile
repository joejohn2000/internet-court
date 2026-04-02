# 1. Base image
FROM python:3.13-slim

# 2. Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 3. System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Python dependencies
COPY requirements/ requirements/
RUN pip install --upgrade pip
RUN pip install -r requirements/prod.txt

# 5. Project code
COPY . .

# 6. Entrypoint configuration
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
