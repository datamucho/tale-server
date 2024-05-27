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

# Since the audio directory is outside of src and not included in the dist build,
# copy it explicitly to where it should be accessible according to your server setup.
# If your Express app expects it to be under /app/audio, you're doing it right here.
# Adjust if necessary based on your actual path requirements.

# Compile TypeScript to JavaScript
RUN npm run build

COPY audio /app/dist/audio
COPY ssl /app/dist/ssl

# Your app binds to port 8080 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 8080

# Define the command to run your app using CMD which defines your runtime
CMD ["node", "dist/server.js"]
