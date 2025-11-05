# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Create stub for typeorm BEFORE copying source to ensure it's available during build
RUN mkdir -p node_modules/typeorm && \
    echo '{}' > node_modules/typeorm/package.json && \
    echo 'module.exports = {};' > node_modules/typeorm/index.js

# Copy source code
COPY . .

# Set build-time environment variables as ARGs with defaults
ARG VITE_MEDUSA_BACKEND_URL=https://api.designereditions.com
ARG VITE_FEED_URL=https://www.designereditions.com/feed
ARG VITE_FRONT_ADMIN_URL=https://www.designereditions.com/admin
ARG VITE_OPENAI_API_KEY=sk-12342232zpw624ggwejf34917p-z_2
ARG CLOUDINARY_SECRET=N3eYvoknt2zXzfyL-4_IpIyMh3w

# Build the application with environment variables
ENV VITE_MEDUSA_BACKEND_URL=$VITE_MEDUSA_BACKEND_URL
ENV VITE_FEED_URL=$VITE_FEED_URL
ENV VITE_FRONT_ADMIN_URL=$VITE_FRONT_ADMIN_URL
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV CLOUDINARY_SECRET=$CLOUDINARY_SECRET

RUN yarn build

# Production stage - only include built files
FROM node:18-alpine

WORKDIR /app

# Install http-server for serving SPA with proper routing
RUN npm install -g http-server

# Copy built application from builder - vite outputs to 'public' directory by default
COPY --from=builder /app/public ./public
COPY --from=builder /app/static ./static

# Create stub modules for server-side dependencies that got bundled
RUN mkdir -p public/typeorm public/medusa-interfaces && \
    echo 'export default {}; export const Entity = {}; export const Column = {}; export const PrimaryColumn = {};' > public/typeorm/index.js && \
    echo 'export default {};' > public/medusa-interfaces/index.js && \
    # Update index.html to include importmap BEFORE module scripts - map all server-only modules to empty stubs
    sed -i 's|<title>|<script type="importmap">{\"imports\": {\"typeorm\": \"/typeorm/index.js\", \"medusa-interfaces\": \"/medusa-interfaces/index.js\", \"medusa-interfaces/dist/notification-service\": \"/medusa-interfaces/index.js\"}}</script>\n  <title>|' public/index.html

# Expose port 7000 (default dev port)
EXPOSE 7000

# Serve the public directory on port 7000
# Use http-server for proper SPA routing (falls back to index.html for unknown routes)
CMD ["http-server", "public", "-p", "7000", "--cors", "-c-1"]