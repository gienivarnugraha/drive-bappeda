# syntax=docker/dockerfile:1
# Use a base image with Python 3.x on Alpine for a small footprint
FROM python:3.11-alpine

# Environment settings
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /python

# Copy only the requirements file first to utilize build cache
COPY requirements.txt .

# Install dependencies in a single RUN command to minimize image size.
# This sequence installs build tools, installs the packages, and then removes the build tools.
RUN apk update
    # 1. Install necessary build dependencies (gcc, make, python headers)
RUN apk add --no-cache build-base python3-dev 
    # 2. Upgrade pip
# RUN pip install --upgrade pip
    # 3. Install Python dependencies
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt 
    # 4. Remove the build dependencies (keeping the final image slim)
RUN apk del build-base python3-dev
    # 5. Clean up apk cache
RUN rm -rf /var/cache/apk/*

# Copy the rest of your Python application code
# (Assuming you have a separate Python application that uses these dependencies)
# COPY your_python_service.py .

# Define the command to run your Python application/service
CMD ["python", "app.py"]