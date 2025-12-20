#!/bin/bash

################################################################################
# Build Script for Sample Project
# Creates production-ready distribution in _dist/ directory
# Features: Progressive logging, detailed execution tracking, build metrics
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Script version
SCRIPT_VERSION="1.0.0"

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"
DIST_DIR="$PROJECT_ROOT/_dist"
LOG_FILE=""

# Build tracking
BUILD_ID=""
BUILD_START_TIME=""
STEP_NUMBER=0
TOTAL_STEPS=10
declare -a STEP_RESULTS=()
declare -a STEP_DURATIONS=()
declare -a STEP_DETAILS=()

# Metrics
FILES_COPIED=0
DIRS_CREATED=0
TOTAL_SIZE=0

################################################################################
# Logging Functions
################################################################################

init_log_file() {
    BUILD_ID=$(date +%Y%m%d-%H%M%S)
    BUILD_START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create dist directory if it doesn't exist (for log file)
    mkdir -p "$DIST_DIR"
    LOG_FILE="$DIST_DIR/build.log"
    
    # Write log header
    cat > "$LOG_FILE" << EOF
=====================================
SAMPLE PROJECT - BUILD LOG
=====================================
Build ID: $BUILD_ID
Build Script: docker/build.sh v$SCRIPT_VERSION
Started: $BUILD_START_TIME

-------------------------------------
CONFIGURATION
-------------------------------------
Source Directory: $SRC_DIR
Distribution Directory: $DIST_DIR
Components: spa01, spa02, spa03, shared
Host: $(hostname)
User: $(whoami)
OS: $(uname -s)

-------------------------------------
EXECUTION LOG
-------------------------------------
EOF

    log_console "${BLUE}[INFO]${NC} Build log initialized: $LOG_FILE"
}

log_to_file() {
    echo "$1" >> "$LOG_FILE"
}

log_console() {
    echo -e "$1"
}

log_both() {
    local console_msg="$1"
    local file_msg="$2"
    
    log_console "$console_msg"
    log_to_file "$file_msg"
}

get_timestamp() {
    date '+%H:%M:%S'
}

start_step() {
    local step_name="$1"
    STEP_NUMBER=$((STEP_NUMBER + 1))
    STEP_START_TIME=$(date +%s)
    
    local timestamp=$(get_timestamp)
    local console_msg="${BLUE}[STEP $STEP_NUMBER/$TOTAL_STEPS]${NC} $step_name"
    local file_msg="[$timestamp] [STEP $STEP_NUMBER] $step_name"
    
    log_both "$console_msg" "$file_msg"
}

log_info() {
    local message="$1"
    local timestamp=$(get_timestamp)
    local console_msg="  ${CYAN}→${NC} $message"
    local file_msg="[$timestamp] [INFO]   → $message"
    
    log_both "$console_msg" "$file_msg"
}

log_success() {
    local message="$1"
    local timestamp=$(get_timestamp)
    local console_msg="  ${GREEN}✓${NC} $message"
    local file_msg="[$timestamp] [SUCCESS]   ✓ $message"
    
    log_both "$console_msg" "$file_msg"
}

log_warning() {
    local message="$1"
    local timestamp=$(get_timestamp)
    local console_msg="  ${YELLOW}⚠${NC} $message"
    local file_msg="[$timestamp] [WARNING]   ⚠ $message"
    
    log_both "$console_msg" "$file_msg"
}

log_error() {
    local message="$1"
    local timestamp=$(get_timestamp)
    local console_msg="${RED}[ERROR]${NC} $message"
    local file_msg="[$timestamp] [ERROR] $message"
    
    log_both "$console_msg" "$file_msg"
}

end_step() {
    local status="$1"
    local detail="${2:-}"
    
    STEP_END_TIME=$(date +%s)
    STEP_DURATION=$((STEP_END_TIME - STEP_START_TIME))
    
    STEP_RESULTS+=("$status")
    STEP_DURATIONS+=("$STEP_DURATION")
    STEP_DETAILS+=("$detail")
    
    local timestamp=$(get_timestamp)
    if [ "$status" = "SUCCESS" ]; then
        local console_msg="${GREEN}[SUCCESS]${NC} Step $STEP_NUMBER completed (${STEP_DURATION}s)"
        local file_msg="[$timestamp] [SUCCESS] Step $STEP_NUMBER completed (${STEP_DURATION}s)"
    else
        local console_msg="${RED}[FAILED]${NC} Step $STEP_NUMBER failed (${STEP_DURATION}s)"
        local file_msg="[$timestamp] [FAILED] Step $STEP_NUMBER failed (${STEP_DURATION}s)"
    fi
    
    if [ -n "$detail" ]; then
        console_msg="$console_msg - $detail"
        file_msg="$file_msg - $detail"
    fi
    
    log_both "$console_msg" "$file_msg"
    log_to_file ""
}

get_file_size() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$file" 2>/dev/null || echo "0"
    else
        stat -c%s "$file" 2>/dev/null || echo "0"
    fi
}

format_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size}B"
    elif [ $size -lt 1048576 ]; then
        echo "$(awk "BEGIN {printf \"%.1f\", $size/1024}")KB"
    else
        echo "$(awk "BEGIN {printf \"%.1f\", $size/1048576}")MB"
    fi
}

################################################################################
# Validation Functions
################################################################################

validate_source() {
    start_step "Validating source directory..."
    
    log_info "Checking source directory exists"
    if [ ! -d "$SRC_DIR" ]; then
        log_error "Source directory not found: $SRC_DIR"
        end_step "FAILED"
        exit 1
    fi
    log_success "Source directory found"
    
    # Check for required directories
    local required_dirs=("spa01" "spa02" "spa03" "shared")
    for dir in "${required_dirs[@]}"; do
        log_info "Validating $dir directory"
        if [ ! -d "$SRC_DIR/$dir" ]; then
            log_error "Required directory not found: $SRC_DIR/$dir"
            end_step "FAILED"
            exit 1
        fi
        log_success "$dir directory validated"
    done
    
    end_step "SUCCESS" "All source directories validated"
}

################################################################################
# Build Functions
################################################################################

clean_dist() {
    start_step "Cleaning distribution directory..."
    
    if [ -d "$DIST_DIR" ]; then
        log_info "Removing existing _dist directory"
        # Keep the log file
        find "$DIST_DIR" -mindepth 1 ! -name 'build.log' -delete
        log_success "Cleaned existing _dist directory"
    else
        log_info "No existing _dist directory to clean"
    fi
    
    end_step "SUCCESS"
}

create_dist_structure() {
    start_step "Creating distribution structure..."
    
    local dirs=("spa01" "spa02" "spa03" "shared/styles" "shared/js")
    local created=0
    
    for dir in "${dirs[@]}"; do
        log_info "Creating _dist/$dir"
        mkdir -p "$DIST_DIR/$dir"
        log_success "$dir created"
        created=$((created + 1))
        DIRS_CREATED=$((DIRS_CREATED + 1))
    done
    
    end_step "SUCCESS" "$created directories created"
}

copy_shared_files() {
    start_step "Copying shared resources..."
    
    local files_copied=0
    local size_copied=0
    
    # Copy shared CSS
    log_info "Copying variables.css"
    cp "$SRC_DIR/shared/styles/variables.css" "$DIST_DIR/shared/styles/"
    local file_size=$(get_file_size "$DIST_DIR/shared/styles/variables.css")
    log_success "variables.css ($(format_size $file_size))"
    files_copied=$((files_copied + 1))
    size_copied=$((size_copied + file_size))
    
    log_info "Copying common.css"
    cp "$SRC_DIR/shared/styles/common.css" "$DIST_DIR/shared/styles/"
    file_size=$(get_file_size "$DIST_DIR/shared/styles/common.css")
    log_success "common.css ($(format_size $file_size))"
    files_copied=$((files_copied + 1))
    size_copied=$((size_copied + file_size))
    
    # Copy shared JS
    log_info "Copying utils.js"
    cp "$SRC_DIR/shared/js/utils.js" "$DIST_DIR/shared/js/"
    file_size=$(get_file_size "$DIST_DIR/shared/js/utils.js")
    log_success "utils.js ($(format_size $file_size))"
    files_copied=$((files_copied + 1))
    size_copied=$((size_copied + file_size))
    
    FILES_COPIED=$((FILES_COPIED + files_copied))
    TOTAL_SIZE=$((TOTAL_SIZE + size_copied))
    
    end_step "SUCCESS" "$files_copied files copied, $(format_size $size_copied)"
}

copy_spa01() {
    start_step "Building SPA01..."
    
    local files=("spa01.html" "spa01.css" "spa01.js" "spa01.json")
    local files_copied=0
    
    for file in "${files[@]}"; do
        log_info "Copying $file"
        cp "$SRC_DIR/spa01/$file" "$DIST_DIR/spa01/"
        log_success "$file"
        files_copied=$((files_copied + 1))
        FILES_COPIED=$((FILES_COPIED + 1))
    done
    
    end_step "SUCCESS" "$files_copied files copied"
}

copy_spa02() {
    start_step "Building SPA02..."
    
    local files=("spa02.html" "spa02.css" "spa02.js" "spa02.json")
    local files_copied=0
    
    for file in "${files[@]}"; do
        log_info "Copying $file"
        cp "$SRC_DIR/spa02/$file" "$DIST_DIR/spa02/"
        log_success "$file"
        files_copied=$((files_copied + 1))
        FILES_COPIED=$((FILES_COPIED + 1))
    done
    
    end_step "SUCCESS" "$files_copied files copied"
}

copy_spa03() {
    start_step "Building SPA03 (Application Shell)..."
    
    local files=("index.html" "spa03.css" "spa03.js" "spa03.json")
    local files_copied=0
    
    for file in "${files[@]}"; do
        log_info "Copying $file"
        cp "$SRC_DIR/spa03/$file" "$DIST_DIR/spa03/"
        log_success "$file"
        files_copied=$((files_copied + 1))
        FILES_COPIED=$((FILES_COPIED + 1))
    done
    
    log_info "Copying index.html to root"
    cp "$SRC_DIR/spa03/index.html" "$DIST_DIR/index.html"
    log_success "Root index.html created"
    files_copied=$((files_copied + 1))
    FILES_COPIED=$((FILES_COPIED + 1))
    
    end_step "SUCCESS" "$files_copied files copied"
}

create_health_check() {
    start_step "Creating health check endpoint..."
    
    log_info "Generating health.html"
    cat > "$DIST_DIR/health.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Check</title>
</head>
<body>
    <h1>OK</h1>
    <p>Application is running</p>
</body>
</html>
EOF
    log_success "Health check created"
    FILES_COPIED=$((FILES_COPIED + 1))
    
    end_step "SUCCESS"
}

create_404_page() {
    start_step "Creating 404 error page..."
    
    log_info "Generating 404.html"
    cat > "$DIST_DIR/404.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
        }
        h1 {
            font-size: 6rem;
            margin: 0;
        }
        p {
            font-size: 1.5rem;
            margin: 20px 0;
        }
        a {
            color: white;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <p>Page Not Found</p>
        <p><a href="/spa03/">Return to Home</a></p>
    </div>
</body>
</html>
EOF
    log_success "404 page created"
    FILES_COPIED=$((FILES_COPIED + 1))
    
    end_step "SUCCESS"
}

generate_build_info() {
    start_step "Generating build information..."
    
    log_info "Creating build-info.txt"
    cat > "$DIST_DIR/build-info.txt" << EOF
Sample Project - Build Information
===================================

Build ID: $BUILD_ID
Build Date: $BUILD_START_TIME
Build Script: docker/build.sh v$SCRIPT_VERSION
Source Directory: $SRC_DIR
Distribution Directory: $DIST_DIR

Components:
- SPA01: Hello World
- SPA02: Multi-Language
- SPA03: Application Shell
- Shared: Utilities and Styles

Build Statistics:
- Files Copied: $FILES_COPIED
- Directories Created: $DIRS_CREATED
- Total Size: $(format_size $TOTAL_SIZE)

For more information, visit the project repository.
EOF
    log_success "Build info generated"
    
    end_step "SUCCESS"
}

################################################################################
# Summary Functions
################################################################################

write_execution_summary() {
    log_to_file ""
    log_to_file "-------------------------------------"
    log_to_file "EXECUTION SUMMARY"
    log_to_file "-------------------------------------"
    
    local step_names=(
        "Validate source directory"
        "Clean distribution directory"
        "Create distribution structure"
        "Copy shared files"
        "Build SPA01"
        "Build SPA02"
        "Build SPA03 (Application Shell)"
        "Create health check endpoint"
        "Create 404 error page"
        "Generate build information"
    )
    
    for i in "${!STEP_RESULTS[@]}"; do
        local step_num=$((i + 1))
        local status="${STEP_RESULTS[$i]}"
        local duration="${STEP_DURATIONS[$i]}"
        local detail="${STEP_DETAILS[$i]}"
        local name="${step_names[$i]}"
        
        local status_symbol="✓"
        if [ "$status" != "SUCCESS" ]; then
            status_symbol="✗"
        fi
        
        local line=$(printf "[STEP %2d] %s %-45s (%ss) %s" "$step_num" "$status_symbol" "$name" "$duration" "$status")
        if [ -n "$detail" ]; then
            line="$line - $detail"
        fi
        
        log_to_file "$line"
    done
}

write_build_summary() {
    local build_end_time=$(date '+%Y-%m-%d %H:%M:%S')
    local total_duration=$(($(date +%s) - $(date -d "$BUILD_START_TIME" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$BUILD_START_TIME" +%s)))
    
    local successful_steps=0
    local failed_steps=0
    for status in "${STEP_RESULTS[@]}"; do
        if [ "$status" = "SUCCESS" ]; then
            successful_steps=$((successful_steps + 1))
        else
            failed_steps=$((failed_steps + 1))
        fi
    done
    
    local overall_status="SUCCESS"
    if [ $failed_steps -gt 0 ]; then
        overall_status="FAILED"
    fi
    
    log_to_file ""
    log_to_file "-------------------------------------"
    log_to_file "BUILD SUMMARY"
    log_to_file "-------------------------------------"
    log_to_file "Total Duration: ${total_duration}s"
    log_to_file "Steps Completed: ${STEP_NUMBER}/${TOTAL_STEPS}"
    log_to_file "Steps Successful: $successful_steps"
    log_to_file "Steps Failed: $failed_steps"
    log_to_file "Status: $overall_status"
    log_to_file ""
    log_to_file "Files Copied: $FILES_COPIED"
    log_to_file "Directories Created: $DIRS_CREATED"
    log_to_file "Total Size: $(format_size $TOTAL_SIZE)"
    log_to_file ""
    log_to_file "Distribution created in: $DIST_DIR"
    log_to_file ""
    log_to_file "Next Steps:"
    log_to_file "1. Build Docker image: docker-compose build"
    log_to_file "2. Start container: docker-compose up -d"
    log_to_file "3. View application: http://localhost:8080"
    log_to_file "4. View logs: docker-compose logs -f"
    log_to_file "5. Stop container: docker-compose down"
    log_to_file ""
    log_to_file "====================================="
    log_to_file "BUILD COMPLETED $overall_status"
    log_to_file "====================================="
    log_to_file "Finished: $build_end_time"
}

display_console_summary() {
    echo ""
    echo "========================================"
    log_console "${GREEN}Build completed successfully!${NC}"
    echo "========================================"
    echo ""
    echo "Distribution created in: $DIST_DIR"
    echo "Build log saved to: $LOG_FILE"
    echo ""
    echo "Statistics:"
    echo "  - Files copied: $FILES_COPIED"
    echo "  - Directories created: $DIRS_CREATED"
    echo "  - Total size: $(format_size $TOTAL_SIZE)"
    echo ""
    echo "Next steps:"
    echo "  1. Build Docker image:    docker-compose build"
    echo "  2. Start container:       docker-compose up -d"
    echo "  3. View application:      http://localhost:8080"
    echo "  4. View logs:             docker-compose logs -f"
    echo "  5. Stop container:        docker-compose down"
    echo ""
}

################################################################################
# Main Build Process
################################################################################

main() {
    # Initialize logging
    init_log_file
    
    log_console "${BLUE}[INFO]${NC} Starting build process..."
    log_console ""
    
    # Execute build steps
    validate_source
    clean_dist
    create_dist_structure
    copy_shared_files
    copy_spa01
    copy_spa02
    copy_spa03
    create_health_check
    create_404_page
    generate_build_info
    
    # Write summaries to log file
    write_execution_summary
    write_build_summary
    
    # Display console summary
    display_console_summary
}

################################################################################
# Error Handler
################################################################################

error_handler() {
    local line_no=$1
    log_error "Build failed at line $line_no"
    log_to_file ""
    log_to_file "====================================="
    log_to_file "BUILD FAILED"
    log_to_file "====================================="
    log_to_file "Failed at: $(date '+%Y-%m-%d %H:%M:%S')"
    log_to_file "Error line: $line_no"
    exit 1
}

trap 'error_handler ${LINENO}' ERR

################################################################################
# Execute Main
################################################################################

main "$@"
