#!/bin/bash

# AI Recruiter Screener - Startup Script
# This script sets up and starts the entire application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_header "AI Recruiter Screener - Setup & Start"

# Function to cleanup ports
cleanup_ports() {
    print_msg "Cleaning up ports 3000 and 3001..." "$YELLOW"

    # Kill processes on port 3000 (frontend)
    if lsof -ti:3000 > /dev/null 2>&1; then
        print_msg "Killing process on port 3000..." "$YELLOW"
        kill -9 $(lsof -ti:3000) 2>/dev/null || true
    fi

    # Kill processes on port 3001 (backend)
    if lsof -ti:3001 > /dev/null 2>&1; then
        print_msg "Killing process on port 3001..." "$YELLOW"
        kill -9 $(lsof -ti:3001) 2>/dev/null || true
    fi

    sleep 1
    print_msg "Ports cleaned up!" "$GREEN"
}

# Function to check if PostgreSQL is running
check_postgres() {
    print_msg "Checking PostgreSQL connection..." "$YELLOW"

    if ! command -v psql &> /dev/null; then
        print_msg "PostgreSQL is not installed. Please install PostgreSQL first." "$RED"
        exit 1
    fi

    # Try to connect to PostgreSQL
    if ! psql -U postgres -c '\q' 2>/dev/null; then
        print_msg "Cannot connect to PostgreSQL. Trying to start PostgreSQL..." "$YELLOW"

        # Try to start PostgreSQL (macOS Homebrew)
        if command -v brew &> /dev/null; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        fi

        sleep 3

        if ! psql -U postgres -c '\q' 2>/dev/null; then
            print_msg "Still cannot connect to PostgreSQL." "$RED"
            print_msg "Please start PostgreSQL manually and try again." "$RED"
            print_msg "On macOS: brew services start postgresql" "$YELLOW"
            print_msg "On Linux: sudo systemctl start postgresql" "$YELLOW"
            exit 1
        fi
    fi

    print_msg "PostgreSQL is running!" "$GREEN"
}

# Function to setup database
setup_database() {
    print_msg "Setting up database..." "$YELLOW"

    # Create database if it doesn't exist
    psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ai_recruiter'" | grep -q 1 || \
        psql -U postgres -c "CREATE DATABASE ai_recruiter"

    print_msg "Database 'ai_recruiter' is ready!" "$GREEN"
}

# Function to install backend dependencies
install_backend() {
    print_msg "Installing backend dependencies..." "$YELLOW"
    cd "$SCRIPT_DIR/backend"
    npm install
    print_msg "Backend dependencies installed!" "$GREEN"
}

# Function to install frontend dependencies
install_frontend() {
    print_msg "Installing frontend dependencies..." "$YELLOW"
    cd "$SCRIPT_DIR/frontend"
    npm install
    print_msg "Frontend dependencies installed!" "$GREEN"
}

# Function to setup Prisma and seed database
setup_prisma() {
    print_msg "Setting up Prisma and database schema..." "$YELLOW"
    cd "$SCRIPT_DIR/backend"

    # Generate Prisma client
    npx prisma generate

    # Push schema to database
    npx prisma db push --force-reset

    print_msg "Database schema created!" "$GREEN"
}

# Function to seed database
seed_database() {
    print_msg "Seeding database with sample data (15+ items per feature)..." "$YELLOW"
    cd "$SCRIPT_DIR/backend"

    node prisma/seed.js

    print_msg "Database seeded successfully!" "$GREEN"
}

# Function to start backend
start_backend() {
    print_msg "Starting backend server..." "$YELLOW"
    cd "$SCRIPT_DIR/backend"
    npm run dev &
    BACKEND_PID=$!
    sleep 3

    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_msg "Backend started on http://localhost:3001" "$GREEN"
    else
        print_msg "Failed to start backend!" "$RED"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_msg "Starting frontend server..." "$YELLOW"
    cd "$SCRIPT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!
    sleep 3

    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_msg "Frontend started on http://localhost:3000" "$GREEN"
    else
        print_msg "Failed to start frontend!" "$RED"
        exit 1
    fi
}

# Trap to cleanup on exit
cleanup() {
    print_msg "\nShutting down..." "$YELLOW"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    print_msg "Goodbye!" "$GREEN"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main execution
main() {
    # Cleanup ports first
    cleanup_ports

    # Check PostgreSQL
    check_postgres

    # Setup database
    setup_database

    # Install dependencies
    install_backend
    install_frontend

    # Setup Prisma and seed
    setup_prisma
    seed_database

    print_header "Starting Application"

    # Start servers
    start_backend
    start_frontend

    print_header "Application is Ready!"

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  AI Recruiter Screener is running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}Backend:${NC}  http://localhost:3001"
    echo -e "${BLUE}API:${NC}      http://localhost:3001/api"
    echo ""
    echo -e "${YELLOW}Demo Login Credentials:${NC}"
    echo -e "  Email:    admin@airecruiter.com"
    echo -e "  Password: Admin123!"
    echo ""
    echo -e "${YELLOW}Or click 'Fill Demo Credentials' button on login page${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"
    echo ""

    # Keep the script running
    wait
}

# Run main function
main
