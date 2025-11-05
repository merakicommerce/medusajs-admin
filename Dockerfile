FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN yarn install --frozen-lockfile

# Create stub for typeorm before build
RUN mkdir -p node_modules/typeorm && \
    echo '{}' > node_modules/typeorm/package.json && \
    echo 'module.exports = {};' > node_modules/typeorm/index.js

# Build arguments (can be overridden with --build-arg)
ARG VITE_MEDUSA_BACKEND_URL
ARG VITE_FEED_URL
ARG VITE_FRONT_ADMIN_URL
ARG VITE_OPENAI_API_KEY
ARG CLOUDINARY_SECRET

# Build the app with environment variables
RUN VITE_MEDUSA_BACKEND_URL=${VITE_MEDUSA_BACKEND_URL} \
    VITE_FEED_URL=${VITE_FEED_URL} \
    VITE_FRONT_ADMIN_URL=${VITE_FRONT_ADMIN_URL} \
    VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY} \
    CLOUDINARY_SECRET=${CLOUDINARY_SECRET} \
    yarn build

# Install http server
RUN npm install -g http-server

# Create module stubs for browser
RUN mkdir -p public/typeorm public/medusa-interfaces && \
    echo 'export default {};' > public/typeorm/index.js && \
    echo 'export default {};' > public/medusa-interfaces/index.js

# Add importmap to HTML
RUN sed -i 's|<title>|<script type="importmap">{"imports": {"typeorm": "/typeorm/index.js", "medusa-interfaces": "/medusa-interfaces/index.js", "medusa-interfaces/dist/notification-service": "/medusa-interfaces/index.js"}}</script>\n  <title>|' public/index.html

# Expose port 7000
EXPOSE 7000

# Serve the app
CMD ["http-server", "public", "-p", "7000"]
