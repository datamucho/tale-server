# Use the official Node.js 16 image as a parent image
FROM node:16

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

# Define the command to run your app
CMD ["node", "dist/server.js"]
