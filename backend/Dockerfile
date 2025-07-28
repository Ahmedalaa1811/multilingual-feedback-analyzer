# Dockerfile for FastAPI backend
FROM python:3.11-slim

WORKDIR /app

# Install curl and bash (needed for wait-for-it)
RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy wait-for-it.sh
RUN curl -o /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Copy application code
COPY backend/ ./

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Replace CMD with wait-for-it wrapper
CMD ["/wait-for-it.sh", "feedback-db:5432", "--timeout=30", "--strict", "--", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
