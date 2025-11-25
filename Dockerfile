# =============================================================================
# MULTI-STAGE DOCKERFILE FOR ANGULAR APPLICATION
# =============================================================================
# Stage 1: Build stage - Compile Angular application
# Stage 2: Production stage - Serve with NGINX
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: BUILD
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# This layer is cached if package.json/package-lock.json don't change
COPY package*.json ./

# Install dependencies
# --legacy-peer-deps: Handle peer dependency conflicts
# npm ci: Clean install (faster and more reliable than npm install in CI)
RUN npm ci --legacy-peer-deps

# Copy application source code
COPY . .

# Build Angular application for production
# --configuration production: Optimizations (AOT, minification, tree-shaking)
# Output directory: dist/utec-planificador-fe/browser
RUN npm run build -- --configuration production

# -----------------------------------------------------------------------------
# STAGE 2: PRODUCTION WITH NGINX
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default NGINX configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular application from builder stage
COPY --from=builder /app/dist/utec-planificador-fe/browser /usr/share/nginx/html

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

# Start NGINX in foreground mode
CMD ["nginx", "-g", "daemon off;"]
