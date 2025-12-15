# Use an official Python runtime as a parent image
FROM python:3.9-slim

# 1. Set the working directory in the container
WORKDIR /app

# 2. Copy the dependencies file to the working directory
COPY requirements.txt .

# 3. Install Python packages (including google-cloud-vision)
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of the backend code
COPY . .

# 5. Make port 5000 available to the world outside this container
EXPOSE 5000

# 6. Define environment variable for Flask
# IMPORTANT: If your main file is named 'app.py', change this to 'app.py'
ENV FLASK_APP=run.py

# 7. Run the application
# IMPORTANT: If your file is 'app.py' and the Flask variable is 'app', change to "app:app"
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]