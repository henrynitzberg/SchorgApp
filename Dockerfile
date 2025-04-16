FROM python:3.11-slim
WORKDIR .

# Install FastAPI CLI and your dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your app files
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Run the dev server
CMD ["fastapi", "run", "backend/app.py", "--port", "8000"]