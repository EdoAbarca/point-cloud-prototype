# ==============================
# Dockerfile.dev
# Development build for Django + Open3D
# ==============================

FROM python:3.9-slim

# Set environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create and set working directory
WORKDIR /app

# Install system dependencies for Open3D and Django tooling
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first (for caching)
COPY pyproject.toml requirements.txt ./

# Install Python dependencies (including dev extras)
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -e ".[dev]"

# Copy the full project
COPY . .

# Expose Django default port
EXPOSE 8000

# Run Django development server with autoreload
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
