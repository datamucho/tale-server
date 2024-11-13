# Update to Node.js 18
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your app source inside the Docker image
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Copy audio and ssl directories to the dist folder
COPY audio /app/dist/audio
COPY ssl /app/dist/ssl

# Expose port 8080
EXPOSE 8080

# Optional: Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Define the command to run your app
CMD ["node", "dist/server.js"]
