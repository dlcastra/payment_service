# syntax=docker/dockerfile:1
ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /usr/src/server

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source files
COPY . .
# Copy the .env file
COPY .env .env

# Expose the port the application listens on
EXPOSE 8080

# Use non-root user to run the app
USER node

# Start the application using npx to call locally installed npm-run-all
CMD npm start
