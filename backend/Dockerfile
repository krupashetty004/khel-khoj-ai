FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (temporary fix for out-of-sync package-lock.json)
RUN npm install --omit=dev

# Copy application source
COPY . .

# Create required directories
RUN mkdir -p /uploads /artifacts

# Expose application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
