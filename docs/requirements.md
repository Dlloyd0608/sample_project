# Requirements Specification

## SPA01: Hello World Simple

### Functional Requirements
- Display "Hello World" message
- Clean, centered layout
- Responsive design
- Single HTML file (self-contained)

### Technical Requirements
- Pure HTML/CSS/JavaScript
- No external dependencies
- Works in modern browsers
- File: `src/spa01/index.html`

## SPA02: Hello World Multi-Language

### Functional Requirements
- Display "Hello World" in user-selected language
- Dropdown/selector for language choice
- Support 20+ languages including:
  - **Single-byte:** English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Polish, Czech
  - **Double-byte:** Japanese (日本語), Chinese Simplified (简体中文), Chinese Traditional (繁體中文), Korean (한국어), Arabic (العربية), Hebrew (עברית), Thai (ไทย), Hindi (हिंदी), Russian (Русский), Greek (Ελληνικά)
- Persist language selection (localStorage)
- Clean, centered layout
- Responsive design
- add a slider control (min = 1.0, max = 5.0) seconds, default 1.5 seconds
- on load, automatically cycle through all 20 languages at the specified time delay interval (from the slider control)

### Technical Requirements
- Pure HTML/CSS/JavaScript
- Proper UTF-8 encoding
- Right-to-left (RTL) support for Arabic/Hebrew
- No external dependencies
- Single HTML file (self-contained)
- File: `src/spa02/index.html`

### Language Translations
"Hello World" in each language:
- English: Hello World
- Spanish: Hola Mundo
- French: Bonjour le Monde
- German: Hallo Welt
- Italian: Ciao Mondo
- Portuguese: Olá Mundo
- Dutch: Hallo Wereld
- Swedish: Hej Världen
- Polish: Witaj Świecie
- Czech: Ahoj Světe
- Japanese: こんにちは世界
- Chinese (Simplified): 你好世界
- Chinese (Traditional): 你好世界
- Korean: 안녕하세요 세계
- Arabic: مرحبا بالعالم
- Hebrew: שלום עולם
- Thai: สวัสดีชาวโลก
- Hindi: नमस्ते दुनिया
- Russian: Привет мир
- Greek: Γεια σου Κόσμε

## SPA03: Application Shell

### Purpose
Unified application providing navigation between SPA01 and SPA02 through a sidebar menu.

### Functional Requirements
- Sidebar navigation menu with links to:
  - SPA01: Hello World Simple
  - SPA02: Hello World Multi-Language
- Click menu item to load corresponding SPA in main content area
- Responsive layout (sidebar + content area)
- Clean, professional design matching SPA01/02 aesthetic
- Highlight active menu item

### Technical Requirements
- **File Structure:**
  - `src/spa03/index.html` - Main application shell
  - `src/spa03/spa03.css` - Shell-specific styles
  - `src/spa03/spa03.js` - Navigation and routing logic
  - `src/shared/styles/common.css` - Shared styles across all SPAs
  - `src/shared/js/utils.js` - Shared JavaScript utilities

- **Code Organization:**
  - Separate HTML, CSS, and JavaScript files
  - Extract common styles to `shared/styles/common.css`
  - Extract reusable functions to `shared/js/utils.js`
  - Link shared resources in all SPA HTML files

- **Navigation Approach:**
  - iframe-based embedding OR
  - Dynamic content loading (fetch HTML)
  - Maintain SPA isolation

- **Shared Resources:**
  - CSS variables for colors, fonts, spacing
  - Common layout styles (centering, responsive)
  - Utility functions (localStorage helpers, DOM utilities)

### Technical Details

**Sidebar Menu Structure:**
```html
<nav class="sidebar">
  <ul>
    <li><a href="#spa01" class="nav-link">Hello World</a></li>
    <li><a href="#spa02" class="nav-link">Multi-Language</a></li>
  </ul>
</nav>
<main class="content">
  <!-- SPA content loads here -->
</main>
```

**Shared CSS Variables (common.css):**
```css
:root {
  --primary-color: #your-color;
  --background: #your-bg;
  --text-color: #your-text;
  --border-radius: 8px;
  --spacing-unit: 1rem;
}
```

**Shared Utilities (utils.js):**
```javascript
// localStorage helpers
const storage = {
  get: (key) => { ... },
  set: (key, value) => { ... }
};

// DOM utilities
const dom = {
  select: (selector) => { ... },
  create: (tag, attrs) => { ... }
};
```

---

## Docker Orchestration

### Purpose
Automate the build process from source files (`/src`) to runtime files (`/_dist`) for consistent deployment.

### Requirements
- Docker container for build environment
- Build script to:
  - Process source files
  - Copy/compile to `/_dist` folder
  - Handle file concatenation if needed
- Single command deployment: `docker-compose up --build`
- macOS compatibility

### Docker Setup
**Files Required:**
- `docker/Dockerfile` - Container definition
- `docker/docker-compose.yml` - Orchestration config
- `docker/build.sh` - Build automation script
- `.dockerignore` - Exclude unnecessary files

**Build Process:**
1. Copy `/src` files to container
2. Process/compile as needed (currently just copy)
3. Output to `/_dist` folder
4. Serve via simple HTTP server for testing

**Commands:**
```bash
# Build and deploy
docker-compose up --build

# Just build
docker-compose run build

# Clean
docker-compose down
```

### Future Enhancements
- CSS minification
- JavaScript bundling/minification
- Asset optimization
- Environment-specific builds (dev/prod)
