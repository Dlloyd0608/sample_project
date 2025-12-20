# Docker Guide - Sample Project

Comprehensive guide for building, running, and deploying the Sample Project using Docker.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Build Process](#build-process)
4. [Docker Commands](#docker-commands)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)
8. [Advanced Usage](#advanced-usage)

---

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher
- **Bash**: For running build scripts (Git Bash on Windows)

### Installation

#### macOS
```bash
brew install docker docker-compose
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

#### Windows
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Verify Installation
```bash
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Build the Distribution

```bash
# Make build script executable
chmod +x docker/build.sh

# Run build script
./docker/build.sh
```

This creates a production-ready distribution in the `_dist/` directory.

### 2. Build Docker Image

```bash
docker-compose build
```

### 3. Start the Application

```bash
docker-compose up -d
```

### 4. Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### 5. View Logs

```bash
docker-compose logs -f
```

### 6. Stop the Application

```bash
docker-compose down
```

---

## Build Process

### Build Script Overview

The `docker/build.sh` script performs the following steps:

1. **Validates** source directory structure
2. **Cleans** existing `_dist/` directory
3. **Creates** distribution structure
4. **Copies** all SPA files (spa01, spa02, spa03)
5. **Copies** shared resources (CSS, JS)
6. **Generates** health check and error pages
7. **Creates** build information file

### Manual Build

If you prefer to build manually:

```bash
# Clean distribution
rm -rf _dist/

# Create structure
mkdir -p _dist/{spa01,spa02,spa03,shared/{styles,js}}

# Copy files
cp -r src/spa01/* _dist/spa01/
cp -r src/spa02/* _dist/spa02/
cp -r src/spa03/* _dist/spa03/
cp -r src/shared/styles/* _dist/shared/styles/
cp -r src/shared/js/* _dist/shared/js/

# Copy entry point
cp src/spa03/index.html _dist/index.html
```

### Build Output

The `_dist/` directory structure:

```
_dist/
├── index.html              # Application entry point
├── health.html            # Health check endpoint
├── 404.html               # Error page
├── build-info.txt         # Build metadata
├── spa01/
│   ├── spa01.html
│   ├── spa01.css
│   ├── spa01.js
│   └── spa01.json
├── spa02/
│   ├── spa02.html
│   ├── spa02.css
│   ├── spa02.js
│   └── spa02.json
├── spa03/
│   ├── index.html
│   ├── spa03.css
│   ├── spa03.js
│   └── spa03.json
└── shared/
    ├── styles/
    │   ├── variables.css
    │   └── common.css
    └── js/
        └── utils.js
```

---

## Docker Commands

### Build Commands

```bash
# Build with default settings
docker-compose build

# Build with no cache
docker-compose build --no-cache

# Build and start
docker-compose up --build
```

### Run Commands

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up web
```

### Management Commands

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Restart containers
docker-compose restart

# View running containers
docker-compose ps
```

### Log Commands

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web

# View last 100 lines
docker-compose logs --tail=100
```

### Inspection Commands

```bash
# Inspect container
docker inspect sample-project-web

# View container stats
docker stats sample-project-web

# Execute command in container
docker-compose exec web sh

# View nginx configuration
docker-compose exec web cat /etc/nginx/nginx.conf
```

---

## Configuration

### Environment Variables

Edit `docker-compose.yml` to configure:

```yaml
environment:
  - NGINX_HOST=localhost
  - NGINX_PORT=80
```

### Port Mapping

Change the host port in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

### Resource Limits

Adjust CPU and memory limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'      # 50% of 1 CPU
      memory: 256M     # 256 MB RAM
    reservations:
      cpus: '0.25'     # 25% of 1 CPU
      memory: 128M     # 128 MB RAM
```

### Volume Mounts (Development)

For live reload during development, uncomment in `docker-compose.yml`:

```yaml
volumes:
  - ./_dist:/usr/share/nginx/html:ro
```

### Nginx Configuration

Custom nginx settings are in `docker/nginx.conf`. Key configurations:

- **Gzip compression**: Enabled for text files
- **Security headers**: XSS protection, CSP, frame options
- **Caching**: 1 year for static assets, no cache for HTML
- **SPA routing**: Fallback to index.html for all routes

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Find process using port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or change port in docker-compose.yml
```

#### 2. Build Script Permission Denied

**Error**: `Permission denied: ./docker/build.sh`

**Solution**:
```bash
chmod +x docker/build.sh
chmod +x scripts/build.sh
```

#### 3. Container Won't Start

**Check logs**:
```bash
docker-compose logs web
```

**Common causes**:
- Missing `_dist/` directory (run build script first)
- Port conflict
- Insufficient Docker resources

#### 4. Health Check Failing

**Verify health check**:
```bash
docker-compose ps
curl http://localhost:8080/health
```

**Check nginx logs**:
```bash
docker-compose exec web cat /var/log/nginx/error.log
```

#### 5. Files Not Updating

**Rebuild and restart**:
```bash
./docker/build.sh
docker-compose up --build
```

### Debug Mode

Run container with shell access:

```bash
docker-compose exec web sh
```

Inside container:
```bash
# Check nginx process
ps aux | grep nginx

# Test nginx configuration
nginx -t

# View file permissions
ls -la /usr/share/nginx/html

# Test application files
curl http://localhost/
```

---

## Production Deployment

### Security Considerations

1. **Update Base Image**
   ```dockerfile
   FROM nginx:alpine
   # Keep updated: docker pull nginx:alpine
   ```

2. **Use Non-Root User** (Already configured)
   ```dockerfile
   USER appuser
   ```

3. **Enable HTTPS**
   - Use reverse proxy (nginx, Traefik, HAProxy)
   - Add SSL certificates
   - Update nginx.conf for HTTPS redirect

4. **Environment Variables**
   - Use `.env` file for secrets
   - Never commit `.env` to git

5. **Resource Limits**
   - Set appropriate CPU/memory limits
   - Monitor resource usage

### CI/CD Integration

#### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build distribution
        run: ./docker/build.sh
      
      - name: Build Docker image
        run: docker-compose build
      
      - name: Push to registry
        run: |
          docker tag sample-project-web:latest your-registry/sample-project:latest
          docker push your-registry/sample-project:latest
```

### Docker Registry

Push to Docker Hub or private registry:

```bash
# Tag image
docker tag sample-project-web:latest username/sample-project:1.0.0

# Login to Docker Hub
docker login

# Push image
docker push username/sample-project:1.0.0

# Pull and run on server
docker pull username/sample-project:1.0.0
docker run -d -p 8080:80 username/sample-project:1.0.0
```

### Production Checklist

- [ ] Update base image to latest version
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure automatic backups
- [ ] Test health checks
- [ ] Set up log rotation
- [ ] Configure resource limits
- [ ] Enable auto-restart policies
- [ ] Document deployment procedures

---

## Advanced Usage

### Multi-Stage Builds

For future optimization, modify Dockerfile:

```dockerfile
# Build stage
FROM node:alpine AS builder
WORKDIR /app
COPY src/ .
RUN npm install && npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Docker Secrets

For sensitive data:

```bash
# Create secret
echo "my-secret-value" | docker secret create my-secret -

# Use in docker-compose.yml
secrets:
  my-secret:
    external: true
```

### Custom Networks

Create isolated networks:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### Monitoring

Add monitoring stack:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose Reference**: https://docs.docker.com/compose/compose-file/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker-compose logs -f`
3. Open an issue in the project repository

---

**Last Updated**: December 2024  
**Version**: 1.0.0
