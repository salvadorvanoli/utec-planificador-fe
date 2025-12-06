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
FROM nginx:1.27-alpine AS production

# Metadatos de la imagen
LABEL maintainer="UTEC Planificador Team"
LABEL description="Frontend del Planificador Docente - Angular + NGINX"
LABEL version="1.0.0"
LABEL org.opencontainers.image.title="UTEC Planificador Frontend"
LABEL org.opencontainers.image.description="Interfaz web para el sistema de planificación docente de UTEC"
LABEL org.opencontainers.image.vendor="Universidad Tecnológica del Uruguay"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/salvadorvanoli/utec-planificador-fe"

# Install curl for healthcheck
RUN apk add --no-cache curl

# Note: nginx user already exists in nginx:alpine image (uid=101, gid=101)
# No need to create it again

# Remove default NGINX configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular application from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist/utec-planificador-fe/browser /usr/share/nginx/html

# Copy custom NGINX configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Asegurar permisos correctos
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Cambiar a usuario no-root
USER nginx

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

# Start NGINX in foreground mode
CMD ["nginx", "-g", "daemon off;"]
