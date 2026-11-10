# -------------------------------------------------------------
# Aarohan AI / Intelligence Service Dockerfile
# -------------------------------------------------------------
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed for psycopg2 and PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --default-timeout=120 --retries=5 --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/
COPY run.py .

# Create uploads directory mount-point
RUN mkdir -p /app/uploads

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

