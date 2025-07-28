# Dockerfile for React frontend
FROM node:18

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the app
COPY frontend/ ./

# Expose the dev server port
EXPOSE 3000

# Run React app
CMD ["npm", "start"]
