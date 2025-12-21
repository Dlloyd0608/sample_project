# Sample Project - Multi-Language SPA Application

A collection of Single Page Applications (SPAs) demonstrating modern web development practices, multi-language support, and Docker deployment.

## 🌟 Features

- **SPA01**: Simple Hello World application
- **SPA02**: Multi-language support with 20+ languages
- **SPA03**: Application shell with navigation
- **Dynamic Content Loading**: JSON-based metadata system
- **Docker Support**: Containerized deployment
- **Responsive Design**: Mobile-first approach
- **Modern Architecture**: Vanilla JavaScript, no frameworks

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (recommended)
- OR a web server (nginx, Apache, or simple HTTP server)
- Bash shell (for build scripts)

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/sample_project.git
cd sample_project

# 2. Build the distribution
chmod +x docker/build.sh
./docker/build.sh

# 3. Build and start Docker container
docker-compose up --build -d

# 4. Access the application
open http://localhost:8080
```

### Option 2: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/sample_project.git
cd sample_project

# 2. Build the distribution
chmod +x scripts/build.sh
./scripts/build.sh

# 3. Serve the _dist directory
cd _dist
python3 -m http.server 8080

# 4. Access the application
open http://localhost:8080
```

---

## 📁 Project Structure

```
sample_project/
├── src/                          # Source files
│   ├── spa01/                   # Hello World SPA
│   │   ├── spa01.html
│   │   ├── spa01.css
│   │   ├── spa01.js
│   │   └── spa01.json          # Metadata
│   ├── spa02/                   # Multi-Language SPA
│   │   ├── spa02.html
│   │   ├── spa02.css
│   │   ├── spa02.js
│   │   └── spa02.json          # Translations & metadata
│   ├── spa03/                   # Application Shell
│   │   ├── index.html
│   │   ├── spa03.css
│   │   ├── spa03.js
│   │   └── spa03.json          # Navigation & metadata
│   └── shared/                  # Shared resources
│       ├── styles/
│       │   ├── variables.css
│       │   └── common.css
│       └── js/
│           └── utils.js
│
├── _dist/                       # Built distribution (generated)
│
├── docker/                      # Docker configuration
│   ├── build.sh                # Build script
│   └── nginx.conf              # Nginx configuration
│
├── scripts/                     # Build scripts
│   └── build.sh                # Local build script
│
├── docs/                        # Documentation
│   ├── requirements.md
│   ├── docker_guide.md
│   └── session_log.md
│
├── Dockerfile                   # Docker image definition
├── docker-compose.yml          # Docker orchestration
├── .dockerignore               # Docker ignore rules
└── README.md                   # This file
```

---

## 💻 Development

### Running Locally

#### Using Python

```bash
# Build distribution
./scripts/build.sh

# Serve with Python
cd _dist
python3 -m http.server 8080
```

#### Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Build and serve
./scripts/build.sh
cd _dist
http-server -p 8080
```

#### Using PHP

```bash
./scripts/build.sh
cd _dist
php -S localhost:8080
```

### Making Changes

1. Edit source files in `src/` directory
2. Run build script: `./scripts/build.sh` or `./docker/build.sh`
3. If using Docker: `docker-compose up --build`
4. Refresh browser to see changes

### Metadata Files

Content is loaded dynamically from JSON files:

- **spa01.json**: Content for Hello World SPA
- **spa02.json**: Translations and UI labels
- **spa03.json**: Navigation items and messages

Edit these files to change content without modifying JavaScript.

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build distribution
./docker/build.sh

# Build Docker image
docker-compose build

# Start container (detached)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Docker Commands

```bash
# Rebuild and restart
docker-compose up --build

# Check container status
docker-compose ps

# Execute commands in container
docker-compose exec web sh

# View nginx configuration
docker-compose exec web cat /etc/nginx/nginx.conf
```

### Configuration

Edit `docker-compose.yml` to customize:

- **Port mapping**: Change `8080:80` to your preferred port
- **Resource limits**: Adjust CPU and memory
- **Environment variables**: Add custom configuration

See [docker_guide.md](docs/docker_guide.md) for detailed documentation.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[requirements.md](docs/requirements.md)**: Project requirements and specifications
- **[docker_guide.md](docs/docker_guide.md)**: Complete Docker deployment guide
- **[session_log.md](docs/session_log.md)**: Development session notes

---

## 🏗️ Architecture

### SPAs Overview

#### SPA01 - Hello World
- Simple, minimal design
- Demonstrates basic structure
- Single language (English)
- Dynamic content loading from JSON

#### SPA02 - Multi-Language
- 20+ language support
- Auto-cycling through languages
- Adjustable cycle speed
- RTL language support (Arabic, Hebrew)
- Persistent preferences using localStorage

#### SPA03 - Application Shell
- Navigation between SPAs
- Hash-based routing
- iframe content loading
- Mobile-responsive sidebar
- Error handling and loading states

### Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, flexbox, grid
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Docker**: Containerization
- **Nginx**: Web server

### Key Features

- **No Dependencies**: Pure vanilla JavaScript
- **Modular Architecture**: Shared utilities and styles
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels, keyboard navigation
- **Security**: CSP headers, XSS protection
- **Performance**: Gzip compression, caching

---

## 🛠️ Build Process

The build script (`docker/build.sh` or `scripts/build.sh`) performs:

1. **Validates** source directory structure
2. **Cleans** existing `_dist/` directory  
3. **Creates** distribution directory structure
4. **Copies** all SPA files with metadata
5. **Copies** shared resources (CSS, JS)
6. **Generates** health check endpoint
7. **Creates** 404 error page
8. **Generates** build information file

### Build Output

The `_dist/` directory contains a production-ready build:

- All HTML, CSS, JS files
- JSON metadata files
- Health check endpoint
- Custom error pages
- Build information

---

## 🧪 Testing

### Manual Testing

1. **SPA01**: Verify Hello World displays correctly
2. **SPA02**: Test language switching and auto-cycling
3. **SPA03**: Test navigation between SPAs
4. **Responsive**: Test on different screen sizes
5. **Browser**: Test on Chrome, Firefox, Safari, Edge

### Health Check

```bash
# Check application health
curl http://localhost:8080/health

# Should return:
# healthy
```

---

## 🔒 Security

### Implemented Security Measures

- **Non-root user**: Container runs as `appuser`
- **Security headers**: XSS, CSP, frame options
- **Input sanitization**: Safe DOM manipulation
- **HTTPS ready**: Configure reverse proxy for SSL
- **No CDN dependencies**: All resources self-hosted

### Best Practices

- Keep Docker base images updated
- Regular security audits
- Use HTTPS in production
- Set appropriate CORS policies
- Monitor application logs

---

## 🚀 Deployment

### Local Development
```bash
./scripts/build.sh
cd _dist && python3 -m http.server 8080
```

### Docker (Staging/Production)
```bash
./docker/build.sh
docker-compose up -d
```

### Manual Deployment
1. Run build script
2. Copy `_dist/` contents to web server
3. Configure web server (nginx, Apache)
4. Ensure proper permissions
5. Test application

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines

- Follow existing code style
- Update documentation as needed
- Test on multiple browsers
- Ensure Docker build succeeds
- Update metadata files for content changes

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📧 Contact

For questions, issues, or suggestions:

- **Issues**: GitHub Issues
- **Email**: your-email@example.com
- **Documentation**: See `docs/` directory

---

## 🙏 Acknowledgments

- Built with vanilla JavaScript, HTML5, and CSS3
- Containerized with Docker and Nginx
- Inspired by modern SPA architectures

---

## 📊 Project Status

- ✅ SPA01 - Complete
- ✅ SPA02 - Complete  
- ✅ SPA03 - Complete
- ✅ Dynamic Content Loading - Complete
- ✅ Docker Integration - Complete
- 🚧 CI/CD Pipeline - Planned
- 🚧 Automated Testing - Planned

---

**Version**: 1.0.0  
**Last Updated**: December 2024

<!-- 21-Dec-2025: trigger build-and-deploy workflow -->

