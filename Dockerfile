# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set build-time environment variables using build secrets
ARG VITE_MEDUSA_BACKEND_URL
ARG VITE_FEED_URL
ARG VITE_FRONT_ADMIN_URL
ARG VITE_OPENAI_API_KEY
ARG CLOUDINARY_SECRET

# Build the application with secrets
RUN --mount=type=secret,id=VITE_MEDUSA_BACKEND_URL \
    --mount=type=secret,id=VITE_FEED_URL \
    --mount=type=secret,id=VITE_FRONT_ADMIN_URL \
    --mount=type=secret,id=VITE_OPENAI_API_KEY \
    --mount=type=secret,id=CLOUDINARY_SECRET \
    VITE_MEDUSA_BACKEND_URL=$(cat /run/secrets/VITE_MEDUSA_BACKEND_URL 2>/dev/null || echo '') \
    VITE_FEED_URL=$(cat /run/secrets/VITE_FEED_URL 2>/dev/null || echo '') \
    VITE_FRONT_ADMIN_URL=$(cat /run/secrets/VITE_FRONT_ADMIN_URL 2>/dev/null || echo '') \
    VITE_OPENAI_API_KEY=$(cat /run/secrets/VITE_OPENAI_API_KEY 2>/dev/null || echo '') \
    CLOUDINARY_SECRET=$(cat /run/secrets/CLOUDINARY_SECRET 2>/dev/null || echo '') \
    yarn build

# Production stage - only include built files
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application from builder
COPY --from=builder /app/public ./public

# Expose port 7000 (default dev port)
EXPOSE 7000

# Start the preview server
CMD ["yarn", "preview", "--host", "0.0.0.0"]