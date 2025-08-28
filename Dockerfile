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

# Set build-time environment variables
ARG MEDUSA_BACKEND_URL
ARG VITE_FEED_URL  
ARG VITE_FRONT_ADMIN_URL

# Make build args available as environment variables
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL
ENV VITE_FEED_URL=$VITE_FEED_URL
ENV VITE_FRONT_ADMIN_URL=$VITE_FRONT_ADMIN_URL

# Debug: Show environment variables during build
RUN echo "🐛 Build-time environment variables:" && \
    echo "MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL" && \
    echo "VITE_FEED_URL=$VITE_FEED_URL" && \
    echo "VITE_FRONT_ADMIN_URL=$VITE_FRONT_ADMIN_URL"

# Build the application
RUN yarn build

# Expose port 7000 (default dev port)
EXPOSE 7000

# Start the preview server
CMD ["yarn", "preview", "--host", "0.0.0.0"]