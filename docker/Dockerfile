# Multi-stage build for Sample Project
# Stage 1: Build stage (optional for future enhancements)
FROM nginx:alpine AS base

# Metadata
LABEL maintainer="Sample Project Team"
LABEL description="Multi-Language SPA Application"
LABEL version="1.0.0"

# Stage 2: Production stage
FROM nginx:alpine

# Install required packages
RUN apk add --no-cache \
    bash \
    curl

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Create necessary directories
RUN mkdir -p /usr/share/nginx/html && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d

# Create nginx PID directory and set permissions
RUN touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built application files from _dist directory
COPY --chown=appuser:appuser _dist/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Switch to non-root user
USER appuser

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
