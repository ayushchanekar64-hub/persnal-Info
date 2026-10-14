FROM python:3.11-slim

# Install system compilers: GCC, G++, OpenJDK, Node.js for Code Studio Sandbox
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    default-jdk \
    nodejs \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend ./backend

ENV PYTHONPATH=/app
ENV PORT=8000

EXPOSE 8000

# Support dynamic Render PORT assignment
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
