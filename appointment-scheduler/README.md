# Appointment Scheduler

A modern appointment scheduling web application built with **HTML, CSS, JavaScript, C++, and SQL (SQLite)**.

## Features

- **📅 Appointment Management** - Create, read, update, and delete appointments
- **🔍 Search & Filter** - Find appointments by title, description, or status
- **🎨 Visual Status Badges** - Color-coded status indicators (Confirmed, Pending, Cancelled, Completed)
- **🎨 Custom Colors** - Each appointment can have its own accent color
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔔 Toast Notifications** - Feedback for all user actions
- **⚡ Keyboard Shortcuts** - Press `Ctrl+N` to create a new appointment, `Esc` to close modals

## Project Structure

```
appointment-scheduler/
├── server.cpp              # C++ HTTP server (thread-per-client)
├── database.cpp            # SQLite database operations
├── database.h              # Database header file
├── CMakeLists.txt          # CMake build configuration
├── build.bat               # Windows build script
├── public/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # All styling
│   └── app.js              # Frontend application logic
└── appointments.db         # SQLite database (created at runtime)
```

## Technology Stack

| Layer   | Technology      | Purpose                    |
|---------|-----------------|----------------------------|
| Frontend| HTML, CSS, JS   | User interface and client logic |
| Backend | C++ (Socket API)| HTTP server with REST API  |
| Database| SQLite          | Persistent appointment storage |

## Prerequisites

### For Building the C++ Server

1. **C++ Compiler** - GCC (MinGW-w64) or Clang
   - Download: https://www.mingw-w64.org/downloads/
   - Ensure `g++` is in your system PATH

2. **SQLite3 Development Library**
   - Ubuntu/Debian: `sudo apt-get install libsqlite3-dev`
   - macOS: `brew install sqlite3`
   - Windows: Install SQLite3 via vcpkg or pre-built binaries

## Building

### Using the Build Script (Windows)

```cmd
cd appointment-scheduler
build.bat
```

### Using CMake (Cross-platform)

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

### Using Direct Compiler Command

```bash
g++ -std=c++17 -O2 -o appointment-scheduler server.cpp database.cpp -lsqlite3 -lpthread
```

## Running

```bash
# Default port 8080
./appointment-scheduler

# Custom port
./appointment-scheduler 3000
```

Open your browser and navigate to:
- **http://localhost:8080** (or the port you specified)

## API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Serve the main HTML page |
| GET | `/api/appointments` | List all appointments (optionally filter by status or search) |
| POST | `/api/appointments` | Create a new appointment |
| PUT | `/api/appointments/:id` | Update an existing appointment |
| DELETE | `/api/appointments/:id` | Delete an appointment |
| GET | `/api/menu` | Get navigation menu items |

### Appointment Object

```json
{
  "id": 1,
  "title": "Team Meeting",
  "description": "Weekly sync",
  "start_time": "2026-10-08 09:00:00",
  "end_time": "2026-10-08 09:30:00",
  "user_id": "1",
  "color": "#4f46e5",
  "status": "pending",
  "created_at": "2026-10-08 10:30:00"
}
```

### POST /api/appointments Request Body

```
title=Team Meeting&description=Weekly+sync&start_time=2026-10-08+09%3A00&end_time=2026-10-08+09%3A30&user_id=1&color=%234f46e5
```

### URL Query Parameters

- `?status=pending` - Filter by status
- `?q=meeting` - Search by title or description

## Data Model

### appointments Table

| Column       | Type         | Description                        |
|--------------|--------------|------------------------------------|
| id           | INTEGER      | Primary key, auto-increment        |
| title        | TEXT         | Appointment title (required)       |
| description  | TEXT         | Detailed description               |
| start_time   | TEXT         | ISO date-time (YYYY-MM-DD HH:MM:SS)|
| end_time     | TEXT         | ISO date-time (YYYY-MM-DD HH:MM:SS)|
| user_id      | TEXT         | User ID (defaults to "1")          |
| color        | TEXT         | Accent color (hex)                 |
| status       | TEXT         | confirmed \| pending \| cancelled \| completed |
| created_at   | TEXT         | Creation timestamp                 |

### Default Sample Data

When the database is first created, the following sample appointments are added:

1. **Team Standup** (9:00 AM - 9:30 AM)
2. **Design Review** (2:00 PM - 3:00 PM)
3. **Client Call** (11:00 AM - 12:00 PM)
4. **Project Planning** (10:00 AM - 12:00 PM)
5. **Code Review** (3:00 PM - 4:00 PM)

## License


## NPM-based Node.js Backend (Alternative)

For developers who want to test the system without compiling C++, we provide a Node.js backend that mirrors the C++ backend's API.

### Files

| File | Purpose |
|------|---------|
| `server.js` | Node.js HTTP server with Express-like API |
| `package.json` | npm package configuration |
| `package-lock.json` | npm dependency lock file |

### Quick Start

```bash
# Install dependency
npm install

# Start the server
node server.js

# Visit
open http://localhost:3000
```

### Commands

```bash
npm start      # Start the server
npm run dev    # Start with auto-reload (requires nodemon)
npm test       # Run any tests
```

### Database

The Node.js backend uses a JSON file (`db.json`) for storage, which is functionally equivalent to the SQLite database in the C++ backend.

### Key Differences

| Feature | C++ Backend | Node.js Backend |
|---------|------------|----------------|
| Database | SQLite (binary) | JSON file (`db.json`) |
| Compilation | Required | None |
| Performance | Higher | Lower |
| Portability | Requires compile | Cross-platform |
| Best for | Production | Development/testing |

### Choosing the Right Backend

- **Use C++ backend** for production deployments and maximum performance
- **Use Node.js backend** for development, testing, and quick setup

---

**MIT**

MIT
