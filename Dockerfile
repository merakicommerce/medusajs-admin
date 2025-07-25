# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose port 7000 (default dev port)
EXPOSE 7000

# Start the preview server
CMD ["yarn", "preview", "--host", "0.0.0.0"]