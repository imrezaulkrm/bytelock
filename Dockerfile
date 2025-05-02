# Stage 1: Build Stage
FROM node:22.12.0-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Stage 2: Production Stage
FROM node:22.12.0-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]