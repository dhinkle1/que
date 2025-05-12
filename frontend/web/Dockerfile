# Frontend Dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Expose development port
EXPOSE 51889

# Use polling to watch files
ENV CHOKIDAR_USEPOLLING=true

# Start the development server
CMD ["npm", "run", "dev"]
