FROM python:3.11-slim

# Install system dependencies
# - Tesseract OCR: Fallback for document text extraction if Groq VLM fails
# - poppler-utils: PDF processing for pymupdf
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend application
COPY . .

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

# Expose port (documentation only, Cloud Run uses PORT env var)
EXPOSE 8080

# Run with gunicorn for production
# Use wsgi.py which properly imports the Flask app from the modular structure
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 300 wsgi:application
